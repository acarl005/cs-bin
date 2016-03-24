var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var nodemon = require('gulp-nodemon');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var notify = require('gulp-notify');

function handleErrors() {
  notify.onError({
    title : 'Compile Error',
    message : '<%= error.message %>'
  }).apply(this, arguments);
  this.emit('end'); //keeps gulp from hanging on this task
}

gulp.task('default', ['sass:dev', 'sass:watch', 'scripts:dev', 'serve'])
    .task('build', ['sass', 'scripts']);

gulp.task('scripts:dev', () => scripts(true))
    .task('scripts', () => scripts(false))
    .task('serve', serve)
    .task('sass', sassProd)
    .task('sass:dev', sassDev)
    .task('sass:watch', function() {
      gulp.watch('./src/sass/*.scss', ['sass:dev']);
    });

function scripts(development) {
  var transform = [
    ['babelify', { blacklist: 'strict' }],
  ];
  if (!development) {
    transform.push(['uglifyify']);
  }
  var bundler = browserify({
    entries: ['./src/editor.js'],
    transform,
    debug: development,
    cache: {},
    packageCache: {},
    fullPaths: development
  });
  bundler = development ? watchify(bundler) : bundler;

  function rebundle(){
    var stream = bundler.bundle();
    return stream
      .on('error', handleErrors)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest('dest/js/'));
  }

  bundler.on('update', function() {
    var now = new Date;
    var updateStart = now.valueOf();
    var time = '\033[37m' + `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}` + '\033[0m';
    rebundle();
    console.log('[' + time + '] \033[32m[watchify] Updated!', (Date.now() - updateStart) + 'ms\033[0m');
  });

  // run it once the first time buildScript is called
  return rebundle();
}

function serve() {
  nodemon({
    script: 'server.js',
    watch: ['server.js', 'views/'],
    env: {
      NODE_ENV: 'test'
    }
  });
}

function sassDev() {
  gulp.src('./src/sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(rename('style.min.css'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dest/'));
}

function sassProd() {
  gulp.src('./src/sass/*.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(concat('style.css'))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('./dest/'));
}

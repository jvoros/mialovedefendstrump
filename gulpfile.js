const gulp = require('gulp');

const browserSync = require('browser-sync');
const del = require('del');
const fileinclude = require('gulp-file-include');
const sass = require('gulp-sass');

// SERVERS
const server = browserSync.create();

function reload(done) {
  server.reload();
  done();
}

function serve(done) {
  server.init({
    server: {
      baseDir: './dist/'
    }
  });
  done();
}

// FINDERS
const config = {
  src: "./src",
  sass: ["./src/sass/*.sass", "./src/sass/*.scss"],
  pages: "./src/!(_)*.html", // do not include if starts with _
  html: "./src/*.html",
  assets: "./src/assets/**/*",
  dest: "./dist",
  desthtml: "./dist/*.html",
  css: "./dist/*.css",
  destassets: "./dist/assets/**/*"
}

// CLEANERS
gulp.task('cleanall', () => del(config.dest));
gulp.task('cleanhtml', () => del(config.desthtml));
gulp.task('cleancss', () => del(config.css));
gulp.task('cleanassets', () => del(config.destassets));

// BUILDERS
gulp.task('sass', () => {
  return gulp.src(config.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(config.dest));
});

gulp.task('html', () => {
  return gulp.src(config.pages)
    .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
      }))
    .pipe(gulp.dest(config.dest));
});

gulp.task('assets', () => {
  return gulp.src(config.assets, { base:'./src' })
  .pipe(gulp.dest(config.dest));
});

// WATCHERS
gulp.task('watchers', () => {
  gulp.watch(config.html, gulp.series('cleanhtml', 'html', reload));
  gulp.watch(config.sass, gulp.series('cleancss', 'sass', reload));
  gulp.watch(config.assets, gulp.series('cleanassets', 'assets', reload));
});

// RUNNERS
const buildList = [
  'cleanall',
  'html',
  'sass',
  'assets'
];

gulp.task('build', gulp.series(...buildList));
gulp.task('dev', gulp.series(...buildList, serve, 'watchers'));

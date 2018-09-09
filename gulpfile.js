const gulp = require('gulp');

const browserSync = require('browser-sync');
const del = require('del');
const nunjucks = require('gulp-nunjucks-render');
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
  pages: "./src/pages/*.njk",
  njkspath: "./src/pages",
  partials: "./src/pages/**/*",
  sass: ["./src/sass/*.sass", "./src/sass/*.scss"],
  assets: "./src/assets/**/*",
  dest: "./dist",
  desthtml: "./dist/*.html",
  destcss: "./dist/*.css",
  destassets: "./dist/assets/**/*"
}

// CLEANERS
gulp.task('cleanall', () => del(config.dest));
gulp.task('cleanhtml', () => del(config.desthtml));
gulp.task('cleancss', () => del(config.destcss));
gulp.task('cleanassets', () => del(config.destassets));

// BUILDERS
gulp.task('sass', () => {
  return gulp.src(config.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(config.dest));
});

// nunjucks setup
// top-level files in the config.pages directory are built into pages
// the `path` variable sets the starting point for `extend` and `include` functions
// the `shared` folder contains base templates and components shared across pages
// each other directory contains partials for their respective pages
gulp.task('nunjucks', () => {
  return gulp.src(config.pages)
    .pipe(nunjucks({
      path: config.njkspath
    }))
    .pipe(gulp.dest(config.dest));
});

gulp.task('assets', () => {
  return gulp.src(config.assets, { base: config.src })
  .pipe(gulp.dest(config.dest));
});

// WATCHERS
gulp.task('watchers', () => {
  gulp.watch(config.partials, gulp.series('cleanhtml', 'nunjucks', reload));
  gulp.watch(config.sass, gulp.series('cleancss', 'sass', reload));
  gulp.watch(config.assets, gulp.series('cleanassets', 'assets', reload));
});

// RUNNERS
const buildList = [
  'cleanall',
  'nunjucks',
  'sass',
  'assets'
];

gulp.task('build', gulp.series(...buildList));
gulp.task('dev', gulp.series(...buildList, serve, 'watchers'));

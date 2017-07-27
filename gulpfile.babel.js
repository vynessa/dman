import gulp from 'gulp';
import gulpNodemon from 'gulp-nodemon';
import jasmineNode from 'gulp-jasmine-node';
import istanbul from 'gulp-babel-istanbul';
import gulpCoveralls from 'gulp-coveralls';
import babel from 'gulp-babel';
import injectModules from 'gulp-inject-modules';
import exit from 'gulp-exit';

const jasmineNodeOpts = {
  timeout: 1000,
  includeStackTrace: false,
  color: true
};

gulp.task('api-tests', () => {
  gulp.src('./tests/api-test.js')
    .pipe(babel())
    .pipe(jasmineNode(jasmineNodeOpts));
});

gulp.task('run-tests', () => {
  return gulp.src(['tests/*.js'])
    .pipe(jasmineNode(jasmineNodeOpts));
});

gulp.task('serve', () => {
  gulpNodemon({
    script: './app.js',
    ext: 'js html',
    env: { NODE_ENV: process.env.NODE_ENV }
  });
});

gulp.task('coverage', (cb) => {
  gulp.src('src/inverted-index.js')
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', () => {
      gulp.src('tests/inverted-index-test.js')
      .pipe(babel())
      .pipe(injectModules())
      .pipe(jasmineNode())
      .pipe(istanbul.writeReports())
      .pipe(istanbul.enforceThresholds({ thresholds: { global: 30 } }))
      .on('end', cb)
      .pipe(exit());
    });
});

gulp.task('test', () => {
  gulp.src('tests/inverted-index-test.js')
  .pipe(babel())
  .pipe(jasmineNode(jasmineNodeOpts));
});

// Load code coverage to coveralls
gulp.task('coveralls', ['coverage'], () => {
  // If not running on CI environment it won't send lcov.info to coveralls
  if (!process.env.CI) {
    return;
  }
  return gulp.src('/lcov.info')
    .pipe(gulpCoveralls());
});

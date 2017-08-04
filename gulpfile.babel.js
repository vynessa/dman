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

gulp.task('build', () => {
  gulp.src('server/**/*.js')
    .pipe(babel({
      presets: ['es2015', 'stage-0']
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('serve', () => {
  gulpNodemon({
    script: './app.js',
    ext: 'js html'
  });
});

gulp.task('test', () => {
  gulp.src('./tests/**/*.js')
    .pipe(babel())
    .pipe(jasmineNode(jasmineNodeOpts));
});

gulp.task('coverage', (cb) => {
  gulp.src('server/**/*.js')
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', () => {
      gulp.src('tests/**/*.js')
        .pipe(babel())
        .pipe(injectModules())
        .pipe(jasmineNode())
        .pipe(istanbul.writeReports())
        .pipe(istanbul.enforceThresholds({ thresholds: { global: 30 } }))
        .on('end', cb)
        .pipe(exit());
    });
});

gulp.task('coveralls', ['coverage'], () => {
  if (!process.env.CI) {
    return;
  }
  return gulp.src('/lcov.info')
    .pipe(gulpCoveralls());
});

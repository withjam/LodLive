var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var tar = require('gulp-tar');
var gzip = require('gulp-gzip');
 
gulp.task('deps', function() {
  return gulp.src('./js/deps/*.js')
    .pipe(concat('deps.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('scripts', function() {
  return gulp.src('./js/lib/*.js')
    .pipe(concat('ml-lodlive.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename('ml-lodlive.min.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('styles', function() {
  return gulp.src('./css/*.css')
    .pipe(concat('ml-lodlive.all.css'))
    .pipe(gulp.dest('./dist/'));
})

gulp.task('build', ['scripts', 'deps', 'styles'], function() {
  return gulp.src(['./dist/ml-lodlive.min.js', './dist/ml-lodlive.deps.js'])
    .pipe(concat('ml-lodlive.complete.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('package', ['build'], function() {
  return gulp.src(['./dist/ml-lodlive.complete.js', './dist/ml-lodlive.all.css'])
    .pipe(tar('ml-lodlive.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('./'));
});
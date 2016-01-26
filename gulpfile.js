var gulp = require('gulp');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');

gulp.task('jshint', function() {
	return gulp.src('lib/*.js')
	.pipe(jshint())
	.pipe(jshint.reporter())
})

gulp.task('compress', function() {
  return gulp.src('lib/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
});

gulp.task('default', ['compress'])

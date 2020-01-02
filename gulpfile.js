const gulp = require('gulp'); // Подключаем Gulp
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
// Для подключения файлов друг в друга.
const fileinclude = require('gulp-file-include');
// Пакет для удаления файлов.
const del = require('del');

// Таск для сборки HTML из шаблонов.
gulp.task('html', function(callback) {
	return gulp.src('./src/html/*.html')
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'HTML include',
					sound: false,
					message: err.message
				}
			})
		}) )
		.pipe( fileinclude({ prefix: '@@' }) )
		.pipe( gulp.dest('./build/') );
    callback();
});

// Таск для компиляции SCSS в CSS.
gulp.task('scss', function(callback) {
	return gulp.src('./src/scss/main.scss')
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'Styles',
					sound: false,
					message: err.message
				}
			})
		}) )
		.pipe( sourcemaps.init() )
		.pipe( sass() )
		.pipe( autoprefixer({
			overrideBrowserslist: ['last 4 versions']
		}) )
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest('./build/css/') )
	/*
		Функция должна завершиться,
		поэтому в конце её выполнения вызывается callback.
	*/
	callback();
});

// Копирование Изображений в папке images.
gulp.task('copy:img', function(callback) {
	return gulp.src('./src/images/**/*.*')
		.pipe(gulp.dest('./build/images/'));
	callback();
});

// Копирование Изображений в папке upload.
gulp.task('copy:upload', function(callback) {
	return gulp.src('./src/upload/**/*.*')
		.pipe(gulp.dest('./build/upload/'));
	callback();
});

// Копирование Скриптов.
gulp.task('copy:js', function(callback) {
	return gulp.src('./src/js/**/*.*')
		.pipe(gulp.dest('./build/js/'));
	callback();
});

// Копирование Значков сайта (favicons).
gulp.task('copy:favicon', function(callback) {
	return gulp.src('./src/*.ico')
		.pipe(gulp.dest('./build/'));
	callback();
});

// Слежение за HTML и CSS и обновление браузера.
gulp.task('watch', function() {
	/*
		В gulp.parallel передается название функции, которую нужно запустить.
		Поэтому передается не строкой.
	*/
	// Слежение за HTML и CSS, за папками с картинками и скриптами, фавиконками и обновление браузера.
	watch(['./build/*.html', './build/css/**/*.css', './build/js/**/*.*', './build/images/**/*.*', './build/upload/**/*.*', './build/*.ico'], gulp.parallel( browserSync.reload ));

	// Слежение за SCSS и компиляция в CSS.
	// watch('./src/scss/**/*.scss', gulp.parallel('scss'));

	/*
		Слежение за SCSS и компиляция в CSS.
		+ Фикс бага SCSS - общий (добавление задержки)
	*/
	watch('./src/scss/**/*.scss', function(){
		setTimeout( gulp.parallel('scss'), 1000 );
	});

	// Слежение за HTML и сборка страниц из шаблонов.
	watch('./src/html/**/*.html', gulp.parallel('html'))

	// Следим за картинками, иконками сайта и скриптами, и копируем их в build.
	watch('./src/images/**/*.*', gulp.parallel('copy:img'));
	watch('./src/upload/**/*.*', gulp.parallel('copy:upload'));
	watch('./src/js/**/*.*', gulp.parallel('copy:js'));
	watch('./src/*.ico', gulp.parallel('copy:favicon'));
});

// Задача для старта сервера из папки build
gulp.task('server', function() {
	browserSync.init({
		server: {
			baseDir: "./build/"
		}
	});
});

// Таск для очищения папки build.
gulp.task('clean:build', function() {
    return del('./build')
});


// Дефолтный таск (таск по умолчанию).
// gulp.task('default', gulp.parallel('server', 'watch', 'scss', 'html') );
gulp.task(
	'default', 
	gulp.series( 
		gulp.parallel('clean:build'),
		gulp.parallel('scss', 'html', 'copy:img', 'copy:upload', 'copy:js', 'copy:favicon'), 
		gulp.parallel('server', 'watch') 
		) 
	);
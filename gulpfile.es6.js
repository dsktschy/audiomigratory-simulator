import gulp from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import del from 'del';
import source from 'vinyl-source-stream';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import browserSync from 'browser-sync';
import fs from 'fs';

var
  $, publicJSDir, publicCSSDir, publicDir, plumberOpt, handleErrors, bs,
  getTasks, bsInit, bsReload, entryFile, indexFileName, indexFile, bsSkip,
  existsSync, srcDir, jsDir, cssDir, mapDir, srcJSDir, srcCSSDir;
$ = loadPlugins();
bs = browserSync.create();
publicDir = 'public/';
srcDir = 'src/';
jsDir = 'javascripts/';
cssDir = 'stylesheets/';
mapDir = 'maps/';
indexFileName = 'index.html';
publicJSDir = publicDir + jsDir;
publicCSSDir = publicDir + cssDir;
srcJSDir = srcDir + jsDir;
srcCSSDir = srcDir + cssDir;
entryFile = `${srcJSDir}main.js`;
indexFile = publicDir + indexFileName;
plumberOpt = {errorHandler: $.notify.onError('Error: <%= error.message %>')};
bsSkip = false;
/**
 * ファイルの存在確認
 */
existsSync = (path) => {
  try {
    fs.accessSync(path);
  } catch (err) {
    return false;
  }
  return true;
};
handleErrors = function() {
  var args;
  args = Array.prototype.slice.call(arguments);
  $.notify.onError('Error: <%= error.message %>').apply(this, args);
  this.emit('end');
};
bsInit = (proxyMode) => {
  var opt;
  opt = proxyMode ? {
    proxy: {
      target: 'localhost:3000',
      ws: true,
    },
    port: 7000,
    open: false,
  } : {
    server: {
      baseDir: publicDir,
      index: indexFileName,
    },
    open: false,
  };
  bs.init(opt);
};
/**
 * taskのコールバックにbs.reloadをそのまま渡すとタスクが完了せず
 * 以降のタスク呼び出しが無効となるため関数で包む
 */
bsReload = () => {
  if (bsSkip) {
    return;
  }
  bs.reload();
};
/**
 * replaceでgulp-nodemonのコンマがファイルパス末尾に入るバグに対応
 */
getTasks = (paths) => {
  var taskSet, taskArray, ext;
  taskSet = new Set();
  for (let path of paths) {
    if (path.match(/\.es6\.js|\.scss|\.html/)) {
      ext = path.replace(',', '').split('.').pop();
      taskSet.add(ext === 'scss' ? 'css' : ext);
    }
  }
  taskArray = Array.from(taskSet.values());
  return taskArray.length ? taskArray : 'noTask';
};

gulp.task('eslint', () => {
  return gulp
    .src([
      '**/*.es6.js',
      '!node_modules/**/*',
    ])
    .pipe($.plumber(plumberOpt))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError());
});

gulp.task('babel', ['eslint'], () => {
  return gulp
    .src([
      '**/*.es6.js',
      '!node_modules/**/*',
    ], {base: './'})
    .pipe($.plumber(plumberOpt))
    .pipe($.babel({optional: ['runtime']}))
    .pipe($.rename((path) => {
      path.basename = path.basename.replace('.es6', '');
    }))
    .pipe(gulp.dest('./'));
});

/**
 * エントリーファイルが存在しなければ何もしない
 */
gulp.task('browserify', ['babel'], (done) => {
  if (!existsSync(entryFile)) {
    done();
    return;
  }
  return browserify(entryFile, {debug: true})
    .bundle()
    .on('error', handleErrors)
    .pipe($.plumber(plumberOpt))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe($.if(
      process.env.NODE_ENV !== 'production',
      $.sourcemaps.init({loadMaps: true})
    ))
    .pipe($.uglify({mangle: process.env.NODE_ENV === 'production'}))
    .pipe($.rename({suffix: '.min'}))
    .pipe($.if(
      process.env.NODE_ENV !== 'production',
      $.sourcemaps.write(`../${mapDir}`)
    ))
    .pipe(gulp.dest(publicJSDir));
});

gulp.task('js', ['browserify'], () => {
  return del([
    `${srcJSDir}**/*.js`,
    `!${srcJSDir}**/*.es6.js`,
  ], (err, paths) => {
    if (err) {
      console.log(err, paths);
    }
  });
});

gulp.task('sasslint', () => {
  return gulp
    .src([
      `${srcCSSDir}**/*.scss`,
    ])
    .pipe($.plumber(plumberOpt))
    .pipe($.sassLint())
    .pipe($.sassLint.format())
    .pipe($.sassLint.failOnError());
});

gulp.task('sass', ['sasslint'], () => {
  return gulp
    .src([
      `${srcCSSDir}**/*.scss`,
    ], {base: srcCSSDir})
    .pipe($.plumber(plumberOpt))
    .pipe($.sass())
    .pipe(gulp.dest(srcCSSDir));
});

gulp.task('css-concat', ['sass'], () => {
  return gulp
    .src([
      `${srcCSSDir}**/*.css`,
    ])
    .pipe($.plumber(plumberOpt))
    .pipe($.concat('bundle.css'))
    .pipe(gulp.dest(srcCSSDir));
});

gulp.task('cssmin', ['css-concat'], () => {
  return gulp
    .src([
      `${srcCSSDir}bundle.css`,
    ], {base: srcCSSDir})
    .pipe($.plumber(plumberOpt))
    .pipe($.if(
      process.env.NODE_ENV !== 'production',
      $.sourcemaps.init({loadMaps: true})
    ))
    .pipe($.cssmin())
    .pipe($.rename({suffix: '.min'}))
    .pipe($.if(
      process.env.NODE_ENV !== 'production',
      $.sourcemaps.write(`../${mapDir}`)
    ))
    .pipe(gulp.dest(publicCSSDir));
});

gulp.task('css', ['cssmin'], () => {
  return del([
    `${srcCSSDir}**/*.css`,
  ], (err, paths) => {
    if (err) {
      console.log(err, paths);
    }
  });
});

gulp.task('htmlhint', () => {
  return gulp
    .src([
      `${publicDir}/*.html`,
    ])
    .pipe($.plumber(plumberOpt))
    .pipe($.htmlhint('.htmlhintrc'))
    .pipe($.htmlhint.reporter())
    .pipe($.htmlhint.failReporter());
});

gulp.task('html', ['htmlhint'], (done) => {
  done();
});

/**
 * watchから呼ばれるためのタスクでbsInit完了前の単体使用は不可
 */
gulp.task('html-reload', ['html'], bsReload);
gulp.task('css-reload', ['css'], bsReload);
gulp.task('js-reload', ['js'], bsReload);

gulp.task('watch', ['js', 'css', 'html'], () => {
  if (existsSync(indexFile)) {
    bsInit(false);
  } else {
    bsSkip = true;
  }
  gulp.watch([
    '**/*.es6.js',
  ], ['js-reload']);
  gulp.watch([
    `${srcCSSDir}**/*.scss`,
  ], ['css-reload']);
  gulp.watch([
    `${publicDir}/*.html`,
  ], ['html-reload']);
});

/**
 * nodemonのtasksオプションは存在する限り無設定不可なので空タスクで対応
 */
gulp.task('noTask', (done) => {
  done();
});

gulp.task('nodemon', ['js', 'css', 'html'], () => {
  bsInit(true);
  $.nodemon({
    script: 'app.js',
    ext: 'es6.js scss html',
    tasks: getTasks,
  })
    .on('restart', () => {
      setTimeout(bsReload, 500);
    });
});

gulp.task('default', ['js', 'css', 'html']);

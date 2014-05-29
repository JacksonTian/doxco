var path = require('path');
var dox = require('dox');
var fs = require('fs');
var ejs = require('ejs');
var markdown = require('marked').parse;
var ncp = require('ncp').ncp;
var hljs = require('highlight.js');

/**
 * 从输入文件中通过dox解析，然后渲染到页面中
 * Example:
 * ```js
 * doxco.run('lib/doxco.js', './doc');
 * ```
 * @param {String} input 输入文件地址
 * @param {String} outputDir 输出目录地址
 * @param {String} skin 皮肤
 */
exports.run = function (input, outputDir) {
  var extname = path.extname(input);
  var basename = path.basename(input, extname);
  var output = path.join(outputDir, basename + '.html');
  var content = fs.readFileSync(input, 'utf-8');
  // 替换掉jshint的定义
  content = content.replace(/^\/\*global[^\/]*/ig, '');
  var comments = dox.parseComments(content, {});
  var template = fs.readFileSync(path.join(__dirname, '../templates/doc.ejs'), 'utf-8');
  var data = {
    hljs: hljs,
    filename: basename + extname,
    comments: comments.map(function (comment) {
       if (comment && !comment.ignore && !comment.isPrivate) {
         return exports.parse(comment);
       }
      }).reduce(function(a, b) {
        if (Array.isArray(b)) {
          return a.concat(b);
        } else {
          if (Array.isArray(a)) {
            a.push(b)
            return a;
          } else {
            return [];
          }
        }
      }).filter(function (comment) {
        return !!comment;
      })
  };
  fs.writeFileSync(output, ejs.render(template, data), 'utf-8');
  ncp(path.join(__dirname, '../templates/assets'), path.join(outputDir, 'assets'), function () {});
  // 输出路径
  console.log('doxco: %s -> %s', input, path.relative(process.cwd(), output));
};

var isComment = function (line) {
  line = line.trim();
  return line.charAt(0) === '/' && line.charAt(1) === '/';
};

/**
 * 解析代码中的单行注释
 */
exports.parse = function (comment) {
  var code = comment.code || '';
  var comments = [];
  var texts = [];
  var codes = [];

  var flag = true;
  var lines = code.split('\n');
  lines.forEach(function (line) {
    var type = isComment(line);
    if (flag === false && type === true) {
      comments.push({
        description: {
          full: markdown(texts.join('\n').trim().replace(/\/\/ /g, ''))
        },
        code: codes.join('\n')
      });
      texts.length = 0;
      codes.length = 0;
    }
    if (type) {
      texts.push(line);
    } else {
      codes.push(line);
    }
    flag = type;
  });

  // 处理尾巴
  comments.push({
    description: {
      full: markdown(texts.join('\n').trim().replace(/\/\/ /g, ''))
    },
    code: codes.join('\n')
  });
  if (!comments[0].description.full) {
    comments[0].description.full = comment.description.full;
  }
  return comments;
};

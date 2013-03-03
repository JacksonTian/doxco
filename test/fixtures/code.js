exports.parse = function (code) {
  var comments = [];
  var result;
  // 持续解析
  while ((result = reg.exec(code)) != null)  {
    // console.log(result);
    comments.push({
      description: {
        full: markdown(result[0])
      },
      code: result.input.substring(result.index)
    });
  }
};

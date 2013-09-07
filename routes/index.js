
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: '0circle' });
};
exports.mail = function(req, res){
  res.render('mail', { title: '0circle' });
};

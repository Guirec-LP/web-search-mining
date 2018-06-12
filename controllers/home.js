var template = require('../views/template-main');
var mongo_data = require('../model/mongo-data');
exports.get = function(req, res) {
  mongo_data.postings(function(err, savedBooks) {
    if (!err) {

      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      var title = "Test web page on node.js"
      var pageTitle = "Web Search and Mining - Implementation"
      var content = "<p>The postings are saved as : </p>"
      savedBooks.forEach(function(title){
        content += '<p>'+title+'</p>'
      })
      res.write(template.build(title,pageTitle,content));
      res.end();
    } else {
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      res.write(template.build("Oh dear", "Database error", "<p>Error details: " + err + "</p>"));
      res.end();
    }
  });
};

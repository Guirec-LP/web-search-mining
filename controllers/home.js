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
      var contentHeader = 'Results'
      var content = ""
      savedBooks.forEach(function(title){
        content +=    '<div class="alert alert-light alert-sm">'+title
                    + '&nbsp;&nbsp;'
                      +'<button class="btn btn-sm btn-outline-primary" type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">'

                        +'More details'
                      +'</button>'

                    +'<div class="collapse alert alert-secondary" id="collapseExample">'
                      +'<div class="card card-body">'
                        +'Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson'
                      +'</div>'
                    +'</div>'
                +'</div>'
      })
      res.write(template.build(title,pageTitle,contentHeader,content));
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

exports.build = function(title, pagetitle, contentHeader, content) {
  return ['<!doctype html>',
  '<html lang="en"><meta charset="utf-8"><title>{title}</title>',
  '<link rel="stylesheet" href="/node_modules/bootstrap/dist/css/bootstrap.css" />',
  '<link rel="stylesheet" href="/assets/style.css" />',
  '<script type="text/javascript" src="http://127.0.0.1:8899/node_modules/bootstrap/dist/js/bootstrap.js"></script> ',
  '<script type="text/javascript" src="/assets/home.controller.js"></script> ',
  '<div class="container">',

  '<div class="row">',
    '<div class="col-12"id="content">',
      '<br><br>',
      '<h1 class="text-primary">{pagetitle}</h1>',
      '<div class="alert alert-successful">Welcome to the <b>demo interface</b> of our project !</div>',

      // form part for the queries
      '<div class="card">',
        '<div class="card-body card-primary">',
        // '<form method="get" action="/">',
        // '<form>',
          '<div class="form-group row">',
                '<label class="col-sm-2 col-form-label" for="myText">Query</label>',
                '<input type = "text" class="form-control col-sm-5" id="idSearchInput" placeholder = "Please enter the terms of your research here" />',
                // '<small id="help" class="form-text text-muted"></small>',
                '<div class="col-sm-1"></div>',
                '<button type="submit" class="btn btn-danger col-sm-2" onclick="onSearchClick()">Search</button>',
          '</div>',
        // '</form>',
        '</div>',
      '</div>',

      // part for the display of the results
      '<div class="card">',
        '<div class="card-body card-primary">',
        '<div class="card-title">',
          '{contentHeader}',
        '</div>',
          '{content}',
        '</div>',
      '</div>',
    '</div>',
  '</div>',
'</div>',
]
  .join('\n')
  .replace(/{title}/g, title)
  .replace(/{pagetitle}/g, pagetitle)
  .replace(/{contentHeader}/g, contentHeader)
  .replace(/{content}/g, content);
};

exports.build = function(title, pagetitle, content) {
  return ['<!doctype html>',
  '<html lang="en"><meta charset="utf-8"><title>{title}</title>',
  '<link rel="stylesheet" href="/node_modules/bootstrap/dist/css/bootstrap.css" />',
  '<link rel="stylesheet" href="/assets/style.css" />',
  '<script type="text/javascript" src="http://127.0.0.1:8899/node_modules/bootstrap/dist/js/bootstrap.js"></script> ',
  '<div class="container">',

  '<div class="row">',
    '<div class="col-1"></div>',
    '<div class="col-10"id="content">',
      '<br><br>',
      '<h1 class="text-primary">{pagetitle}</h1>',
      '<br><br>',
      '<div class="card">',
        '<div class="card-body card-primary">',
        '<div class="card-title">',
          'Welcome to the <b>demo interface</b> of our project !',
        '</div>',
          '{content}',
        '</div>',
      '</div>',
    '</div>',
    '<div class="col-1"></div>',
  '</div>',

'</div>',
]
  .join('\n')
  .replace(/{title}/g, title)
  .replace(/{pagetitle}/g, pagetitle)
  .replace(/{content}/g, content);
};

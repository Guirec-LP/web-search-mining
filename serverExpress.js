var express = require('express');
var app = express();

// Our first route
app.get('/', function (req, res) {
    // res.send('Hello Dev!');
    require('./controllers/home').get(req, res);
});

// Our second route
 app.get('/dev', function (req, res) {
     res.send('Hello, you are now on the Dev route!');
 });

// Listen to port 5000
app.listen(5000, function () {
    console.log('Dev app listening on port 5000!');
});

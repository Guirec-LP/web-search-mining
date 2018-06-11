var request = require('request')
var cheerio = require('cheerio')
var URL = require('url-parse')

var pageToVisit = "http://www.gutenberg.org/files/11/11-h/11-h.htm";
console.log("Visiting page " + pageToVisit);

request(pageToVisit, function(error, response, body) {
   if(error) {
     console.log("Error: " + error);
   }
   // Check status code (200 is HTTP OK)
   console.log("Status code: " + response.statusCode);
   if(response.statusCode === 200) {
     // Parse the document body
     var $ = cheerio.load(body);
     console.log("Page title:  " + $('title').text());
     console.log(harvestWords($));
   }
});


function harvestWords($) {
  var bodyText = $('html > body').text();
    return bodyText;
}

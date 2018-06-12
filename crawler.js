var request = require('request')
var cheerio = require('cheerio')
// var URL = require('url-parse')

var mongo = require('mongodb'),
  Server = mongo.Server,
  Db = mongo.Db;
var server = new Server('localhost', 27017, {
  auto_reconnect: true
});
var db = new Db('euro2012', server);
var onErr = function(err, callback) {
  db.close();
  callback(err);
};

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
     bookParse($);
   }
});

function bookParse($) {
    var bodyText = $('html > body').text();
    var tmp = bodyText.replace(/(\r\n|\n|\r|\n\r)/gm," ");
    var tmp2 = tmp.replace(/['"_,.!:?(){}=@]/gm," ")
    var tmp3 = tmp2.replace(/[\/]/gm," ")
    var rawWords = tmp3.split(' ')
    var filteredWords = []
    rawWords.forEach(function(word){
        w = word.toLowerCase().trim()
        if(   w.length != 0
           && !w.endsWith(' ')
           && filteredWords[w]==undefined){
            filteredWords.push(w);
        }
    })

    var postings = [] ;
    filteredWords.forEach(function(w){
        if(postings[w]==undefined){
          postings[w]=1
        }else{
          postings[w]= postings[w]+1;
        }
    })

    sortedPostings = sortTableByValue(postings);
    // displaySimpleTable(filteredWords)
    displayAssociativeTable(sortedPostings)
    console.log('\n\n'+postings['alice'])
}

function displayAssociativeTable(table){
  for(key in table){
    console.log(key+' | '+table[key]+'\n');
  }
}

function displaySimpleTable(table){
  var monString = "";
  for(element in table){
    monString += table[element]+' | '
  }
  console.log(monString)
}

// sorts the table returning the highest value firsts in descending order
// example ['key1' -> 2 , 'key2' -> 15 , 'key3' -> 8]
// the expected outcoming order will be {key 2, key3, key1}
function sortTableByValue(table){
  return table
}

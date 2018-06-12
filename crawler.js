var request = require('request')
var cheerio = require('cheerio')
// var URL = require('url-parse')

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
     var title=  $('title').text();
     bookParse($,function(){
       console.log('Successful parsing of the book : '+title.trim())
     });
   }
});

function bookParse($,callback) {
    var body = $('html > body').text();

    var filteredWords
    filtering(body,function(result){
      filteredWords = result
      console.log('Successful filtering of the book')
    })
    var totalNbWords = filteredWords.length

    // Creation of the postings
    var postings = [] ;
    createPostings(filteredWords,function(result){
      postings = result;
      console.log('Successful creation of the postings')
    })

    sortedPostings = sortTableByValue(postings);
    // displaySimpleTable(filteredWords)
    // displayAssociativeTable(sortedPostings)
    var frequencyPostings = []
    calculateFrequencies(sortedPostings,totalNbWords,function(result){
      frequencyPostings = result;
      console.log('Successful creation of the frequency postings')
    })
    console.log(frequencyPostings);

    callback();
}

function filtering(body,callback){
    // removes the parts that belongs to Gutenberg's Project
    var start = "*** START OF THIS PROJECT GUTENBERG EBOOK ALICE'S ADVENTURES IN WONDERLAND ***"
    body = body.split(start)[1]
    var end = "End of Project Gutenberg"
    body = body.split(end)[0]

    // cut all the text into uniqu
    var tmp = body.replace(/(\r\n|\n|\r|\n\r)/gm," ");
    var tmp = tmp.replace(/^[a-z,A-Z,0-9]/gm," ");
    var tmp = tmp.replace(/[;‘’'"_,.!:?(){}=@*$]/gm," ")
    var tmp = tmp.replace(/[\/]/gm," ")
    var rawWords = tmp.split(' ')
    // handles the trimming of white spaces
    var filteredWords = []
    rawWords.forEach(function(word){
        w = word.toLowerCase().trim()
        if(   w.length != 0
           && !w.endsWith(' ')){
            filteredWords.push(w);
        }
    })
    callback(filteredWords);
}

function createPostings(filteredWords,callback){
  var postings = []
  filteredWords.forEach(function(w){
      if(postings[w]==undefined){
        postings[w]=1
      }else{
        postings[w]= postings[w]+1;
      }
  })

  callback(postings)
}

function calculateFrequencies(postings, totalNbWords, callback){
    var frequencies = []
    postings.forEach(function(p){
      word = p[0]
      value = Math.round(p[1]*10000/totalNbWords)/10000
      frequencies[word] = value
    })

    callback(frequencies)
}

function displayAssociativeTable(table){
  for(key in table){
    console.log(key+' | '+table[key]+'\n');
  }
}

// temporary function to display all words parsed after the split and regex
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

  var sortable = [];
  for (var key in table) {
      sortable.push([key, table[key]]);
  }

  sortable.sort(function(a, b) {
      return b[1] - a[1];
  });

  return sortable
}

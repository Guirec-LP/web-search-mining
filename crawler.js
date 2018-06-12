var request = require('request')
var cheerio = require('cheerio')
// var URL = require('url-parse')


var maxPages = 50;
var start = 3
for(var i = start ; i-start<maxPages ; i++){
  targetPage = "http://www.gutenberg.org/files/"+i+"/"+i+"-h/"+i+"-h.htm";
  console.log("* "+(i-start+1)+" * "+"Crawling : "+targetPage)
  crawlSinglePage(targetPage,function(result){
    var message = "  - Number of words for the posting : "+ result.length
    console.log(message)
  })
}


function crawlSinglePage(targetPage, callback){
  request(targetPage, function(error, response, body) {
     if(error) {
       console.log("Error: " + error);
     }
     // Check status code (200 is HTTP OK)
     console.log("  - HTML file downloaded");
     if(response.statusCode === 200) {
       // Parse the document body
       var $ = cheerio.load(body);
       var title=  $('title').text().trim();

       if(title.startsWith("The Project Gutenberg eBook of")) {
           title = title.split('The Project Gutenberg eBook of')[1];
       }else if (title.startsWith('The Project Gutenberg EBook of')) {
          title = title.split('The Project Gutenberg EBook of')[1];

       }else if(title.startsWith('The Project Gutenberg\'s etext of')){
          title = title.split('The Project Gutenberg\'s etext of')[1];
       }
       console.log("  - Title (short) : "+title.substring(0,35)+'...')
       var frequency
       bookParse($,function(result){
         frequency = result
         console.log('  - Successful parsing of the book')
       });
       callback(frequency)
     }
  });
}

function bookParse($,callback) {
    var body = $('html > body').text();

    // here we identifu the pre div to remove it from the useful text
    var pre= $('pre').text()
    body = body.split(pre).join(' ')


    var filteredWords
    filtering(body,function(result){
      filteredWords = result
      console.log('  - Successful filtering of the book')
    })
    var totalNbWords = filteredWords.length

    // Creation of the postings
    var postings = [] ;
    createPostings(filteredWords,function(result){
      postings = result;
      console.log('  - Successful creation of the postings')
    })

    sortedPostings = sortTableByValue(postings);
    // displaySimpleTable(filteredWords)
    // displayAssociativeTable(sortedPostings)
    var frequencyPostings = []
    calculateFrequencies(sortedPostings,totalNbWords,function(result){
      frequencyPostings = result;
      console.log('  - Successful creation of the frequency postings')
    })

    callback(frequencyPostings);
}

function filtering(body,callback){
    // removes the parts that belongs to Gutenberg's Project

    // cut all the text into uniqu
    var tmp = body.replace(/(\r\n|\n|\r|\n\r)/gm," ");
    var tmp = tmp.replace(/^[a-z,A-Z,0-9]/gm," ");
    var tmp = tmp.replace(/[;‘’“'"—_—\-,.!:?(){}=@*$]/gm," ")
    var tmp = tmp.replace(/[\/\]\[]/gm," ")
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
      if(word!=''){
        value = Math.round(p[1]*100000000/totalNbWords)/100000000
        frequencies[word] = value
      }
    })
    console.log(frequencies)
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

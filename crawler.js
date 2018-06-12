var request = require('request')
var cheerio = require('cheerio')
var mongo = require('mongodb')
async = require('async')

  Server = mongo.Server
  Db = mongo.Db
var server = new Server('localhost', 27017, {
  auto_reconnect: true
});
var db = new Db('webSearch', server);
var onErr = function(err, callback) {
  db.close();
  callback(err);
};
var collection

db.open(function(err, db) {
  if (!err) {
    collection = db.collection('postings',function(err,collection){
      if(err){
        onErr(err, callback);
      }
    })
  }else{
      onErr(err,callback)
  }
})


  var myPostingsFrequency = ['ici']
  var maxPages = 1;
  var start = 3
  var rootURL = "http://www.gutenberg.org/files/"

  console.log("Crawling "+maxPages+" pages from gutenberg.org")

  for(var i = 0 ; i<maxPages ; i++){
    var index = i + start
    targetPage = rootURL+index+"/"+index+"-h/"+index+"-h.htm";
    var frequencyPostings = []
    var title
    async.waterfall([
        function(callback) {
          callback(null, targetPage);
        },
        crawlSinglePage,
        filtering,
        createPostings,
        calculateFrequencies,
    ], function (error, result) {
        if (error) { alert('Something is wrong !');
      }else{
        crawlingSuccess(result,targetPage,title);

      }
    });
  }

  function crawlingSuccess(result,targetPage,title){
    frequencyPostings = result;
    console.log( "   -> frequency postings done ("+ Object.keys(frequencyPostings).length+' different words)')

    // do something with the frequency postings
    var document = {"url":targetPage, "title":title, "postings":frequencyPostings};

    collection.save(document, {w: 1}, function(err, records){
        if(err){
          console.log(err);
        }
    });
    collection.find().toArray(function(err, data){
        if(err){
          console.log(err);
        }else{
          data.forEach(function(element){
            console.log(element['title'])
          });
        }
    });
  }

function crawlSinglePage(targetPage, callback){
  request(targetPage, function(error, response, body) {
     if(error) {
       console.log("Error: " + error);
     }else{
       // Check status code (200 is HTTP OK)
       // console.log("  - HTML file downloaded");
       if(response.statusCode === 200) {
         // Parse the document body
         var $ = cheerio.load(body);
         title=  $('title').text().trim();

         if(title.startsWith("The Project Gutenberg eBook of")) {
             title = title.split('The Project Gutenberg eBook of')[1];
         }else if (title.startsWith('The Project Gutenberg EBook of')) {
            title = title.split('The Project Gutenberg EBook of')[1];

         }else if(title.startsWith('The Project Gutenberg\'s etext of')){
            title = title.split('The Project Gutenberg\'s etext of')[1];
         }
         console.log(" *  "+title.substring(0,65)+' [...]')
         var body = $('html > body').text();

         // here we identifu the pre div to remove it from the useful text
         var pre= $('pre').text()
         body = body.split(pre).join(' ')

         var frequencyPostings = [] ;
         // Here we define the correct order to avoid a callbeck hell situation
         callback(null,body)
       }
     }
  });
}



function filtering(body,callback){
    // removes the parts that belongs to Gutenberg's Project

    // cut all the text into uniqu
    var tmp = body.replace(/(\r\n|\n|\r|\n\r)/gm," ");
    var tmp = tmp.replace(/^[a-z,A-Z,0-9]/gm," ");
    var tmp = tmp.replace(/[%#;‘’“'"—_—\-,.!:?(){}=@*$]/gm," ")
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
        // console.log(filteredWords)
    })
    var total = filteredWords.length
    callback(null,filteredWords,total);
}


function createPostings(filteredWords,total,callback){
  var postings = []

  filteredWords.forEach(function(w){

      if(postings.w==undefined){
        postings.push([w, 1]);
      }else{
        postings.w= postings.w+1;
      }

  })
  console.log('  - Successful creation of the postings '+Object.keys(postings).length)
  callback(null,sortTableByValue(postings),total)
}


function calculateFrequencies(postings, totalNbWords, callback){
    var frequencies = []
    postings.forEach(function(p){

      word = p[1][0]
      if(word!=''){
        value = Math.round(p[1][1]*100000000/totalNbWords)/100000000
        frequencies.push([word,value])
      }
    })
    console.log('  - Successful creation of the frequency postings '+Object.keys(frequencies).length)
    callback(null,cleanTable(frequencies))
}


function displayAssociativeTable(table){
  var limit = 5
  var count = 0
  for(key in table){
    count ++
    if(count<= limit){
      console.log(key+' | '+table[key]+'\n');
    }
  }
}

function cleanTable(actual) {
  var newTable = [];
  for (key in actual) {
    if (actual[key]!=null) {
    //  console.log(actual[key])
      newTable[key] = actual[key];
    }
  }
  return newTable;
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

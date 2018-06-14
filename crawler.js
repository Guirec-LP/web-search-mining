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

// Connection once to the database
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



  var allPostings = [];
  var booksIndex = []

  var maxPages = 2;
  var start = 3
  var rootURL = "http://www.gutenberg.org/files/"
  console.log("Crawling "+maxPages+" pages from gutenberg.org")

  var targetPages = []
  for(var i = 0 ; i<maxPages ; i++){
    var index = i + start
    targetPages.push(rootURL+index+"/"+index+"-h/"+index+"-h.htm");
  }

  async.forEach(targetPages,function(url,callback){
    var title
    async.waterfall([
        function(callback) {
          callback(null, url);
        },
        crawlSinglePage,
        filtering,
        createPostings,
        calculateFrequencies,
    ], function (error, result) {
        if (error) { alert('Something is wrong !');
      }else{
        crawlingSuccess(result,url,callback);
      }
    });
  },function(err){
    if(err){
      console.log("erreur à la fin du async.forEach")
    }else{
      console.log("     * * * * * ")
      console.log("")
      console.log("- - - End of Crawling and Preliminary Postings - - -")
      console.log("")
      console.log("     * * * * * ")


      // treatMultiplePostings(allPostings)


    }
  })



  function treatMultiplePostings(allPostings){
    var finalPostings = []
    // console.log(booksIndex)
    // console.log(allPostings)


    allPostings.forEach(function(book){
      title = book[0]
      url = book[1]
      postings = book[2]
      index = getIndexBookOf(title,url);
      console.log(index)
      for(key in postings){
        word = postings[key][0]
        freq = postings[key][1]

        if(finalPostings[word]==undefined){
          var myArray = [index+freq]
          finalPostings.push([word,myArray]);
        }else{
          // console.log(finalPostings[word])
          var myArray = []
          myArray.push(finalPostings[word])
          myArray.push(title+freq)
          finalPostings[word]= myArray
        }
      }
      console.log(finalPostings)
    })

  }

  function getIndexBookOf(title,url){
    console.log(booksIndex)
    index = booksIndex.indexOf(title+'/'+url)
    return index
  }





  function crawlingSuccess(frequencyPostings,url,callback){

    console.log(title.substring(0,35)+" - ("+ Object.keys(frequencyPostings).length+" different words)")
    // console.log('    @ '+url)
    // do something with the frequency postings
    var document = {"url":url, "title":title, "postings":frequencyPostings};
    // console.log(document)
    booksIndex.push(title+'/'+url);
    allPostings.push([title,url,frequencyPostings]);

    /*
    collection.save(document, {w: 1}, function(err, records){
        if(err){
          console.log(err);
          console.log('error when saving')
        }else{
          console.log('saved')
          callback();
        }
    });
    */
  }

  /*
  collection.find().toArray(function(err, data){
      if(err){
        console.log(err);
        console.log('error when loading titles')
      }else{
        console.log('Loading titles')
        data.forEach(function(element){
          console.log(element['title'])
        });
      }
  });
  */

function crawlSinglePage(url, callback){
  request(url, function(error, response, body) {
     if(error) {
       console.log("Error: " + error);
     }else{
       // Check status code (200 is HTTP OK)
       // console.log("  - HTML file downloaded");
       if(response.statusCode === 200) {
         // Parse the document body
         var $ = cheerio.load(body);
         title =  $('h1').text().trim();
         if(title.length<=0){
           title = $('h2').text().trim();
         }
         if(title.length<=0){
           title = $('title').text().trim();
         }
         if(title.startsWith("The Project Gutenberg eBook of")) {
             title = title.split('The Project Gutenberg eBook of')[1];
         }else if (title.startsWith('The Project Gutenberg EBook of')) {
            title = title.split('The Project Gutenberg EBook of')[1];
         }else if(title.startsWith('The Project Gutenberg\'s etext of')){
            title = title.split('The Project Gutenberg\'s etext of')[1];
         }else if(title.startsWith('The Project Gutenberg\'s Etext of')){
            title = title.split('The Project Gutenberg\'s Etext of')[1];
         }else if(title.startsWith('The Project Gutenberg\'s E-text of')){
            title = title.split('The Project Gutenberg\'s E-text of')[1];
         }else if(title.startsWith('The Project Gutenberg\'s E-Book of')){
            title = title.split('The Project Gutenberg\'s E-Book of')[1];
         }else if(title.startsWith('The Project Gutenberg\'s E-book of')){
            title = title.split('The Project Gutenberg\'s E-book of')[1];
         }

         title = title.replace(/(\r\n|\n|\r|\n\r)/gm," ");
         title = title.replace(/[%#;‘’“”'''"—_—\-,.!:?(){}=@*$]/gm," ")
         // console.log(" *  "+title.substring(0,65)+' [...]')
         var body = $('html > body').text();

         // here we identifu the pre div to remove it from the useful text
         var pre= $('pre').text()
         body = body.split(pre).join(' ')
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
    var tmp = tmp.replace(/[%#;‘’“”'''"—_—\-,.!:?(){}=@*$]/gm," ")
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

      if(postings[w]==undefined){
        postings[w]= 1;
      }else{
        postings[w]= parseInt(postings[w])+1;
      }

  })
  // console.log('  - Successful creation of the postings '+Object.keys(postings).length)
  callback(null,sortTableByValue(postings),total)
}


function calculateFrequencies(postings, totalNbWords, callback){
    var frequencies = []
    for(index in postings){
      //console.log("word =<"+word+"> value =<"+value+">");

      var value = postings[index][1]
      var word = postings[index][0]

      if(word!=''){
        var freq = value/totalNbWords
        frequencies.push([word,freq]);
      }
    }
    // console.log('  - Successful creation of the frequency postings '+Object.keys(frequencies).length)
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

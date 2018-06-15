var mongo = require('mongodb')
async = require('async')

Server = mongo.Server
Db = mongo.Db
var server = new Server('localhost', 27017, {
  auto_reconnect: true
});
var db = new Db('webSearch', server);
var onErr = function(err,callback) {
  db.close();
  console.log(err);
  callback(err)
};
var collectionPostings
var collectionBooks
var collectionBigPosting

// Connection once to the database




async.waterfall([
    retrievePostings,
    loadBooksURL,
    treatMultiplePostings,
    saveBigPostings
], function (error, result) {
    if (error) { alert('Something is wrong !');
  }else{
    console.log('DONE')
    // console.log(finalPostings)
    db.close()
  }
});


// retrievePostings(function(){console.log("ok")})

function retrievePostings(callback){
  var allPostings = []
  db.open(function(err, db) {
    if (!err) {
      collectionPostings = db.collection('postings',function(err,collection){
        if(err){
          onErr(err, callback(null));
        }
      })
      collectionPostings.find().toArray(function(err, data) {
          if(!err){
            console.log(err);

            data.forEach(function(element){
              allPostings.push(element)
            });
          // strJson = '{"GroupName":"' + gname + '","count":' + intCount + ',"teams":[' + strJson + "]}"
          callback(null,allPostings);
        } else {
          onErr(err, callback(null));
        }
      });
    }else{
        onErr(err,callback(null))
    }
  })
}

function loadBooksURL(data,callback){
    var booksIndex = []
      collectionBooks = db.collection('books',function(err,collection){
        if(err){

          onErr(err, callback(null));
        }
      })

      // saving all new books
      async.forEach(data, function(book,callback){
        var title = book['title']
        var url = book['url']
        var document = {"title":title,"url":url};
        // console.log(document)

        collectionBooks.save(document, {w: 1}, function(err, records){
          if(err){
            console.log(err);
            console.log('error when saving book')
          }else{
            var id = records.ops[0]['_id']

            booksIndex[title]=id
            callback(null)
          }
        })

      },function (err) {
          if (err) {
            console.log("erreur à la fin du async.forEach")
          } else {
            callback(null,booksIndex,data)
        }
      })
}

function treatMultiplePostings(idsBooks,myPostings,callback){

  var finalPostings = []
  myPostings.forEach(function(book){

    var title = book['title']
    var index = idsBooks[title]
    console.log(index)
    var postings = book['postings']

    // console.log(index)
    for(key in postings){
      word = postings[key][0]
      freq = postings[key][1]

      if(finalPostings[word]==undefined){
        var myArray = []
        myArray.push({'freq':freq,'index':index})
        finalPostings[word] = myArray;
      }else{
        // console.log(finalPostings[word])
        var myArray = []
        for(key in finalPostings[word]){
          myArray.push(finalPostings[word][key])
        }
        myArray.push({'freq':freq,'index':index})
        finalPostings[word] = sortTableByFrequency(myArray)
      }
      // console.log(finalPostings)
    }

    // console.log(sortTableByAlphabet(finalPostings))
  })
  callback(null,finalPostings)

}

function saveBigPostings(postingsReady,callback){

        // saving the Big posting list
        for (key in postingsReady){
          posting = postingsReady[key]
          var document = {"word":key,"posting":posting};
          // console.log(collectionBigPosting)
          db.collection('bigPosting').save(document, {w: 1}, function(err, records){
              if(err){
                console.log(err);
                console.log('error when saving Big Posting word')
              }else{
                // book saved
              }
          });
        }
        callback(null)
}

/* NOT USED */
function sortTableByAlphabet(table){

  var sortable = [];
  for (var key in table) {
      sortable.push([key, table[key]]);
  }

  sortable.sort();
  return sortable
}

function sortTableByFrequency(tableArg){
  var table = tableArg

  var length = Object.keys(table).length
  if(length==1){
    return table;
  }else{
    for (var i = 0 ; i < length-1; i++) {
      var frequency1 = table[i]['freq']
      var frequency2 = table[i+1]['freq']
      if(frequency1 < frequency2){
        // console.log('f1 : '+frequency1+' < f2 :'+ frequency2)
        var tmp = table[i+1]
        table[i+1]=table[i]
        table[i]=tmp
      }
    }
    var sub = sortTableByFrequency(table.slice(0,length-1))
    sub.push(table[length-1])
    // console.log('rest2 : '+rest)
    return sub;

  }
}

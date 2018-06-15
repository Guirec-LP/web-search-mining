var mongo = require('mongodb')
async = require('async')

Server = mongo.Server
Db = mongo.Db
var server = new Server('localhost', 27017, {
  auto_reconnect: true
});
var db = new Db('webSearch', server);
var onErr = function(err,callback) {
  console.log('ICI')
  db.close();
  callback(err);
};
var collectionPostings
var collectionBooks
var collectionBigPosting

// Connection once to the database



var allPostings = [];
var booksIndex  = [];
var finalPostings = []


async.series([
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
          callback(null);
        } else {
          onErr(err, callback(null));
        }
      });
    }else{
        onErr(err,callback(null))
    }
  })
}

function loadBooksURL(callback){

      collectionBooks = db.collection('books',function(err,collection){
        if(err){

          onErr(err, callback(null));
        }
      })

      // saving all new books
      allPostings.forEach(function(book){
        title = book['title']
        url = book['url']
        var document = {"title":title,"url":url};
        // console.log(document)

        collectionBooks.save(document, {w: 1}, function(err, records){
            if(err){
              console.log(err);
              console.log('error when saving book')
            }else{
              // book saved

            }
        });
      })
      callback(null)
}

function treatMultiplePostings(callback){

  allPostings.forEach(function(book){

    title = book['title']

    postings = book['postings']

    // console.log(index)
    for(key in postings){
      word = postings[key][0]
      freq = postings[key][1]

      if(finalPostings[word]==undefined){
        var myArray = []
        myArray.push({'freq':freq,'title':title})
        finalPostings[word] = myArray;
      }else{
        // console.log(finalPostings[word])
        var myArray = []
        for(key in finalPostings[word]){
          myArray.push(finalPostings[word][key])
        }
        myArray.push({'freq':freq,'title':title})
        finalPostings[word] = sortTableByFrequency(myArray)
      }
    }

    // console.log(sortTableByAlphabet(finalPostings))
  })
  callback(null)

}

function saveBigPostings(callback){

        // saving the Big posting list
        for (key in finalPostings){
          posting = finalPostings[key]
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

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

// to test the sortTableByFrequency function
// console.log(sortTableByFrequency([4.001,3.002,1.004,2.003]))

var allPostings = [];
var booksIndex  = [];

retrievePostings()

async.series([
    retrievePostings,
    getIndexBook,
    treatMultiplePostings,
], function (error, result) {
    if (error) { alert('Something is wrong !');
  }else{
    console.log('YESSS')
  }
});

function retrievePostings(callback){

  var result = []
  db.open(function(err, db) {
    if (!err) {
      collectionPostings = db.collection('postings',function(err,collectionPostings){
        if(err){
          onErr(err, callback(null));
        }
      })
      collectionPostings.find().toArray(function(err, data) {
          if(!err){
            console.log(err);

            data.forEach(function(element){
              result.push(element)
            });
          // strJson = '{"GroupName":"' + gname + '","count":' + intCount + ',"teams":[' + strJson + "]}"
          db.close()
          allPostings = result
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

function getIndexBook(callback){
  callback(null)
}

function treatMultiplePostings(callback){
  var finalPostings = []

  allPostings.forEach(function(book){
    title = book[0]
    url = book[1]
    postings = book[2]
    index = getIndexBookOf(title,url);
    // console.log(index)
    for(key in postings){
      word = postings[key][0]
      freq = postings[key][1]

      if(finalPostings[word]==undefined){
        var myArray = []
        myArray.push(index+freq)
        finalPostings[word]= myArray;
      }else{
        // console.log(finalPostings[word])
        var myArray = []
        for(key in finalPostings[word]){
          myArray.push(finalPostings[word][key])
        }
        myArray.push(index+freq)
        finalPostings[word]= sortTableByFrequency(myArray)
      }
    }

    // console.log(sortTableByAlphabet(finalPostings))
  })
  callback(null)

}

function getIndexBookOf(title,url){
  // console.log(booksIndex)
  index = booksIndex.indexOf(title+'/'+url)
  return index
}

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
      var frequency1 = table[i] - Math.trunc(table[i])
      var frequency2 = table[i+1] - Math.trunc(table[i+1])
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

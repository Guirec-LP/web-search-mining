var mongo = require('mongodb'),
async = require('async')
  Server = mongo.Server,
  Db = mongo.Db;
var server = new Server('localhost', 27017, {
  auto_reconnect: true
});
var db = new Db('webSearch', server);
var onErr = function(err, callback) {
  db.close();
  callback(err);
};
var collectionBooks
var collectionBigPosting
var booksIndex = []
var bigPosting = []

function processing(callback){

  async.series([
      openDatabase,
      // getBooks,
      getBigPosting
  ], function (error, result) {
      if (error) {
        alert('Something is wrong !');
      }else{
        // console.log('Books Index')
        // console.log(booksIndex)
        db.close()
        callback("",bigPosting)
        console.log('TERMINATED here')
      }
    }
  );
}

exports.bigPosting = processing

processing(function(){console.log('TERMINEATED there')})

function openDatabase(callback){
  db.open(function(error){
    if(error){
      console.log(error)
    }else{
      callback(null)
    }
  })
}

// retrieving all the BOOKS saved to create the index
function getBooks(callback){

  db.collection('books').find().toArray(function(err, data) {
    console.log(data)
    if(!err){
      console.log(err);

      data.forEach(function(element){
        booksIndex.push(element)
      });
      console.log('ICICICICICI')
      callback();
    } else {
      console.log(err)
      callback()
    }
  })
}

// retrieve the BIG POSTING
function getBigPosting(callback){
  db.collection('bigPosting').find().toArray(function(err, data) {
    if(!err){
      for(key in data){
        var word    = data[key]['word']
        var posting = data[key]['posting']
        bigPosting[word]=posting
      };
      console.log(bigPosting)
      callback(null)

    } else {
      console.log('probleme')
    }
  }); //end db.collection
}

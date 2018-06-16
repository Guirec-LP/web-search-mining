var mongo = require('mongodb'),
  async = require('async')
Server = mongo.Server,
  Db = mongo.Db;
var server = new Server('localhost', 27017, {
  auto_reconnect: true
});
var db = new Db('webSearch', server);
var onErr = function (err, callback) {
  db.close();
  callback(err);
};
var collectionBooks
var collectionBigPosting
var booksIndex = []
var bigPosting = []

function processing(callback) {

  async.series([
    openDatabase,
    // getBooks,
    getBigPosting
  ], function (error, result) {
    if (error) {
      alert('Something is wrong !');
    } else {
      // console.log('Books Index')
      // console.log(booksIndex)
      // db.close()
      callback("", bigPosting)
    }
  }
  );
}

// exports.bigPosting = processing
exports.getBigPosting = getBigPosting;
exports.getBooks = getBooks;

processing(function () { console.log('TERMINATED there') })

function openDatabase(callback) {
  db.open(function (error) {
    if (error) {
      console.log(error)
    } else {
      callback(null)
    }
  })
}

// retrieving all the BOOKS saved to create the index
// function getBooks(callback) {
//   db.collection('books').find().toArray(function (err, data) {
//     console.log(data)
//     if (!err) {
//       data.forEach(function (element) {
//         booksIndex.push(element)
//       });
//       callback(undefined, data);
//     } else {
//       console.log(err)
//       callback()
//     }
//   })
// }
function getBooks(callback) {
  // db.open(function (err, db) {
  //   if (!err) {
      db.collection('books', function (err, collection) {
        if (!err) {
          collection.find().toArray(function (err, data) {
            if (!err) {
              var books = []
              data.forEach(function (element) {
                books.push({
                  id: element['_id'],
                  title: element['title'],
                  url: element['url']
                });
              });
              // db.close()
              try {
                callback("", books);
              } catch (error) {
                console.log("Couldn't call callback: ", error);
              }

            } else {
              onErr(err, callback);
            }
          });
        } else {
          onErr(err, callback);
        }
      });
  //   } else {
  //     onErr(err, callback);
  //   }
  // });
};




// // retrieve the BIG POSTING
// function getBigPosting(callback) {
//   db.collection('bigPosting').find().toArray(function (err, data) {
//     if (!err) {
//       // for (key in data) {
//       //   var word = data[key]['word']
//       //   var posting = data[key]['posting']
//       //   bigPosting[word] = posting
//       // };
//     } else {
//       console.log('probleme')
//     }
//   }); //end db.collection
// }

function getBigPosting(callback) {
  // db.open(function (err, db) {
  //   if (!err) {
  db.collection('bigPosting', function (err, collection) {
    if (!err) {
      collection.find().toArray(function (err, data) {
        if (!err) {
          var postings = []
          var posting;
          data.forEach(function (element) {
            var id = element['_id'];
            var word = element['word'];
            posting = {
              id: id,
              word: word,
              postings: []
            };
            element['posting'].forEach(el => {
              posting.postings.push({
                bookId: el['index'],
                freq: el['freq']
              });
            });
            postings.push(posting);
          });

          // db.close();
          callback(undefined, postings);
        } else {
          console.log("error on finding postings: ", err);
          onErr(err, callback);
        }
      });
    } else {
      console.log("error on accessing bigPostings collection: ", err);
      onErr(err, callback);
    }
  });
}

// function getBookById(id, callback) {
//   db.collection('books', function (err, collection) {
//     if (!err) {
//       collection.find(id, function (err, data) {
//         if (!err) {
//           // try {
//           //   callback("", books);
//           // } catch (error) {
//           //   console.log("Couldn't call callback: ", error);
//           // }
//         } else {
//           onErr(err, callback);
//         }
//       });
//     } else {
//       onErr(err, callback);
//     }
//   });
// }

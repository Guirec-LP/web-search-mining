var mongo = require('mongodb'),
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

exports.postings = function(callback) {
  db.open(function(err, db) {
    if (!err) {
      db.collection('postings', function(err, collection) {
        if (!err) {

          collection.find().toArray(function(err, data) {
              if(!err){
                console.log(err);

                var savedBooks = []
                data.forEach(function(element){
                  savedBooks.push(element['title'])
                });

              // strJson = '{"GroupName":"' + gname + '","count":' + intCount + ',"teams":[' + strJson + "]}"
              db.close()
              callback("", savedBooks);

            } else {
              onErr(err, callback);
            }
          }); //end collection.find
        } else {
          onErr(err, callback);
        }
      }); //end db.collection
    } else {
      onErr(err, callback);
    }
  }); // end db.open
};

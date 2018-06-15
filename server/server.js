var http = require('http');
var mongo_data = require('./model/mongo-data');

http.createServer(function (request, response) {
    response.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE'
    });

    request.on('error', function (err) {
        console.error(err);
        response.statusCode = 400;
        response.end();
    });
    response.on('error', function (err) {
        console.error(err);
    });

    if (request.method === 'POST') {
        processPOST(request.url, request, response)
    } else {
        response.statusCode = 404;
        response.end();
    }
}).listen(8080);
console.log("Server is running...");

function processPOST(url, request, response) {
    console.log("received POST");

    var jsonString = '';

    request.on('data', function (data) {
        jsonString += data;
    });

    request.on('end', function () {
        console.log("Payload: ", JSON.parse(jsonString));
        var requestParams = JSON.parse(jsonString);

        switch (url) {
            case '/query':
                var result = {};
                var query = requestParams.query;

                mongo_data.postings(function (err, savedBooks) {
                    console.log("savedBooks: ", savedBooks);
                    if (!err) {
                        if (query == '') {
                            result = { savedBooks: savedBooks };
                        } else {
                            result.savedBooks = [];
                            var words = query.toLowerCase().split(' ');
                            words.forEach(word => {
                                savedBooks.forEach(book => {
                                    if(book.toLowerCase().includes(word) && !result.savedBooks.includes(book)) {
                                        result.savedBooks.push(book);
                                    }
                                });
                            });
                        }
                    } else {
                        result = { savedBooks: [] };
                    }
                    response.write(JSON.stringify(result));
                    request.pipe(response);

                    console.log("Sent response");
                });
                break;
            default:
                break;
        }
    });
}

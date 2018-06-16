var http = require('http');
var mongo_data = require('./model/mongo-data');
var search_data = require('./model/search-data');

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

        var result = {};
        var terms = requestParams.query.toLowerCase().trim().split(" ");
        terms.forEach(term => {
            if (term.trim() == "" || terms.includes(term, terms.indexOf(term) + 1)) {
                terms.splice(terms.indexOf(term), 1);
            }
        });

        switch (url) {
            case '/full':
                search_data.getBooks(function (err, bookData) {
                    if (!err) {
                        if (requestParams.query == '') {
                            result = { books: bookData };
                            response.write(JSON.stringify(result));
                            request.pipe(response);
                        } else {
                            search_data.getBigPosting(function (err, postings) {
                                if (!err) {
                                    result.books = booleanRetrievalFull(postings, terms, bookData);
                                    console.log("boolean retrieval resulted with " + result.books.length + " results: ", result.books);
                                    response.write(JSON.stringify(result));
                                    request.pipe(response);
                                } else {
                                    console.log("Something went wrong retrieving the postings. Returning empty array.");
                                    result = { books: [] };
                                    response.write(JSON.stringify(result));
                                    request.pipe(response);
                                }
                            });
                        }
                    } else {
                        console.log("Something went wrong retrieving the books. Returning empty array.");
                        result = { books: [] };
                        response.write(JSON.stringify(result));
                        request.pipe(response);
                    }
                });
                break;
            case '/title':
                search_data.getBooks(function (err, bookData) {
                    if (!err) {
                        if (requestParams.query == '') {
                            result = { books: bookData };
                            response.write(JSON.stringify(result));
                            request.pipe(response);
                        } else {
                            result.books = booleanRetrievalTitle(bookData, terms);
                            console.log("boolean retrieval resulted with " + result.books.length + " results: ", result.books);
                            response.write(JSON.stringify(result));
                            request.pipe(response);
                        }
                    } else {
                        console.log("Something went wrong retrieving the books. Returning empty array.");
                        result = { books: [] };
                        response.write(JSON.stringify(result));
                        request.pipe(response);
                    }
                });
                break;
            case '/author':
                break;
            default:
                break;
        }
    });
}

function booleanRetrievalFull(postings, terms, books) {
    var results = [];

    terms.forEach(term => {
        postings.forEach(posting => {
            if (posting.word.toLowerCase().includes(term)) {
                posting.postings.forEach(post => {
                    books.forEach(book => {
                        if ((book.id.toString() == post.bookId.toString() || book.title.toLowerCase().includes(term)) && !results.includes(book)) {
                            results.push(book);
                        }
                    });
                });
            }
        });
    });

    return results;
}

function booleanRetrievalTitle(books, terms) {
    var results = [];

    terms.forEach(term => {
        books.forEach(book => {
            if (book.title.toLowerCase().includes(term) && !results.includes(book)) {
                results.push(book);
            }
        });
    });

    return results;
}

function booleanRetrievalAuthor(postings, terms, books) {
    var results = [];

    terms.forEach(term => {
        postings.forEach(posting => {
            if (posting.word.toLowerCase().includes(term)) {
                posting.postings.forEach(post => {
                    books.forEach(book => {
                        if (book.id.toString() == post.bookId.toString()) {
                            if (!results.includes(book)) {
                                results.push(book);
                            }
                        }
                    });
                });
            }
        });
    });

    return results;
}

function rankByTermFreq(docs, terms) {
    var result = docs;
    results.forEach(result => {
        result.score = 0;
    });
    // var postings = search_data.getBigPosting();

    // var posting;
    // terms.forEach(term => {
    //     postings.forEach(posting => {
    //         if (posting.word.toLowerCase().includes(term)) {
    //             docFrequencies.forEach(docFreq => {
    //                 results.forEach(result => {
    //                     if (docFreq.id == result.id) {
    //                         result.score += docFreq.frequency;
    //                     }
    //                 });
    //             });
    //         }
    //     });
    // });

    results.sort((a, b) => { return a.score >= b.score ? 1 : -1 });
    return results;
}
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
}).listen(8082);
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
                            result = { books: [] };
                            bookData.forEach(book => {
                                if (!isBookInResults(book, result.books)) {
                                    result.books.push(book);
                                }
                            });
                            response.write(JSON.stringify(result));
                            request.pipe(response);
                        } else {
                            search_data.getBigPosting(function (err, postings) {
                                if (!err) {
                                    result.books = rankByTermFreq(booleanRetrievalFull(postings, terms, bookData), terms, postings);
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
                            result = { books: [] };
                            bookData.forEach(book => {
                                if (!isBookInResults(book, result.books)) {
                                    result.books.push(book);
                                }
                            });
                            response.write(JSON.stringify(result));
                            request.pipe(response);
                        } else {
                            result.books = rankByTermFreq(booleanRetrievalTitle(bookData, terms), terms);
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
                        if ((book.id.toString() == post.bookId.toString() || book.title.toLowerCase().includes(term)) && !isBookInResults(book, results)) {
                            results.push(book);
                        }
                    });
                });
            }
        });
    });

    return results;
}

function isBookInResults(book, results) {
    var ret = false;

    results.forEach(result => {
        if (result.title == book.title || result.id == book.id) {
            ret = true;
        }
    });

    return ret;
}

function booleanRetrievalTitle(books, terms) {
    var results = [];

    terms.forEach(term => {
        books.forEach(book => {
            if (book.title.toLowerCase().includes(term) && !isBookInResults(book, results)) {
                results.push(book);
            }
        });
    });

    return results;
}

function booleanRetrievalAuthor(postings, terms, books) {
    var results = [];

    // terms.forEach(term => {
    //     postings.forEach(posting => {
    //         if (posting.word.toLowerCase().includes(term)) {
    //             posting.postings.forEach(post => {
    //                 books.forEach(book => {
    //                     if (book.id.toString() == post.bookId.toString()) {
    //                         if (!results.includes(book)) {
    //                             results.push(book);
    //                         }
    //                     }
    //                 });
    //             });
    //         }
    //     });
    // });

    return results;
}

function rankByTermFreq(books, terms, postings) {
    var results = books;
    results.forEach(result => {
        result.score = 0;
        if (!postings) {
            terms.forEach(term => {
                result.score += (result.title.match(new RegExp(term, "g")) || []).length;
            });
        }
    });

    if (!postings) {
        results.sort((a, b) => { return a.score >= b.score ? 1 : -1 });
        return results;
    }

    terms.forEach(term => {
        postings.forEach(posting => {
            if (posting.word.toLowerCase().includes(term)) {
                posting.postings.forEach(post => {
                    results.forEach(result => {
                        if (post.bookId == result.id) {
                            result.score += post.freq;
                        }
                    });
                });
            }
        });
    });

    results.sort((a, b) => { return a.score >= b.score ? 1 : -1 });
    return results;
}

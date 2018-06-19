var baseUrl = "http://localhost:8082";
var endpointFullSearch = "/full";
var endpointTitleSearch = "/title";
var endpointAuthorSearch = "/author";




function onFullSearchClick() {
    var query = document.getElementById("idFullSearchInput").value;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {
        console.log(this.responseText);
        if (this.readyState === 4) {
            var responseJson = JSON.parse(this.responseText);
            console.log("XHR Response: ", responseJson);
            buildResultList(responseJson);
        }
    });

    var payload = JSON.stringify({ query: query });
    xhr.open("POST", baseUrl + endpointSearch);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.send(payload);
}

function onFullSearchClick() {
    var query = document.getElementById("idFullSearchInput").value;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {
        console.log(this.responseText);
        if (this.readyState === 4) {
            var responseJson = JSON.parse(this.responseText);
            console.log("XHR Response: ", responseJson);
            document.getElementById("idResultHeader").innerHTML = "Full Search Results (" + responseJson.books.length + " hits)";
            buildResultList(responseJson);
        }
    });

    var payload = JSON.stringify({ query: query });
    xhr.open("POST", baseUrl + endpointFullSearch);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.send(payload);
}

function onTitleSearchClick() {
    var query = document.getElementById("idTitleSearchInput").value;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function () {
        console.log(this.responseText);
        if (this.readyState === 4) {
            var responseJson = JSON.parse(this.responseText);
            console.log("XHR Response: ", responseJson);
            document.getElementById("idResultHeader").innerHTML = "Title Search Results (" + responseJson.books.length + " hits)";
            buildResultList(responseJson);
        }
    });

    var payload = JSON.stringify({ query: query });
    xhr.open("POST", baseUrl + endpointTitleSearch);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.send(payload);
}

// function onAuthorSearchClick() {
//     var query = document.getElementById("idAuthorSearchInput").value;

//     var xhr = new XMLHttpRequest();
//     xhr.withCredentials = false;

//     xhr.addEventListener("readystatechange", function () {
//         console.log(this.responseText);
//         if (this.readyState === 4) {
//             var responseJson = JSON.parse(this.responseText);
//             console.log("XHR Response: ", responseJson);
//             document.getElementById("idResultHeader").innerHTML = "Author Search Results (" + responseJson.books.length + " hits)";
//             buildResultList(responseJson);
//         }
//     });

//     var payload = JSON.stringify({ query: query });
//     xhr.open("POST", baseUrl + endpointAuthorSearch);
//     xhr.setRequestHeader('Content-Type', 'text/plain');
//     xhr.send(payload);
// }

function buildResultList(data) {
    var content = ""
    if (data.books) {
        data.books.forEach(function (book) {
            content += '<div class="alert alert-light alert-sm">' + book.title
                + '&nbsp;&nbsp;'
                + '<button onclick="window.open(\'' + book.url + '\', \'_blank\');" class="btn btn-sm btn-outline-primary" type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">'
                + 'More details'
                + '</button>'
                + '<div class="collapse alert alert-secondary" id="collapseExample">'
                + '<div class="card card-body">'
                + 'Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson'
                + '</div>'
                + '</div>'
                + '</div>'
        });
    }
    document.getElementById("idContent").innerHTML = content;
}

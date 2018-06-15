var baseUrl = "http://localhost:8080";
var endpointSearch = "/query";




function onSearchClick() {
    var query = document.getElementById("idSearchInput").value;

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

function buildResultList(data) {
    var content = ""
    data.savedBooks.forEach(function (title) {
        content += '<div class="alert alert-light alert-sm">' + title
            + '&nbsp;&nbsp;'
            + '<button class="btn btn-sm btn-outline-primary" type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">'

            + 'More details'
            + '</button>'

            + '<div class="collapse alert alert-secondary" id="collapseExample">'
            + '<div class="card card-body">'
            + 'Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson'
            + '</div>'
            + '</div>'
            + '</div>'
    });

    document.getElementById("idContent").innerHTML = content;
}
$.ajax({
    type: 'get',
    url: 'https://127.0.0.1:5000/mindmap',
    contentType: "application/json; charset=utf-8",
    success: function (dicts) {
        for (var dict in dicts) {
            mindmaps.LocalDocumentStorage.saveDocumentNotSerializable(dicts[dict]["map"])
        }
    },
    error: function (err) {
        console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
    }

});

docs = mindmaps.LocalDocumentStorage.getDocuments()

docs.forEach(function (doc, index) {
    uuid = doc.id
    $.ajax({
        type: 'get',
        url: 'https://127.0.0.1:5000/mindmap/info?uuid=' + uuid,
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var renderer = new mindmaps.StaticCanvasRenderer();
            var $img = renderer.renderAsPNG(doc);
            var description = data.description
            var title = data.title
            var uuid = data.uuid

            if (title == null || description == null) {
                title = "<a href=\"#\" uuid=" + uuid + " onclick=\"return switchDoc($(this));\">" + "not yet saved" + "</a>"
                description = "<a href=\"#\" uuid=" + uuid + " onclick=\"return switchDoc($(this));\">Save your project now?</a>"
                removeLink = "<a style='float: right; font-size: 15px;' uuid=" + uuid + " href=\"#\" onClick=\"remove($(this));\">delete</a>"
                targetRemoval = "<div card-uuid=\"" + uuid + "\" class=\"col-4\" style=\"margin-bottom: 10px\">"
            } else {
                title = "<a href=\"#\" uuid=" + uuid + " onclick=\"return switchDoc($(this));\">" + title + "</a>"
                description = "<a href=\"#\" uuid=" + uuid + " onclick=\"return switchDoc($(this));\">" + description + "</a>"
                removeLink = "<a style='float: right; font-size: 15px;' uuid=" + uuid + " href=\"#\" onClick=\"remove($(this));\">delete</a>"
                targetRemoval = "<div card-uuid=\"" + uuid + "\" class=\"col-4\" style=\"margin-bottom: 10px\">"
            }


            $("#my-gallery").append(" " + targetRemoval + " <div class=\"card h-100\"> " + "<div class=\"card-header\">" + removeLink + "</div>" + "<div id=\"my-img-" + index + "\"> " + "</div> " + "<div class=\"card-body\" id=\"card-body\">" + " <h5 class=\"card-title\">" + title + "</h5>" + " <p class=\"card-text\">" + description + "</p> </div> </div> </div>")


            $("#my-img-" + index).html($img.css("height", "120px").css("width", "120px"))
        },
        error: function (err) {
            console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
        }

    });
});

function remove(value) {
    url = 'https://127.0.0.1:5000/mindmap/remove?uuid=' + value.attr("uuid")
    $.ajax({
        type: 'DELETE', url: url, contentType: "application/json; charset=utf-8", success: function (data) {
            uuid = value.attr("uuid")
            $("[card-uuid=" + uuid + "]").remove()
            mindmaps.LocalDocumentStorage.deleteDocumentById(uuid)
        }, error: function (err) {
            console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
        }

    });


}

function switchDoc(value) {
    mindmaps.LocalDocumentStorage.setMainId(value.attr("uuid"));
    document.location.href = '/'
}


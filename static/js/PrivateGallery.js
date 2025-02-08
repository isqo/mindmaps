docs = []
$.ajax({
    type: 'get',
    url: 'https://treemap.services/mindmaps/mine',
    contentType: "application/json; charset=utf-8",
    success: function (dicts) {
        mindmaps.LocalDocumentStorage.clear();

        for (var dict in dicts) {
            console.log(dict)
            map = dicts[dict]["map"]
            doc = mindmaps.Document.fromObject(map)
            mindmaps.LocalDocumentStorage.saveDocument(doc)
        }
    },
    error: function (err) {
        console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
    }

});



docs = mindmaps.LocalDocumentStorage.getDocuments();

docs.forEach(function (doc, index) {
    uuid = doc.id
    $.ajax({
        type: 'get',
        url: 'https://treemap.services/mindmap/info?uuid=' + uuid,
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            var renderer = new mindmaps.StaticCanvasRenderer();
            var $img = renderer.renderAsPNG(doc);
            var description = data.description
            var title = data.title
            var uuid = data.uuid

            if (title == null || description == null) {
                title = "<p uuid=" + uuid + ">" + "not yet saved" + "</p>"
                description = "<p uuid=" + uuid + " style=\"white-space: nowrap;overflow: hidden;\">Save your project now?</p>"
                //removeLink = "<a style='float: right; font-size: 15px;' uuid=" + uuid + " href=\"#\" onClick=\"remove($(this));\">delete</a>"
                targetRemoval = "<div card-uuid=\"" + uuid + "\" class=\"col-4\" style=\"margin-bottom: 10px\">"
            } else {
                title = "<p  uuid=" + uuid + " onclick=\"return switchDoc($(this));\">" + title + "</p>"
                description = "<p uuid=" + uuid + " style=\"white-space: nowrap;overflow: hidden;\">" + description + "</p>"
                // removeLink = "<a style='float: right; font-size: 15px;' uuid=" + uuid + " href=\"#\" onClick=\"remove($(this));\">delete</a>"
                targetRemoval = "<div card-uuid=\"" + uuid + "\" class=\"col-4\" style=\"margin-bottom: 10px\">"
            }

            removeLink = "<button type=\"button\" class=\"btn-close\" aria-label=\"Close\"" + " style=\"float: right; font-size: 10px;\" uuid=" + uuid + " href=\"#\" onClick=\"remove($(this));\" ></button>"

            $("#my-gallery").append(" " + targetRemoval + " <div class=\"card h-100\"> " + "<div class=\"card-header\" style=' '>" + removeLink + "</div>" + "<a uuid=\"" + uuid + "\" onclick=\"return switchDoc($(this));\" id=\"my-img-" + index + "\" href='#'> " + "</a> " + "<div class=\"card-body\" id=\"card-body\">" + " <h5 class=\"card-title\">" + title + "</h5>" + " <div class=\"card-text\">" + description + "</div> </div> </div> </div>")


            $("#my-img-" + index).html($img.css("height", "200px").css("width", "200px"))
        },
        error: function (err) {
            console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
        }

    });
});

function remove(value) {
    $.confirm({
        title: 'Confirm!', content: 'are you sure you want to delete it ?', buttons: {
            confirm: function () {
                url = 'https://treemap.services/mindmap/remove?uuid=' + value.attr("uuid")
                $.ajax({
                    type: 'DELETE', url: url, contentType: "application/json; charset=utf-8", success: function (data) {
                        uuid = value.attr("uuid")
                        $("[card-uuid=" + uuid + "]").remove()
                        mindmaps.LocalDocumentStorage.deleteDocumentById(uuid)
                    }, error: function (err) {
                        console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
                    }

                });

            }, cancel: function () {
            }
        }
    });

}

function switchDoc(value) {
    mindmaps.LocalDocumentStorage.setMainId(value.attr("uuid"));
    document.location.href = '/'
}


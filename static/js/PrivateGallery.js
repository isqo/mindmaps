docs = []
url = mindmaps.Util.url("mindmaps/private")
$.ajax({
    type: 'get', url: url, contentType: "application/json; charset=utf-8", success: function (dicts) {
        index = 0;

        if(Object.keys(dicts).length == 0) {
            $("#my-gallery-2").html("<div class=\"alert alert-info  \" role=\"alert\">You don't have any private mindmap. you can create them or turn your existing ones into them after <a href='/premium'>subscription</a>.</div>")

        }

        console.log(dicts)
        dictionary=dicts;

        for (var dict in dicts) {
            data = dicts[dict]
            map = data["map"]
            doc = mindmaps.Document.fromObject(map)
            doc.setPrivate(true);
            mindmaps.LocalDocumentStorage.saveDocument(doc)
            uuid = doc.id

            var description = data.description
            var title = data.title
            var uuid = data.uuid


            var renderer = new mindmaps.StaticCanvasRenderer();
            var $img = renderer.renderAsPNG(doc);

            if (title == null || description == null) {
                title = "<p uuid=" + uuid + ">" + "not yet saved" + "</p>"
                description = "<p uuid=" + uuid + " style=\"white-space: nowrap;overflow: hidden;\">Save your project now?</p>"
                targetRemoval = "<div card-uuid=\"" + uuid + "\" class=\"col-lg-3 col-sm-6\" style=\"margin-bottom: 10px\">"
            } else {
                title = "<p  uuid=" + uuid + " onclick=\"return switchDoc('" + uuid + "');\">" + title + "</p>"
                description = "<p uuid=" + uuid + " style=\"white-space: nowrap;overflow: hidden;\">" + description + "</p>"
                targetRemoval = "<div card-uuid=\"" + uuid + "\" class=\"col-lg-3 col-sm-6\" style=\"margin-bottom: 10px\">"
            }
            removeLink = "<button type=\"button\" class=\"btn-close\" aria-label=\"Close\"" + " style=\"float: right; font-size: 10px;\" uuid=" + uuid + " href=\"#\" onClick=\"remove('" + uuid + "');\" ></button>"
            lock_link = "<a href=\"#\" uuid=" + uuid + " style='float: left; margin-right:10px;  margin-bottom: 0px; color: #14a800'><i class=\"fa fa-lock fa-2x\" aria-hidden=\"true\"></i></a>"
            editLink =  "<a  href=\"#\" uuid=" + uuid + " style='float: left; margin-right:10px;  margin-bottom: -2x    xpx; color: #14a800' onclick=\"return switchDoc($(this));\"><i class=\"fa fa-edit fa-2x\" aria-hidden=\"true\"></i></a>"

            $("#my-gallery-2").append(" " + targetRemoval + " <div class=\"card h-100\"> " + "<div class=\"card-header\" style=''>" + removeLink + lock_link + editLink + "</div>"
                + "<a data-bs-toggle=\"modal\" data-bs-target=\"#staticBackdrop\" key=\"" + dict + "\" uuid=\"" + uuid + "\" onclick=\"return ViewImage($((this)));\" id=\"my-img-" + index + "\" href='#'> "
                + "</a> " + "<div class=\"card-body\" id=\"card-body\">" + " <h5 class=\"card-title\">" + title + "</h5>" + " <div class=\"card-text\">" + description
                + "</div> </div> </div> </div>")

            $("#my-img-" + index).html($img.css("height", "200px").css("width", "200px"))

            index = index + 1;

        }
    }, error: function (err) {
        console.log("AJA" +
            "X error in request: " + JSON.stringify(err, null, 2));
    }

});

function ViewImage(value) {
    uuid = value.attr("uuid")
    key = value.attr("key")
    doc = mindmaps.Document.fromObject(dictionary[key]["map"])
    var renderer = new mindmaps.StaticCanvasRenderer();
    var $img = renderer.renderAsPNG(doc);
    $("#img-modal").html($img.css("display", "block").css("margin", "0 auto"))
    $("#edit-mindmap").attr("uuid", value.attr("uuid"))
    $("#edit-mindmap").attr("onclick", "switchDoc($(this));return false;")


    /*     doc = mindmaps.Document.fromObject(dictionary[key]["map"])
        var renderer = new mindmaps.StaticCanvasRenderer();
        var $img = renderer.renderAsPNG(doc);
        $("#img-modal").html($img.css("display", "block").css("margin", "0 auto"))

        $("#edit-mindmap").attr("uuid", value.attr("uuid"))
        $("#edit-mindmap").attr("onclick", "editMindmap($(this));return false;")*/
}

function remove(uuid) {

    $.confirm({
        title: 'Confirm!', content: 'are you sure you want to delete it ?', buttons: {
            confirm: function () {

                url3 = mindmaps.Util.url("mindmap/remove?uuid=" + uuid)
                $.ajax({
                    type: 'DELETE',
                    url: url3,
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        $("[card-uuid=" + uuid + "]").remove()
                        mindmaps.LocalDocumentStorage.deleteDocumentById(uuid)
                    },
                    error: function (err) {
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

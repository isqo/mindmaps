dictionary = {}
url = mindmaps.Util.url("mindmaps")
$.ajax({
    type: 'get', url: url, contentType: "application/json; charset=utf-8", success: function (dicts) {
        var renderer = new mindmaps.StaticCanvasRenderer();
        dictionary = dicts;

        for (var key in dicts) {
            user_id = dicts[key]["user_id"]
            title = dicts[key]["title"]
            description = dicts[key]["description"]
            doc = mindmaps.Document.fromObject(dicts[key]["map"])
            var $img = renderer.renderAsPNG(doc);
            uuid = dicts[key]["uuid"]
            user_name = dicts[key]["user_name"]
            card = " <div class=\"col-lg-3 col-sm-6\" style=\"margin-bottom: 10px\"> " + "<div class=\"card h-100\" style='border 0;    box-shadow: 0 0.25rem 1rem rgba(48, 55, 66, .15);'> " + "<a data-bs-toggle=\"modal\" data-bs-target=\"#staticBackdrop\"" + " href=\"#\" uuid=\"" + uuid + "\" key=\"" + key + "\" id=\"img-" + key + "\" " + "onclick=\"ViewImage($(this));return false;\">" + "<img class=\"card-img-top\" alt=\"...\"></a>" + " <div class=\"card-body\"> " + "<h5 class=\"card-title\">" + title + "</h5> <p class=\"card-text\" style=\"white-space: nowrap;overflow: hidden;\">" + description +
                "</p>   <a style='float: left;' href=\"/user/profile/" + user_id + "\" class=\"card-link\">@" + user_name + "</a> "
                + "</div>  </div> </div>"

            $("#gallery").append(card)
            $("#img-" + key).html($img.css("height", "200px").css("width", "200px"))

        }
    }, failure: function (fail) {
        console.log("AJAX fail in request: " + JSON.stringify(fail, null, 2));
    }, error: function (err) {
        console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
    }, timeout: 300000

});

function ViewImage(value) {
    key = value.attr("key")

    doc = mindmaps.Document.fromObject(dictionary[key]["map"])
    var renderer = new mindmaps.StaticCanvasRenderer();
    var $img = renderer.renderAsPNG(doc);
    $("#img-modal").html($img.css("display", "block").css("margin", "0 auto"))
    $("#edit-mindmap").attr("uuid", value.attr("uuid"))
    $("#edit-mindmap").attr("onclick", "editMindmap($(this));return false;")
}


function editMindmap(value) {
    uuid = value.attr("uuid")
    url = mindmaps.Util.url("mindmap/clone?uuid=" + uuid)
    $.ajax({
        type: 'post', url: url, contentType: "application/js    on; charset=utf-8", success: function (data) {
            map = data["map"]
            doc = mindmaps.Document.fromObject(map)
            mindmaps.LocalDocumentStorage.saveDocument(doc)
            switchDoc(doc.id)
        }
    });
}

function switchDoc(id) {
    mindmaps.LocalDocumentStorage.setMainId(id);
    document.location.href = '/'
}

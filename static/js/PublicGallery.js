dictionary = {}
$.ajax({
    type: 'get',
    url: 'https://treemap.services/mindmaps',
    contentType: "application/json; charset=utf-8",
    success: function (dicts) {
        var renderer = new mindmaps.StaticCanvasRenderer();
        dictionary = dicts;

        for (var key in dicts) {

            title = dicts[key]["title"]
            description = dicts[key]["description"]
            doc = mindmaps.Document.fromObject(dicts[key]["map"])
            uuid = dicts[key]["uuid"]
            var $img = renderer.renderAsPNG(doc);

            card = " <div class=\"col-4\" style=\"margin-bottom: 10px\"> " + "<div class=\"card h-100\"> "
                + "<a data-bs-toggle=\"modal\" data-bs-target=\"#staticBackdrop\" href=\"#\" uuid=\"" + uuid + "\" key=\"" + key + "\" id=\"img-" + key + "\" onclick=\"ViewImage($(this));return false;\"><img class=\"card-img-top\" alt=\"...\"></a>" +
                " <div class=\"card-body\"> "
                + "<h5 class=\"card-title\">" + title +
                "</h5> <p class=\"card-text\" style=\"white-space: nowrap;overflow: hidden;\">" + description + "</p> " +
                "</div>  </div> </div>"

            $("#gallery").append(card)
            $("#img-" + key).html($img.css("height", "200px").css("width", "200px"))

        }
    },
    failure: function(fail){
        console.log("AJAX fail in request: " + JSON.stringify(fail, null, 2));
    },
    error: function (err) {
        console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
    },
    timeout: 300000

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

function editMindmap(value){

    uuid=value.attr("uuid")
    $.ajax({
        type: 'post',
        url: 'https://treemap.services/mindmap/clone?uuid='+uuid,
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            map = data["map"]
            json = mindmaps.Document.fromObject(map)
            mindmaps.LocalDocumentStorage.saveDocument(json)
            switchDoc(json.id)
        }
    });
}

function switchDoc(id) {
    mindmaps.LocalDocumentStorage.setMainId(id);
    document.location.href = '/'
}

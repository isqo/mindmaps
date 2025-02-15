dictionary = {}
url = mindmaps.Util.url("/mindmaps/all")
$.ajax({
    type: 'get',
    url: url,
    contentType: "application/json; charset=utf-8",
    success: function (dicts) {
        console.log(dicts);
        dictionary = dicts;
        console.log(dictionary)
        for (var key in dicts) {

            id = dicts[key]["id"]
            uuid = dicts[key]["uuid"]
            customer_id = dicts[key]["customer_id"]
            title = dicts[key]["title"]
            description = dicts[key]["description"]
            map = dicts[key]["map"]

            var renderer = new mindmaps.StaticCanvasRenderer();
            doc = mindmaps.Document.fromObject(dicts[key]["map"])
            var $img = renderer.renderAsPNG(doc);

            mindmap = " <div class=\"col-md-6\" style=\"margin-top: 10px;\">\n" +
            "                    <div class=\"card\">\n" +
            "                        <div id=\"img-"+id+"\"></div>" +
            "                        <div class=\"card-body\">\n" +
            "                            <h5 class=\"card-title\">" + title + "</h5>\n" +
            "                            <p class=\"card-text\" style='overflow: hidden;text-overflow: ellipsis;display: -webkit-box;-webkit-line-clamp: 2;line-clamp: 2;-webkit-box-orient: vertical;'>"+ description +"</p>\n" +
            "                            <a href=\"/\" uuid=\""+uuid+"\" onclick=\"switchDoc($(this)); return false;\" class=\"btn btn-primary\">Open your mindmap</a>\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "                </div>"

             $("#mindmaps").append(mindmap)
             $("#img-" + key).html($img.css("height", "200px").css("width", "200px"))
        }

    },
    failure: function (fail) {
        console.log("AJAX fail in request: " + JSON.stringify(fail, null, 2));
    },
    error: function (err) {
        console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
    },
    timeout: 300000

});

dictionary = {}
url = mindmaps.Util.url("/user/info")
$.ajax({
    type: 'get',
    url: url,
    contentType: "application/json; charset=utf-8",
    success: function (user) {

    profile = "<div class=\"card\" style=\"width: 18rem;\">\n" +
        "                <img class=\"card-img-top\" src=\""+user.profile_pic+"\" alt=\"Card image cap\">\n" +
        "                <div class=\"card-body\">\n" +
        "                    <h5 class=\"card-title\">Profile</h5>\n" +
        "                </div>\n" +
        "                <ul class=\"list-group list-group-flush\">\n" +
        "                    <li class=\"list-group-item\">"+user.name+"</li>\n" +
        "                </ul>\n" +
        "                <div class=\"card-body\">\n" +
        "                    <a href=\"/gallery\" class=\"card-link\">Gallery</a>\n" +
        "                    <a href=\"/my-gallery\" class=\"card-link\">My Gallery</a>\n" +
        "                </div>\n" +
        "                <div class=\"list-group\" id=\"list-tab\" role=\"tablist\">\n" +
        "                    <a class=\"list-group-item list-group-item-action active\" id=\"list-home-list\" data-toggle=\"list\" href=\"/\" role=\"tab\" aria-controls=\"home\">Home</a>\n" +
        /*            "                    <a class=\"list-group-item list-group-item-action\" id=\"list-messages-list\" data-toggle=\"list\" href=\"#list-messages\" role=\"tab\" aria-controls=\"messages\">Messages</a>\n" +
                    "                    <a class=\"list-group-item list-group-item-action\" id=\"list-settings-list\" data-toggle=\"list\" href=\"#list-settings\" role=\"tab\" aria-controls=\"settings\">Settings</a>\n" +*/
        "                </div>\n" +
        "            </div>"

    $("#profile").append(profile)
    }});

function ViewImage(value) {
    alert("switchDoc")
/*    key = value.attr("key")

    doc = mindmaps.Document.fromObject(dictionary[key]["map"])
    var renderer = new mindmaps.StaticCanvasRenderer();
    var $img = renderer.renderAsPNG(doc);
    $("#img-modal").html($img.css("display", "block").css("margin", "0 auto"))
    $("#edit-mindmap").attr("uuid", value.attr("uuid"))
    $("#edit-mindmap").attr("onclick", "editMindmap($(this));return false;")*/
}


function editMindmap(value) {
    uuid = value.attr("uuid")
    url = mindmaps.Util.url("mindmap/clone?uuid=" + uuid)
    $.ajax({
        type: 'post',
        url: url,
        contentType: "application/js    on; charset=utf-8",
        success: function (data) {
            map = data["map"]
            doc = mindmaps.Document.fromObject(map)
            mindmaps.LocalDocumentStorage.saveDocument(doc)
            switchDoc(doc.id)
        }
    });
}

function switchDoc(value) {
    id=value.attr("uuid")
    mindmaps.LocalDocumentStorage.setMainId(id);
    document.location.href = '/'
}

docs = []
url = mindmaps.Util.url("mindmaps/mine?private=false")
$.ajax({
    type: 'get', url: url, contentType: "application/json; charset=utf-8", success: function (dicts) {
        dictionary = dicts
        for (var dict in dicts) {
            data = dicts[dict]
            map = data["map"]
            doc = mindmaps.Document.fromObject(map)
            var index = dict
            var title = data.title
            var description = data.description
            var uuid = data.uuid
            var renderer = new mindmaps.StaticCanvasRenderer();
            var $img = renderer.renderAsPNG(doc);

            if (title == null || description == null) {
                title = "<p uuid=" + uuid + ">" + "not yet saved" + "</p>"
                description = "<p uuid=" + uuid + " style=\"white-space: nowrap;overflow: hidden;\">Save your project now?</p>"
                //removeLink = "<a style='float: right; font-size: 15px;' uuid=" + uuid + " href=\"#\" onClick=\"remove($(this));\">delete</a>"
                targetRemoval = "<div card-uuid=\"" + uuid + "\" class=\"col-lg-3 col-sm-6\" style=\"margin-bottom: 10px\">"
            } else {
                title = "<p  uuid=" + uuid + " onclick=\"return switchDoc($(this));\">" + title + "</p>"
                description = "<p uuid=" + uuid + " style=\"white-space: nowrap;overflow: hidden;\">" + description + "</p>"
                // removeLink = "<a style='float: right; font-size: 15px;' uuid=" + uuid + " href=\"#\" onClick=\"remove($(this));\">delete</a>"
                targetRemoval = "<div card-uuid=\"" + uuid + "\" class=\"col-lg-3 col-sm-6\" style=\"margin-bottom: 10px\">"
            }

            removeLink = "<button type=\"button\" class=\"btn-close\" aria-label=\"Close\"" + " style=\"float: right; font-size: 10px;\" uuid=" + uuid + " href=\"#\" onClick=\"remove($(this));\" ></button>"
            editLink =  "<a  href=\"#\" uuid=" + uuid + " style='float: left; margin-right:10px;  margin-bottom: 5px; color: #14a800' onclick=\"return switchDoc($(this));\"><i class=\"fa fa-edit fa-2x\" aria-hidden=\"true\"></i></a>"
            lock_link = "<a  href=\"#\" uuid=" + uuid + " style='float: left; margin-right:10px;  margin-bottom: 5px; color: #14a800' onClick=\"lock($(this));\"><i class=\"fa fa-unlock-alt fa-2x\" aria-hidden=\"true\"></i></a>"

            $("#my-gallery").append(" " + targetRemoval + " <div class=\"card h-100\"> " + "<div class=\"card-header\" style=' '>" +  removeLink  + lock_link + editLink +  "</div>" +
                "<a data-bs-toggle=\"modal\" data-bs-target=\"#staticBackdrop\" key=\"" + index + "\" uuid=\"" + uuid + "\" onclick=\"return ViewImage($((this)));\" id=\"my-img-" + index + "\" href='#'> " + "</a> " + "<div class=\"card-body\" id=\"card-body\">" + " <h5 class=\"card-title\">" + title + "</h5>" + " <div class=\"card-text\">" + description + "</div> </div> </div> </div>")

            $("#my-img-" + index).html($img.css("height", "200px").css("width", "200px"))

            mindmaps.LocalDocumentStorage.saveDocument(doc)
        }
    }, error: function (err) {
        console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
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
    $("#edit-mindmap").attr("onclick", "editMindmap($(this));return false;")
}


function lock(value) {


    url3 = mindmaps.Util.url("user/premium")
    $.ajax({
        type: 'GET', url: url3, contentType: "application/json; charset=utf-8", success: function (data) {

            if (data.premium === true) {

                $.confirm({
                    title: 'Confirm!', content: 'are you sure you want to make it private?', buttons: {
                        confirm: function () {
                            url3 = mindmaps.Util.url("mindmap/private?uuid=" + value.attr("uuid"))

                            $.ajax({
                                type: 'POST',
                                url: url3,
                                contentType: "application/json; charset=utf-8",
                                success: function (data) {
                                    uuid = value.attr("uuid")
                                    $("[card-uuid=" + uuid + "]").remove()
                                    switchDocId(uuid, "/my-private")


                                },
                                error: function (err) {
                                    console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
                                }

                            });

                        }, cancel: function () {
                        }
                    }
                });

            } else {
                $('#exampleModal').modal('show');
            }


        }, error: function (err) {
            console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
        }

    });

}

function editMindmap(value) {
    mindmaps.LocalDocumentStorage.setMainId(value.attr("uuid"));
    document.location.href = '/'
}

function remove(value) {
    $.confirm({
        title: 'Confirm!', content: 'are you sure you want to delete it ?', buttons: {
            confirm: function () {
                url3 = mindmaps.Util.url("mindmap/remove?uuid=" + value.attr("uuid"))
                $.ajax({
                    type: 'DELETE',
                    url: url3,
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        uuid = value.attr("uuid")
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

function switchDocId(uuid, path) {
    mindmaps.LocalDocumentStorage.setMainId(uuid);
    document.location.href = path
}


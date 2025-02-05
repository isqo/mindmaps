$.ajax({
    type: 'get',
    url: 'https://127.0.0.1:5000/mindmap',
    contentType: "application/json; charset=utf-8",
    success: function (dicts) {
        var renderer = new mindmaps.StaticCanvasRenderer();
        for (var key in dicts) {
            title = dicts[key]["title"]
            description = dicts[key]["description"]
            doc = mindmaps.Document.fromObject(dicts[key]["map"])
            var $img = renderer.renderAsPNG(doc);
            card = " <div class=\"col-4\" style=\"margin-bottom: 10px\"> " +
                "<div class=\"card h-100\"> " +
                "<a href=\"#\" id=\"img-"+key+"\"><img class=\"card-img-top\" alt=\"...\"></a> <div class=\"card-body\"> " +
                "<h5 class=\"card-title\">"+title+"</h5> <p class=\"card-text\" style=\"white-space: nowrap;overflow: hidden;\">" +
                description +
                "</p> </div> </div> </div>"
            $("#gallery").append(card)
            $("#img-" + key).html($img.css("height", "200px").css("width", "200px"))


        }
    },
    error: function (err) {
        console.log("AJAX error in request: " + JSON.stringify(err, null, 2));
    }

});
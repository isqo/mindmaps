/**
 *
 * @constructor
 */
mindmaps.MindMapInfoView = function () {
    var self = this;


    // create dialog
    var $dialog = $("#template-mind-map-info").tmpl().dialog({
        autoOpen: false, modal: true, zIndex: 5000, width: "auto", height: "auto", close: function () {
            $(this).dialog("destroy");
            $(this).remove();
        }, open: function () {
            map_uuid=mindmaps.LocalDocumentStorage.getMainId()
            $.ajax({
                type: 'get',
                    url: 'https://treemap.services/mindmap/info?uuid='+map_uuid,
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    $('#mindmap-title').val(data.title)
                    $('#mindmap-description').val(data.description)
                }
            });

            $(this).css({
                "max-width": $(window).width() * 0.9, "max-height": $(window).height() * 0.8
            });
            $dialog.dialog("option", "position", "center");
        }, buttons: {
            "Save": function () {
                map_uuid=mindmaps.LocalDocumentStorage.getMainId()
                title = $('#mindmap-title').val()
                description = $('#mindmap-description').val()
                data = {
                    "title": title, "description": description
                }
                $.ajax({
                    type: 'post',
                    url: 'https://treemap.services/mindmap/info?uuid='+map_uuid,
                    data: JSON.stringify(data),
                    contentType: "application/json; charset=utf-8",
                });

                $(this).dialog("close");
            }
        }
    });

    /**
     * Shows the dialog.
     *
     */
    this.showDialog = function () {
        $dialog.dialog("open");
    };

    /**
     * Hides the dialog.
     */
    this.hideDialog = function () {
        $dialog.dialog("close");

    };

    this.setImage = function ($img) {
        $("#export-preview").html($img);
    };
};

/**
 *
 * @constructor
 * @param {mindmaps.EventBus} eventBus
 * @param {mindmaps.MindMapModel} mindmapModel
 * @param {mindmaps.ExportMapView} view
 */
mindmaps.MindMapInfoPresenter = function (eventBus, mindmapModel, view) {
    var renderer = new mindmaps.StaticCanvasRenderer();
    this.go = function () {
        var $img = renderer.renderAsPNG(mindmapModel.getDocument());
        view.setImage($img);

        // slightly delay showing the dialog. otherwise dialog is not correctly
        // centered, because the image is inserted too late
        setTimeout(function () {
            view.showDialog();
        }, 30);
    };
};

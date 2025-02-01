/**
 * Unused for now.
 *
 * @constructor
 */
mindmaps.NewDocumentView = function () {
    var self = this
    // create dialog

    var $dialog = $("#template-new").tmpl().dialog({
        autoOpen: false,
        modal: true,
        zIndex: 5000,
        width: 550,
        close: function () {
            $(this).dialog("destroy");
            $(this).remove();
        }
    });


    this.showOpenDialog = function () {
        $dialog.dialog("open");
    };

    /**
     * Hides the dialog.
     */
    this.hideOpenDialog = function () {
        $dialog.dialog("close");
    };


};

/**
 * Creates a new NewDocumentPresenter. This presenter has no view associated
 * with it for now. It simply creates a new document. It could in the future
 * display a dialog where the user could chose options like document title and
 * such.
 *
 * @constructor
 */
mindmaps.NewDocumentPresenter = function (eventBus, mindmapModel, view) {

    $("#button-new-confirm").button().click(function () {
        //mindmaps.LocalDocumentStorage.clear();

        var doc = new mindmaps.Document();
        mindmapModel.setDocument(doc);
        view.hideOpenDialog()
    });

    $("#button-new-cancel").button().click(function () {
        view.hideOpenDialog()
    });

    this.go = function () {
        view.showOpenDialog();
    };
};

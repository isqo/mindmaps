/**
 * Creates a new SaveDocumentView. This view renders a dialog where the user can
 * save the mind map.
 *
 * @constructor
 */
mindmaps.SaveRemotelyDocumentView = function() {
  var self = this;

  var $dialog = $("#template-save-cloud").tmpl().dialog({
    autoOpen : false,
    modal : true,
    zIndex : 5000,
    width : 550,
    close : function() {
      // remove dialog from DOM
      $(this).dialog("destroy");
      $(this).remove();
    }
  });


  var $saveCloudStorageButton = $("#button-save-cloud").button().click(
      function() {
        if (self.CloudStorageClicked) {
          self.CloudStorageClicked();
          self.hideSaveDialog();
        }
      });

  this.showSaveDialog = function() {
    $dialog.dialog("open");
  };

  this.hideSaveDialog = function() {
    $dialog.dialog("close");
  };

  this.showCloudError = function(msg) {
    $dialog.find('.cloud-loading').removeClass('loading');
    $dialog.find('.cloud-error').text(msg);
  };

  this.showCloudLoading = function() {
    $dialog.find('.cloud-error').text('');
    $dialog.find('.cloud-loading').addClass('loading');
  };

  this.hideCloudLoading = function() {
    $dialog.find('.cloud-loading').removeClass('loading');
  };
};

/**
 * Creates a new SaveDocumentPresenter. The presenter can store documents in the
 * local storage or to a hard disk.
 *
 * @constructor
 * @param {mindmaps.EventBus} eventBus
 * @param {mindmaps.MindMapModel} mindmapModel
 * @param {mindmaps.SaveDocumentView} view
 * @param {mindmaps.AutoSaveController} autosaveController
 * @param {mindmaps.FilePicker} filePicker
 */
mindmaps.SaveRemotelyDocumentPresenter = function(eventBus, mindmapModel, view, autosaveController, filePicker) {

  /**
   * Save in cloud button was clicked.
   */

  /**
   * View callback when local storage button was clicked. Saves the document
   * in the local storage.
   *
   * @ignore
   */

  view.CloudStorageClicked = function() {
    mindmapModel.saveToLocalStorageAndCloudNoLimits();
  };

  /**
   * View callback: Enables or disables the autosave function for localstorage.
   *
   * @ignore
   */

  this.go = function() {
      view.showSaveDialog();
  };
};

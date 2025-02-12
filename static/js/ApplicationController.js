function logOut() {

  url=mindmaps.Util.url("logout")
  $.ajax({
    url : url,
    type : 'GET',
    success : function(data) {
      console.log('Data: '+data);
      window.location.href = '/';
    },
    error : function(request,error)
    {
    }
  });
}

/**
 * Creates a new Application Controller.
 *
 * @constructor
 */
mindmaps.ApplicationController = function() {
  var eventBus = new mindmaps.EventBus();
  var shortcutController = new mindmaps.ShortcutController();
  var commandRegistry = new mindmaps.CommandRegistry(shortcutController);
  var undoController = new mindmaps.UndoController(eventBus, commandRegistry);
  var mindmapModel = new mindmaps.MindMapModel(eventBus, commandRegistry, undoController);
  var clipboardController = new mindmaps.ClipboardController(eventBus,
      commandRegistry, mindmapModel);
  var helpController = new mindmaps.HelpController(eventBus, commandRegistry);
  var printController = new mindmaps.PrintController(eventBus,
      commandRegistry, mindmapModel);
  var autosaveController = new mindmaps.AutoSaveController(eventBus, mindmapModel);
  var filePicker = new mindmaps.FilePicker(eventBus, mindmapModel);

  /**
   * Handles the new document command.
   */
    function doNewDocument() {
    // close old document first
    //var doc = mindmapModel.getDocument();
    //mindmaps.LocalDocumentStorage.clear();
    //doCloseDocument();
    //mindmaps.LocalDocumentStorage.clear();

    var doc = mindmapModel.getDocument()
    if (doc == null)
    {
      var doc = new mindmaps.Document();
      mindmapModel.setDocument(doc);
    }
    else
    {
      var presenter = new mindmaps.NewDocumentPresenter(eventBus,
          mindmapModel, new mindmaps.NewDocumentView());

      presenter.go();
    }
  }

  /**
   * Handles the save document command.
   */
  function doSaveDocument() {
    var presenter = new mindmaps.SaveDocumentPresenter(eventBus,
        mindmapModel, new mindmaps.SaveDocumentView(), autosaveController, filePicker);
    presenter.go();
  }

  function doSaveRemotelyDocument() {
    var presenter = new mindmaps.SaveRemotelyDocumentPresenter(eventBus,
        mindmapModel, new mindmaps.SaveRemotelyDocumentView(), autosaveController, filePicker);

    presenter.go();
  }

  /**
   * Handles the close document command.
   */
  function doCloseDocument() {
    var doc = mindmapModel.getDocument();
    if (doc) {
      // TODO for now simply publish events, should be intercepted by
      // someone
      mindmapModel.setDocument(null);
    }
  }

  /**
   * Handles the open document command.
   */
  function doOpenDocument() {
    var presenter = new mindmaps.OpenDocumentPresenter(eventBus,
        mindmapModel, new mindmaps.OpenDocumentView(), filePicker);
    presenter.go();
  }

  function doExportDocument() {
    var presenter = new mindmaps.ExportMapPresenter(eventBus,
        mindmapModel, new mindmaps.ExportMapView());
    presenter.go();
  }
  function mindMapInfoHandler() {
    var presenter = new mindmaps.MindMapInfoPresenter(eventBus,
        mindmapModel, new mindmaps.MindMapInfoView());
    presenter.go();
  }

    function myGalleryHandler() {
      document.location.href = '/my-gallery'
  }

  /**
   * Initializes the controller, registers for all commands and subscribes to
   * event bus.
   */
  this.init = function() {



    var newDocumentCommand = commandRegistry
        .get(mindmaps.NewDocumentCommand);
    newDocumentCommand.setHandler(doNewDocument);
    newDocumentCommand.setEnabled(true);

    var openDocumentCommand = commandRegistry
        .get(mindmaps.OpenDocumentCommand);
    openDocumentCommand.setHandler(doOpenDocument);
    openDocumentCommand.setEnabled(true);

    var SaveRemotelyDocumentCommand = commandRegistry.get(mindmaps.SaveRemotelyDocumentCommand);
    SaveRemotelyDocumentCommand.setHandler(doSaveRemotelyDocument);

    var saveDocumentCommand = commandRegistry
        .get(mindmaps.SaveDocumentCommand);
    saveDocumentCommand.setHandler(doSaveDocument);

    var closeDocumentCommand = commandRegistry
        .get(mindmaps.CloseDocumentCommand);
    closeDocumentCommand.setHandler(doCloseDocument);
    closeDocumentCommand
    var logOutCommand = commandRegistry
        .get(mindmaps.LogOut);
    logOutCommand.setHandler(logOut);

    var  GalleryCommand = commandRegistry
        .get(mindmaps.myGallery);
    GalleryCommand.setHandler(myGalleryHandler);

    var  GalleryCommand = commandRegistry
        .get(mindmaps.mindMapInfo);
    GalleryCommand.setHandler(mindMapInfoHandler);

    var exportCommand = commandRegistry.get(mindmaps.ExportCommand);
    exportCommand.setHandler(doExportDocument);

    eventBus.subscribe(mindmaps.Event.DOCUMENT_CLOSED, function() {
      saveDocumentCommand.setEnabled(false);
      closeDocumentCommand.setEnabled(false);
      exportCommand.setEnabled(false);
    });

    eventBus.subscribe(mindmaps.Event.DOCUMENT_OPENED, function() {
      saveDocumentCommand.setEnabled(true);
      closeDocumentCommand.setEnabled(true);
      exportCommand.setEnabled(true);
    });


  };

  /**
   * Launches the main view controller.
   */
  this.go = function() {
    var viewController = new mindmaps.MainViewController(eventBus,
        mindmapModel, commandRegistry);
    viewController.go();

        docId=mindmaps.LocalDocumentStorage.getMainId()
        doc=mindmaps.LocalDocumentStorage.loadDocument(docId)
        if (doc != null) {
          mindmapModel.setDocument(doc)
        }
        else {
          doNewDocument();
        }
  };

  this.init();
};

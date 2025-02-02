docId=mindmaps.LocalDocumentStorage.getDocumentId()
var renderer = new mindmaps.StaticCanvasRenderer();
doc=mindmaps.LocalDocumentStorage.loadDocument(docId)
console.log(doc)
var $img = renderer.renderAsPNG(doc);
$("#my-gallery").html($img.css("height","120px").css("width","120px"));

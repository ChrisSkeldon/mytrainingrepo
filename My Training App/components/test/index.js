'use strict';

app.test = kendo.observable({
    onShow: function() { },
    afterShow: function() { }
});
app.localization.registerView('test');

// START_CUSTOM_CODE_test
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

var inited = false;
var saveButton;
var jsdo;
var imageData;

/**
 * Load item data from the server.
 */
function loadData () {

  if (jsdo) {
    jsdo.fill({sort: [{ field: 'ItemName', dir: 'asc' }]})
      .then(function ( jsdo, success, request ) {
        var items = jsdo.getData();
        var itemsList = $('#itemsList');

        // Clear out whatever is in the list and refill.

        itemsList.empty(); 
        items.forEach(function(item) {
          itemsList.append('<option value="' + item.Itemnum + '">' + item.ItemName + '</option>');
        });
      })
      .fail(function ( jsdo, success, request ) {
        logError('jsdo fill failed:', request);
      });
  } else {
    logError('no jsdo object available');
  }
}

function logError(msg) {
  logMsg('Error: ' + msg);
}

function logMsg(msg) {
  $('#msgArea').append(msg + '\n');
}

/**
 * Upload a picture to the server by putting it into the blob field on the
 * temp-table and senting it back.
 */
function uploadPicture() {

  var selectedItem = $('#itemsList').val();

  var item = jsdo.find(function(jsrecord) {
    return (jsrecord.data.Itemnum == selectedItem);
  });
 
  item.assign({ItemData: imageData});

  jsdo.saveChanges()
    .done(function( jsdo, success, request ) {
      logMsg('update good');
      $('#savePic').hide();
    })
    .fail(function( jsdo, success, request ) {
      logError('update failed');
    });
}

/**
 * Initialises the component.
 */
function initComponent() {
  inited = true;
  saveButton = $('#savePic');

  saveButton.hide(); // Do not want to show the button until we have an image.

  // If we come in here before other views that use the JSDOs, the catalogs
  // will not have been loaded, so we load them now. 

  app.data.progressDataProvider.loadCatalogs()
    .then(function() {
      try {
        jsdo = new progress.data.JSDO('SIItem');
      } catch (e) {
        // NB. then() does not propogate errors 
        logErr('caught err:', e)
      }
    })
    .then (function () {
     loadData();
    })
    .fail(function(err) {
      logMsg('my err handler', err);
    });

  $('#pic').click(function () {
    navigator.camera.getPicture(function (imageURI) { // Worked 
                                var image = document.getElementById('myPic');

                              //  imageData = imageURI;

                                image.src = imageURI;
                                saveButton.show();
                                logMsg('URI: ' + imageURI);
                                var reader = new FileReader();

                                reader.onload = function(e) {
                                  logError('reading err: ' + err);
                                 var rawData = reader.result;
                                }
         
                               window.resolveLocalFileSystemURL(imageURI, 
                                 function(fileEntry) {
                                   logMsg('Resolved: ' + fileEntry)
                                   //  reader.readAsBinaryString(fileEntry);
                                 }, 
                                 function(evt) {
                                  logMsg('resolve url err: ' + evt); 
                                 });
                              }, 
                              function (msg) { //Failed
                                logError('Picture taking failed: ' + msg);
                                saveButton.hide();
                              }, 
                              { quality: 50,
                              //  destinationType: Camera.DestinationType.DATA_URL
                                destinationType: Camera.DestinationType.FILE_URI
                              // destinationType: Camera.DestinationType.NATIVE_URI 
                              });
                              });   

  $('#savePic').click(uploadPicture);

}

// Override the onShow handler so that we can initialise the component the 
// first time is it used.
app.test.set('onShow', function () {

  if (!inited) {
    initComponent(); // Will also load data from the server.  
  } else {
    // Not the first time this page as been viewed, so refresh the data.
    loadData();
  }

});   

// END_CUSTOM_CODE_test
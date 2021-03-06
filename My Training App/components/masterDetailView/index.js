'use strict';

app.masterDetailView = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});
app.localization.registerView('masterDetailView');

// START_CUSTOM_CODE_masterDetailView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_masterDetailView
(function(parent) {
    var dataProvider = app.data.progressDataProvider,
        /// start global model properties
        /// end global model properties
        fetchFilteredData = function(paramFilter, searchFilter) {
            var model = parent.get('masterDetailViewModel'),
                dataSource;

            if (model) {
                dataSource = model.get('dataSource');
            } else {
                parent.set('masterDetailViewModel_delayedFetch', paramFilter || null);
                return;
            }

            if (paramFilter) {
                model.set('paramFilter', paramFilter);
            } else {
                model.set('paramFilter', undefined);
            }

            if (paramFilter && searchFilter) {
                dataSource.filter({
                    logic: 'and',
                    filters: [paramFilter, searchFilter]
                });
            } else if (paramFilter || searchFilter) {
                dataSource.filter(paramFilter || searchFilter);
            } else {
                dataSource.filter({});
            }
        },

        jsdoOptions = {
            name: 'SIItem',
            autoFill: false
        },
        dataSourceOptions = {
            type: 'jsdo',
            transport: {},
            error: function(e) {
                app.mobileApp.pane.loader.hide();
                if (e.xhr) {
                    var errorText = "";
                    try {
                        errorText = JSON.stringify(e.xhr);
                    } catch (jsonErr) {
                        errorText = e.xhr.responseText || e.xhr.statusText || 'An error has occurred!';
                    }
                    alert(errorText);
                } else if (e.errorThrown) {
                    alert(e.errorThrown);
                }
            },
            schema: {
                model: {
                    fields: {
                        'ItemName': {
                            field: 'ItemName',
                            defaultValue: ''
                        },
                        'Itemnum': {
                            field: 'Itemnum',
                            defaultValue: ''
                        },
                    }
                }
            },
            serverFiltering: true,
            serverSorting: true,
            sort: {
                field: 'ItemName',
                dir: 'asc'
            },
            serverPaging: true,
            pageSize: 50
        },
        /// start data sources
        /// end data sources
        masterDetailViewModel = kendo.observable({
            _dataSourceOptions: dataSourceOptions,
            _jsdoOptions: jsdoOptions,
            searchChange: function(e) {
                var searchVal = e.target.value,
                    searchFilter;

                if (searchVal) {
                    searchFilter = {
                        field: 'ItemName',
                        operator: 'contains',
                        value: searchVal
                    };
                }
                fetchFilteredData(masterDetailViewModel.get('paramFilter'), searchFilter);
            },
            fixHierarchicalData: function(data) {
                var result = {},
                    layout = {};

                $.extend(true, result, data);

                (function removeNulls(obj) {
                    var i, name,
                        names = Object.getOwnPropertyNames(obj);

                    for (i = 0; i < names.length; i++) {
                        name = names[i];

                        if (obj[name] === null) {
                            delete obj[name];
                        } else if ($.type(obj[name]) === 'object') {
                            removeNulls(obj[name]);
                        }
                    }
                })(result);

                (function fix(source, layout) {
                    var i, j, name, srcObj, ltObj, type,
                        names = Object.getOwnPropertyNames(layout);

                    if ($.type(source) !== 'object') {
                        return;
                    }

                    for (i = 0; i < names.length; i++) {
                        name = names[i];
                        srcObj = source[name];
                        ltObj = layout[name];
                        type = $.type(srcObj);

                        if (type === 'undefined' || type === 'null') {
                            source[name] = ltObj;
                        } else {
                            if (srcObj.length > 0) {
                                for (j = 0; j < srcObj.length; j++) {
                                    fix(srcObj[j], ltObj[0]);
                                }
                            } else {
                                fix(srcObj, ltObj);
                            }
                        }
                    }
                })(result, layout);

                return result;
            },
            itemClick: function(e) {
                var dataItem = e.dataItem || masterDetailViewModel.originalItem;

                app.mobileApp.navigate('#components/masterDetailView/details.html?uid=' + dataItem.uid);

            },
            editClick: function() {
                var uid = this.originalItem.uid;
                app.mobileApp.navigate('#components/masterDetailView/edit.html?uid=' + uid);
            },
            detailsShow: function(e) {
                var uid = e.view.params.uid,
                    dataSource = masterDetailViewModel.get('dataSource'),
                    itemModel = dataSource.getByUid(uid);

                masterDetailViewModel.setCurrentItemByUid(uid);

                /// start detail form show
                /// end detail form show
            },
            setCurrentItemByUid: function(uid) {
                var item = uid,
                    dataSource = masterDetailViewModel.get('dataSource'),
                    itemModel = dataSource.getByUid(item);

                if (!itemModel.ItemName) {
                    itemModel.ItemName = String.fromCharCode(160);
                }

                /// start detail form initialization
                /// end detail form initialization

                masterDetailViewModel.set('originalItem', itemModel);
                masterDetailViewModel.set('currentItem',
                    masterDetailViewModel.fixHierarchicalData(itemModel));

                return itemModel;
            },
            linkBind: function(linkString) {
                var linkChunks = linkString.split('|');
                if (linkChunks[0].length === 0) {
                    return this.get('currentItem.' + linkChunks[1]);
                }
                return linkChunks[0] + this.get('currentItem.' + linkChunks[1]);
            },
            /// start masterDetails view model functions
            /// end masterDetails view model functions
            currentItem: {}
        });

    parent.set('editItemViewModel', kendo.observable({
        /// start edit model properties
        /// end edit model properties
        /// start edit model functions
        /// end edit model functions
        editFormData: {},
        onShow: function(e) {
            var that = this,
                itemUid = e.view.params.uid,
                dataSource = masterDetailViewModel.get('dataSource'),
                itemData = dataSource.getByUid(itemUid),
                fixedData = masterDetailViewModel.fixHierarchicalData(itemData);

            /// start edit form before itemData
            /// end edit form before itemData

            this.set('itemData', itemData);
            this.set('editFormData', {
                itemName: itemData.ItemName,
                /// start edit form data init
                /// end edit form data init
            });

            /// start edit form show
            /// end edit form show
        },
        linkBind: function(linkString) {
            var linkChunks = linkString.split(':');
            return linkChunks[0] + ':' + this.get('itemData.' + linkChunks[1]);
        },
        onSaveClick: function(e) {
            var that = this,
                editFormData = this.get('editFormData'),
                itemData = this.get('itemData'),
                dataSource = masterDetailViewModel.get('dataSource');

            /// edit properties
            itemData.set('ItemName', editFormData.itemName);
            /// start edit form data save
            /// end edit form data save

            function editModel(data) {
                /// start edit form data prepare
                /// end edit form data prepare
                dataSource.one('sync', function(e) {
                    /// start edit form data save success
                    /// end edit form data save success

                    app.mobileApp.navigate('#:back');
                });

                dataSource.one('error', function() {
                    dataSource.cancelChanges(itemData);
                });

                dataSource.sync();
                app.clearFormDomData('edit-item-view');
            };
            /// start edit form save
            /// end edit form save
            /// start edit form save handler
            editModel();
            /// end edit form save handler
        },
        onCancel: function() {
            /// start edit form cancel
            /// end edit form cancel
        }
    }));

    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('masterDetailViewModel', masterDetailViewModel);
            var param = parent.get('masterDetailViewModel_delayedFetch');
            if (typeof param !== 'undefined') {
                parent.set('masterDetailViewModel_delayedFetch', undefined);
                fetchFilteredData(param);
            }
        });
    } else {
        parent.set('masterDetailViewModel', masterDetailViewModel);
    }

    parent.set('onShow', function(e) {
        var param = e.view.params.filter ? JSON.parse(e.view.params.filter) : null,
            isListmenu = false,
            backbutton = e.view.element && e.view.element.find('header [data-role="navbar"] .backButtonWrapper'),
            dataSourceOptions = masterDetailViewModel.get('_dataSourceOptions'),
            dataSource;

        if (param || isListmenu) {
            backbutton.show();
            backbutton.css('visibility', 'visible');
        } else {
            if (e.view.element.find('header [data-role="navbar"] [data-role="button"]').length) {
                backbutton.hide();
            } else {
                backbutton.css('visibility', 'hidden');
            }
        }

        dataProvider.loadCatalogs().then(function _catalogsLoaded() {
            var jsdoOptions = masterDetailViewModel.get('_jsdoOptions'),
                jsdo = new progress.data.JSDO(jsdoOptions);

            dataSourceOptions.transport.jsdo = jsdo;
            dataSource = new kendo.data.DataSource(dataSourceOptions);
            masterDetailViewModel.set('dataSource', dataSource);

            fetchFilteredData(param);
        });
    });

})(app.masterDetailView);

// START_CUSTOM_CODE_masterDetailViewModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes
var dataSourceOptions = app.masterDetailView.masterDetailViewModel.get('_dataSourceOptions');
dataSourceOptions.serverFiltering = true;
dataSourceOptions.serverSorting = true;
dataSourceOptions.serverPaging = true;
dataSourceOptions.pageSize = 10;
dataSourceOptions.transport = {
    countFnName: 'Count'
};

// you can handle the beforeFill / afterFill events here. For example:

app.masterDetailView.masterDetailViewModel.get('_jsdoOptions').events = {
    /* 'beforeFill' : [ {
         scope : app.masterDetailView.masterDetailViewModel,
         fn : function (jsdo, success, request) {
             // beforeFill event handler statements ...
         }
     } ] */

    'afterSaveChanges': [{
        scope: app.masterDetailView.masterDetailViewModel,
        fn: function(jsdo, success, request) {
            var errorMsg = 'unknown error';
            var errorPanel;
            var resp;

            console.log('success:', success, 'request:', request, 'error:', request.response._retVal);

            if (!success && request.response) {
                resp = request.response;

                if (resp._retVal) {
                    // Catches RETURN ERROR
                    errorMsg = resp._retVal
                } else if (resp._errors instanceof Array && resp._errors.length > 0) {
                    // Catches AppError()
                    errorMsg = resp._errors[0]._errorMsg;
                } else if (resp.dsItem['prods:errors'] &&
                    resp.dsItem['prods:errors'].ttItem instanceof Array &&
                    resp.dsItem['prods:errors'].ttItem.length > 0) {
                    // Catch ProDataSet errors

                    errorMsg = '';
                    resp.dsItem['prods:errors'].ttItem.forEach(function(err) {
                        errorMsg += err['prods:error'];
                    });
                }
            }
            // alert('Error from server: ' + errorMsg);
            errorPanel = document.getElementById('errorstringField');
            errorPanel.innerHTML = errorMsg;
        }
    }]
};

// END_CUSTOM_CODE_masterDetailViewModel
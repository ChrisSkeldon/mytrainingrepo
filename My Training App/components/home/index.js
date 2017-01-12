'use strict';

app.home = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});
app.localization.registerView('home');

// START_CUSTOM_CODE_home
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_home
(function(parent) {
    var
    /// start global model properties
    /// end global model properties
        homeModel = kendo.observable({
        /// start add model functions
        /// end add model functions

    });

    /// start form functions
    /// end form functions

    parent.set('onShow', function _onShow() {
        var that = parent;
        that.set('addFormData', {
            home: 'Test App Home Page',
            /// start add form data init
            /// end add form data init
        });
        /// start add form show
        /// end add form show
    });
    parent.set('homeModel', homeModel);
})(app.home);

// START_CUSTOM_CODE_homeModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_homeModel
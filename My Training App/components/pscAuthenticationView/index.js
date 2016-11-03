'use strict';

app.pscAuthenticationView = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

// START_CUSTOM_CODE_pscAuthenticationView
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_pscAuthenticationView
(function(parent) {
    var provider = app.data.progressDataProvider,

        signinRedirect = 'home',
        init = function(error, result) {
            $('.status').text('');

            if (error) {
                if (error.message) {
                    $('.status').text(error.message);
                }
                try {
                    var err = '';
                    if (result === progress.data.Session.AUTHENTICATION_FAILURE) {
                        err = 'Login failed. Authentication error.';
                    } else if (result === progress.data.Session.GENERAL_FAILURE) {
                        err = 'Login failed. Unspecified error.';
                    }

                    $('.status').text(err);
                } catch (e) {}

                return false;
            }

            var activeView = '.signin-view',
                model = parent.pscAuthenticationViewModel;

            if (provider.setup && provider.setup.offlineStorage && !app.isOnline()) {
                $('.signin-view', 'signup-view').hide();
                $('.offline').show();
            } else {
                $('.offline').hide();

                $(activeView).show();
            }

            if (model && model.set) {
                model.set('logout', null);
            }

        },
        successHandler = function(data) {
            var redirect = signinRedirect,
                model = parent.pscAuthenticationViewModel || {},
                logout = model.logout;

            if (logout) {
                model.set('logout', null);
            }
            if (data) {
                if (logout) {
                    provider.Users.logout(init, init);
                    return;
                }

                setTimeout(function() {
                    app.mobileApp.navigate('components/' + redirect + '/view.html');
                }, 0);
            } else {
                init();
            }
        },
        pscAuthenticationViewModel = kendo.observable({
            displayName: '',
            email: '',
            password: '',
            errorMessage: '',
            validateData: function(data) {
                var model = pscAuthenticationViewModel;

                if (!data.email && !data.password) {
                    model.set('errorMessage', 'Missing credentials.');
                    return false;
                }

                if (!data.email) {
                    model.set('errorMessage', 'Missing username or email.');
                    return false;
                }

                if (!data.password) {
                    model.set('errorMessage', 'Missing password.');
                    return false;
                }

                return true;
            },
            signin: function() {
                var model = pscAuthenticationViewModel,
                    email = model.email.toLowerCase(),
                    password = model.password;

                if (!model.validateData(model)) {
                    return false;
                }

                provider.Users.login(email, password, successHandler, init);

            }
        });

    parent.set('pscAuthenticationViewModel', pscAuthenticationViewModel);
    parent.set('afterShow', function(e) {
        if (e && e.view && e.view.params && e.view.params.logout) {
            pscAuthenticationViewModel.set('logout', true);
        }
        provider.Users.currentUser().then(successHandler, init);
    });
})(app.pscAuthenticationView);

// START_CUSTOM_CODE_pscAuthenticationViewModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_pscAuthenticationViewModel
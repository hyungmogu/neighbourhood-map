/**
* loadingscreen.js
*   - Handles all behaviors on loading screen. This includes live status
*     update regarding setup and its errors
*   - Uses Knockout.js
*   - Manages VM part of MVVM model
*   - Methods are kept as fundamental as possible to reduce redundancy
*     and increase maintainability.
*
* Author: Hyungmo Gu
* Email: guhyungm7@gmail.com
* Last Modified: 10:26PM, April 22nd, 2017
*/

'use strict';

var LoadingScreen = function() {

    var self = this;

    self.isVisible = ko.observable(true);

    self.statusTitle = ko.observable('');
    self.statusDetail = ko.observable('');

    /**
    * @description - hides loading screen. This is used with header.show(),
    *                infowindow.show() to unveil app at the end of setup.
    *
    */
    self.hide = function() {
        self.isVisible(false);
    };

    /**
    * @description - informs user of what's happening during setup.
    *
    */
    self.updateStatus = function(title, detail) {
        self.statusTitle(title);
        self.statusDetail(detail);
    };
};
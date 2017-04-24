/**
* header.js
*   - handles all behaviors in header.
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

var Header = function() {

    var self = this;

    self.isVisible = ko.observable(false);

    /**
    * @description - triggers actions that hides/shows info-window.
    *                InfoWindow.toggle() is activated in the end.
    *
    */
    self.toggleInfoWindow = function() {
        App.toggleInfoWindow();
    };

    /**
    * @description - unveils header. This is used with LoadingScreen.hide(),
    *                InfoWindow.show() to unveil app at the end of setup.
    *
    */
    self.show = function() {
        self.isVisible(true);
    };
};
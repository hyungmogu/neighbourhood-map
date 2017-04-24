/**
* app.js
*   - Processes and coordinates sets of independent components like a brain.
*     - Signals from one end of an object is relayed to another.
*     - Additional actions may be triggerd as signals pass through this layer
*
* Author: Hyungmo Gu
* Email: guhyungm7@gmail.com
* Last Modified: 10:26PM, April 22nd, 2017
*/

'use strict';

var EVENTBRITE_API_KEY = 'SOLRRNOSEG4UHYXOXLNG';

var App = {


    /**
    * @description - Constructs application for view
    *
    */
    init: function(eventbriteAPIKey) {
        var self = this;

        self.header = new Header();
        self.infoWindow = new InfoWindow();
        self.loadingScreen = new LoadingScreen();

        Setup.start(eventbriteAPIKey, self.header, self.infoWindow, self.loadingScreen, function(gMap){
            self.gMap = gMap;
            App.activateFilter();
        });
    },

    /**
    * @description - activates filter. This is used to prevent app from
    *                crashing while loading.
    *
    */
    activateFilter: function() {
        var self = this;

        self.infoWindow.activateFilter();
    },

    /**
    * @description - performs actions associated to the unveiling of event
    *                description. This is triggered when a marker or an event
    *                in info-window is clicked.
    *
    */
    showDetail: function(event) {
        var self = this;

        if (typeof self.gMap.prevClickedMarker != 'undefined') {
            self.gMap.resetMarkerAnimation(self.gMap.prevClickedMarker);
        }

        self.gMap.animateMarker(event);
        self.infoWindow.showDetail(event);
        self.gMap.resize();
        self.gMap.centerMarker(event.marker);
        self.gMap.prevClickedMarker = event.marker;
    },

    /**
    * @description - hides/shows info-window. This is triggered when menu
    *                button is clicked, and Header.toggleInfoWindow() is
    *                activated.
    *
    */
    toggleInfoWindow: function() {
        var self = this;

        self.infoWindow.toggle();
        self.gMap.resize();
    },

    /**
    * @description - hides irrelevant markers while filtering events.
    *
    */
    filter: function(type, events) {
        var self = this;

        switch (type) {
            case 'show_all':
                $.map(events, function(event, i){
                    self.gMap.updateMarkerVisibility('show', event.marker);
                });
                break;
            case 'hide_marker':
                self.gMap.updateMarkerVisibility('hide', events[0].marker);
                break;
            case 'show_marker':
                self.gMap.updateMarkerVisibility('show', events[0].marker);
                break;
            default:
                App.throwError('App Error (500)', 'Sorry. A bug in code caused self app to crash. Please try again later');
        }
    },

    /**
    * @description - returns app to main page.
    *
    */
    returnToMain: function(event) {
        var self = this;

        self.gMap.resetMarkerAnimation(event.marker);
        self.infoWindow.showMain();
        self.gMap.resize();
    },

    /**
    * @description - informs user of an error that occur after setup. This
    *                is triggered when something goes wrong with Google Map,
    *                markers and the view model objects.
    *
    */
    throwError: function(title, description) {
        var self = this;

        self.infoWindow.showError(title, description);
    }
};

App.init(EVENTBRITE_API_KEY);
/**
* infowindow.js
*   - Handles all behaviors in info-window.
*   - Uses Knockout.js
*   - Manages VM part of MVVM model
*   - Methods are kept as fundamental as possible to reduce redundancy and
*     increase maintainability
*
* Author: Hyungmo Gu
* Email: guhyungm7@gmail.com
* Last Modified: 10:26PM, April 22nd, 2017
*/

'use strict';

var InfoWindow = function() {

    var self = this;

    self.events = ko.observableArray([]);
    self.selectedEvent = ko.observable();
    self.searchKeywords = ko.observable('');

    self.isVisible = ko.observable(false);
    self.isSafeToFilter = ko.observable(false);
    self.toggleIsOn = ko.observable(false);

    self.showEventDescription = ko.observable(false);
    self.showEventList = ko.observable(true);
    self.showErrorScreen = ko.observable(false);

    self.errorTitle = ko.observable('');
    self.errorDetail = ko.observable('');

    self.filteredEvents = ko.computed(function() {

        if (!self.isSafeToFilter()) {
            return self.events();
        }

        if (self.searchKeywords() === '') {
            App.filter('show_all', self.events());
            return self.events();
        }


        // Filter list based on keywords in title, location, and/or description.
        return ko.utils.arrayFilter(self.events(), function(event){

            var isThisInRefinedList = !self._descriptionExists(event) ? self._filterEvent('exclude_description', event) : self._filterEvent('default', event);

            // Filter marker in the process.
            if (!isThisInRefinedList) {
                App.filter('hide_marker', [event]);
                return false;
            }

            App.filter('show_marker', [event]);
            return true;
        });

    });

    /**
    * @description - checks if the selected event has non-null description.
    *
    */
    self._descriptionExists = function(event) {
        return event.description == null ? true : false;
    };

    /**
    * @description - checks if an event should be included in search result.
    *                It compares the string from search bar to words in event
    *                description, name, and location. It returns true when
    *                a match is found.
    *
    */
    self._filterEvent = function(type, event) {
        var isEventIncludedInFilteredList;

        switch(type){
            case 'exclude_description':
                isEventIncludedInFilteredList = (event.name.toLowerCase().indexOf(self.searchKeywords().toLowerCase()) != -1 ||
                    event.location.toLowerCase().indexOf(self.searchKeywords().toLowerCase()) != -1);
                break;
            default:
                isEventIncludedInFilteredList = (event.name.toLowerCase().indexOf(self.searchKeywords().toLowerCase()) != -1 ||
                    event.location.toLowerCase().indexOf(self.searchKeywords().toLowerCase()) != -1 ||
                    event.description.toLowerCase().indexOf(self.searchKeywords().toLowerCase()) != -1);
        }

        return isEventIncludedInFilteredList;
    };

    /**
    * @description - shows info-window. This is used with Header.show(),
    *                Loadingscreen.hide() to unveil app at the end of setup.
    *
    */
    self.show = function() {
        self.isVisible(true);
    };

    /**
    * @description - populates info-window with events. This is used by
    *                Setup.loadItems().
    *
    */
    self.loadEvents = function(listOfEvents) {
        self.events(listOfEvents);
        self.showMain();
    };


    /**
    * @description - shows list of events. This is used by App.returnToMain(),
    *                InfoWindow.loadEvents().
    *
    */
    self.showMain = function() {
        self.showEventList(true);
        self.showEventDescription(false);
        self.showErrorScreen(false);
    };

    /**
    * @description - constructs and shows event description. This is used by
    *                App.showDetail().
    *
    */
    self.showDetail = function(event) {
        self._selectEvent(event);

        self.showEventList(false);
        self.showEventDescription(true);
        self.showErrorScreen(false);
    };

    /**
    * @description - loads event description in info-window.
    *
    */
    self._selectEvent = function(event) {
        self.selectedEvent(event);
    };

    /**
    * @description - constructs and shows error message. This is triggered
    *                when App.throwError() is activated.
    *
    */
    self.showError = function(title, description) {
        self._loadError(title, description);

        self.showErrorScreen(true);
        self.showEventList(false);
        self.showEventDescription(false);
    };

    /**
    * @description - loads error message.
    *
    */
    self._loadError = function(title,description) {
        self.errorTitle(title);
        self.errorDetail(description);
    };

    /**
    * @description - triggers actions associated to the unveiling of event
    *                description.
    *
    */
    self.loadDescription = function(event) {
        App.showDetail(event);
    };


    /**
    * @description - triggers actions associated to returning from event
    *                description.
    *
    */
    self.goBackToEventList = function() {
        App.returnToMain(self.selectedEvent());
    };


    /**
    * @description - hides/shows info-window. This is triggered when menu button,
    *                is clicked and Header.toggleInfoWindow() is activated.
    *
    */
    self.toggle = function() {
        self.toggleIsOn(!self.toggleIsOn());
    };

    /**
    * @description -  handles error in app. This is activated by App.throwError().
    *
    */
    self.throwError = function(type) {
        var title;
        var description;

        switch (type) {
            case 'emptyResult':
                title = 'Search Result Empty (204)';
                description = 'Sorry. Search result returned empty.';
                break;
            default:
                title = 'App Error (500)';
                description = 'Sorry. A bug in code caused this app to crash. Please try again later';
        }
        App.throwError(title, description);
    };


    /**
    * @description - activates filter. This used by App.activateFilter() to
    *                prevent app from crashing while loading.
    *
    */
    self.activateFilter = function() {
        self.isSafeToFilter(true);
    };
};
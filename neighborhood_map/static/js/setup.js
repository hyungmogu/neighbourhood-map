/**
* setup.js
*   - Prepares application for view
*
* Author: Hyungmo Gu
* Email: guhyungm7@gmail.com
* Last Modified: 10:26PM, April 22nd, 2017
*/


'use strict';

var Setup = {

    /*
    *   @description - performs application setup.
    *
    */
    start: function(eventbriteAPIKey, header, infoWindow, loadingScreen, callback) {
        var self = this;

        self.eventbriteAPIKey = eventbriteAPIKey;

        self.eventListLoaded = false;
        self.gMapAPILoaded = (typeof self.gMapAPILoaded == 'undefined') ? false : true;
        self.setupComplete = false;
        self.userLocation = {lat: 0, lng: 0};
        self.events = [];
        self.loadingScreen = loadingScreen;
        self.infoWindow = infoWindow;
        self.header = header;

        Setup._activateKnockout(function(){
            self.loadingScreen.updateStatus('Loading...', 'Obtaining user location');
            Setup._getUserLocation(function(){
                self.loadingScreen.updateStatus('Loading...', 'Retrieving events data');
                Setup._getEvents(function() {
                    self.loadingScreen.updateStatus('Loading...', 'Loading nearby events');
                    Setup._finish();
                    callback(self.gMap);
                });
            });
        });
    },

    /*
    *   @description - binds VM objects to particular section in HTML.
    *
    */
    _activateKnockout: function(callback) {
        var self = this;

        ko.applyBindings(self.loadingScreen, document.getElementById('loading-screen'));
        ko.applyBindings(self.header, document.getElementById('navbar'));
        ko.applyBindings(self.infoWindow, document.getElementById('main-app'));

        return callback();
    },

    /*
    *   @description - fetches user's geocoordinate. Error is returned
    *                  when user declines to share location, or
    *                  when something goes wrong while retrieving data.
    *
    */
    _getUserLocation: function(callback) {
        var self = this;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {

                self.userLocation.lat = position.coords.latitude;
                self.userLocation.lng = position.coords.longitude;

                return callback();
            }, function(){
                Setup.throwError('latlngNotFoundError');
            });
        } else {
            Setup.throwError('refusedToRunNavigatorError');
        }
    },

    /*
    *   @description - stores user's geocoordinate. The stored value is used
    *                  for the initialization of Google map, and the retrieval of
    *                  data from Eventbrite API.
    *
    */
    _storeUserLocation: function(position, callback) {
        var self = this;

        self.userLocation = position;

        return callback();
    },

    /*
    *   @description - fetches data from Eventbrite API.
    *
    */
    _getEvents: function(callback) {
        var self = this;

        var url = 'https://www.eventbriteapi.com/v3/events/search/?' +
            'sort_by=distance&location.within=20km&location.latitude=' +
            self.userLocation.lat + '&location.longitude=' +
            self.userLocation.lng + '&start_date.keyword=today&' +
            'expand=organizer,venue&token=' + self.eventbriteAPIKey;

        $.ajax({
            url: url,
            type: 'GET',
            timeout: 10000,
            success: function(result, status) {

                $.map(result.events, function(event, i){
                    self.events.push(new EventItem(event));
                });

                self.eventListLoaded = true;

                return callback();
            },
            error: function(xhr, status, error) {
                console.log('Error occured while loading events: ' + error);

                if (status == 'error') {
                    Setup.throwError('eventbriteLoadingError');
                    return;
                }
                if (status == 'timeout') {
                    Setup.throwError('timeoutError');
                    return;
                }
            }
        });
    },

    /*
    *   @description - ties the setup before display. Note that centerMap()
    *                  is placed at the very end to ensure Google map is
    *                  centered about user's location.
    *
    */
    _finish: function() {
        var self = this;

        if(self.eventListLoaded && self.gMapAPILoaded){
            Setup._loadItems(function(){
                Setup._showApp(function(){
                    Setup._centerMap(self.userLocation);
                    self.setupComplete = true;
                });
            });
        }
    },

    /*
    *   @description - loads markers and list of events.
    *
    */
    _loadItems: function(callback) {
        var self = this;

        if (self.events.length === 0) {
            return callback();
        }

        self.events = self.gMap.addMarkers(self.events);
        self.infoWindow.loadEvents(self.events);

        return callback();
    },

    /*
    *   @description - centers Google map about user's location.
    *
    */
    _centerMap: function(geocoordinate, callback) {
        var self = this;
        self.gMap.centerMap(geocoordinate);

    },

    /*
    *   @description - unveils app.
    *
    */
    _showApp: function(callback) {
        var self = this;

        self.loadingScreen.hide();
        self.header.show();
        self.infoWindow.show();
        self.gMap.resize();

        return callback();
    },

    /*
    *   @description - handles an error that occurs during setup. The chosen
    *                  title and message are shown on loading screen.
    *
    */
    throwError: function(type) {
        var self = this;

        var errorTitle = '';
        var errorDetail = '';

        switch(type) {
            case 'gMapLoadingError':
                errorTitle = 'API Failed to Load (500)';
                errorDetail = 'Something went wrong while loading Google Map API';
                break;
            case 'eventbriteLoadingError':
                errorTitle = 'API Failed to Load (500)';
                errorDetail = 'Something went wrong while downloading data from Eventbrite API';
                break;
            case 'refusedToRunNavigatorError':
                errorTitle = 'Failed to Retrieve User Location (500)';
                errorDetail = 'self application requires user location. Please refresh and try again.';
                break;
            case 'latlngNotFoundError':
                errorTitle = 'Failed to Retrieve User Location (500)';
                errorDetail = 'Something went wrong while retrieving user location.';
                break;
            case 'timeoutError':
                errorTitle = 'Time Out (500)';
                errorDetail = 'App took too long to download data.';
                break;
            default:
                errorTitle = 'Error Type Not Found (500)';
                errorDetail = 'Error type, ' + type + ', is not valid.';
        }

        self.loadingScreen.updateStatus(errorTitle, errorDetail);
        return;
    },

    /*
    *   @description - constructs Google map and markers. This
    *                 function is activated after downloading Google Map API.
    *
    */
    setupGMap: function() {
        var self = this;

        self.gMap = new GMap();

        self.loadingScreen.updateStatus('Loading...', 'Generating Google Map');
        Setup._loadMap(function(){
            self.gMapAPILoaded = true;
            Setup._finish();
        });
    },

    /*
    *   @description - generates and displays Google map.
    *
    */
    _loadMap: function(callback) {
        var self = this;

        self.gMap.generateMap(self.userLocation);

        return callback();
    }
};
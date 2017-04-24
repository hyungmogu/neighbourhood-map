/**
* gmap.js
*   - Handles all behaviors related to Google Map
*   - Methods are kept as fundamental as possible to reduce redundancy,
*     and increase maintainability
*
*/

'use strict';

var GMap = function() {

    var self = this;
    self.prevClickedMarker = undefined;

    /**
    * @description - generates map.
    *
    */
    self.generateMap = function(userLocation) {
        self.map = new google.maps.Map(document.getElementById('g-map'),
            {zoom: 10,center: userLocation});
    };


    /**
    * @description - adds markers to Google map.
    *
    */
    self.addMarkers = function(events) {
        var eventsWithMarkers = [];

        $.map(events,function(event, i){
            var marker = new google.maps.Marker({
                position: event.latlng,
                map: self.map,
                animation: google.maps.Animation.DROP
            });

            marker.addListener('click', function(){
                self.showInfo(event);
            });

            var markerWithEvent = self.storeMarker(event, marker);
            eventsWithMarkers.push(markerWithEvent);
        });

        return eventsWithMarkers;

    };


    /**
    * @description - stores marker to an object called 'event'.
    *
    *
    */
    self.storeMarker = function(event, marker) {
        event.marker = marker;
        return event;
    };

    /**
    * @description - re-evalutates the coverage of map.
    *
    */
    self.resize = function() {
        google.maps.event.trigger(self.map, 'resize');
    };

    /**
    * @description - centers Google map about the geolocation of
    *                the selected marker.
    *
    */
    self.centerMarker = function(marker) {
        self.map.setZoom(13);
        self.map.setCenter(marker.getPosition());
    };

    /**
    * @description - triggers app to show event description.
    *
    */
    self.showInfo = function(event) {
        App.showDetail(event);
    };

    /**
    * @description - hides/shows the selected marker on Google map.
    *
    */
    self.updateMarkerVisibility = function(type, marker) {
        if (type == "hide") {
          marker.setVisible(false);
        } else{
          marker.setVisible(true);
        }
    };

    /**
    * @description - animates markers.
    *
    */
    self.animateMarker = function(event) {
        if (event.marker.getAnimation() !== null) {
            event.marker.setAnimation(null);
        } else {
            event.marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    };

    /**
    * @description - resets the animation of a marker.
    *
    */
    self.resetMarkerAnimation = function(marker) {
        marker.setAnimation(null);
    };

    /**
    * @description - centers Google map about the given geocoordinate.
    *
    */
    self.centerMap = function(userLocation) {
        self.map.setCenter(userLocation);
    };
};

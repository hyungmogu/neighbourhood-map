var GMap = function() {

	var self = this;
	self.prevClickedMarker;

	self.generateMap = function(userLocation) {
		self.map = new google.maps.Map(document.getElementById('g-map'),
			{zoom: 10,center: userLocation});
	};

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

	self.storeMarker = function(event, marker) {
		event.marker = marker;
		return event
	};

	self.resize = function() {
		google.maps.event.trigger(self.map, 'resize');
	};

	self.centerMarker = function(marker) {
		self.map.setZoom(13);
		self.map.setCenter(marker.getPosition());
	};

	self.showInfo = function(event) {
		App.showDetail(event);
	};

	self.updateMarkerVisibility = function(type, marker) {
	    if (type == "hide") {
	      marker.setVisible(false);
	    } else{
	      marker.setVisible(true);
	    }
	};

	self.animateMarker = function(event) {
		if (event.marker.getAnimation() !== null) {
			event.marker.setAnimation(null);
		} else {
			event.marker.setAnimation(google.maps.Animation.BOUNCE);
		}
	};

	self.resetMarkerAnimation = function(marker) {
		marker.setAnimation(null);
	};

	self.centerMap = function(userLocation) {
		self.map.setCenter(userLocation);
	};
};

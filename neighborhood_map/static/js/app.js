var EVENTBRITE_API_KEY = 'SOLRRNOSEG4UHYXOXLNG';

var upcomingEvent = function(event) {
	var self = this;

	self._getLocation = function(address, city) {
		return address === null ? city : address + ', ' + city;
	};

	self._getTime = function(startingTime){
		var MINUTE_IN_MILLISECONDS = 1000 * 60;
		var HOUR_IN_MILLISECONDS =  1000 * 60 * 60;
		var currentDateTime = new Date();
		var startingDateTime = new Date(startingTime);
		var remainingTime = startingDateTime.getTime() - currentDateTime.getTime();
		var remainingHours = Math.floor(remainingTime / HOUR_IN_MILLISECONDS);
		var remainingMinutes = Math.floor(remainingTime / MINUTE_IN_MILLISECONDS) % 60;

		if (remainingTime < 0) {
			return '<span class="text-muted">Already Started</span>';
		} else if (remainingTime > 0 && remainingHours > 4) {
			return '<span class="text-success">Starts in ' + remainingHours +
				' hours ' + remainingMinutes + ' minutes' + '<\/span>';
		} else if (remainingTime > 0 && remainingHours <= 4 && remainingHours > 2) {
			return '<span class="text-warning">Starts in ' + remainingHours +
				' hours ' + remainingMinutes + ' minutes' + '<\/span>';
		} else if (remainingTime > 0 && remainingHours <= 2 && remainingHours > 0) {
			return '<span class="text-danger">Starts in ' + remainingHours +
				' hours ' + remainingMinutes + ' minutes' + '<\/span>';
		} else {
			return '<span class="text-danger">Starts in ' + remainingMinutes +
				' minutes' + '<\/span>';
		}
	};

	self.name = event.name.text;
	self.description = event.description.html;
	self.time = self._getTime(event.start.utc);
	self.location = self._getLocation(event.venue.address.address_1,
		event.venue.address.city);
	self.latlng = {lat: parseFloat(event.venue.latitude),
		lng: parseFloat(event.venue.longitude)};
	self.organizerName = event.organizer.name;
	self.url = event.url;
};

var Model = {
	data: [],
	userLocation: {lat: 0, lng: 0},
	addData: function(items) {
		$.map(items, function(item){
			Model.data.push(item);
		});
	}
};

var GMap = function(){
	var self = this;

	self.init = function() {
		self.map = new google.maps.Map(document.getElementById('g-map'),
			{zoom: 10,center: Model.userLocation});

		self.generateMarkers();
	};

	self.resize = function() {
		google.maps.event.trigger(self.map, 'resize');
	};

	self.generateMarkers = function() {
		$.map(Model.data,function(event){
			var marker = new google.maps.Marker({
				position: event.latlng,
				map: self.map,
				animation: google.maps.Animation.DROP
			});

			self.storeMarker(event, marker);

			marker.addListener('click', function(){
				App.showDetail(event);
				self.resize();
				self.centerMarker(event.marker);
			});

		});
	};

	self.resetMarkersAnimation = function() {
		$.map(Model.data, function(event){
			if (typeof event.marker != 'undefined') {
				event.marker.setAnimation(null);
			}
		});
	};

	self.resetMarkerAnimation = function(marker) {
		marker.setAnimation(null);
	};

	self.storeMarker = function(event, gmarker) {
		event.marker = gmarker;
	};

	self.makeMarkerBounce = function(event) {
		if (event.marker.getAnimation() !== null) {
			event.marker.setAnimation(null);
		} else {
			event.marker.setAnimation(google.maps.Animation.BOUNCE);
		}
	};

	self.updateMarkerVisibility = function(type, marker) {
		type == "hide" ? marker.setVisible(false) : marker.setVisible(true);
	};

	self.centerMarker = function(marker) {
		self.map.setZoom(13);
		self.map.setCenter(marker.getPosition());
	};

};

var App = {
	init: function(eventbriteApiKey) {
		var self = this;

		self.infoWindow = new InfoWindow();
		self.gMap = new GMap();

		ko.applyBindings(self.infoWindow);
		App._getUserLocation(function(){
			App._load(eventbriteApiKey);
		});
	},
	_load: function(eventbriteApiKey) {
		var self = this;

		var events = [];
		var url = 'https://www.eventbriteapi.com/v3/events/search/?' +
			'sort_by=distance&location.within=20km&location.latitude=' +
			Model.userLocation.lat + '&location.longitude=' +
			Model.userLocation.lng + '&start_date.keyword=today&' +
			'expand=organizer,venue&token=' + eventbriteApiKey;

		$.ajax({
			url: url,
			type: 'GET',
			timeout: 5000,
			success: function(result, status) {

				if (result.pagination.object_count === 0) {
					self.infoWindow.displayError('not_found');
					return;
				}

				$.map(result.events, function(eventData, i){
					events.push(new upcomingEvent(eventData));
				});

				Model.addData(events);

				self.gMap.init();
				self.infoWindow.init();
			},
			error: function(xhr, status, error) {
				console.log('Error occured while loading events: ' + error);

				if (status == 'error') {
					self.infoWindow.displayError('default');
					return;
				}
				if (status == 'timeout') {
					self.infoWindow.displayError('timeout');
					return;
				}
			}
		});
	},
	_getUserLocation: function(callback) {
		var self = this;

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				Model.userLocation.lat = position.coords.latitude;
				Model.userLocation.lng = position.coords.longitude;

				callback();
			}, function(){
				self.infoWindow.displayError('default');
			});
		} else {
			self.infoWindow.displayError('default');
		}
	},
	showDetail: function(event) {
		var self = this;

		if (typeof event == 'undefined') {
			self.infoWindow.displayError('default');
			return;
		}

		self.gMap.resetMarkersAnimation();
		self.gMap.makeMarkerBounce(event);

		self.infoWindow.showDetail(event);
	},
	returnToMain: function() {
		var self = this;

		self.gMap.resetMarkersAnimation();

		self.infoWindow.showMain();
	},

	updateMarkerVisibility: function(type, marker) {
		var self = this;

		self.gMap.updateMarkerVisibility(type, marker);

	},

	showAllMarkers: function(events) {
		var self = this;

		$.map(events, function(event, i){
			self.gMap.updateMarkerVisibility('show', event.marker);
		});
	},

	resetMarkerAnimation: function(marker) {
		var self = this;

		self.gMap.resetMarkerAnimation(marker);
	},

	refreshMap: function() {
		var self = this;

		self.gMap.resize();
	},

	centerMarker: function(marker) {
		var self = this;

		self.gMap.centerMarker(marker);

	}
};

var InfoWindow = function() {
	// TODO: Change toggleIsOn in activateToggle() to hideInfoWindow
	// TODO: Center a marker when the corresponding item in the list-view is clicked

	var self = this;
	//////////////
	//
	// Data
	//
	//////////////

	self.events = ko.observableArray([]);
	self.event = ko.observable();
	self.searchKeywords = ko.observable('');

	self.toggleIsOn = ko.observable(false);
	self.showEventDescription = ko.observable(false);
	self.showEventList = ko.observable(true);
	self.showErrorScreen = ko.observable(false);
	self.showDefaultError = ko.observable(false);
	self.showTimeoutError = ko.observable(false);
	self.showNotFoundError = ko.observable(false);

	self.filteredEvents = ko.computed(function(){
		if (self.searchKeywords() == "") {
			App.showAllMarkers(self.events());
			return self.events();
		} else {
			return ko.utils.arrayFilter(self.events(), function(event){
				if (event.name.toLowerCase().indexOf(self.searchKeywords().toLowerCase()) != -1 ||
					event.location.toLowerCase().indexOf(self.searchKeywords().toLowerCase()) != -1 ||
					event.description.toLowerCase().indexOf(self.searchKeywords().toLowerCase()) != -1) {
					App.resetMarkerAnimation(event.marker);
					App.updateMarkerVisibility('show', event.marker);
					return true;
				} else {
					App.resetMarkerAnimation(event.marker);
					App.updateMarkerVisibility('hide', event.marker);
				}

			});
		}
	});

	///////////////
	//
	// Operations (Controller)
	//
	//////////////

	self.init = function() {
		// Display list of events
		$.map(Model.data, function(event){
			self.events.push(event);
			self.showEventList(true);
			self.showEventDescription(false);
		});
	};

	self.activateToggle = function() {
		if (self.toggleIsOn() === true) {
			self.toggleIsOn(false);
			App.refreshMap();
		} else {
			self.toggleIsOn(true);

			App.refreshMap();
		}
	};

	self.showDetail = function(event) {
		self.event(event);
		self.showEventList(false);
		self.showEventDescription(true);
		self.showErrorScreen(false);
	};

	self.showMain = function() {
		self.showEventList(true);
		self.showEventDescription(false);
		self.showErrorScreen(false);

		App.refreshMap();
	};

	self.loadDescription = function(event) {
		App.showDetail(event);
		App.centerMarker(event.marker);
	};

	self.updateEvents = function() {
		// Refresh the observable array.
		self.events([]);

		// Update the event list.
		$.map(Model.data, function(eventItem) {
			self.events.push(eventItem);
		});
	};

	self.goBackToEventList = function() {
		App.returnToMain();
	};

	self.displayError = function(type) {
		// Determine error display type.
		if (type == 'default') {
			self.showDefaultError(true);
			self.showTimeoutError(false);
			self.showNotFoundError(false);
		} else if (type == 'timeout') {
			self.showDefaultError(false);
			self.showTimeoutError(true);
			self.showNotFoundError(false);
		} else if (type == 'not_found') {
			self.showDefaultError(false);
			self.showTimeoutError(false);
			self.showNotFoundError(true);
		}

		// Show error screen.
		self.showErrorScreen(true);
		self.showEventList(false);
		self.showEventDescription(false);
	};
};

App.init(EVENTBRITE_API_KEY);
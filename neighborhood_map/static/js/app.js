var Event = function(event) {
	var self = this;

	self._getLocation = function(address, city) {
		return address == null ? city : address + ', ' + city;
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
			return '<span class="text-success">Starts in ' + remainingHours + ' hours ' + remainingMinutes + ' minutes' + '<\/span>';
		} else if (remainingTime > 0 && remainingHours <= 4 && remainingHours > 2) {
			return '<span class="text-warning">Starts in ' + remainingHours + ' hours ' + remainingMinutes + ' minutes' + '<\/span>';
		} else if (remainingTime > 0 && remainingHours <= 2 && remainingHours > 0) {
			return '<span class="text-danger">Starts in ' + remainingHours + ' hours ' + remainingMinutes + ' minutes' + '<\/span>';
		} else {
			return '<span class="text-danger">Starts in ' + remainingMinutes + ' minutes' + '<\/span>';
		}
	};

	self._generateKeywords = function(event) {
		var location = self._getLocation(event['venue']['address']['address_1'], event['venue']['address']['city']);
		var harvestTargets = [event['description']['text'],event['name']['text'],location];
		var output = {};

		for (i = 0; i < harvestTargets.length; i++) {

			if (harvestTargets[i] == null) {
				continue;
			};

			$.map(harvestTargets[i].toLowerCase().split(' '), function(keyword, j){
				if (typeof output['keyword'] == 'undefined') {
					output[keyword] = 1;
				} else if (output[keyword] > 1) {
					output[keyword] += 1;
				};
			});

		};

		return output;
	}

	self.name = event['name']['text'];
	self.description = event['description']['html'];
	self.time = self._getTime(event['start']['utc']);
	self.location = self._getLocation(event['venue']['address']['address_1'], event['venue']['address']['city']);;
	self.latlng = {lat: parseFloat(event['venue']['latitude']), lng: parseFloat(event['venue']['longitude'])};
	self.organizerName = event['organizer']['name'];
	self.keywords = self._generateKeywords(event);
	self.url = event['url'];
};

var Search = function(keywords, events) {

	var self = this;
	console.log(keywords);
	self.numOfEvents = events.length;
	self.searchKeywords = typeof keywords == 'undefined' || keywords == '' ? null: keywords.toLowerCase().split(" ");

	self.returnResults = function() {

		console.log(self.searchKeywords);
		// Return everything if no keywords are entered
		if (self.searchKeywords == null) {
			return events;
		}

		var relevancies = self._calculateRelevancies(events);
		var sortedEvents = self._sortEvents(relevancies, events);
		var filteredEvents = self._removeIrrevalentEvents(relevancies, sortedEvents);
		return filteredEvents;
	};

	self._calculateRelevancies = function(events) {
		// Note: Relevancy reflects the amount of matching between
		// an event and search keywords.
		var relevancy;
		var output = [];

		$.map(events, function(event, i){

			var matchingKeywordsCnt = 0;

			$.map(self.searchKeywords, function(keyword, i){
				if (typeof event.keywords[keyword] != 'undefined'){
					matchingKeywordsCnt += 1;
				};
			});

			relevancy = matchingKeywordsCnt / self.searchKeywords.length;
			output.push(relevancy);
		});

		return output;
	};

	self._sortEvents = function(relevancies, events) {
		var output = events;

		// Note: Insertion algorithm is used.
		var i = 1;
		while (i < self.numOfEvents) {

			var j = i;
			while  (j > 0) {

				if (relevancies[j] > relevancies[j-1]) {
					var tmp1 = relevancies[j-1];
					relevancies[j-1] = relevancies[j];
					relevancies[j] = tmp1;

					// Organize events using relevancies as a reference
					var tmp2 = output[j-1];
					output[j-1] = output[j];
					output[j] = tmp2;
				};

				j -= 1;

			};

			i += 1;

		};
		return output;

	};

	self._removeIrrevalentEvents = function(relevancies, sortedEvents) {
		var output = sortedEvents;
		var threshold = 0.5;

		// Remove events with relevancy below the threshold
		for (i = 0; i < relevancies.length; i++) {
			if (relevancies[i] <= threshold) {
				output = output.splice(0, i);
				break;
			};
		};
		return output;
	};

};

var Model = {
	backUpData: [],
	data: [],
	userLocation: {lat: 0, lng: 0},
	get: function(target) {
		if (target == 'backUpData' || target == 'data') {
			return Model[target].slice();
		};
	},
	addData: function(target, data) {
		$.map(data, function(item){
			Model[target].push(item);
		});
	},
	deleteAll: function(target) {
		if (target == 'backUpData' || target == 'data') {
			Model[target] = [];
		};

		if (target == 'userLocation') {
			Model[target] = {lat:0, lng: 0};
		};
	}
};

var GMap = function(){
	var self = this;

	self.init = function() {
		self.map = new google.maps.Map(document.getElementById('g-map'),{zoom: 10,center: Model.userLocation});

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
			});

		});
	};

	self.removeAllMarkers = function() {
		$.map(Model.data,function(event){
			event.marker.setMap(null);
		});
	};

	self.resetMarkersAnimation = function() {
		$.map(Model.data, function(event){
			if (typeof event.marker != 'undefined') {
				event.marker.setAnimation(null);
			};
		});
	};

	self.storeMarker = function(event, marker) {
		event.marker = marker;
	};

	self.makeMarkerBounce = function(event) {
		if (event.marker.getAnimation() !== null) {
		  event.marker.setAnimation(null);
		} else {
		  event.marker.setAnimation(google.maps.Animation.BOUNCE);
		}
	};
};

var App = {
	init: function() {
		var self = this;

		self.infoWindow = new InfoWindow();
		self.gMap = new GMap();

		ko.applyBindings(self.infoWindow);
		App._getUserLocation(function(){
			App._load();
		});
	},
	_load: function(callback) {
		var self = this;
		var events = [];

		$.ajax({
			url: 'https://www.eventbriteapi.com/v3/events/search/?sort_by=distance&location.within=20km&location.latitude=' + Model.userLocation["lat"] + '&location.longitude=' + Model.userLocation["lng"] + '&start_date.keyword=today&expand=organizer,venue&token=SOLRRNOSEG4UHYXOXLNG',
			type: 'GET',
			timeout: 5000,
			success: function(result, status) {

				if (result['pagination']['object_count'] == 0) {
					self.infoWindow.displayError('not_found');
					return;
				};

				$.map(result['events'], function(eventData, i){
					events.push(new Event(eventData));
				});

				Model.addData('backUpData', events);
				Model.addData('data', events);

				self.gMap.init();
				self.infoWindow.init();
			},
			error: function(xhr, status, error) {
				console.log('Error occured while loading events: ' + error);

				if (status == 'error') {
					self.infoWindow.displayError('default');
					return;
				};
				if (status == 'timeout') {
					self.infoWindow.displayError('timeout');
					return;
				};
			}
		});
	},
	_getUserLocation: function(callback) {
		var self = this;

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				Model.userLocation["lat"] = position.coords.latitude;
				Model.userLocation["lng"] = position.coords.longitude;

				callback();
			}, function(){
				self.infoWindow.displayError("default");
			});
		} else {
			self.infoWindow.displayError("default");
		};
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
	search: function(searchKeywords) {
		var self = this;
		var events = Model.get('backUpData');

		self.gMap.removeAllMarkers();

		if (events.length == 0) {
			self.infoWindow.displayError('not_found');
			return;
		};

		var search = new Search(searchKeywords, Model.get('backUpData'));
		var searchResults = search.returnResults();

		if (searchResults.length == 0) {
			self.infoWindow.displayError('not_found');
			return;
		};

		Model.deleteAll('data');
		Model.addData('data', searchResults);

		self.gMap.generateMarkers();

		self.infoWindow.updateEvents();

		App.returnToMain();

	},
	refreshMap: function(keyword) {
		var self = this;

		self.gMap.resize();
		// var events = [];

		// $.ajax({
		// 	url: 'https://www.eventbriteapi.com/v3/events/search/?q=' + keyword + '&sort_by=distance&location.within=20km&location.latitude=' + Model.userLocation["lat"] + '&location.longitude=' + Model.userLocation["lng"] + '&start_date.keyword=today&expand=organizer,venue&token=SOLRRNOSEG4UHYXOXLNG',
		// 	type: 'GET',
		// 	timeout: 5000,
		// 	success: function(result, status) {

		// 		if (result['pagination']['object_count'] == 0) {
		// 			self.infoWindow.displayError('not_found');
		// 			return;
		// 		};

		// 		$.map(result['events'], function(eventData, i){
		// 			events.push(new Event(eventData));
		// 		});

		// 		self.gMap.removeAllMarkers();

		// 		Model.deleteAll('backUpData');
		// 		Model.deleteAll('data');
		// 		Model.add('backUpData', events);
		// 		Model.add('data', events);

		// 		self.gMap.generateMarkers();

		// 		self.infoWindow.updateEvents();

		// 		App.returnToMain();

		// 	},
		// 	error: function(xhr, status, error) {
		// 		console.log('Error occured while searching events: ' + error);

		// 		self.gmap.resetMarkersAnimation();

		// 		if (status == 'error') {
		// 			self.infoWindow.displayError('default');
		// 			return;
		// 		};
		// 		if (status == 'timeout') {
		// 			self.infoWindow.displayError('timeout');
		// 			return;
		// 		};
		// 	}
		// });
	}
};

var InfoWindow = function() {
	var self = this;
	//////////////
	//
	// Data
	//
	//////////////

	self.events = ko.observableArray([]);
	self.event = ko.observable();
	self.searchKeywords = ko.observable();

	self.toggleIsOn = ko.observable(false);
	self.showEventDescription = ko.observable(false);
	self.showEventList = ko.observable(true);
	self.showErrorScreen = ko.observable(false);
	self.showDefaultError = ko.observable(false);
	self.showTimeoutError = ko.observable(false);
	self.showNotFoundError = ko.observable(false);

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
		if (self.toggleIsOn() == true) {
			self.toggleIsOn(false);
			App.refreshMap();
		} else {
			self.toggleIsOn(true);
			App.refreshMap();

		};
	}

	self.showDetail = function(event) {
		self.event(event);
		self.showEventList(false);
		self.showEventDescription(true);
		self.showErrorScreen(false);
	}

	self.showMain = function() {
		self.showEventList(true);
		self.showEventDescription(false);
		self.showErrorScreen(false);

		App.refreshMap();
	};

	self.searchEvents = function() {
		// var sanitizedKeywords = encodeURIComponent(self.searchKeywords()).replace(/%20/g, '+');
		App.search(self.searchKeywords());
	};

	self.loadDescription = function(event) {
		App.showDetail(event);
	};

	self.updateEvents = function() {
		// Refresh the observable array
		self.events([]);

		// Update the event list
		$.map(Model.data, function(eventItem) {
			self.events.push(eventItem);
		});
	};

	self.goBackToEventList = function() {
		App.returnToMain();
	};

	self.displayError = function(type) {
		// Determine error display type
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

		// Show error screen
		self.showErrorScreen(true);
		self.showEventList(false);
		self.showEventDescription(false);
	}

};

App.init();
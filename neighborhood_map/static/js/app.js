var Event = function(event) {
	var self = this;
	self.name = event['name']['text'];
	self.description = event['description']['text'];
	self.time = event['start']['local'] + ' ~ ' + event['end']['local'];
	self.location = event['venue']['address']['address_1'] + ', ' + event['venue']['address']['city'];
	self.organizerName = event['organizer']['name'];
	self.latlng = {lat: parseFloat(event['venue']['latitude']), lng: parseFloat(event['venue']['longitude'])};
	self.url = event['url'];
};

var Model = {
	data: [],
	addData: function(data) {
		$.map(data, function(item){
			Model.data.push(new Event(item));
		});
	},
	refreshData: function(data) {
		Model.data = [];
		Model.addData(data);
	}
};

var GMap = function(){
	var self = this;

	self.init = function() {
		self.map = new google.maps.Map(document.getElementById('g-map'),{zoom: 13,center: {'lat':49.226967,'lng':-122.948692}});

		self.generateMarkers();
	};

	self.generateMarkers = function() {
		$.map(Model.data,function(event){
			console.log(JSON.stringify(event.latlng));
			var marker = new google.maps.Marker({
				position: event.latlng,
				map: self.map
			});
		});
	};

};

var App = {
	init: function() {
		var self = this;

		self.infoWindow = new InfoWindow();
		self.gMap = new GMap();

		App._load();
	},
	_load: function(callback) {
		var self = this;
		ko.applyBindings(self.infoWindow);
		$.ajax({
			url: 'https://www.eventbriteapi.com/v3/events/search/?sort_by=distance&location.within=20km&location.latitude=49.226967&location.longitude=-122.948692&date_modified.keyword=this_week&expand=organizer,venue&token=SOLRRNOSEG4UHYXOXLNG',
			type: 'GET',
			timeout: 5000,
			success: function(result, status) {

				if (result['pagination']['object_count'] == 0) {
					self.infoWindow.displayError('not_found');
					return;
				};

				Model.addData(result['events']);

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
	search: function(keyword, callback) {
		var self = this;

		$.ajax({
			url: 'https://www.eventbriteapi.com/v3/events/search/?q=' + keyword + '&sort_by=distance&location.within=20km&location.latitude=49.226967&location.longitude=-122.948692&date_modified.keyword=this_week&expand=organizer,venue&token=SOLRRNOSEG4UHYXOXLNG',
			type: 'GET',
			timeout: 5000,
			success: function(result, status) {

				if (result['pagination']['object_count'] == 0) {
					self.infoWindow.displayError('not_found');
					return;
				};

				Model.refreshData(result['events']);

				self.infoWindow.updateEvents();

				self.infoWindow.goBackToEventList();
			},
			error: function(xhr, status, error) {
				console.log('Error occured while searching events: ' + error);

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

	self.searchEvents = function() {
		var sanitizedKeywords = encodeURIComponent(self.searchKeywords()).replace(/%20/g, '+');
		App.search(sanitizedKeywords);
	};

	self.loadDescription = function(eventItem) {
		self.event(eventItem);
		self.showEventList(false);
		self.showEventDescription(true);
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
		self.showEventList(true);
		self.showEventDescription(false);
		self.showErrorScreen(false);
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
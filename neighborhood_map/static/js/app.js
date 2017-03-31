var Map = function() {
	var self = this;

	self.map = new google.maps.Map(document.getElementById('g-map'),{zoom: 5,center: {'lat':49.226967,'lng':-122.948692}});

};

var Event = function(event) {
	var self = this;
	self.name = event['name']['text'];
	self.description = event['description']['text'];
	self.time = event['start']['local'] + ' ~ ' + event['end']['local'];
	self.location = event['venue']['address']['address_1'] + ', ' + event['venue']['address']['city'];
	self.organizerName = event['organizer']['name'];
	self.url = event['url'];
};

var App = {
	load: function() {
		$.ajax({
			url: 'https://www.eventbriteapi.com/v3/events/search/?sort_by=distance&location.within=20km&location.latitude=49.226967&location.longitude=-122.948692&date_modified.keyword=this_week&expand=organizer,venue&token=SOLRRNOSEG4UHYXOXLNG',
			type: 'GET',
			success: function(result, status) {
				Model.data = result['events'];
				ko.applyBindings(new InfoWindow());
			},
			error: function(error) {
				console.log('Error occured while loading events: ' + error);
			}
		});
	},
	search: function(keyword, callback) {
		$.ajax({
			url: 'https://www.eventbriteapi.com/v3/events/search/?q=' + keyword + '&sort_by=distance&location.within=20km&location.latitude=49.226967&location.longitude=-122.948692&date_modified.keyword=this_week&expand=organizer,venue&token=SOLRRNOSEG4UHYXOXLNG',
			type: 'GET',
			timeout: 5000,
			success: function(result, status) {
				Model.data = result['events'];
				callback(result, status);
			},
			error: function(xhr, status, error) {
				console.log('Error occured while searching events: ' + error);
				callback(error, status);
			}
		});
	}
};

var Model = {
	data: []
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
			self.events.push(new Event(event));
			self.showEventList(true);
			self.showEventDescription(false);
		});
	};

	self.searchEvents = function() {
		var sanitizedKeywords = encodeURIComponent(self.searchKeywords()).replace(/%20/g, '+');
		App.search(sanitizedKeywords, function(result, status) {

			if (status == 'error') {
				self.displayError('default');
				return;
			};
			if (status == 'timeout') {
				self.displayError('timeout');
				return;
			};
			if (result['pagination']['object_count'] == 0) {
				self.displayError('not_found');
				return;
			};

			// Refresh the observable array
			self.events([]);

			// Update the event list
			$.map(Model.data, function(eventItem) {
				self.events.push(new Event(eventItem));
			});

			self.goBackToEventList();
		});
	};

	self.loadDescription = function(eventItem) {
		self.event(eventItem);
		self.showEventList(false);
		self.showEventDescription(true);
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

	self.init();
};

App.load();
var initMap = function() {
	//init
	this.map = new google.maps.Map(document.getElementById('g-map'),{zoom: 5,center: {"lat":49.226967,"lng":-122.948692}});
	this.infoWindow = new google.maps.InfoWindow({maxWidth: 250});

	// var filterButton = document.getElementById('search-submit');
	// google.maps.event.addDomListener(filterButton,'click',function(){
	// 	markers.filter(MAP,INFOWINDOW);
	// 	console.log("finished updating markers");
	// });

};

var Event = function(event) {
	var self = this;
	self.name = event["name"]["text"];
	self.description = event["description"]["text"];
	self.time = event["start"]["local"] + " ~ " + event["end"]["local"];
	self.location = event["venue"]["address"]["address_1"] + ", " + event["venue"]["address"]["city"];
	self.organizer_name = event["organizer"]["name"];
	self.url = event["url"];
};

var App = {
	load: function(){
		$.ajax({
			url: "https://www.eventbriteapi.com/v3/events/search/?sort_by=distance&location.within=20km&location.latitude=49.226967&location.longitude=-122.948692&date_modified.keyword=this_week&expand=organizer,venue&token=SOLRRNOSEG4UHYXOXLNG",
			type: "GET",
			success: function(result,status){
				Model.data = result["events"];
				ko.applyBindings(new InfoWindowViewModel());
			},
			error: function(error) {
				console.log("Error occured while loading events: " + error);
			}
		});
	},
	search: function(keyword, callback) {
		$.ajax({
			url: "https://www.eventbriteapi.com/v3/events/search/?q=" + keyword + "&sort_by=distance&location.within=20km&location.latitude=49.226967&location.longitude=-122.948692&date_modified.keyword=this_week&expand=organizer,venue&token=SOLRRNOSEG4UHYXOXLNG",
			type: "GET",
			timeout: 5000,
			success: function(result, status){
				Model.data = result["events"];
				callback(result, status);
			},
			error: function(xhr, status, error) {
				console.log("Error occured while searching events: " + error);
				callback(error, status);
			}
		});
	}
};

var Model = {
	data: []
};


var InfoWindowViewModel = function() {
	var self = this;
	//////////////
	//
	// Data
	//
	//////////////

	self.events = ko.observableArray([]);
	self.event = ko.observable();
	self.search_keywords = ko.observable();

	self.show_event_description = ko.observable(false);
	self.show_event_list = ko.observable(true);
	self.show_error_screen = ko.observable(false);
	self.show_default_error = ko.observable(false);
	self.show_timeout_error = ko.observable(false);
	self.show_not_found_error = ko.observable(false);

	///////////////
	//
	// Operations (Controller)
	//
	//////////////

	self.init = function() {
		// Display list of events
		$.map(Model.data, function(event){
			self.events.push(new Event(event));
			self.show_event_list(true);
			self.show_event_description(false);
		});
	};

	self.search_events = function() {
		var sanitized_keywords = encodeURIComponent(self.search_keywords()).replace(/%20/g, "+");
		App.search(sanitized_keywords, function(result, status){

			if (status == "error") {
				self.display_error("default");
				return;
			};
			if (status == "timeout") {
				self.display_error("timeout");
				return;
			};
			if (result["pagination"]["object_count"] == 0){
				self.display_error("not_found");
				return;
			};

			// Refresh the observable array
			self.events([]);

			// Update the event list
			$.map(Model.data, function(event_item){
				self.events.push(new Event(event_item));
			});

			self.go_back_to_event_list();
		});
	};

	self.load_description = function(event_item) {
		self.event(event_item);
		self.show_event_list(false);
		self.show_event_description(true);
	};

	self.go_back_to_event_list = function() {
		self.show_event_list(true);
		self.show_event_description(false);
		self.show_error_screen(false);
	};

	self.display_error = function(type) {

		// Determine error display type
		if (type == "default") {
			self.show_default_error(true);
			self.show_timeout_error(false);
			self.show_not_found_error(false);
		} else if (type == "timeout") {
			self.show_default_error(false);
			self.show_timeout_error(true);
			self.show_not_found_error(false);
		} else if (type == "not_found") {
			self.show_default_error(false);
			self.show_timeout_error(false);
			self.show_not_found_error(true);
		}

		// Show error screen
		self.show_error_screen(true);
		self.show_event_list(false);
		self.show_event_description(false);
	}

	self.init();
};

App.load();
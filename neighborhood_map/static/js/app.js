var EVENTBRITE_API_KEY = 'SOLRRNOSEG4UHYXOXLNG';

var App = {

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

	activateFilter: function() {
		var self = this;

		self.infoWindow.activateFilter();
	},

	showDetail: function(event) {
		var self = this;

		if (typeof self.gMap.prevClickedMarker != 'undefined') {
			self.gMap.resetMarkerAnimation(self.gMap.prevClickedMarker);
		}

		self.gMap.centerMarker(event.marker);
		self.gMap.animateMarker(event);
		self.infoWindow.showDetail(event);
		self.gMap.resize();
		self.gMap.prevClickedMarker = event.marker;
	},

	toggleInfoWindow: function() {
		var self = this;

		self.infoWindow.toggle();
		self.gMap.resize();
	},

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

	returnToMain: function(event) {
		var self = this;

		self.gMap.resetMarkerAnimation(event.marker);
		self.infoWindow.showMain();
		self.gMap.resize();
	},

	throwError: function(title, description) {
		var self = this;

		console.log(description);
		console.log(self.infoWindow);
		self.infoWindow.showError(title, description);
	}
};

App.init(EVENTBRITE_API_KEY);
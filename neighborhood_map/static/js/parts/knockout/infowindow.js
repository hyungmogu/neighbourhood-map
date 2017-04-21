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


	self._descriptionExists = function(event) {
		return typeof event.description != 'undefined' ? true : false;
	};

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
	}

	self.show = function() {
		self.isVisible(true);
	}

	self.loadEvents = function(listOfEvents) {
		self.events(listOfEvents);
		self.showEventList(true);
		self.showEventDescription(false);
		self.showErrorScreen(false);
	};

	self.showMain = function() {
		self.showEventList(true);
		self.showEventDescription(false);
		self.showErrorScreen(false);
	};

	self.showDetail = function(event) {
		self._selectEvent(event);

		self.showEventList(false);
		self.showEventDescription(true);
		self.showErrorScreen(false);
	};

	self._selectEvent = function(event) {
		self.selectedEvent(event);
	};

	self.showError = function(title, description) {
		self._loadError(title, description);

		self.showErrorScreen(true);
		self.showEventList(false);
		self.showEventDescription(false);
	};

	self._loadError = function(title,description) {
		self.errorTitle(title);
		self.errorDetail(description);
	};

	self.loadDescription = function(event) {
		App.showDetail(event);
	};

	self.goBackToEventList = function() {
		App.returnToMain(self.selectedEvent());
	};

	self.toggle = function() {
		self.toggleIsOn(!self.toggleIsOn());
	};

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

	self.activateFilter = function() {
		self.isSafeToFilter(true);
	};
};
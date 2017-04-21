var Header = function() {
	var self = this;

	self.isVisible = ko.observable(false);

	self.toggleInfoWindow = function() {
		App.toggleInfoWindow();
	};

	self.show = function() {
		self.isVisible(true);
	};
};
var LoadingScreen = function() {

	var self = this;

	self.isVisible = ko.observable(true);

	self.statusTitle = ko.observable('');
	self.statusDetail = ko.observable('');

	self.hide = function() {
    	self.isVisible(false);
	};

    self.updateStatus = function(title, detail) {
    	self.statusTitle(title);
    	self.statusDetail(detail);
    };
};
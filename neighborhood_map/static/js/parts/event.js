var EventItem = function(event) {
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
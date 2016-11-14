//protected. modified only when adding or permanently deleting data
var allLocations = [
	{
		_name: "2015 Alberta Business Fair",
		content: "hi",
		latlng: {lat: 52.08924, lng: -114.160540},
		keywords: ['alberta','calgary','stampede','business']
	},
	{
		_name: "Alberta Business Networking",
		content: "hi 2",
		latlng: {lat: 51.08920, lng: -112.160640},
		keywords: ['alberta','business','networking']
	},
	{
		_name: "Edmonton Speed Dating",
		content: "hi 3",
		latlng:{lat: 53.08912, lng: -111.160735},
		keywords: ['alberta','edmonton','dating']
	},
	{
		_name: "Alberta sex gathering",
		content: "hi 4",
		latlng:{lat: 51.08924, lng: -118.160749},
		keywords: ['alberta','sex','dating']
	},
	{
		_name: "Make Alberta Social Again",
		content: "hi 5",
		latlng:{lat: 50.09025, lng: -117.160742},
		keywords: ['alberta','meetup']
	}
];

//
var filteredLocations2 = [
	{
		_name: "2015 Alberta Business Fair",
		content: "hi",
		latlng: {lat: 52.08924, lng: -114.160540},
		keywords: ['alberta','calgary','stampede','business']
	},
	{
		_name: "Alberta Business Networking",
		content: "hi 2",
		latlng: {lat: 51.08920, lng: -112.160640},
		keywords: ['alberta','business','networking']
	},
	{
		_name: "Edmonton Speed Dating",
		content: "hi 3",
		latlng:{lat: 53.08912, lng: -111.160735},
		keywords: ['alberta','edmonton','dating']
	},
	{
		_name: "Alberta sex gathering",
		content: "hi 4",
		latlng:{lat: 51.08924, lng: -118.160749},
		keywords: ['alberta','sex','dating']
	},
	{
		_name: "Make Alberta Social Again",
		content: "hi 5",
		latlng:{lat: 50.09025, lng: -117.160742},
		keywords: ['alberta','meetup']
	}
];


var query = {
	getValue: function() {
		return document.getElementById('search').value;
	},
	isEmpty: function() {
		if (query.getValue() === "") {
			return true;
		} else {
			return false;
		}
	},
	generateFilteredList: function() {
		var query= this.getValue();
		var list = [];
		for(i = 0; i < allLocations.length; i++) {
			console.log(allLocations[i].keywords.indexOf(query));
			if (allLocations[i].keywords.indexOf(query) != -1){
				list.push(allLocations[i]);
			}
		}
		return list;
	}
}

var viewModel = function() {
	var self = this;
	self.locationsArray = ko.observableArray(filteredLocations2);
	self.showErrorIfExists= ko.observable("");
	self.filterContent = function() {
		//filter list
		if (!query.isEmpty()) {
			var list = query.generateFilteredList();
			if(list.length > 0){
				self.updateData(list);
			} else {
				self.locationsArray.removeAll();
				self.showErrorIfExists("No result found");
			}
		} else {
			console.log('query is empty');
			self.displayDefault();
		}
		console.log("about to activate markers filter function in filterContent: " +JSON.stringify(list));
		// markers.filter(initMap().map,list,initMap().infowindow);

		console.log('filter function activated');
		mapMarkers.removeAll();
		mapMarkers.generate(initMap().map,initMap().infowindow);

		console.log("activated filter function in filtercontent");

	};
	self.displayDefault = function() {
		self.locationsArray.removeAll();
		self.showErrorIfExists("");
		for (i = 0; i < allLocations.length; i++) {
			self.locationsArray.push(allLocations[i]);
		}
	};

	self.updateData = function(FILTEREDDATA){
		self.locationsArray.removeAll();
		self.showErrorIfExists("");
		for (i = 0; i < FILTEREDDATA.length; i++) {
			self.locationsArray.push(FILTEREDDATA[i]);
		}
	};
};

ko.applyBindings(new viewModel);

var initMap = function() {
	//init
	this.map = new google.maps.Map(document.getElementById('map'),{zoom: 5,center: allLocations[0].latlng});
	this.infoWindow = new google.maps.InfoWindow({maxWidth: 250});

	mapMarkers.init(this.map,allLocations,this.infoWindow);

	// var filterButton = document.getElementById('search-submit');
	// google.maps.event.addDomListener(filterButton,'click',function(){
	// 	markers.filter(MAP,INFOWINDOW);
	// 	console.log("finished updating markers");
	// });

};

var mapMarkers = {
	init: function(MAP,DATASET,INFOWINDOW) {
		this.markerLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		this.addedMarkers = [];

		mapMarkers.generate(MAP,INFOWINDOW);
		console.log("Init function of markers activated");
	},

	generate: function(MAP,INFOWINDOW){
		console.log("show function activated");
		console.log("Dataset from show: "+JSON.stringify(filteredLocations2));
		filteredLocations2.map(function(location,i){
			var content = location.content;
			var marker = new google.maps.Marker({
				position: location.latlng,
				label: mapMarkers.markerLabels[i % mapMarkers.markerLabels.length],
				map: MAP,
				title: location._name
			});
			console.log("at addDomListener: " + 'location-'+(i+1));
			google.maps.event.addDomListener(document.getElementById('location-'+(i+1)),'click',function(){
				setupInfoWindow(MAP,marker,content,INFOWINDOW);
			});

			marker.addListener('click', function(){
				setupInfoWindow(MAP,marker,content,INFOWINDOW);
			});

			mapMarkers.addedMarkers.push(marker);
		});
	},

	removeAll: function() {
		console.log("remove function activated");
		mapMarkers.addedMarkers.map(function(location,i){
			mapMarkers.addedMarkers[i].setMap(null);
		});
		mapMarkers.addedMarkers = [];
		console.log("AddedMarkers from remove all: " + mapMarkers.addedMarkers);
	},

	filter: function(MAP,INFOWINDOW) {
		console.log('filter function activated');
		mapMarkers.removeAll();
		console.log("filteredLocation2 from filter fuction: " + JSON.stringify(filteredLocations2));
		console.log("Added Markers from filter function" + JSON.stringify(mapMarkers.addedMarkers));
		mapMarkers.generate(MAP,INFOWINDOW);
	}
};

function setupInfoWindow(MAP,MARKER,CONTENT,INFOWINDOW) {
	MAP.setCenter(MARKER.getPosition());
	INFOWINDOW.setContent('<div>'+CONTENT+'</div>');
	INFOWINDOW.open(MAP,MARKER);
};

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
	self.listView = ko.observableArray(filteredLocations2);
	self.showErrorIfExists= ko.observable("");
	self.filterContent = function() {
		if (!query.isEmpty()) {
			var list = query.generateFilteredList();
			if(list.length > 0){
				self.updateListView(list);
			} else {
				self.listView.removeAll();
				self.showErrorIfExists("No result found");
			}
		} else {
			console.log('query is empty');
				viewModel.displayDefault();
		}

		markers.filter(initMap.map,initMap.infowindow);
	};
	self.displayDefault = function() {
		self.listView.removeAll();
		self.showErrorIfExists("");
		for (i = 0; i < allLocations.length; i++) {
			self.listView.push(allLocations[i]);
		}
	};

	self.updateListView = function(FILTEREDDATA){
		self.listView.removeAll();
		self.showErrorIfExists("");
		for (i = 0; i < FILTEREDDATA.length; i++) {
			self.listView.push(FILTEREDDATA[i]);
			console.log("list is updated");
		}
	};
};

ko.applyBindings(new viewModel);

var initMap = function() {
	//init
	this.map = new google.maps.Map(document.getElementById('map'),{zoom: 5,center: allLocations[0].latlng});
	this.infoWindow = new google.maps.InfoWindow({maxWidth: 250});

	markers.init(this.map,allLocations,this.infoWindow);

	// var filterButton = document.getElementById('search-submit');
	// google.maps.event.addDomListener(filterButton,'click',function(){
	// 	markers.filter(MAP,INFOWINDOW);
	// 	console.log("finished updating markers");
	// });

};

var markers = {
	init: function(MAP,DATASET,INFOWINDOW) {
		this.markerLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		this.addedMarkers = [];

		markers.show(MAP,DATASET,INFOWINDOW);

	},

	show: function(MAP,DATASET,INFOWINDOW){
		DATASET.map(function(location,i){
			var content = location.content;
			var marker = new google.maps.Marker({
				position: location.latlng,
				label: markers.markerLabels[i % markers.markerLabels.length],
				map: MAP,
				title: location._name
			});

			google.maps.event.addDomListener(document.getElementById('location-'+(i+1)),'click',function(){
				setupInfoWindow(MAP,marker,content,INFOWINDOW);
			});

			marker.addListener('click', function(){
				setupInfoWindow(MAP,marker,content,INFOWINDOW);
			});

			markers.addedMarkers.push(marker);
		});
	},

	removeAll: function() {
		for(i=0; i< markers.addedMarkers.length; i++) {
			markers.addedMarkers[i].setMap(null);
		}
		markers.addedMarkers.length = 0;
		console.log(markers.addedMarkers);
	},

	filter: function(MAP,INFOWINDOW) {
		markers.removeAll();
		console.log(filteredLocations2);
		markers.show(MAP,filteredLocations2,INFOWINDOW);
	}
};

function setupInfoWindow(MAP,MARKER,CONTENT,INFOWINDOW) {
	MAP.setCenter(MARKER.getPosition());
	INFOWINDOW.setContent('<div>'+CONTENT+'</div>');
	INFOWINDOW.open(MAP,MARKER);
};

//protected. modified only when adding or permanently deleting data
var safeData = [
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
var modifiableData = [
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
		for(i = 0; i < safeData.length; i++) {
			//console.log(safeData[i].keywords.indexOf(query));
			if (safeData[i].keywords.indexOf(query) != -1){
				list.push(safeData[i]);
			}
		}
		return list;
	}
}

var viewModel = function() {
	var self = this;
	self.locationsArray = ko.observableArray(modifiableData);
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
			//console.log('query is empty');
			self.displayDefault();
		}
		//console.log("about to activate markers filter function in filterContent: " +JSON.stringify(list));
		markers.filter();

		// console.log('filter function activated');
		// mapMarkers.removeAll();
		// mapMarkers.generate(initMap().map,initMap().infowindow);

		// console.log("activated filter function in filtercontent");

	};
	self.displayDefault = function() {
		self.locationsArray.removeAll();
		self.showErrorIfExists("");
		for (i = 0; i < safeData.length; i++) {
			self.locationsArray.push(safeData[i]);
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
	this.map = new google.maps.Map(document.getElementById('map'),{zoom: 5,center: safeData[0].latlng});
	this.infoWindow = new google.maps.InfoWindow({maxWidth: 250});

	markers.init(this.map,safeData,this.infoWindow);

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

		markers.generate(MAP,INFOWINDOW);
		//console.log("Init function of markers activated");
	},

	generate: function(MAP,INFOWINDOW){
		//console.log("show function activated");
		//console.log("Dataset from show: "+JSON.stringify(modifiableData));
		modifiableData.map(function(location,i){
			var content = location.content;
			var marker = new google.maps.Marker({
				position: location.latlng,
				label: markers.markerLabels[i % markers.markerLabels.length],
				map: MAP,
				title: location._name
			});
			//console.log("at addDomListener: " + 'location-'+(i+1));
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
		//console.log("remove function activated");
		markers.addedMarkers.map(function(location,i){
			markers.addedMarkers[i].setMap(null);
		});
		markers.addedMarkers = [];
		//console.log("AddedMarkers from remove all: " + mapMarkers.addedMarkers);
	},

	filter: function() {
		//console.log('filter function activated');
		markers.removeAll();
		//console.log("filteredLocation2 from filter fuction: " + JSON.stringify(modifiableData));
		//console.log("Added Markers from filter function" + JSON.stringify(mapMarkers.addedMarkers));
		markers.generate(initMap().map,initMap().infoWindow);
	}
};

function setupInfoWindow(MAP,MARKER,CONTENT,INFOWINDOW) {
	MAP.setCenter(MARKER.getPosition());
	INFOWINDOW.setContent('<div>'+CONTENT+'</div>');
	INFOWINDOW.open(MAP,MARKER);
};

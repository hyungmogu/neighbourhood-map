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
	self.filterListView = ko.computed({
		read: function() {
			return query.getValue();
		},
		write: function() {
			if (!query.isEmpty()) {
				var list = query.generateFilteredList();
				if(list.length > 0){
					self.listView.removeAll();
					for (i = 0; i < list.length; i++) {
						self.listView.push(list[i]);
						console.log("list is updated");
					}
				} else {
					self.listView.removeAll();
					self.showErrorIfExists("No result found");
				}
			} else {
				console.log('query is empty');
				self.listView.removeAll();
				for (i = 0; i < allLocations.length; i++) {
					self.listView.push(allLocations[i]);
				}
			}
		}
	});
};

ko.applyBindings(new viewModel);

var initMap = function() {
	//init
	var map = new google.maps.Map(document.getElementById('map'),{zoom: 5,center: allLocations[0].latlng});
	var infoWindow = new google.maps.InfoWindow({maxWidth: 250});
	var markerLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var addedMarkers = [];

	var filterButton = document.getElementById('search-submit');

	markers.show(map,allLocations,markerLabels,infoWindow,addedMarkers);

	google.maps.event.addDomListener(filterButton,'click',function(){
		markers.filter(map,markerLabels,infoWindow,addedMarkers);
		console.log("finished updating markers");
	});

};

var markers = {
	show: function(MAP,DATASET,LABELS,INFOWINDOW,ADDEDMARKERS){
		DATASET.map(function(location,i){
			var content = location.content;
			var marker = new google.maps.Marker({
				position: location.latlng,
				label: LABELS[i % LABELS.length],
				map: MAP,
				title: location._name
			});

			google.maps.event.addDomListener(document.getElementById('location-'+(i+1)),'click',function(){
				setupInfoWindow(MAP,marker,content,INFOWINDOW);
			});

			marker.addListener('click', function(){
				setupInfoWindow(MAP,marker,content,INFOWINDOW);
			});

			ADDEDMARKERS.push(marker);
		});
		return ADDEDMARKERS
	},

	removeAll: function(ADDEDMARKERS) {
		ADDEDMARKERS.map(function(marker,i){
			marker.setMap(null);
		});

		ADDEDMARKERS = [];
		return ADDEDMARKERS;
	},

	filter: function(MAP,LABELS,INFOWINDOW,ADDEDMARKERS) {
		markers.removeAll(ADDEDMARKERS);
		console.log(JSON.stringify(filteredLocations2));
		markers.show(MAP,filteredLocations2,LABELS,INFOWINDOW,ADDEDMARKERS);
	}
};

function setupInfoWindow(MAP,MARKER,CONTENT,INFOWINDOW) {
	MAP.setCenter(MARKER.getPosition());
	INFOWINDOW.setContent('<div>'+CONTENT+'</div>');
	INFOWINDOW.open(MAP,MARKER);
};

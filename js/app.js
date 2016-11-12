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

var filteredLocations = [
	[
		{
			_name: "Place 1",
			content: "hi",
			latlng: {lat: 52.08924, lng: -114.160540}
		},
		{
			_name: "Place 2",
			content: "hi 2",
			latlng: {lat: 51.08920, lng: -112.160640},
		}
	],
	[
		{
			_name: "Place 3",
			content: "hi 3",
			latlng:{lat: 53.08912,  lng: -111.160735},
		},
		{
			_name: "Place 4",
			content: "hi 4",
			latlng:{lat: 51.08924, lng: -118.160749},
		},
		{
			_name: "Place 5",
			content: "hi 5",
			latlng:{lat: 50.09025, lng: -117.160742}
		}
	]
];


function initMap() {
	//init
	var map = new google.maps.Map(document.getElementById('map'),{
		zoom: 5,
		center: allLocations[0].latlng
	});
	var infoWindow = new google.maps.InfoWindow({
		maxWidth: 250
	});
	var markerLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var markers = [];
	var filter = document.getElementById('filter-menu');
	var currentFilterType = 0;

	setMarkers(map,allLocations,markerLabels,infoWindow,markers);

	google.maps.event.addDomListener(filter,'click',function(){

		var clickedFilterType = filter.value;
		console.log(clickedFilterType);
		if ( (clickedFilterType != currentFilterType) && clickedFilterType != 0) {

			filterMarkers(map,clickedFilterType,markerLabels,infoWindow,markers);
			currentFilterType = clickedFilterType;

		} else if ((clickedFilterType != currentFilterType) && clickedFilterType == 0) {

			setMarkers(map,allLocations,markerLabels,infoWindow,markers);
			currentFilterType = clickedFilterType;
		}
	});

};

function setMarkers(MAP,DATASET,LABELS,INFOWINDOW,MARKERS){
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

		MARKERS.push(marker);
	});

	return MARKERS
};

function clearMarkers(MARKERS) {
	MARKERS.map(function(marker,i){
		marker.setMap(null);
	});

	MARKERS = [];
	return MARKERS;
}

function filterMarkers(MAP,CLICKED_FILTER_TYPE,LABELS,INFOWINDOW,MARKERS){
	var newData = filteredLocations[CLICKED_FILTER_TYPE-1];
	clearMarkers(MARKERS);
	setMarkers(MAP,newData,LABELS,INFOWINDOW,MARKERS);
}

function setupInfoWindow(MAP,MARKER,CONTENT,INFOWINDOW) {
	MAP.setCenter(MARKER.getPosition());
	INFOWINDOW.setContent('<div>'+CONTENT+'</div>');
	INFOWINDOW.open(MAP,MARKER);
};

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
					}
				} else {
					console.log("I am Here");
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


ko.applyBindings(new viewModel);




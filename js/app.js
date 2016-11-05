var locations = [
	{
		_name: "Place 1",
		content: "hi",
		latlng: {lat: 52.08924, lng: -114.160540}
	},
	{
		_name: "Place 2",
		content: "hi 2",
		latlng: {lat: 51.08920, lng: -112.160640},
	},
	{
		_name: "Place 3",
		content: "hi 3",
		latlng:{lat: 53.08912, lng: -111.160735},
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
];

function initMap() {
	//init
	var home = locations[0].latlng
	var labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var map = new google.maps.Map(document.getElementById('map'),{
		zoom: 10,
		center: home
	});
	var infoWindow = new google.maps.InfoWindow({
		maxWidth: 250
	});

	addMarkers(map,locations,labels,infoWindow);

};

function addMarkers(MAP,DATASET,LABELS,INFOWINDOW){
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
	});
};

function setupInfoWindow(MAP,MARKER,CONTENT,INFOWINDOW) {
	MAP.setCenter(MARKER.getPosition());
	INFOWINDOW.setContent('<div>'+CONTENT+'</div>');
	INFOWINDOW.open(MAP,MARKER);
};

var viewModel = function() {
	var self = this;
	self.listView = ko.observableArray(locations);

};

ko.applyBindings(new viewModel);




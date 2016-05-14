"use strict"
// Onload we grab and set default input fields, add a listener for our button, and initialize
window.onload = function(event){
    var mapElement = new UrtheCastMap();
    document.getElementById('map-wrapper').appendChild(mapElement);
    mapElement.initializeMap(37.78, -122.89, 9); // SF
};


//TODO: these functions are outdated - move their functionality elsewhere...
function initialInputters() {
  // Show starting lat/long
  // TODO: get inputs back
  var latInput = document.getElementById('lat-in');
  latInput.value = DEFAULT_OPTIONS.latitude;

  var longInput = document.getElementById('long-in');
  longInput.value = DEFAULT_OPTIONS.longitude;

  // TODO: Is this the right approach if we have to store these two numbers in LayerToggle?
  // TODO: They might belong on a Map object?
  var cloudInput = document.getElementById('cloud-cover-in');
  cloudInput.value = LayerToggleProto.filters.cloud_coverage_lte;

  var sunElevInput = document.getElementById('sun-elevation-in');
  sunElevInput.value = LayerToggleProto.filters.sun_elevation_lte;

  // Listen for lat-long changes
  var changeLocationButton = document.getElementById('new-location-btn');
  changeLocationButton.addEventListener('click', resetMapOptions);
}

function resetMapOptions() {
  var latInput = document.getElementById('lat-in');
  var longInput = document.getElementById('long-in');
  var cloudInput = document.getElementById('cloud-cover-in');
  var sunElevInput = document.getElementById('sun-elevation-in');
  var activeSensors = document.querySelectorAll(`#sensor-toggle .${ToggleButton.activeClass}`);

  var sensors = [];
  for(let i = 0; i < activeSensors.length; i++) {
    sensors.push(activeSensors[i].innerText);
  }

  var options = {
    latitude: latInput.value,
    longitude: longInput.value,
    zoom: DEFAULT_OPTIONS.zoom,
    filters: {
      sensor_platform: sensors.join(','),
      season: SEASONS.join(','),
      cloud_coverage_lte: cloudInput.value,
      sun_elevation_lte: sunElevInput.value
    }
  }

  map.eachLayer(function(layer) {
    map.removeLayer(layer);
  });

  initializeMap(options);
}

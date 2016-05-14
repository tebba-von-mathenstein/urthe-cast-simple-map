"use strict"
// Access to the API stored in Local Storage


const DEFAULT_OPTIONS = {
  latitude: 37.78684346730307,
  longitude: -122.40559101104735,
  zoom: 9
};

// Onload we grab and set default input fields, add a listener for our button, and initialize
window.onload = function(event){
    var map = L.map('map');

    var mapElement = document.getElementById('map');
    var mapMenu = new MapMenu();
    var layerSection = new MenuSection();

    for(let idx in LayerToggle.LAYERS) {
        let toggle = new ToggleButton();
        let name = LAYERS[idx];
        let onByDefault = idx == 0;

        toggle.innerText = name;
        layerSection.appendChild(toggle);
        linkLayerToggle(toggle, name, idx, map, idx == 0, DEFAULT_OPTIONS.filters);
    }

    mapMenu.appendChild(layerSection);
    mapElement.insertBefore(mapMenu, mapElement.firstChild);

    // Show starting lat/long
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

    map.setView(L.latLng(DEFAULT_OPTIONS.latitude, DEFAULT_OPTIONS.longitude), DEFAULT_OPTIONS.zoom);

    initializeMap(map, undefined, mapMenu);
};

function initializeMap(map,  options, layerSection) {
  if(options === undefined) {
    options = DEFAULT_OPTIONS;
  }

  // Use defaults for unset properties
  for(var key in DEFAULT_OPTIONS) {
    if(!options[key]) {
      options[key] = DEFAULT_OPTIONS[key];
    }
  }

  map.panTo(L.latLng(options.latitude, options.longitude));


  // Create the layers
  for(let i = 0; i < LayerToggleProto.colorLayers.length; i++) {
    let layerName = LayerToggleProto.colorLayers[i];
    let initiallyOn = i === 0;
    let layerToggle = new LayerToggle();
    layerToggle.initializeLayer(map, layerName, LayerToggle.filters);

    if(i === 0) {
      layerToggle.activate();
    }
    layerSection.appendChild(layerToggle);
  }
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

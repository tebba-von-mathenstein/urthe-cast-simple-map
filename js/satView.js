"use strict"
// Access to the API stored in Local Storage
const LS_API_KEY = 'uc_api_key';
const LS_API_SECRET = 'uc_api_secret';
const API_KEY = getOrPrompt(LS_API_KEY);
const API_SECRET = getOrPrompt(LS_API_SECRET);

const LAYERS = ['rgb', 'ndvi', 'ndwi', 'false-color-nir', 'evi'];
const SENSORS = ['theia', 'landsat-8', 'deimos-1'];
const SEASONS = ['summer', 'fall', 'winter', 'spring'];

const DEFAULT_OPTIONS = {
  latitude: 37.78684346730307,
  longitude: -122.40559101104735,
  zoom: 9,
  filters: {
    sensor_platform: SENSORS.join(','),
    season: SEASONS.join(','),
    cloud_coverage_lte: 100,
    sun_elevation_lte: 90
  }
};

// Onload we grab and set default input fields, add a listener for our button, and initialize
window.onload = function(event){
    var map = L.map('map');

    var mapElement = document.getElementById('map');
    var toggleMenu = new ToggleMenu();
    var sensorSection = new ToggleSection();
    var layerSection = new ToggleSection();

    for(let idx in SENSORS) {
        let toggle = new Toggle();
        toggle.innerText = SENSORS[idx];
        toggle.classList.add(ACTIVE_CLASS);
        sensorSection.appendChild(toggle);
    }

    for(let idx in LAYERS) {
        let toggle = new Toggle();
        let name = LAYERS[idx];
        let onByDefault = idx == 0;

        toggle.innerText = name;
        layerSection.appendChild(toggle);
        linkLayerToggle(toggle, name, idx, map, idx == 0, DEFAULT_OPTIONS.filters);
    }

    toggleMenu.appendChild(sensorSection);
    toggleMenu.appendChild(layerSection);
    mapElement.insertBefore(toggleMenu, mapElement.firstChild);

    // Show starting lat/long
    var latInput = document.getElementById('lat-in');
    latInput.value = DEFAULT_OPTIONS.latitude;

    var longInput = document.getElementById('long-in');
    longInput.value = DEFAULT_OPTIONS.longitude;

    var cloudInput = document.getElementById('cloud-cover-in');
    cloudInput.value = DEFAULT_OPTIONS.filters.cloud_coverage_lte;

    var sunElevInput = document.getElementById('sun-elevation-in');
    sunElevInput.value = DEFAULT_OPTIONS.filters.sun_elevation_lte;

    // Listen for lat-long changes
    var changeLocationButton = document.getElementById('new-location-btn');
    changeLocationButton.addEventListener('click', resetMapOptions);

    map.setView(L.latLng(DEFAULT_OPTIONS.latitude, DEFAULT_OPTIONS.longitude), DEFAULT_OPTIONS.zoom);

    initializeMap(map);
};

function initializeMap(map,  options) {
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
  // var layerToggles = document.getElementById('layer-toggle');
  // layerToggles.innerHTML = '';

  // for(let i = 0; i < LAYERS.length; i++) {
  //   let layerName = LAYERS[i];
  //   let initiallyOn = i === 0;
  //   addLayerToggle(layerName, i, map, initiallyOn, options.filters);
  // }
}

function resetMapOptions() {
  var latInput = document.getElementById('lat-in');
  var longInput = document.getElementById('long-in');
  var cloudInput = document.getElementById('cloud-cover-in');
  var sunElevInput = document.getElementById('sun-elevation-in');
  var activeSensors = document.querySelectorAll(`#sensor-toggle .${ACTIVE_CLASS}`);
  
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

/* * 
 * Create a tile layer url based on options and the color-set desired
 *  @param colorLayer: UrtheCast API values: 'rgb', 'ndvi', 'ndwi', 'false-color-nir', 'evi'
 *  @param filterValues: UrtheCast API key/value pairs for query params
 */
function createTileUrl(colorLayer, filterValues) {
  var main = `https://tile-{s}.urthecast.com/v1/${colorLayer}/{z}/{x}/{y}?api_key=${API_KEY}&api_secret=${API_SECRET}`;
  
  for(let key in filterValues){
    let val = filterValues[key];
    main += `&${key}=${val}`;
  }

  return main;
}

/**
 * Based on: https://www.mapbox.com/mapbox.js/example/v1.0.0/layers/
 *
 * Create a menu-ui element and add it to the layer section.
 * This name must correspond with a value from the UrtheCast
 * api color layer options.
 * 
 * @param layer: a layer object from mapbox.js
 * @param name: a string, must be a valid color layer option from UrtheCast
 * @param zIndex: a number, the zIndex of the layer on the map
 * @param map: a reference to the map object which will hold the layers
 * 
 * return DOMElement, the anchor tag added to the toggle-menu
 */
function linkLayerToggle(toggleElement, name, zIndex, map, initOn, filters) {
  var url = createTileUrl(name, filters);
  var layer = L.tileLayer(url);

  layer.setZIndex(zIndex);

  if(initOn) {
    toggleElement.className = ACTIVE_CLASS;
    map.addLayer(layer);
  }

  toggleElement.onclick = function(event) {
    event.preventDefault();
    event.stopPropagation();

    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
      toggleElement.className = INACTIVE_CLASS;
    } else {
      map.addLayer(layer);
      toggleElement.className = ACTIVE_CLASS;
    }
  };
}

/** 
 * Takes a key for local storage and fetches the value, or prompts
 * the user for it if it's not in LS. 
 *
 * @param lsKeyValue: a string to be used as a local storage key.   
 */
function getOrPrompt(lsKeyValue) {
  var valInStorage = localStorage.getItem(lsKeyValue);

  if(!valInStorage) {
    valInStorage = prompt(`Enter a value for ${lsKeyValue}`);
    localStorage.setItem(lsKeyValue, valInStorage);
  }

  return valInStorage;
}
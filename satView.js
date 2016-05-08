"use strict"
// Access to the API stored in Local Storage
const LS_API_KEY = 'uc_api_key';
const LS_API_SECRET = 'uc_api_secret';
const API_KEY = getOrPrompt(LS_API_KEY);
const API_SECRET = getOrPrompt(LS_API_SECRET);

// menu-ui togglers
const ACTIVE_CLASS = "active";
const INACTIVE_CLASS = "";

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
var MAP_GLOBAL;
window.onload = function(event){
  // Allow menu hiding
  document.getElementById("hide-menus").addEventListener('click', hideMenuHandler);

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

  // Add the sensor-toggle elements
  for(let i = 0; i < SENSORS.length; i++) {
    let sensorName = SENSORS[i];
    addSensorToggle(sensorName);
  }
  
  MAP_GLOBAL = L.map('map');
  MAP_GLOBAL.setView(L.latLng(DEFAULT_OPTIONS.latitude, DEFAULT_OPTIONS.longitude), DEFAULT_OPTIONS.zoom);

  initializeMap();
};

function initializeMap(options) {
  map = MAP_GLOBAL;
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
  var layerToggles = document.getElementById('layer-toggle');
  layerToggles.innerHTML = '';

  for(let i = 0; i < LAYERS.length; i++) {
    let layerName = LAYERS[i];
    let initiallyOn = i === 0;
    addLayerToggle(layerName, i, map, initiallyOn, options.filters);
  }
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
 * Click handler for hide/show menus button.
 * Toggles the menus to be hidden.
 */
function hideMenuHandler(event) {
  event.preventDefault();
  event.stopPropagation();

  var menus = document.querySelectorAll('.menu-ui.hideable');
  var targetStyle;

  if (event.target.classList.contains(ACTIVE_CLASS)) {
    event.target.className = INACTIVE_CLASS;
    event.target.innerText = "Hide Menus";
    targetStyle = "";
  } else {
    event.target.className = ACTIVE_CLASS;
    event.target.innerText = "Show Menus";
    targetStyle = "none";
  }

  for(let i = 0; i < menus.length; i++) {
    let subMenu = menus[i];
    subMenu.style.display = targetStyle;
  }
}

/**
 * Given a name, create a menu-ui element and add it to the sensor
 * section. This name must correspond with a value from the UrtheCast
 * api sensor filter options.
 */
function addSensorToggle(name) {
  var link = document.createElement('a');
      link.href = '#';
      link.className = ACTIVE_CLASS;
      link.innerHTML = name;

  link.onclick = function(event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.classList.contains(ACTIVE_CLASS)) {
      this.className = INACTIVE_CLASS;
    } else {
      this.className = ACTIVE_CLASS;
    }
  };

  var layers = document.getElementById('sensor-toggle');
  layers.appendChild(link);
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
 */
function addLayerToggle(name, zIndex, map, initOn, filters) {
  let url = createTileUrl(name, filters);
  var layer = L.tileLayer(url);

  layer.setZIndex(zIndex);

  // Create a simple layer switcher that
  // toggles layers on and off.
  var link = document.createElement('a');
      link.href = '#';
      link.className = INACTIVE_CLASS;
      link.innerHTML = name;

  if(initOn) {
    link.className = ACTIVE_CLASS;
    map.addLayer(layer);
  }

  link.onclick = function(event) {
    event.preventDefault();
    event.stopPropagation();

    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
      this.className = INACTIVE_CLASS;
    } else {
      map.addLayer(layer);
      this.className = ACTIVE_CLASS;
    }
  };

  // Fetch the nav element
  var layers = document.getElementById('layer-toggle');
  layers.appendChild(link);
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
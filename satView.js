"use strict"
// Access to the API stored in Local Storage
const LS_API_KEY = 'uc_api_key';
const LS_API_SECRET = 'uc_api_secret';
const API_KEY = getOrPrompt(LS_API_KEY);
const API_SECRET = getOrPrompt(LS_API_SECRET);

// SF's location information
const SF_LAT = 37.78684346730307;
const SF_LONG = -122.40559101104735;
const DEFAULT_ZOOM = 9;

// menu-ui togglers
const ACTIVE_CLASS = "active";
const INACTIVE_CLASS = "";

const LAYERS = ['rgb', 'ndvi', 'ndwi', 'false-color-nir', 'evi'];
const SENSORS = ['theia', 'landsat-8', 'deimos-1'];
const SEASONS = ['summer', 'fall', 'winter', 'spring'];

const FILTERS = {
  sensor_platform: SENSORS.join(','),
  season: SEASONS.join(','),
  cloud_coverage_lte: 100,
  sun_elevation_lte: 90
};


window.onload = function() {
  var map = L.map('map');

  // Lets look at SF
  setMapLocation(map, SF_LAT, SF_LONG, DEFAULT_ZOOM);

  // Create the layers
  for(let i = 0; i < LAYERS.length; i++) {
    let colorLayer = LAYERS[i];
    let url = createTileUrl(colorLayer, FILTERS);

    // Allow the layers to be toggled. 
    addLayerToggle(L.tileLayer(url), colorLayer, i, map);
  }

  // Add the sensor-toggle elements
  for(let i = 0; i < SENSORS.length; i++) {
    let sensorName = SENSORS[i];
    addSensorToggle(sensorName);
  }

  // Allow menu hiding
  document.getElementById("hide-menus").addEventListener('click', hideMenuHandler);

  // Show starting lat/long
  var latInput = document.getElementById('lat-in');
  var longInput = document.getElementById('long-in');
  latInput.value = SF_LAT;
  longInput.value = SF_LONG;

  // Listen for lat-long changes
  var changeLocationButton = document.getElementById('new-location-btn');
  changeLocationButton.addEventListener('click', function(event) {
    setMapLocation(map, latInput.value, longInput.value);
  });
}

/**
 * Given a latitude, logitude, and zoom[0-15] values, move the map
 * wherever it needs to go.
 */
function setMapLocation(map, latitude, longitude, zoom) {
  var latLong = L.latLng(latitude, longitude);
  map.setView(latLong, zoom);
}

/* * 
 * Create a tile layer url based on filters and the color-set desired
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
      link.className = INACTIVE_CLASS;
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
function addLayerToggle(layer, name, zIndex, map) {
  layer.setZIndex(zIndex);

  // Create a simple layer switcher that
  // toggles layers on and off.
  var link = document.createElement('a');
      link.href = '#';
      link.className = INACTIVE_CLASS;
      link.innerHTML = name;

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
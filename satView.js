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

const LAYERS = ['rgb', 'ndvi', 'ndwi', 'false-color-nir', 'evi'];
const FILTERS = {
  sensor_platform: 'theia,landsat-8,deimos-1',
  cloud_coverage_lte: 20,
  sun_elevation_lte: 90,
  season: 'winter',
};
//season: 'summer,winter,spring,fall'

window.onload = function() {
  var map = L.map('map');

  // Map can alter itself
  map.setLocation = setMapLocation;

  // So I can play with setLocation in the console
  window.setMapLocation = setMapLocation.bind(map);

  // Lets look at SF
  map.setLocation(SF_LAT, SF_LONG, DEFAULT_ZOOM);

  // Create the layers
  for(let i = 0; i < LAYERS.length; i++) {
    let colorLayer = LAYERS[i];
    let url = createTileUrl(colorLayer, FILTERS);

    // Allow the layers to be toggled. 
    addLayerToggle(L.tileLayer(url), colorLayer, i, map);
  }

  // Show starting lat/long
  var latInput = document.getElementById('lat-in');
  var longInput = document.getElementById('long-in');
  latInput.value = SF_LAT;
  longInput.value = SF_LONG;

  // Listen for lat-long changes
  var changeLocationButton = document.getElementById('new-location-btn');
  changeLocationButton.addEventListener('click', function(event) {
    map.setLocation(latInput.value, longInput.value);
  });
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

// From https://www.mapbox.com/mapbox.js/example/v1.0.0/layers/
// Creates a button which can toggle the map layers on and off
function addLayerToggle(layer, name, zIndex, map) {
  layer.setZIndex(zIndex);

  // Create a simple layer switcher that
  // toggles layers on and off.
  var link = document.createElement('a');
      link.href = '#';
      link.className = '';
      link.innerHTML = name;

  link.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
      this.className = '';
    } else {
      map.addLayer(layer);
      this.className = 'active';
    }
  };

  // Fetch the nav element
  var layers = document.getElementById('menu-ui');
  layers.appendChild(link);
}

/**
 * Given a latitude, logitude, and zoom values, move the map
 * wherever it needs to go. 
 */
function setMapLocation(latitude, longitude, zoom) {
  var latLong = L.latLng(latitude, longitude);
  this.setView(latLong, zoom);
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
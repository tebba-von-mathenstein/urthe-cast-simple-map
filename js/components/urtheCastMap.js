"use strict"

// TODO: more elegant solution to api keys
const API_KEY = getOrPrompt('uc_api_key');
const API_SECRET = getOrPrompt('uc_api_secret');

// TODO: Is there a way to have these as static properties without recreating them each time
// and also without making them global?
const UC_COLOR_LAYERS = ['rgb', 'ndvi', 'ndwi', 'false-color-nir', 'evi'];
const UC_SENSORS = ['theia', 'landsat-8', 'deimos-1'];
const UC_SEASONS = ['summer', 'fall', 'winter', 'spring'];

// completely permissive defaults
const UC_FILTERS = {
  sensor_platform: UC_SENSORS.join(','),
  season: UC_SEASONS.join(','),
  cloud_coverage_lte: 100,
  sun_elevation_lte: 90
}

/*
  an UrtheCastMap is an HMTL element represneting a satilite map using the urthe cast API.
  By default it has a menu overlay which can be used to trigger color layers
*/
class UrtheCastMapProto extends HTMLElement {

  constructor() {
    super();
  }

  static get sensors() { return UC_SENSORS; }
  static get seasons() { return UC_SEASONS; }
  static get colorLayers() { return UC_COLOR_LAYERS; }
  static get filters() { return UC_FILTERS; }

  /*
    Initialize the map component, including create the leaflet map, and map menu
  */
  initializeMap(latitude, longitude, zoom) {
    this.id = 'uc-map';
    this.map = L.map('uc-map');
    this.mapMenu = new MapMenu();
    this.mapMenu.initializeMenu(this.map)
    this.map.setView(L.latLng(latitude, longitude), zoom);
    this.appendChild(this.mapMenu);
  }

}

var UrtheCastMap = document.registerElement('uc-map', UrtheCastMapProto);

/**
 * TODO: Move this to a utility module.
 *
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

"use strict"
/*
  A Layer toggle is a toggle button which can turn on and off a color map
  layer.
*/

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

class LayerToggleProto extends ToggleButtonProto {

  /*
    @param map a reference to a mapbox.js/leaflet.js object that this layer belongs to
    @param colorLayer a valid UrtheCast API color layer value.
  */
  constructor(map, colorLayer, filters) {
    super()
  }

  initializeLayer(map, colorLayer, filters) {
      this.map = map;
      this.innerText = colorLayer;
      this.colorLayer = colorLayer;

      // Clone any filter props to a new object
      this.filters = {};
      Object.assign(this.filters, filters);

      this.url = LayerToggleProto.createUrl(this.colorLayer, this.filters);
      this.layer = L.tileLayer(this.url);
  }

  static get sensors() { return UC_SENSORS; }
  static get seasons() { return UC_SEASONS; }
  static get colorLayers() { return UC_COLOR_LAYERS; }
  static get filters() { return UC_FILTERS; }

  static createUrl(colorLayer, filters) {
    var url = `https://tile-{s}.urthecast.com/v1/${colorLayer}/{z}/{x}/{y}?api_key=${API_KEY}&api_secret=${API_SECRET}`;

    for(let key in filters){
      let val = filters[key];
      url += `&${key}=${val}`;
    }

    return url;
  }

  /*
    Listen for clicks by default, toggling the layer on and off
  */
  attachedCallback() {
    this.addEventListener('click', function(event) {
      this.toggleLayer();
    });
  }

  /*
    Alter the activated state. When active the selected color layer will be added to the map
  */
  toggleLayer() {
    if(this.classList.contains(super.activeClass)) {
      this.deactivate()
    }
    else {
      this.activate();
    }
  }

  activate() {
    super.activate();
    this.map.addLayer(this.layer);
  }

  deactivate() {
    super.deactivate();
    this.map.removeLayer(this.layer);
  }
}

var LayerToggle = document.registerElement('layer-toggle', LayerToggleProto);

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

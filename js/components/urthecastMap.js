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
    this.layerSection = new MenuSection();
    this.sensorSection = new MenuSection();

    // Create the sensor toggles
    for(let i = 0; i < UrtheCastMapProto.sensors.length; i++) {
      let sensorName = UrtheCastMapProto.sensors[i];
      let sensorToggle = new ToggleButton();
      sensorToggle.activate();
      sensorToggle.innerText = sensorName;
      this.sensorSection.appendChild(sensorToggle);
    }

    // On click, update the sensor filters for the URLs
    this.sensorSection.addEventListener('click', this.updateTileFilters.bind(this));

    // Add the layers w/ toggles
    for(let i = 0; i < UrtheCastMapProto.colorLayers.length; i++) {
      let layerName = UrtheCastMapProto.colorLayers[i];
      let layerToggle = new LayerToggle();

      layerToggle.initializeLayer(this.map, layerName, UrtheCastMapProto.filters);
      this.layerSection.appendChild(layerToggle);

      if(i === 0) {
        layerToggle.activate();
      }
    }

    // Turn off all layers (during capture phase) before toggling -- this ensures one is always on
    this.layerSection.addEventListener('click', this.disableAllLayers.bind(this), true);

    this.mapMenu.appendChild(this.layerSection);
    this.mapMenu.appendChild(this.sensorSection);
    this.appendChild(this.mapMenu);

    this.map.setView(L.latLng(latitude, longitude), zoom);
  }

  /*
    This method disables all active layers.
    Commonly used to ensure that only one layer is on at a time.
  */
  disableAllLayers() {
    var layerToggles = this.layerSection.querySelectorAll('layer-toggle');
    for(let i = 0; i < layerToggles.length; i++) {
      layerToggles[i].deactivate();
    }
  }

  /*
    In order to change API filter values, the tile layers have to be given a new URL. Here
    we remove the old layers and add new ones based on the current filter configuration
  */
  updateTileFilters() {
    var filters = {};

    // Check acvitve sensors
    var activeSensors = [];
    for(let i = 0; i < this.sensorSection.children.length; i++) {
      let sensorToggle = this.sensorSection.children[i];

      if(sensorToggle.isActive()) {
        activeSensors.push(sensorToggle.innerText);
      }
    }

    // sensor_platform is an UrtheCast value
    filters.sensor_platform = activeSensors.join(',');

    // Give each layer a new url based on our known filter situation
    for(let i = 0; i < this.layerSection.children.length; i++) {
      let layerToggle = this.layerSection.children[i];
      let newUrl = LayerToggleProto.createUrl(layerToggle.innerText, filters)
      layerToggle.layer.setUrl(newUrl);
    }
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

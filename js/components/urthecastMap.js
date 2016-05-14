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
    console.log("CONSTRUCT...")
    this.id = 'map'; // This is requied by leaflet
  }

  static get sensors() { return UC_SENSORS; }
  static get seasons() { return UC_SEASONS; }
  static get colorLayers() { return UC_COLOR_LAYERS; }
  static get filters() { return UC_FILTERS; }

  initializeMap(latitude, longitude, zoom) {
    this.id = 'uc-map';
    this.map = L.map('uc-map');
    var mapMenu = new MapMenu();
    var layerSection = new MenuSection();

    // Add the layers
    for(let i = 0; i < UrtheCastMapProto.colorLayers.length; i++) {
      let layerName = UrtheCastMapProto.colorLayers[i];
      let initiallyOn = i === 0;
      let layerToggle = new LayerToggle();
      layerToggle.initializeLayer(this.map, layerName, UrtheCastMapProto.filters);

      if(i === 0) {
        layerToggle.activate();
      }
      layerSection.appendChild(layerToggle);
    }

    layerSection.addEventListener('click', function(event) {
      var layerToggles = layerSection.querySelectorAll('layer-toggle');
      for(let i = 0; i < layerToggles.length; i++) {
        layerToggles[i].deactivate();
      }
    }, true);




    mapMenu.appendChild(layerSection);
    this.appendChild(mapMenu);

    this.map.setView(L.latLng(latitude, longitude), zoom);
  }
}

var UrtheCastMap = document.registerElement('uc-map', UrtheCastMapProto);

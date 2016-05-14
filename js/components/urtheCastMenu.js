"use strict"
/*
  A MapMenu is an overlay with options for controlling the maps behavior.
  This might be anything from toggling map layers on and off, or selecting
  a desired season or date range.

  The Map can be hidden and shown using the hidden class.
*/
class MapMenuProto extends HTMLElement {

  // hidden class controls css behavior
  static get hiddenClass() {
    return 'hidden';
  }

  constructor() {
    super();
  }

  initializeMenu(map) {
    this.map = map;
    this.layerSection = new MenuSection();
    this.layerSection.addEventListener('click', this.disableAllLayers.bind(this), true);

    this.sensorSection = new MenuSection();
    this.sensorSection.addEventListener('click', this.updateTileUrls.bind(this));

    this.latLongSection = new MenuSection();
    var latLongHTML = '' +
      '<form>' +
        '<input type="number" name="latitude" placeholder="latitude" step="any">' +
        '<input type="number" name="longitude" placeholder="longitude" step="any">' +
        '<input type="submit" value="Go">' +
      '</form>';
    this.latLongSection.innerHTML = latLongHTML;
    this.latLongSection.addEventListener('submit', this.handleLatLongSubmit.bind(this));

    // TODO: Create a two-sided slider component that can be used for this and sun-angle.
    this.cloudCoverageSection = new MenuSection();
    var latLongHTML = '' +
      '<form>' +
        '<input type="number" name="cloud-coverage" placeholder="cloud-coverage" step="any">' +
        '<input type="submit" value="Go">' +
      '</form>';
    this.cloudCoverageSection.innerHTML = latLongHTML;
    this.cloudCoverageSection.addEventListener('submit', this.handleCloudCoverageSubmit.bind(this));


    // Create the sensor toggles
    for(let i = 0; i < UrtheCastMapProto.sensors.length; i++) {
      let sensorName = UrtheCastMapProto.sensors[i];
      let sensorToggle = new ToggleButton();
      sensorToggle.activate();
      sensorToggle.innerText = sensorName;
      this.sensorSection.appendChild(sensorToggle);
    }

    // Add the layers w/ toggles
    for(let i = 0; i < UrtheCastMapProto.colorLayers.length; i++) {
      let layerName = UrtheCastMapProto.colorLayers[i];
      let layerToggle = new LayerToggle();

      layerToggle.initializeLayer(this.map, layerName);
      this.layerSection.appendChild(layerToggle);

      if(i === 0) {
        layerToggle.activate();
      }
    }

    // Put the map on the page
    this.updateTileUrls();
    this.appendChild(this.layerSection);
    this.appendChild(this.sensorSection);
    this.appendChild(this.latLongSection);
    this.appendChild(this.cloudCoverageSection);
  }

  /*
    Pans the map to the current lat/long input values
  */
  handleLatLongSubmit(event) {
    event.preventDefault();
    var lat = Number(event.currentTarget.querySelector('input[name="latitude"]').value);
    var long = Number(event.currentTarget.querySelector('input[name="longitude"]').value);
    this.map.panTo(new L.LatLng(lat, long));
  }

  /*
    Reset the layer URL's to filter based on the current cloud coverage input value
  */
  handleCloudCoverageSubmit(event) {
    event.preventDefault();
    this.updateTileUrls();
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
  updateTileUrls() {
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

    // Add cloud coverage filter
    var cloudCoverageLTE = parseFloat(this.cloudCoverageSection.querySelector('input[name=cloud-coverage]').value);
    if(typeof cloudCoverageLTE !== 'number' || isNaN(cloudCoverageLTE)) {
      cloudCoverageLTE = 100; // Most permisve value
    }
    filters.cloud_coverage_lte = cloudCoverageLTE;

    // Give each layer a new url based on our known filter situation
    for(let i = 0; i < this.layerSection.children.length; i++) {
      let layerToggle = this.layerSection.children[i];
      let newUrl = LayerToggleProto.createUrl(layerToggle.innerText, filters)
      layerToggle.layer.setUrl(newUrl);
    }
  }

  toggleHidden() {
      this.classList.toggle(MapMenuProto.hiddenClass);
  }

  hide() {
    this.classList.remove(MapMenuProto.hiddenClass);
  }

  show() {
    this.classList.add(MapMenuProto.hiddenClass);
  }
}

var MapMenu = document.registerElement('map-menu', MapMenuProto);

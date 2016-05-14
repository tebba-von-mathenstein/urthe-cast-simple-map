"use strict"
const _CONFIG = {
  hiddenClass: 'hidden',
}

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
        '<input type="number" name="latitude" placeholder="latitude">' +
        '<input type="number" name="longitude" placeholder="longitude">' +
        '<input type="submit" value="Go">' +
      '</form>';
    this.latLongSection.innerHTML = latLongHTML;

    this.latLongSection.addEventListener('submit', this.handleLatLongSubmit.bind(this));

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
  }

  handleLatLongSubmit(event) {
    event.preventDefault();
    var lat = event.currentTarget.querySelector('input[name="latitude"]').value;
    var long = event.currentTarget.querySelector('input[name="longitude"]').value;
    this.map.panTo([lat, long]);
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

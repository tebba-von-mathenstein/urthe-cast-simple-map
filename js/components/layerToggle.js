"use strict"
/*
  A Layer toggle is a toggle button which can turn on and off a color map
  layer.
*/
class LayerToggleProto extends ToggleButtonProto {

  /*
    @param map a reference to a mapbox.js/leaflet.js object that this layer belongs to
    @param colorLayer a valid UrtheCast API color layer value.
  */
  constructor() {
    super()
  }

  initializeLayer(map, colorLayer) {
      this.map = map;
      this.innerText = colorLayer;
      this.layer = L.tileLayer();
  }

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

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

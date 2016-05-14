"use strict"
/*
  ToggleItem is an HTML element that is clickable by default. Clicking toggles the class activeClass
  on and off.
*/
class ToggleButtonProto extends HTMLElement {

    // active class is tied to CSS behavior.
    static get activeClass() {
      return 'active';
    }

    constructor() {
        super();
    }

    /*
      On creation register the click event handler to alter the activeClass
    */
    attachedCallback() {
      this.addEventListener('click', function(event) {
          this.toggleActivated();
      });
    }

    toggleActivated() {
      this.classList.toggle(ToggleButtonProto.activeClass);
    }

    activate() {
      this.classList.add(ToggleButtonProto.activeClass);
    }

    deactivate() {
      this.classList.remove(ToggleButtonProto.activeClass);
    }
}

const ToggleButton = document.registerElement('toggle-item', ToggleButtonProto);

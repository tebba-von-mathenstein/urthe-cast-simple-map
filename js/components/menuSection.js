var ToggleSectionProto = Object.create(HTMLElement.prototype);
var ToggleSection = document.registerElement('toggle-section', {
    prototype: ToggleSectionProto
});

class MenuSectionProto extends HTMLElement {
  constructor() {
    super();
  }
}

const MenuSection = document.registerElement('menu-section', MenuSectionProto);

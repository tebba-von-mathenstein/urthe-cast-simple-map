"use strict"
/*
  A Menu Section is a section of the menu.
*/
class MenuSectionProto extends HTMLElement {
  constructor() {
    super();
  }
}

const MenuSection = document.registerElement('menu-section', MenuSectionProto);

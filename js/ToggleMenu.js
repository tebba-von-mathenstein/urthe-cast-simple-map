"use strict"

// Class Constants, used in CSS
const ACTIVE_CLASS = "active";
const HIDDEN_CLASS = "hidden";
const CANNOT_HIDE_CLASS = "cannot-hide";

// Show/Hide text options
const SHOW_HIDE_TEXT = "Show/Hide Menus";

/* * 
 * Create a DOMElement with the given id and give it a hide show section
 */
var ToggleMenuProto = Object.create(HTMLElement.prototype);
ToggleMenuProto.createdCallback = function() {
    var hideShowSection = new ToggleSection();
    var hideToggle = new Toggle();
    hideToggle.innerText = SHOW_HIDE_TEXT;
    hideShowSection.addEventListener('click', _hideToggles);

    hideShowSection.appendChild(hideToggle);
    this.appendChild(hideShowSection);
}

/**
 * Hide all toggles underneath the hide/show section
 */
function _hideToggles(event) {
    var menus = document.querySelectorAll('toggle-section');

    for(let i = 0; i < menus.length; i++) {
        let subMenu = menus[i];
        
        if(!subMenu.classList.contains(CANNOT_HIDE_CLASS)) {
            ToggleMenuProto._handleSubMenuAnimation(subMenu);
        }
    }
}

ToggleMenuProto._handleSubMenuAnimation = function(subMenu) {
    var toggles = subMenu.querySelectorAll('toggle-item');

    for(let i = 0; i < toggles.length; i++){
        let toggle = toggles[i];
        let yToShift = 0;

        if(subMenu.classList.contains(HIDDEN_CLASS)) {
          // yToShift = toggle.offsetTop + subMenu.offsetTop + toggle.offsetHeight;
          yToShift = toggle.offsetTop;
        }

        toggle.style.transform = `translate(0, -${yToShift}px)`;
        console.log(toggle.style.transform);
    }
}

var ToggleMenu = document.registerElement('toggle-menu', {
    prototype: ToggleMenuProto
});

var ToggleSectionProto = Object.create(HTMLElement.prototype);
var ToggleSection = document.registerElement('toggle-section', {
    prototype: ToggleSectionProto
});


var ToggleProto = Object.create(HTMLElement.prototype);
ToggleProto.createdCallback = function () {
    this.addEventListener('click', function(event) {
        this.classList.toggle(ACTIVE_CLASS);
    });
}

var Toggle = document.registerElement('toggle-item', {
      prototype: ToggleProto
});

"use strict"
// Onload we grab and set default input fields, add a listener for our button, and initialize
window.onload = function(event) {
    var mapElement = new UrtheCastMap();
    document.getElementById('map-wrapper').appendChild(mapElement);
    mapElement.initializeMap(37.78, -122.89, 9); // SF
};

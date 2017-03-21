# Simple UrtheCast Map

This satellite imagery map application is a chance to explore the very cool [UrtheCast API](https://www.urthecast.com/services/) (but you need to get an API Key and Secret to use the app). You can toggle between which satellites you want images from, jump to specific lat/long locations, and play with several of the query parameters such as cloud cover and sun angle provided by the map-tiles API. It's also based on the emerging Web Components API.

# Getting Started

There are no dependencies for this app besides HTML5, CSS3 and ES6 -- simply clone this repo and open `index.hml` in your favorite modern browser. When prompted (literally `window.prompt()`, how embarrassing) enter your UrtheCast API key and secret -- those will be stored into local storage and will be used to make HTTPS requests to UrtheCast. To get an API key head over to [https://developers.urthecast.com](https://developers.urthecast.com)

# Motivations

This application is largely a learning app. I wanted an opportunity to build something a little more complex using Web Components, and I also wanted a chance to play with the UrtheCast API. Please fork/clone/distribute/alter to your hearts content. 

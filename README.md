WeatherWise - Weather Forecast Web Application

Project Overview

WeatherWise is a web-based waether application that allows users to search for a location and view its current weather conditions and five-day forcast. 
The application is designed to make weather information easy to access and understand. Users can search for a city, search the correct location from the search results, view current weather details, filter forecast results, and sort the forcast. 

Features

- Search for cities and locations.
- Display current weather conditions
- Show temperature, weather description, feels-like temperature, and wind speed. 
- Display a five-day weather forecast. 
- Filter forecast result to show drier days
- Sort forecast result by temperature.
- Display helpful messages when search fail or information cannot be retrieved
- Provide a responsive interface for different screen sizes.

APIs Used
WeatherWise uses the Open-Meteo APIs:
1. Open-Meteo Geocoding API - searches for location and retrieves their geographical coordinates. Documentation: https://open-meteo.com/en/docs/geocoding-api

2. Open-Meteo Forecast API - retrieves current weather conditions and daily forecast information using the selected location's coordinates.

## Deployment
The application is intended to be deployed on the ALU Web01 and Web02 servers, with Lb01 configured as the load balancer. 

The load balancer will distribute incoming requests between the two web servers.

** Live Application URL:**
hhtps://github.com/fav058/WeatherWise 

## Testing
The application should be tested by: 

- Searching for different cities and locations.
- Selecting a location from the search result.
- Checking that current weather information is displayed.
- Checking that the five-day forecast appears. 
- Testing the forecast filter and sorting options.
- Testing how the application handles invalid searches or API errors.
- Accessing the deployed application through the load balancer. 
- Checking that requests can be served by both Web01 and Web02. 

## Challenges and Solutions

During development, attention was given to connecting the application to external APIs, handling location searches, retrieving weather information, and displaying the results clearly. 

Testing and debugging were used to identify and correct issues with API requests, element selectors, and the display of weather information. 

## Credits

- Open-Meteo for providing the geocoding and weather forcast APIs.
- African Leadership Uniersity for the project learning experience.

Below are the links for lb01, web01, and web02 respectively
http://13.40.166.189/weatherwise/
http://35.178.97.245/weatherwise/
http://18.171.156.247/weatherwise/

Github Repository
https://github.com/Fav058/WeatherWise.git

Demo Video
https://youtu.be/besOQDzI7VY

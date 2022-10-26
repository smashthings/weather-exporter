#!/usr/bin/env node

module.paths.push('/usr/local/lib/node_modules');

////////////////////////
// Functions

function EnvVar(desiredVariable){
  if (!process.env[desiredVariable]){
    console.log(`Desired Variable ${desiredVariable} not found in environment variables!`);
    process.exit(1);
  }
  return process.env[desiredVariable];
}

function getWeather(){
  console.log(`${Date()} - Getting Weather`);
  request.get('http://api.openweathermap.org/data/2.5/weather?APPID='+weatherKey+'&q=' + location, function(weatherErr, weatherRes, weatherBody){
    if (weatherErr){
      console.log(`Could not update weather values with error - ${weatherErr}`);
      return
    } else {
      let weatherData = JSON.parse(weatherBody);
      minTemperature = (weatherData.main.temp_min - 273).toFixed(2);
      maxTemperature = (weatherData.main.temp_max - 273).toFixed(2);
      humidityPercentage = weatherData.main.humidity;
      averageTemperature = (((weatherData.main.temp_max - 273) + (weatherData.main.temp_min - 273)) / 2).toFixed(2);

      let now = new Date();
      timeTillSunrise = ((new Date(weatherData.sys.sunrise*1000) - now) / 1000) /60;
      timeTillSunset = ((new Date(weatherData.sys.sunset*1000) - now) /1000) /60;
    };
  });
};

function generateMetrics(req, res){
  console.log(`${Date()} - Metrics response`);
  let 
    allVals = {
      "minTemperature": minTemperature,
      "averageTemperature": averageTemperature,
      "maxTemperature": maxTemperature,
      "humidityPercentage": humidityPercentage,
      "timeTillSunrise": timeTillSunrise,
      "timeTillSunset": timeTillSunset
    },
    resultingContent = [];
  
  for (let key in allVals){
    let
      name = key,
      description = descriptionMap[key] || "No description provided",
      value = allVals[key];

    resultingContent.push(`# HELP ${name} ${description}`, `# TYPE ${name} gauge`, `${name}{interval="1m",from="WeatherExporter"} ${value}`);
  };

  res.send(resultingContent.join("\n"));

}

////////////////////////
// Variables

const
    weatherKey = EnvVar("OPENWEATHERMAP_API_KEY"),
    location = EnvVar('LOCATION'),
    port = process.env.PORT || 80,
    request = require('request'),
    express = require('express');

let
  app = express(),
  minTemperature = 0,
  averageTemperature = 0,
  maxTemperature = 0,
  humidityPercentage = 0,
  timeTillSunrise = 0,
  timeTillSunset = 0,
  descriptionMap = {
    "minTemperature": "Minimum temperature for the day in degrees celsius",
    "averageTemperature": "The average temperature between minimum and maximum temperatures",
    "maxTemperature": "Maximum temperature for the day in degrees celsius",
    "humidityPercentage": "Percentage humidity for the air today",
    "timeTillSunrise": "Minutes left until sunrise",
    "timeTillSunset": "Minutes left until sunset"
  };

setInterval(getWeather, 300000);

console.log(`${Date()} - Fetching initial weather values...`);
getWeather();

console.log(`${Date()} - Initialising server...`);
app
  .get("/metrics", generateMetrics)
  .listen(port);


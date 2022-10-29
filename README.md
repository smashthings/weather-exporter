# weatherexporter

This is a dead simple nodejs server that translates responses from the OpenWeather API into prometheus metrics. It uses express and requests and generates the scraping page out of plain text with no prometheus libraries or dependencies

## Config

You need to provide:

- A location under environment variable LOCATION, eg. London,UK
- An OpenWeather API Key under environment variable OPENWEATHERMAP_API_KEY
- Optionally a port under environment varible PORT, defaults to 80

// Global variables and constants
let currentSearch = "Madrid"; // Saves the last city searched
let system = "metric"; // Can change to "imperial"
let tempUnits = "C"; // Must change to "F" for "imperial" system
let speedUnits = "meter/sec"; //Must change to "miles/hour" for "imperial" system
let weatherIn; // Where the data from API will be stored
const searchButton = document.getElementById('searchButton'); // For Event Listener associated to it
let inputBox = document.getElementById('inputBox'); // We need its value to pass it to the API
const dataCont = document.getElementById('data-container'); // Where we need to append weather data fields
const unitsCheck = document.getElementById('units'); // For Event Listener associated to it
let locationsArray = ["London","Berlin","New York","Tokyo"]; // An array that saves the last searches and displays in 'search-bottom' <div> in DOM

// This function transform wind direction in degrees unit to coordinates based in 32 points rose compass
function degreesToCoordinates(degrees) {
    if (degrees >= 348.75 || degrees < 11.25) {
        return "N";
    } else if (degrees >= 11.25 && degrees < 33.75) {
        return "NNE";
    } else if (degrees >= 33.75 && degrees < 56.25) {
        return "NE";
    } else if (degrees >= 56.25 && degrees < 78.75) {
        return "ENE";
    } else if (degrees >= 78.75 && degrees < 101.25) {
        return "E";
    } else if (degrees >= 101.25 && degrees < 123.75) {
        return "ESE";
    } else if (degrees >= 123.75 && degrees < 146.25) {
        return "SE";
    } else if (degrees >= 146.25 && degrees < 168.75) {
        return "SSE";
    } else if (degrees >= 168.75 && degrees < 191.25) {
        return "S";
    } else if (degrees >= 191.25 && degrees < 213.75) {
        return "SSW";
    } else if (degrees >= 213.75 && degrees < 236.25) {
        return "SW";
    } else if (degrees >= 236.25 && degrees < 258.75) {
        return "WSW";
    } else if (degrees >= 258.75 && degrees < 281.25) {
        return "W";
    } else if (degrees >= 281.25 && degrees < 303.75) {
        return "WNW";
    } else if (degrees >= 303.75 && degrees < 326.25) {
        return "NW";
    } else if (degrees >= 326.25 && degrees < 348.75) {
        return "NNW";
    } else {
        return "Invalid Value";
    }
}

// This function translate Unix time into HH:MM format
function unixTimeToHHMM(time) {
    // input unit is mili seconds and we need seconds instead
    var date = new Date(time * 1000);
    
    // Hours part from the timestamp
    if (date.getHours().toString().length == 1) {
        var hours = "0" + date.getHours();
    } else {
        var hours = date.getHours();
    }
    
    // Minutes part from the timestamp
    if (date.getMinutes().toString().length == 1) {
        var minutes = "0" + date.getMinutes();
    } else {
        var minutes = date.getMinutes();
    }

    // Will display time in 10:30 format
    var formattedTime = hours + ':' + minutes;

    return formattedTime;
}

function formatDate(date) {
    const year = date.getFullYear();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekDay = days[date.getDay()];

    return `${weekDay}, ${day} ${month} ${year}`;
}

// This function toggle between units systems
function toggleUnitsSystem() {
    if (system == "metric") {
        system = "imperial";
        tempUnits = "F";
        speedUnits = "miles/hour";
    } else {
        system = "metric";
        tempUnits = "C";
        speedUnits = "meter/sec";
    }
}

// Weather Type Class
class WeatherType {
    constructor(title,desc,icon) {
        this.title = title;
        this.desc = desc;
        this.icon = `http://openweathermap.org/img/wn/${icon}@2x.png`;
    }

    getWeatherName() {
        return this.title;
    }

    getWeatherDescription() {
        return this.desc;
    }

    getWeatherIcon() {
        return this.icon;
    }
}

// Weather Data Class
class WeatherData {
    constructor(location,country,timezone,weather,temp,feels,pressure,humidity,windSpeed,windDeg,rain1,snow1,clouds,utcTime,sunrise,sunset) {
        this.location = location;
        this.country = country;
        this.timezone = timezone / 3600; // From seconds to hours
        this.weather = weather; // Is an array of WeatherType Objects!!! 
        this.temp = temp;
        this.feels = feels;
        this.pressure = pressure;
        this.humidity = humidity;
        this.windSpeed = windSpeed;
        this.windDeg = degreesToCoordinates(windDeg); // Call to custom function
        this.rain1 = rain1;
        this.snow1 = snow1;
        this.clouds = clouds;
        this.utcTime = unixTimeToHHMM(utcTime-3600); // I don't know why but UTC time from API is 1 hour ahead
        this.sunrise = unixTimeToHHMM(sunrise);
        this.sunset = unixTimeToHHMM(sunset);
        this.localTime = unixTimeToHHMM(utcTime-3600+timezone); // Same as in utcTime
    }

    getLocation() {
        return this.location;
    }

    getCountry() {
        return this.country;
    }

    getTimezone() {
        return this.timezone;
    }

    getNumberOfWeatherTypes() {
        return this.weather.length;
    }

    getWeatherTypes() {
        return this.weather;
    }

    getTemp() {
        return this.temp;
    }

    getFeels() {
        return this.feels;
    }

    getPressure() {
        return this.pressure;
    }

    getHumidity() {
        return this.humidity;
    }

    getWindSpeed() {
        return this.windSpeed;
    }

    getWindDeg() {
        return this.windDeg;
    }

    getRain() {
        return this.rain1;
    }

    getSnow() {
        return this.snow1;
    }

    getClouds() {
        return this.clouds;
    }

    getUtcTime() {
        return this.utcTime;
    }

    getSunriseTime() {
        return this.sunrise;
    }

    getSunsetTime() {
        return this.sunset;
    }

    getLocalTime() {
        return this.localTime;
    }
}

async function getDataFromAPI(location) {
    try {
        // Com with the server
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&APPID=a9d46371cffec0745195f9b5d7ae205b&units=${system}`, {
            mode: 'cors'
        });
        // Passing from json to object
        const dataObject = response.json();

        return dataObject;
    } catch (error) {
        // If some error happens, print it
        console.log(error);
    }
}

// Function that parses
function parseRawWeatherType(type) {
    return new WeatherType(type.main,type.description,type.icon);
}

// Function that takes an Object from an OpenWeather fetch response and converts it into an Object of class Weather
function parseRawWeatherData(data) {
    let weatherTypeArray = Array();

    for (let i = 0; i < data.weather.length; i++) {
        const element = data.weather[i];
        weatherTypeArray.push(parseRawWeatherType(element));
    }

    let rain;
    if (data.rain) {
        rain = data.rain['1h'];
    } else {
        rain = 0;
    }

    let snow;
    if (data.snow) {
        snow = data.snow['1h'];
    } else {
        snow = 0;
    }
    
    weatherIn = new WeatherData(data.name,data.sys.country,data.timezone,weatherTypeArray,data.main.temp,data.main.feels_like,data.main.pressure,data.main.humidity,data.wind.speed,data.wind.deg,rain,snow,data.clouds.all,data.dt,data.sys.sunrise,data.sys.sunset);
}

// Create an element with an optional CSS id
function createElementWithId(tag, id) {
    const element = document.createElement(tag);
    if (id) {
      element.setAttribute("id", id);
    }
  
    return element;
}
  
// Create an element with an optional CSS class
function createElementWithClass(tag, className) {
    const element = document.createElement(tag);
    if (className) {
        element.classList.add(className);
    }

    return element;
}

// Function that create HTML elements in DOM in order to display the different weathers in a WeatherData Object
function displayWeatherTypes(weatherDataObj) {
    const weathersCont = createElementWithId('div','weathers-cont');
    dataCont.appendChild(weathersCont);
    const weatherTypes = weatherDataObj.getWeatherTypes();
    for (let i = 0; i < weatherDataObj.getNumberOfWeatherTypes(); i++) {
        const oneWeatherCont = createElementWithId('div','one-weather-cont');

        // Switch - Case that build tha icon structure based on the weather name
        switch (weatherTypes[i].getWeatherName()) {
            case "Thunderstorm":
                const iconThunderstorm = createElementWithClass('div','icon');
                iconThunderstorm.classList.add('thunder-storm');
                const cloud1 = createElementWithClass('div','cloud');
                const lightning = createElementWithClass('div','lightning');
                const bolt1 = createElementWithClass('div','bolt');
                const bolt2 = createElementWithClass('div','bolt');
                lightning.appendChild(bolt1);
                lightning.appendChild(bolt2);
                iconThunderstorm.appendChild(cloud1);
                iconThunderstorm.appendChild(lightning);
                oneWeatherCont.appendChild(iconThunderstorm);
                break;
            case "Drizzle":
                const iconSunshower = createElementWithClass('div','icon');
                iconSunshower.classList.add('sun-shower');
                const cloud5 = createElementWithClass('div','cloud');
                const rays1 = createElementWithClass('div','rays');
                const rain1 = createElementWithClass('div','rain');
                const sun1 = createElementWithClass('div','sun');
                sun1.appendChild(rays1);
                iconSunshower.appendChild(cloud5);
                iconSunshower.appendChild(sun1);
                iconSunshower.appendChild(rain1);
                oneWeatherCont.appendChild(iconSunshower);
                break;
            case "Rain":
                const iconRainy = createElementWithClass('div','icon');
                iconRainy.classList.add('rainy');
                const cloud2 = createElementWithClass('div','cloud');
                const rain = createElementWithClass('div','rain');
                iconRainy.appendChild(cloud2);
                iconRainy.appendChild(rain);
                oneWeatherCont.appendChild(iconRainy);
                break;
            case "Snow":
                const iconFlurries = createElementWithClass('div','icon');
                iconFlurries.classList.add('flurries');
                const cloud6 = createElementWithClass('div','cloud');
                const snow = createElementWithClass('div','snow');
                const flake1 = createElementWithClass('div','flake');
                const flake2 = createElementWithClass('div','flake');
                snow.appendChild(flake1);
                snow.appendChild(flake2);
                iconFlurries.appendChild(cloud6);
                iconFlurries.appendChild(snow);
                oneWeatherCont.appendChild(iconFlurries);
                break;
            case "Clear":
                const iconSunny = createElementWithClass('div','icon');
                iconSunny.classList.add('sunny');
                const sun = createElementWithClass('div','sun');
                const rays = createElementWithClass('div','rays');
                sun.appendChild(rays);
                iconSunny.appendChild(sun);
                oneWeatherCont.appendChild(iconSunny);
                break;
            case "Clouds":
                const iconCloudy = createElementWithClass('div','icon');
                iconCloudy.classList.add('cloudy');
                const cloud3 = createElementWithClass('div','cloud');
                const cloud4 = createElementWithClass('div','cloud');
                iconCloudy.appendChild(cloud3);
                iconCloudy.appendChild(cloud4);
                oneWeatherCont.appendChild(iconCloudy);
                break;
            case "Mist":
            case "Smoke":
            case "Haze":
            case "Dust":
            case "Fog":
            case "Sand":
            case "Ash":
            case "Squall":
                const iconFoggy = createElementWithClass('div','icon');
                iconFoggy.classList.add('foggy');
                const cloud7 = createElementWithClass('div','cloud');
                const fog = createElementWithClass('div','fog');
                iconFoggy.appendChild(cloud7);
                iconFoggy.appendChild(fog);
                oneWeatherCont.appendChild(iconFoggy);
                break;
            default:
                break;
        }

        weathersCont.appendChild(oneWeatherCont);
    }
}

// Function that displays cities in 'locationsArray' inside 'search-bottom' DOM place
function displayOtherLocations() {
    
}

// Function that takes a WeatherData object and displays its data to the user
function displayData(weatherDataObj) {
    // Setting background
    document.body.style.backgroundImage = `url('./Backgrounds/${weatherDataObj.getWeatherTypes()[0].getWeatherName()}-bg.jpg')`;
    
    // Displaying temp
    const tempCont = createElementWithId('div','temp-cont');
    const temp = document.createElement('h1');
    temp.textContent = `${Math.round(weatherDataObj.getTemp())}º${tempUnits}`;
    tempCont.appendChild(temp);
    dataCont.appendChild(tempCont);

    // Displaying location, date, time info
    const locInfoCont = createElementWithId('div','loc-info-cont');
    const cityCont = createElementWithId('div','city-cont');
    const dateCont = createElementWithId('div','date-cont');
    const timeCont = createElementWithId('div','time-cont');
    locInfoCont.appendChild(cityCont);
    locInfoCont.appendChild(dateCont);
    locInfoCont.appendChild(timeCont);
    dataCont.appendChild(locInfoCont);

    const city = document.createElement('h2');
    city.textContent = weatherDataObj.getLocation();
    cityCont.appendChild(city);

    const today = new Date();
    const date = document.createElement('p');
    date.textContent =  formatDate(today);
    dateCont.appendChild(date);

    const time = document.createElement('p');
    // We need to change symbol depends on + or - sign of the input
    if (weatherDataObj.timezone > 0) {
        time.textContent = `${weatherDataObj.getLocalTime()} (UTC + ${weatherDataObj.timezone})`;
    } else if (weatherDataObj.timezone < 0) {
        time.textContent = `${weatherDataObj.getLocalTime()} (UTC ${weatherDataObj.timezone})`;
    } else {
        time.textContent = `${weatherDataObj.getLocalTime()} (= UTC Time)`;
    }
    timeCont.appendChild(time);

    // Displaying weather types
    
    // Just call the function declared above
    displayWeatherTypes(weatherDataObj);

    // Print other data
    /*
    const feels = createElementWithClass('p','data');
    feels.textContent = `Feels like: ${weatherDataObj.getFeels()}º ${tempUnits}`;
    const pres = createElementWithClass('p','data');
    pres.textContent = `Pressure: ${weatherDataObj.getPressure()} hPa`;
    const hum = createElementWithClass('p','data');
    hum.textContent = `Humidity: ${weatherDataObj.getHumidity()} %`;
    const speed = createElementWithClass('p','data');
    speed.textContent = `Wind speed: ${weatherDataObj.getWindSpeed()} ${speedUnits}`;
    const dir = createElementWithClass('p','data');
    dir.textContent = `Wind direction: ${weatherDataObj.getWindDeg()}`;
    const clouds = createElementWithClass('p','data');
    clouds.textContent = `Clouds: ${weatherDataObj.getClouds()} %`;
    const sunrise = createElementWithClass('p','data');
    sunrise.textContent = `Sunrise Time: ${weatherDataObj.getSunriseTime()}`;
    const sunset = createElementWithClass('p','data');
    sunset.textContent = `Sunset Time: ${weatherDataObj.getSunsetTime()}`;

    dataCont.appendChild(feels);
    dataCont.appendChild(pres);
    dataCont.appendChild(hum);
    dataCont.appendChild(speed);
    dataCont.appendChild(dir);
    dataCont.appendChild(clouds);
    dataCont.appendChild(sunrise);
    dataCont.appendChild(sunset);*/

    // Rain and snow measures only displayed if > 0
    /*
    if (weatherDataObj.getRain() > 0) {
        const rain = createElementWithClass('p','data');
        rain.textContent = `Precipitation volume for last hour: ${weatherDataObj.getRain()} mm`;
        dataCont.appendChild(rain);
    }

    if (weatherDataObj.getSnow() > 0) {
        const snow = createElementWithClass('p','data');
        snow.textContent = `Snow volume for last hour: ${weatherDataObj.getSnow()} mm`;
        dataCont.appendChild(snow);
    }*/
}

function cleanOldData() {
    while (dataCont.childNodes.length >= 1) {
        dataCont.removeChild(dataCont.lastChild);
    }
}

// Function that exec the API call, create the obj, clean screen and displays the data
function asyncWeatherApiCall(search) {
    getDataFromAPI(search)
        .then((data) => {
            parseRawWeatherData(data);
            // Clean previous data
            cleanOldData();
            // Display new data
            displayData(weatherIn);
        })
        .catch((error) => {
            // Clean previous data
            cleanOldData();
            const errorMsg = document.createElement('h2');
            errorMsg.textContent = "Server error: Please try to search again :-(";
            dataCont.appendChild(errorMsg);
        });
}

// Test - default call to our function
asyncWeatherApiCall(currentSearch);

// Event Listener associated to search button
searchButton.addEventListener("click", () => {
    currentSearch = inputBox.value;
    asyncWeatherApiCall(currentSearch);
});

// Event Listener associated to units checkbox
unitsCheck.addEventListener("change", () => {
    toggleUnitsSystem();
    asyncWeatherApiCall(currentSearch);
});
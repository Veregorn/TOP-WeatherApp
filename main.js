// Global variables and constants
let currentSearch = "Madrid"; // Saves the last city searched
let system = "metric"; // Can change to "imperial"
let tempUnits = "C"; // Must change to "F" for "imperial" system
let speedUnits = "meter/sec"; //Must change to "miles/hour" for "imperial" system
let weatherIn; // Where the data from API will be stored
const searchButton = document.getElementById('search'); // For Event Listener associated to it
let inputBox = document.getElementById('inputBox'); // We need its value to pass it to the API
const dataCont = document.getElementById('data-container'); // Where we need to append weather data fields
const unitsCheck = document.getElementById('units'); // For Event Listener associated to it

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
        this.utcTime = unixTimeToHHMM(utcTime-3600); // I don't now why but UTC time from API is 1 hour ahead
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
    const timeDateCont = createElementWithId('div','time-date-cont');
    locInfoCont.appendChild(cityCont);
    locInfoCont.appendChild(timeDateCont);
    dataCont.appendChild(locInfoCont);

    const city = document.createElement('h2');
    city.textContent = weatherDataObj.getLocation();
    cityCont.appendChild(city);

    const dateTime = document.createElement('p');
    dateTime.textContent = `${weatherDataObj.getLocalTime()} (UTC + ${weatherDataObj.timezone}) - `;
    timeDateCont.appendChild(dateTime);

    // Print weather types
    /*
    const weatherTypes = weatherDataObj.getWeatherTypes();
    for (let i = 0; i < weatherDataObj.getNumberOfWeatherTypes(); i++) {
        const img =  new Image();
        img.src = weatherTypes[i].getWeatherIcon();
        const name = createElementWithClass('p','data');
        const desc = createElementWithClass('p','data');
        name.textContent = weatherTypes[i].getWeatherName();
        desc.textContent = weatherTypes[i].getWeatherDescription();

        dataCont.appendChild(img);
        dataCont.appendChild(name);
        dataCont.appendChild(desc);
    }*/

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
    while (dataCont.childNodes.length > 1) {
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
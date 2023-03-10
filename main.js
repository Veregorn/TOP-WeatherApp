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
const timeOffset = new Date().getTimezoneOffset() * 60; // To calculate local time, sunset and sunrise properties (* 60 because seconds needed and result is in minutes)

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

// Function that delete the first element of the locations array
function removeFirstCityInLocationsArray() {
    for (let i = 0; i < locationsArray.length - 1; i++) {
        locationsArray[i] = locationsArray[i + 1];
    }
    locationsArray.pop();
}

// Function that search for the input string in the locations array (predefined cities). If is a new city, place it at the end of the array and delete the first element in it
function updateLocationsArray(location) {
    if (!locationsArray.includes(location) && location != "Madrid") {
        removeFirstCityInLocationsArray();
        locationsArray.push(location);
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
        this.utcTime = unixTimeToHHMM(utcTime + timeOffset);
        this.localTime = unixTimeToHHMM(utcTime + timeOffset + timezone);
        this.sunrise = unixTimeToHHMM(sunrise + timeOffset + timezone);
        this.sunset = unixTimeToHHMM(sunset + timeOffset + timezone);
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
    const container = document.getElementById('predefined-searches');
    for (let i = 0; i < locationsArray.length; i++) {
        const element = locationsArray[i];
        const link = createElementWithClass('span','city-link');
        link.textContent = element;
        link.addEventListener('click', () => {
            currentSearch = element;
            asyncWeatherApiCall(currentSearch);
        });
        container.appendChild(link);
    }
}

// Function that takes a background name and gets an url to the source
function fromBgImgToSource(bgName) {
    switch (bgName) {
        case "Ash-bg-d":
        case "Ash-bg-n":
            return "https://unsplash.com/es/fotos/qexZLgMcbPc";
            break;
        case "Clear-bg-d":
            return "https://pxhere.com/en/photo/707105";
            break;
        case "Clear-bg-n":
            return "https://unsplash.com/es/fotos/TSw0ua31yeQ?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Clouds-bg-d":
            return "https://unsplash.com/es/fotos/pbxwxwfI0B4?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Clouds-bg-n":
            return "https://unsplash.com/es/fotos/8Gl7Ew-q6D8?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Drizzle-bg-d":
            return "https://unsplash.com/es/fotos/qPvBmSvmohs?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Drizzle-bg-n":
            return "https://unsplash.com/es/fotos/bbw8FcIaKJs?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Dust-bg-d":
        case "Dust-bg-n":
            return "https://unsplash.com/es/fotos/DIIhn4HSXKY?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Fog-bg-d":
        case "Mist-bg-d":
            return "https://pxhere.com/en/photo/985718?utm_content=shareClip&utm_medium=referral&utm_source=pxhere";
            break;
        case "Fog-bg-n":
        case "Mist-bg-n":
            return "https://unsplash.com/es/fotos/rzCi3mD-6ho?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Haze-bg-d":
            return "https://unsplash.com/es/fotos/U99MuqdVTx4?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Haze-bg-n":
            return "https://unsplash.com/es/fotos/9kbsq91NFwg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Rain-bg-d":
        case "Rain-bg-n":
        case "Squall-bg-n":
            return "https://unsplash.com/es/fotos/tT_SrSMhhgE?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Sand-bg-d":
            return "https://unsplash.com/es/fotos/x6v-fRhAJG8?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Sand-bg-n":
            return "https://unsplash.com/es/fotos/yNGQ830uFB4?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Smoke-bg-d":
            return "https://unsplash.com/es/fotos/hZe5eOlvqDk?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Smoke-bg-n":
            return "https://unsplash.com/es/fotos/I1MGVZ42wnU?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Snow-bg-d":
            return "https://unsplash.com/es/fotos/o7mSBvC57qk?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Snow-bg-n":
            return "https://unsplash.com/es/fotos/3N5ccOE3wGg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Squall-bg-d":
            return "https://unsplash.com/es/@noaa";
            break;
        case "Thunderstorm-bg-d":
            return "https://unsplash.com/es/fotos/WHLI73X8tE0?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Thunderstorm-bg-n":
            return "https://unsplash.com/es/fotos/USCBhx-EqkU?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Tornado-bg-d":
            return "https://unsplash.com/es/fotos/Zus94oboIsM?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText";
            break;
        case "Tornado-bg-n":
            return "https://twitter.com/xel_artz/status/1380812058975866882";
            break;
        default:
            break;
    }
}

// Function that takes a WeatherData object and displays its data to the user
function displayData(weatherDataObj) {
    // Setting background
    let fileName = "";
    if ((weatherDataObj.getLocalTime() >= weatherDataObj.getSunriseTime()) && (weatherDataObj.getLocalTime() < weatherDataObj.getSunsetTime())) {
        fileName = weatherDataObj.getWeatherTypes()[0].getWeatherName() + "-bg-d";
        document.body.style.backgroundImage = `url('./Backgrounds/${fileName}.jpg')`;
    } else {
        fileName = weatherDataObj.getWeatherTypes()[0].getWeatherName() + "-bg-n";
        document.body.style.backgroundImage = `url('./Backgrounds/${fileName}.jpg')`;
    }
    
    // Displaying temp
    const tempCont = createElementWithId('div','temp-cont');
    const temp = document.createElement('h1');
    temp.textContent = `${Math.round(weatherDataObj.getTemp())}?? ${tempUnits}`;
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

    // Displaying other cities
    displayOtherLocations();

    // Displaying weather details in 'Weather Details' Section
    const dataDetails = document.getElementById('measures');

    const feels = createElementWithClass('p','data');
    feels.textContent = `${Math.round(weatherDataObj.getFeels())}?? ${tempUnits}`;
    const pres = createElementWithClass('p','data');
    pres.textContent = `${weatherDataObj.getPressure()} hPa`;
    const hum = createElementWithClass('p','data');
    hum.textContent = `${weatherDataObj.getHumidity()} %`;
    const speed = createElementWithClass('p','data');
    speed.textContent = `${Math.round(weatherDataObj.getWindSpeed())} ${speedUnits}`;
    const dir = createElementWithClass('p','data');
    dir.textContent = `${weatherDataObj.getWindDeg()}`;
    const clouds = createElementWithClass('p','data');
    clouds.textContent = `${weatherDataObj.getClouds()} %`;
    const sunrise = createElementWithClass('p','data');
    sunrise.textContent = `${weatherDataObj.getSunriseTime()}`;
    const sunset = createElementWithClass('p','data');
    sunset.textContent = `${weatherDataObj.getSunsetTime()}`;

    dataDetails.appendChild(feels);
    dataDetails.appendChild(pres);
    dataDetails.appendChild(hum);
    dataDetails.appendChild(speed);
    dataDetails.appendChild(dir);
    dataDetails.appendChild(clouds);
    dataDetails.appendChild(sunrise);
    dataDetails.appendChild(sunset);

    // Displaying background credits
    const bgCredits = document.getElementById('bg-photo-owner');
    bgCredits.href = fromBgImgToSource(fileName);
}

function cleanOldData() {
    // Clean temp, location and main weather data (icon)
    while (dataCont.childNodes.length >= 1) {
        dataCont.removeChild(dataCont.lastChild);
    }

    // Clean predefined cities searches
    const otherCities = document.getElementById('predefined-searches');

    while (otherCities.childNodes.length >= 1) {
        otherCities.removeChild(otherCities.lastChild);
    }

    // Clean secondary weather data on right column
    const measures = document.getElementById('measures');

    while (measures.childNodes.length >= 1) {
        measures.removeChild(measures.lastChild);
    }
}

// Function that exec the API call, create the obj, clean screen and displays the data
function asyncWeatherApiCall(search) {
    getDataFromAPI(search)
        .then((data) => {
            parseRawWeatherData(data);
            // Clean previous data
            cleanOldData();
            // Update Locations Array
            updateLocationsArray(search);
            // Display new data
            displayData(weatherIn);
        })
        .catch((error) => {
            // Clean previous data
            cleanOldData();
            const errorMsg = document.createElement('h2');
            errorMsg.textContent = "Server error: Please try to search again :-(";
            dataCont.appendChild(errorMsg);
            // Displaying other cities
            displayOtherLocations();
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
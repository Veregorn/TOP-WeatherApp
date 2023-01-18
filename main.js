// Global variables and constants
let units = "metric"; // Change it to "imperial" for Fahrenheit grades
let weatherIn;

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

// This function translate Unix time into HH:MM:SS format
function unixTimeToHHMMSS(time) {
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
    
    // Seconds part from the timestamp
    if (date.getSeconds().toString().length == 1) {
        var seconds = "0" + date.getSeconds();
    } else {
        var seconds = date.getSeconds();
    }

    // Will display time in 10:30:23 format
    var formattedTime = hours + ':' + minutes + ':' + seconds;

    return formattedTime;
}

// Weather Type Class
class WeatherType {
    constructor(title,desc,icon) {
        this.title = title;
        this.desc = desc;
        this.icon = `http://openweathermap.org/img/wn/${icon}@2x.png`;
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
        this.utcTime = unixTimeToHHMMSS(utcTime);
        this.sunrise = unixTimeToHHMMSS(sunrise);
        this.sunset = unixTimeToHHMMSS(sunset);
    }
}

async function getDataFromAPI(location) {
    try {
        // Com with the server
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&APPID=a9d46371cffec0745195f9b5d7ae205b&units=${units}`, {
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
    console.log(weatherIn);
}

// Test - default call to our function
getDataFromAPI("Logatec")
    .then((data) => parseRawWeatherData(data));
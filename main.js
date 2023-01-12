async function getWeatherData(location) {
    try {
        // Com with the server
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&APPID=a9d46371cffec0745195f9b5d7ae205b`, {
            mode: 'cors'
        });
        // Passing from object to json format
        const json = response.json();
        // Printing info to console
        console.log(json);
    } catch (error) {
        // If some error happens, print it
        console.log(error);
    }
}

// Test - default call to our function
getWeatherData("Madrid");
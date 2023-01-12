async function getWeatherData(location) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&APPID=a9d46371cffec0745195f9b5d7ae205b`, {
            mode: 'cors'
        });
        const json = response.json();
        console.log(json);
    } catch (error) {
        console.log(error);
    }
}

getWeatherData("Madrid");
// Prompt the user for permission to use their GPS location
// Check if Geolocation is supported
function getUserLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
                // Call the callback function with the user's coordinates
                callback(latitude, longitude);
            },
            function(error) {
                console.error('Error getting location:', error);
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

// Calculate the distance between two coordinates using Haversine formula
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

// Convert kilometers to miles
function kilometersToMiles(km) {
    return km * 0.621371;
}

// Calculate the time it would take for sound to travel from the rocket to the user
function calculateSoundTravelTime(distance_km, air_temp_c, wind_speed_m_s) {
    // Speed of sound in air (m/s) as a function of temperature (C)
    const speed_of_sound = 331.3 + 0.606 * air_temp_c;
    
    // Adjust speed of sound for wind speed
    const effective_speed_of_sound = speed_of_sound + wind_speed_m_s;
    
    // Convert distance from km to meters
    const distance_m = distance_km * 1000;
    
    // Calculate time in seconds
    const time_seconds = distance_m / effective_speed_of_sound;
    
    return time_seconds;
}


// Fetch current weather data for the user's location
function fetchUserWeatherData(latitude, longitude) {
    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    $.ajax({
        url: weatherApiUrl,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            const temperatureC = data.current_weather.temperature;
            const windSpeedKph = data.current_weather.windspeed;
            const windSpeedMph = (windSpeedKph * 0.621371).toFixed(2); // Convert to mph
            const windDirection = data.current_weather.winddirection;
            const precipitation = data.current_weather.precipitation !== undefined ? data.current_weather.precipitation : 'N/A';
            const weatherCode = data.current_weather.weathercode;
            displayUserWeatherData(temperatureC, windSpeedKph, windSpeedMph, windDirection, precipitation, weatherCode);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching weather data:', textStatus, errorThrown);
        }
    });
}

// Display user weather data
function displayUserWeatherData(temperatureC, windSpeedKph, windSpeedMph, windDirection, precipitation, weatherCode) {
    $('#user-weather').html(`
	<h4>Current Weather at Your Location:</h4>
	<p>Temperature: ${temperatureC}°C</p>
	<p>Wind Speed: ${windSpeedKph} km/h (${windSpeedMph} mph)</p>
	<p>Wind Direction: ${windDirection}°</p>
	<p>Precipitation: ${precipitation}</p>
	<p>Weather Code: ${weatherCode}</p>
    `);
}

// Fetch sunrise and sunset times for the user's location
function fetchSunriseSunsetTimes(latitude, longitude) {
    const apiUrl = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`;
    $.ajax({
        url: apiUrl,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            const sunrise = new Date(data.results.sunrise).toLocaleTimeString();
            const sunset = new Date(data.results.sunset).toLocaleTimeString();
            displaySunriseSunsetTimes(sunrise, sunset);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching sunrise/sunset times:', textStatus, errorThrown);
        }
    });
}

// Display sunrise and sunset times
function displaySunriseSunsetTimes(sunrise, sunset) {
    $('#sunrise-sunset').html(`
        <h4>Sunrise and Sunset Times:</h4>
        <p>Sunrise: ${sunrise}</p>
        <p>Sunset: ${sunset}</p>
    `);
}

// Display user data in the same style as launch data
function displayUserData(userLatitude, userLongitude) {
    const userLocation = {
        latitude: userLatitude,
        longitude: userLongitude
    };
    const distance_km = haversineDistance(userLocation.latitude, userLocation.longitude, launchPadCoordinates.latitude, launchPadCoordinates.longitude);
    const distance_miles = kilometersToMiles(distance_km);
    
    // Example values for air temperature and wind speed
    const air_temp_c = 20; // Replace with actual air temperature
    const wind_speed_m_s = 5; // Replace with actual wind speed
    
    const soundTravelTime = calculateSoundTravelTime(distance_km, air_temp_c, wind_speed_m_s);

    $('#user-data').html(`
        <div>
            <h3>User Location</h3>
            <p>Latitude: ${userLocation.latitude}</p>
            <p>Longitude: ${userLocation.longitude}</p>
            <p>Distance to Launch Pad: ${distance_km.toFixed(2)} km / ${distance_miles.toFixed(2)} miles</p>
            <p>Time for Sound to Reach User: ${soundTravelTime.toFixed(2)} seconds</p>
            <div id="user-weather"></div>
            <div id="sunrise-sunset"></div>
        </div>
    `);

    // Fetch and display weather data for the user's location
    fetchUserWeatherData(userLatitude, userLongitude);

    // Fetch and display sunrise and sunset times for the user's location
    fetchSunriseSunsetTimes(userLatitude, userLongitude);
}

// Function to kick off calculating user data
function calculateUserData() {
    getUserLocation(function(latitude, longitude) {
        displayUserData(latitude, longitude);
    });
}

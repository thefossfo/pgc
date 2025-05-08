let launchesData = [];
let launchDate;
let launchPadCoordinates = {};

// Function to calculate color based on percentage
function getColorForPercentage(percentage) {
    const red = Math.min(255, Math.max(0, 255 - (percentage * 2.55)));
    const green = Math.min(255, Math.max(0, percentage * 2.55));
    return `rgb(${red}, ${green}, 0)`;
}

// Function to fetch launch data from the API or cache
function fetchLaunchData() {
    const cachedData = localStorage.getItem('launchesData');
    const cachedTimestamp = localStorage.getItem('launchesDataTimestamp');
    const now = new Date().getTime();

    // Check if cached data is available and not older than 1 hour
    if (cachedData && cachedTimestamp && (now - cachedTimestamp < 3600000)) {
        launchesData = JSON.parse(cachedData);
        populateLaunchList();
    } else {
        const apiUrl = 'https://ll.thespacedevs.com/2.3.0/launches/upcoming';
        $.ajax({
            url: apiUrl,
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                launchesData = data.results;
                // Cache the data and timestamp
                localStorage.setItem('launchesData', JSON.stringify(launchesData));
                localStorage.setItem('launchesDataTimestamp', now);
                populateLaunchList();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('Error fetching launch data:', textStatus, errorThrown);
                console.log(jqXHR);
            }
        });
    }
}


// Function to populate the launch list
function populateLaunchList() {
    const $launchList = $('#launch-list');
    $launchList.empty();
    $launchList.append('<option value="">Select a launch...</option>');
    launchesData.forEach(launch => {
	    console.log("Launch ID: "+launch.id);
        launchDate = new Date(launch.net || launch.window_start).toLocaleString(); // Assign value to global variable
        const launchLocation = launch.pad.location.name;
        const option = $('<option>')
            .val(launch.id)
            .text(`${launch.name} - ${launchDate} - ${launchLocation}`);
        $launchList.append(option);
    });
}

// Function to convert wind direction degrees to compass direction
function getCompassDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

// Function to fetch current weather data
function fetchCurrentWeatherData(latitude, longitude) {
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
            displayWeatherData(temperatureC, windSpeedKph, windSpeedMph, windDirection, precipitation, weatherCode, 'current');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching weather data:', textStatus, errorThrown);
        }
    });
}

// Function to fetch forecast weather data
function fetchForecastWeatherData(latitude, longitude, launchDate) {
    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start_date=${launchDate}&end_date=${launchDate}&hourly=temperature_2m,windspeed_10m,winddirection_10m,precipitation,weathercode`;
    $.ajax({
        url: weatherApiUrl,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            const forecast = data.hourly;
            const temperatureC = forecast.temperature_2m[0];
            const windSpeedKph = forecast.windspeed_10m[0];
            const windSpeedMph = (windSpeedKph * 0.621371).toFixed(2); // Convert to mph
            const windDirection = forecast.winddirection_10m[0];
            const precipitation = forecast.precipitation[0];
            const weatherCode = forecast.weathercode[0];
            displayWeatherData(temperatureC, windSpeedKph, windSpeedMph, windDirection, precipitation, weatherCode, 'forecast');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error fetching weather data:', textStatus, errorThrown);
        }
    });
}

// Function to display weather data
function displayWeatherData(temperatureC, windSpeedKph, windSpeedMph, windDirection, precipitation, weatherCode, type) {
    const temperatureF = (temperatureC * 9/5) + 32;
    const compassDirection = getCompassDirection(windDirection);
    const weatherCondition = getWeatherCondition(weatherCode);
    const weatherDetails = `
        <p><strong>Air Temperature:</strong> ${temperatureC}°C / ${temperatureF.toFixed(1)}°F</p>
        <p><strong>Wind Speed:</strong> ${windSpeedKph} km/h (${windSpeedMph} mph)</p>
        <p><strong>Wind Direction:</strong> ${compassDirection} (${windDirection}°)</p>
        <p><strong>Precipitation:</strong> ${precipitation} mm</p>
        <p><strong>Weather Condition:</strong> ${weatherCondition}</p>
    `;
    if (type === 'current') {
        $('#current-weather').append(weatherDetails);
    } else {
        $('#forecast-weather').append(weatherDetails);
    }
}

// Function to get weather condition from weather code
function getWeatherCondition(weatherCode) {
    const weatherConditions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Drizzle: Light',
        53: 'Drizzle: Moderate',
        55: 'Drizzle: Dense intensity',
        56: 'Freezing Drizzle: Light',
        57: 'Freezing Drizzle: Dense intensity',
        61: 'Rain: Slight',
        63: 'Rain: Moderate',
        65: 'Rain: Heavy intensity',
        66: 'Freezing Rain: Light',
        67: 'Freezing Rain: Heavy intensity',
        71: 'Snow fall: Slight',
        73: 'Snow fall: Moderate',
        75: 'Snow fall: Heavy intensity',
        77: 'Snow grains',
        80: 'Rain showers: Slight',
        81: 'Rain showers: Moderate',
        82: 'Rain showers: Violent',
        85: 'Snow showers: Slight',
        86: 'Snow showers: Heavy',
        95: 'Thunderstorm: Slight or moderate',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    return weatherConditions[weatherCode] || 'Unknown';
}

$(document).ready(function() {
    const $countdownTimer = $('#countdown-timer');
    let countdownInterval;

    // Countdown logic
    function startCountdown(launchTime) {
        clearInterval(countdownInterval); // Clear any existing countdown
        countdownInterval = setInterval(function() {
            const now = new Date().getTime();
            const distance = launchTime - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            $countdownTimer.text(`T - ${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

            if (distance < 0) {
                clearInterval(countdownInterval);
                $countdownTimer.text("LAUNCHED");
            }
        }, 1000);
    }
	// Event listener for the dropdown selection
	$('#launch-list').change(function() {
	    const selectedValue = $(this).val();
	    if (selectedValue) {
		const launch = launchesData.find(l => l.id === selectedValue);
		if (launch) {
		    const launchDate = new Date(launch.net || launch.window_start).toLocaleString(); // Use net value if available
		    const launchLocation = launch.pad.location.name;
		    const launchPadName = launch.pad.name;
		    const missionName = launch.mission ? launch.mission.name : 'N/A';
		    const missionDescription = launch.mission ? launch.mission.description : 'N/A';
		    const rocketName = launch.rocket.configuration.full_name;
		    const goPercentage = launch.probability ? `${launch.probability}%` : 'N/A';
		    const padLatitude = launch.pad.location.latitude;
		    const padLongitude = launch.pad.location.longitude;

		    // Store the GPS coordinates in the global variable
		    launchPadCoordinates = {
			latitude: padLatitude,
			longitude: padLongitude
		    };

		    // Fetch current weather data
		    fetchCurrentWeatherData(padLatitude, padLongitude);

		    // Fetch forecast weather data
		    const launchDateISO = new Date(launch.net || launch.window_start).toISOString().split('T')[0];
		    fetchForecastWeatherData(padLatitude, padLongitude, launchDateISO);

		    // Determine the color for the go percentage
		    const goPercentageColor = getColorForPercentage(launch.probability);

		    const launchDetails = `
			<h3>${launch.name}</h3>
			<p><strong>Launch Date:</strong> ${launchDate}</p>
			<p><strong>Location:</strong> ${launchLocation}</p>
			<p><strong>Launch Pad:</strong> ${launchPadName}</p>
			<p><strong>Mission:</strong> ${missionName}</p>
			<p><strong>Description:</strong> ${missionDescription}</p>
			<p><strong>Rocket:</strong> ${rocketName}</p>
			<p><strong>Go Percentage:</strong> <span class="go-percentage" style="color: ${goPercentageColor};font-weight:bold;">${goPercentage}</span></p>
			<p><strong>Launch Pad Coordinates:</strong> ${padLatitude}, ${padLongitude}</p>
			<div id="weather-details" style="display: flex; justify-content: space-between;">
			    <div id="current-weather" style="flex: 1; margin-right: 10px;">
				<h4>Current Weather:</h4>
			    </div>
			    <div id="forecast-weather" style="flex: 1; margin-left: 10px;">
				<h4>Forecasted Weather:</h4>
			    </div>
			</div>
		    `;
		    $('#launch-details').html(launchDetails);

		    // Start the countdown
		    const launchTime = new Date(launch.net || launch.window_start).getTime(); // Use net value if available
		    startCountdown(launchTime);

		    calculateUserData(); // Call the function to calculate user data
		}
	    } else {
		$('#launch-details').html('<p>Please select a launch to see the details.</p>');
	    }
	});
	});

$(document).ready(function() {
    $('#launch-details').html('<p>Please select a launch to see the details.</p>');
    fetchLaunchData();
});

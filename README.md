# Personal Ground Control (PGC)

## About
The Personal Ground Control System, or PGC, aims to enable everyday users as well as hobby rocket enthusiasts and even professionals with minimal funding to monitor rocket launches like the pros. It is designed to highly modular and confiurable to quickly and easily adapt to a variety of use cases.

## Existing features
The beta setup for PGC consists of a screen and a camera. That could be a phone, tablet, etc, but the prototype uses a laptop and a USB webcam. It uses Apache Web Server to serve static HTML, CSS and JavaScript that is displayed in a fullscreen browser window. It is designed to monitor *public* rocket launches, but with a little tweaking could be modified for private/personal launches.

The window is broken up into 4 quads, each one displaying relevant information about the launch.

|   |   |
|---|---|
| 1 | 2 |
| 3 | 4 |

### Quad 1
This section uses [Goople APIs](https://cloud.google.com/apis) to comb a predefined list of relevant YouTube channels and lists any livestreams that are available in a dropdown. When a livestream is selected, it is displayed.

### Quad 2
This section connects to the user's camera, and can dynamically switch between camera sources. It also has built in camera controls like zoom, etc.

### Quad 3
This quad uses [The Space Devs](https://thespacedevs.com/) [Launch Library 2 API](https://thespacedevs.com/llapi) to pull data for all upcoming launches, and then lists them in a dropdown. When a launch is selected, it displays data about the launch, uncluding date and time, location, description, etc. It also uses the [Open-meto weather API](https://open-meteo.com/) to pull and compare current and predicted weather data for the launch time.

### Quad 4
This is the most unique section of PGC, and displays data relevant to the user. It uses GPS to calculate the user's distance to the launch pad using the [Haversine formula](https://en.wikipedia.org/wiki/Haversine_formula) and displays interesting information like how long it would take sound from the rocket to reach the user. It also displays weather data relevant to the user's location so that they can compare it with the launch site. Providing information relevant to the user's location will enable remote viewing of rocket launches, even if the user is too far away to see the launch.

## Planned/upcoming features

### AR Overlay
Eventually, the user's camera view will have an AR overlay and possibly use AI to calculate things like the rocket's speed and trajectory. It could also color code a trajectory line to distinguis different stages of the rocket like booster seperation and SECO.

### Pan-Tilt camera
Eventually, the camera on the beta setup will incorporate a Pan-Tilt Unit, that with a little coding, will enable the camera to automatically track the rocket as it takes off.

### Automatic launchpad detection
Using the Pan-Tilt Unit, as well as GPS and compass data, the beta setup will be able to calculate it's relevant location to the launch pad and automatically find and zoom in on it.

$(document).ready(function() {
    const $videoElement = $('#camera-view video');
    const $videoSelect = $('#videoSource');
    const $zoomLevelDisplay = $('#zoomLevelDisplay');
    let zoomLevel = 1;
    let zoomInterval;

    // List available video input devices
    navigator.mediaDevices.enumerateDevices()
        .then(gotDevices)
        .catch(handleError);

    function gotDevices(deviceInfos) {
        $videoSelect.empty(); // Clear existing options
        deviceInfos.forEach(deviceInfo => {
            if (deviceInfo.kind === 'videoinput') {
                const option = $('<option>').val(deviceInfo.deviceId).text(deviceInfo.label || `Camera ${$videoSelect.children().length + 1}`);
                $videoSelect.append(option);
            }
        });
    }

    function handleError(error) {
        console.error('Error: ', error);
    }

    function start() {
        if (window.stream) {
            window.stream.getTracks().forEach(track => track.stop());
        }
        const videoSource = $videoSelect.val();
        const constraints = {
            video: { deviceId: videoSource ? { exact: videoSource } : undefined }
        };
        navigator.mediaDevices.getUserMedia(constraints)
            .then(gotStream)
            .catch(handleError);
    }

    function gotStream(stream) {
        window.stream = stream; // make stream available to console
        $videoElement[0].srcObject = stream;
    }

    $videoSelect.on('change', start);

    // Start with the default video source
    start();

    // Update zoom level display
    function updateZoomLevelDisplay() {
        $zoomLevelDisplay.text(`${zoomLevel.toFixed(1)}x`);
    }

    // Zoom controls
    $('#zoomIn').on('mousedown', function() {
        zoomInterval = setInterval(function() {
            zoomLevel += 0.01;
            $videoElement.css('transform', `scale(${zoomLevel})`);
            updateZoomLevelDisplay();
        }, 10);
    }).on('mouseup', function() {
        clearInterval(zoomInterval);
    });

    $('#zoomOut').on('mousedown', function() {
        zoomInterval = setInterval(function() {
            zoomLevel = Math.max(1, zoomLevel - 0.01); // Prevent zooming out too much
            $videoElement.css('transform', `scale(${zoomLevel})`);
            updateZoomLevelDisplay();
        }, 10);
    }).on('mouseup', function() {
        clearInterval(zoomInterval);
    });

    // Reset zoom control
    $('#resetZoom').on('click', function() {
        zoomLevel = 1;
        $videoElement.css('transform', `scale(${zoomLevel})`);
        updateZoomLevelDisplay();
    });
});
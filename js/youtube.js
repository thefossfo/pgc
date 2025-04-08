// Define YouTube channels to scan as objects to include name and channel ID
const channels = [
    { name: 'NASA', id: 'UCVKOFka8myGogtM0OTxu9Ug' },
    { name: 'NASASpaceflight', id: 'UCSUu1lih2RifWkKtDOJdsBA' },
    { name: 'Spaceflight Now Now', id: 'UC_oLd0Y2pW4rPV8Pp0kWfFg' },
    { name: 'SpaceX', id: 'UCtI0Hodo5o5dUb67FeUjDeA' },
    { name: 'European Space Agency', id: 'UCIBaDdAbGlFDeS33shmlD0A' },
];

// Static fallback livestream URL
const livestream_fallback = {
    videoId: 'Jm8wRjD3xVA',
    title: 'Fallback Live Stream',
    thumbnail: 'https://img.youtube.com/vi/Jm8wRjD3xVA/default.jpg'
};

// Function to poll channels for live streams using jQuery
function pollChannels() {
    const cacheKey = 'liveStreamData';
    const cacheExpiryKey = 'liveStreamDataExpiry';
    const cachedData = localStorage.getItem(cacheKey);
    const cacheExpiry = localStorage.getItem(cacheExpiryKey);
    const now = new Date().getTime();

    if (cachedData && cacheExpiry && now < cacheExpiry) {
        const data = JSON.parse(cachedData);
        populateLiveStreams(data);
    } else {
        fetchLiveStreams();
    }
}

function fetchLiveStreams() {
    $('#live-streams').empty();
    $('#live-streams').append('<option value="">Select a live stream...</option>');
    var api_key = 'YOUR_API_KEY';
    let liveStreamFound = false;
    let completedRequests = 0;
    let liveStreamData = [];

    channels.forEach(channel => {
        $.get(`https://www.googleapis.com/youtube/v3/search?key=` + api_key + `&channelId=${channel.id}&eventType=live&type=video&part=snippet`)
            .done(function(data) {
                completedRequests++;
                if (data.items.length > 0) {
                    liveStreamFound = true;
                    data.items.forEach(item => {
                        const videoId = item.id.videoId;
                        const title = item.snippet.title;
                        const thumbnail = item.snippet.thumbnails.default.url;
                        liveStreamData.push({ videoId, title, thumbnail });
                        $('#live-streams').append(`<option value="https://www.youtube.com/embed/${videoId}?autoplay=1"><img src="${thumbnail}" alt="${title}"> ${title}</option>`);
                    });
                }
                if (completedRequests === channels.length) {
                    if (!liveStreamFound) {
                        $('#live-streams').append('<option value="">No live streams available</option>');
                    }
                    liveStreamData.push(livestream_fallback); // Add fallback stream only once
                    localStorage.setItem('liveStreamData', JSON.stringify(liveStreamData));
                    localStorage.setItem('liveStreamDataExpiry', new Date().getTime() + 60 * 60 * 1000); // Cache for 1 hour
                    populateLiveStreams(liveStreamData); // Populate dropdown with fetched data
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error('Error fetching live streams:', textStatus, errorThrown);
                completedRequests++;
                if (completedRequests === channels.length) {
                    liveStreamData.push(livestream_fallback); // Add fallback stream only once
                    populateLiveStreams(liveStreamData); // Populate dropdown even if some requests fail
                }
            });
    });
}

function populateLiveStreams(data) {
    $('#live-streams').empty();
    $('#live-streams').append('<option value="">Select a live stream...</option>');
    data.forEach(item => {
        $('#live-streams').append(`<option value="https://www.youtube.com/embed/${item.videoId}?autoplay=1"><img src="${item.thumbnail}" alt="${item.title}"> ${item.title}</option>`);
    });
}

// Event listener for the dropdown selection
$('#live-streams').change(function() {
    const selectedValue = $(this).val();
    if (selectedValue) {
        $('#live-stream').html(`<iframe src="${selectedValue}" frameborder="0" allowfullscreen></iframe>`);
        $('#live-stream iframe').css({
            'width': '100%',
            'height': '100%',
            'max-width': '100%',
            'max-height': '100%'
        });
    }
});

// Periodically check for live streams every 15 minutes
setInterval(pollChannels, 15 * 60 * 1000);
// Initial check for live streams on page load
$(document).ready(function() {
    pollChannels();
});

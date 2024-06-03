"use strict";

// Initialize videoWatched object from localStorage
let videoWatched = JSON.parse(localStorage.getItem('videoWatched')) || {};
let totalVideos = new Set(); // Use a Set to store unique video IDs

// Function to mark a video as watched when it ends
function markVideoAsWatched(videoId) {
    if (videoWatched[videoId]) return; // If already watched, exit the function

    videoWatched[videoId] = true;
    try {
        localStorage.setItem('videoWatched', JSON.stringify(videoWatched)); // Update localStorage
        checkAllVideosWatched(); // Check if all videos have been watched after marking the video as watched
    } catch (error) {
        console.error('Error updating localStorage:', error);
        alert('Unable to save video watch status. Please ensure your browser allows cookies.');
    }
}

// Function to check if all videos have been watched
function checkAllVideosWatched() {
    let watchedVideos = Object.values(videoWatched).filter(Boolean).length;

    // Check if all videos in the list have been watched
    if (totalVideos.size === watchedVideos && Object.keys(videoWatched).length > 0) {
        // Enable quiz button when all videos are watched
        enableQuizButton();
    } else {
        // If not all videos are watched, ensure the button is disabled
        disableQuizButton();
    }
}

// Function to enable the quiz button
function enableQuizButton() {
    $('.video-quiz-rich-text-button-wrap #quiz-button').removeClass('disabled');
}

// Function to disable the quiz button
function disableQuizButton() {
    $('.video-quiz-rich-text-button-wrap #quiz-button').addClass('disabled');
}

// Load jQuery asynchronously
function loadScript(src, callback) {
    let script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.onload = callback;
    document.head.appendChild(script);
}

loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js', () => {
    // Load the YouTube API script dynamically
    loadScript('https://www.youtube.com/iframe_api', () => {});
});

// Function called when the YouTube API is ready
window.onYouTubeIframeAPIReady = function () {
    initializeYouTubePlayers(); // Initialize YouTube players
};

// Function to initialize YouTube players
function initializeYouTubePlayers() {
    let playerCount = $('iframe[data-youtube-id]').length;
    let playersInitialized = 0;

    // Initialize YouTube players for each video
    $('iframe[data-youtube-id]').each(function () {
        let videoId = $(this).data('youtube-id');
        if (videoId) {
            try {
                new YT.Player($(this).parent().attr('id'), {
                    videoId: videoId,
                    origin: window.location.origin, // Ensure the origin matches the current page origin
                    playerVars: {
                        'allow': 'autoplay; fullscreen; picture-in-picture',
                    },
                    events: {
                        onReady: (event) => {
                            totalVideos.add(videoId); // Add video ID to the totalVideos Set
                            playersInitialized++;
                            if (playersInitialized === playerCount) {
                                // Check if all players have been initialized
                                checkAllVideosWatched();
                            }
                        },
                        onStateChange: (event) => {
                            if (event.data === YT.PlayerState.ENDED) {
                                // Call markVideoAsWatched when the video ends
                                markVideoAsWatched(videoId);
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error creating YouTube player:', error);
            }
        } else {
            console.error("Video ID not found for element:", this);
        }
    });
}
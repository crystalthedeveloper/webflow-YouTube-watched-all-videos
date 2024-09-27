"use strict";

// Generate a unique key for each page based on the URL
const pageKey = window.location.pathname; // Use the page path as a unique identifier

// Initialize videoWatched object for each page from localStorage using a unique key
let videoWatched = JSON.parse(localStorage.getItem(`videoWatched_${pageKey}`)) || {};

let totalVideos = new Set(); // Reset Set to store unique video IDs per page

// Function to mark a video as watched when it ends
function markVideoAsWatched(videoId) {
    if (videoWatched[videoId]) {
        return; // If already watched, exit the function
    }

    videoWatched[videoId] = true;
    try {
        // Store the watched videos with a unique key for each page
        localStorage.setItem(`videoWatched_${pageKey}`, JSON.stringify(videoWatched));
        checkAllVideosWatched(); // Check if all videos have been watched after marking the video as watched
    } catch (error) {
        console.error('Error updating localStorage:', error);
        alert('Unable to save video watch status. Please ensure your browser allows cookies.');
    }
}

// Function to unhide elements when video is complete
function unhideVideoComplete(videoId, isGuestVideo) {
    // Find the iframe that contains the video in the src URL
    let iframe = $(`iframe[src*='${videoId}']`);

    if (iframe.length > 0) {
        let chapter = iframe.attr('id'); // Get the id attribute of the iframe (chapter name)

        if (isGuestVideo) {
            // Unhide elements for guest videos
            switch (chapter) {
                case 'Chapter 1':
                    $('.guest_complete_1').removeClass('hidden');
                    break;
                case 'Chapter 2':
                    $('.guest_complete_2').removeClass('hidden');
                    break;
                case 'Chapter 3':
                    $('.guest_complete_3').removeClass('hidden');
                    break;
            }
        } else {
            // Unhide elements for user videos
            switch (chapter) {
                case 'Chapter 1':
                    $('.video_complete_1').removeClass('hidden');
                    $('.watched_link1').click(() => $('[data-w-tab="Tab 1"]').click());
                    break;
                case 'Chapter 2':
                    $('.video_complete_2').removeClass('hidden');
                    $('.watched_link2').click(() => $('[data-w-tab="Tab 2"]').click());
                    break;
                case 'Chapter 3':
                    $('.video_complete_3').removeClass('hidden');
                    break;
            }
        }
    }
}

// Function to check if all videos have been watched
function checkAllVideosWatched() {
    let watchedVideos = Object.values(videoWatched).filter(Boolean).length;

    if (totalVideos.size === watchedVideos && Object.keys(videoWatched).length > 0) {
        enableQuizButton();
    } else {
        disableQuizButton();
    }
}

// Function to enable/disable the quiz button
function enableQuizButton() {
    $('.video-quiz-rich-text-button-wrap #quiz-button').removeClass('disabled');
}

function disableQuizButton() {
    $('.video-quiz-rich-text-button-wrap #quiz-button').addClass('disabled');
}

// Function to handle video end events
function handleVideoEnd(videoId, isUserVideo) {
    if (isUserVideo) {
        markVideoAsWatched(videoId); // Track the video as watched for logged-in users
    }
    unhideVideoComplete(videoId, !isUserVideo); // Pass whether it's a guest video or not
}

// Load external scripts
function loadScript(src, callback) {
    let script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.onload = callback;
    document.head.appendChild(script);
}

loadScript('https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js', () => {
    loadScript('https://www.youtube.com/iframe_api');
});

// YouTube API ready callback
window.onYouTubeIframeAPIReady = function () {
    initializeYouTubePlayers();
};

// Function to initialize YouTube players
function initializeYouTubePlayers() {
    let playerCount = $('iframe[data-youtube-id]').length;
    let playersInitialized = 0;

    $('iframe[data-youtube-id]').each(function () {
        let videoId = $(this).data('youtube-id');
        let isUserVideo = $(this).closest('.uservideo').length > 0; // Check if the video is a user video

        if (videoId) {
            try {
                new YT.Player($(this).parent().attr('id'), {
                    videoId: videoId,
                    origin: window.location.origin,
                    playerVars: { 'allow': 'autoplay; fullscreen; picture-in-picture' },
                    events: {
                        onReady: (event) => {
                            totalVideos.add(videoId); // Add the video to the totalVideos set
                            playersInitialized++;
                            if (playersInitialized === playerCount) {
                                checkAllVideosWatched(); // Check if all players are initialized
                            }
                        },
                        onStateChange: (event) => {
                            if (event.data === YT.PlayerState.ENDED) {
                                handleVideoEnd(videoId, isUserVideo);
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error creating YouTube player:', error);
            }
        }
    });
}

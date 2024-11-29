
"use strict";

// Generate a unique key for each page based on the URL
const pageKey = window.location.pathname; // Use the page path as a unique identifier

// Initialize videoWatched object for each page from localStorage using a unique key
let videoWatched = JSON.parse(localStorage.getItem(`videoWatched_${pageKey}`)) || {};

let totalVideos = new Set(); // Reset Set to store unique video IDs per page

function markVideoAsWatched(videoId) {
    if (videoWatched[videoId]) {
        return; // If already watched, exit the function
    }
    videoWatched[videoId] = true;
    try {
        localStorage.setItem(`videoWatched_${pageKey}`, JSON.stringify(videoWatched));
        checkAllVideosWatched();
    } catch (error) {
        console.error('Error updating localStorage:', error);
        alert('Unable to save video watch status. Please ensure your browser allows cookies.');
    }
}

function unhideVideoComplete(videoId, isGuestVideo) {
    let iframe = $(`iframe[src*='${videoId}']`);
    if (iframe.length > 0) {
        let chapter = iframe.attr('id');
        if (isGuestVideo) {
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

function checkAllVideosWatched() {
    let watchedVideos = Object.values(videoWatched).filter(Boolean).length;
    if (totalVideos.size === watchedVideos && Object.keys(videoWatched).length > 0) {
        enableQuizButton();
    } else {
        disableQuizButton();
    }
}

function enableQuizButton() {
    $('.video-quiz-rich-text-button-wrap #quiz-button').removeClass('disabled');
}

function disableQuizButton() {
    $('.video-quiz-rich-text-button-wrap #quiz-button').addClass('disabled');
}

function handleVideoEnd(videoId, isUserVideo) {
    if (isUserVideo) {
        markVideoAsWatched(videoId);
    }
    unhideVideoComplete(videoId, !isUserVideo);
}

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

window.onYouTubeIframeAPIReady = function () {
    initializeYouTubePlayers();
};

function initializeYouTubePlayers() {
    let playerCount = $('iframe[data-youtube-id]').length;
    let playersInitialized = 0;

    $('iframe[data-youtube-id]').each(function () {
        let videoId = $(this).data('youtube-id');
        let isUserVideo = $(this).closest('.uservideo').length > 0;

        if (videoId) {
            try {
                new YT.Player($(this).parent().attr('id'), {
                    videoId: videoId,
                    origin: window.location.origin,
                    playerVars: {
                          'modestbranding': 1, // Hide YouTube logo
                          'rel': 0,            // Disable related videos
                          'showinfo': 0,       // (deprecated, doesn't work anymore)
                          'iv_load_policy': 3, // Hide annotations
                          'controls': 1        // Hide video controls       
                    },
                    events: {
                        onReady: (event) => {
                            totalVideos.add(videoId);
                            playersInitialized++;
                            if (playersInitialized === playerCount) {
                                checkAllVideosWatched();
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
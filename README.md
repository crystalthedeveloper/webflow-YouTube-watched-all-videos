
# webflow-YouTube-watched-all-videos

## Video Tracking and Interaction Script

This script provides functionality to track video-watching progress on a webpage, dynamically handle UI updates based on video completion, and enable a quiz button once all videos on the page are watched.

## Features

- Tracks video watch status using `localStorage` for persistence.
- Handles YouTube iframe players and dynamically interacts with the webpage.
- Shows or hides specific UI elements based on the video state.
- Enables or disables a quiz button based on video completion.

## Code Explanation

### Unique Key for Each Page

```javascript
const pageKey = window.location.pathname;
```

- Uses the page's URL path as a unique identifier to store and retrieve data.

### Persistent Video Tracking

```javascript
let videoWatched = JSON.parse(localStorage.getItem(`videoWatched_${pageKey}`)) || {};
```

- Initializes the `videoWatched` object for the current page, storing data in `localStorage`.

### Mark Video as Watched

```javascript
function markVideoAsWatched(videoId) {
    if (videoWatched[videoId]) return; // Skip if the video is already marked as watched
    videoWatched[videoId] = true;      // Mark the video as watched
    try {
        localStorage.setItem(`videoWatched_${pageKey}`, JSON.stringify(videoWatched));
        checkAllVideosWatched();
    } catch (error) {
        console.error('Error updating localStorage:', error);
        alert('Unable to save video watch status. Please ensure your browser allows cookies.');
    }
}
```

- Marks a video as watched by updating the `videoWatched` object with the video's ID.
- Saves the updated object to `localStorage`.

## Setup

1. Include the script in your webpage.
2. Ensure that each video iframe has a unique `data-youtube-id` attribute and a parent element with a unique `id`.
3. Customize the UI elements and selectors as needed (e.g., `.quiz-button`).

## Dependencies

- **jQuery** (3.5.1 or higher)
- **YouTube iframe API**

## License

This project is licensed under the MIT License.
document.addEventListener('DOMContentLoaded', function () {
    const videoGrid = document.getElementById('video-grid');
    const loadingElement = document.getElementById('loading');
    const errorMessageElement = document.getElementById('error-message');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    let allVideos = [];

    async function fetchVideos() {
        try {
            const response = await fetch('https://api.freeapi.app/api/v1/public/youtube/videos');

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);

            if (data.success && data.data && data.data.data) {
                allVideos = data.data.data.map(item => {
                    const videoData = item.items;
                    return {
                        id: videoData.id,
                        title: videoData.snippet.title,
                        channelName: videoData.snippet.channelTitle,
                        thumbnail: videoData.snippet.thumbnails.standard.url || videoData.snippet.thumbnails.high.url,
                        publishedAt: videoData.snippet.publishedAt,
                        viewCount: videoData.statistics.viewCount,
                        description: videoData.snippet.description
                    };
                });
                displayVideos(allVideos);
            } else {
                showError('No videos found or API returned an unexpected format.');
            }
        } catch (error) {
            showError(`Failed to fetch videos: ${error.message}`);
        } finally {
            loadingElement.style.display = 'none';
        }
    }

    function displayVideos(videos) {
        videoGrid.innerHTML = '';

        if (videos.length === 0) {
            videoGrid.innerHTML = '<p class="no-results">No videos found matching your search.</p>';
            return;
        }

        videos.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'video-card';
            videoCard.addEventListener('click', () => {
                window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
            });

            const thumbnailSrc = video.thumbnail || 'https://via.placeholder.com/480x360.png?text=No+Thumbnail';
            const publishedDate = video.publishedAt ? video.publishedAt.substring(0, 10) : '';

            videoCard.innerHTML = `
                <div class="thumbnail-container">
                    <img class="thumbnail" src="${thumbnailSrc}" alt="${video.title}">
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="channel-name">${video.channelName || 'Unknown Channel'}</p>
                    <div class="video-stats">
                        <span>${video.viewCount} Views</span>
                        <span>${publishedDate}</span>
                    </div>
                </div>
            `;

            videoGrid.appendChild(videoCard);
        });
    }

    function filterVideos() {
        const searchTerm = searchInput.value.trim().toLowerCase();

        if (searchTerm === '') {
            displayVideos(allVideos);
            return;
        }

        const filteredVideos = allVideos.filter(video => {
            return (
                video.title.toLowerCase().includes(searchTerm) ||
                (video.channelName && video.channelName.toLowerCase().includes(searchTerm)) ||
                (video.description && video.description.toLowerCase().includes(searchTerm))
            );
        });

        displayVideos(filteredVideos);
    }

    function showError(message) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
        loadingElement.style.display = 'none';
    }

    function debounce(func, delay) {
        let timeoutId;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }

    const debouncedFilter = debounce(filterVideos, 300);

    searchInput.addEventListener('input', debouncedFilter);

    searchButton.addEventListener('click', filterVideos);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            filterVideos();
        }
    });

    fetchVideos();
});

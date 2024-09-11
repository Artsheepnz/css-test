let player;
let currentSongIndex = 0;

const playlist = [
    {
        title: "HEAT WAV.", 
        artist: "Wavey Davey",
        videoId: "mRD0-GxqHVo",
        albumCover: "assets/album1.png",
    },
    {
        title: "song title",
        artist: "artist",
        videoId: "RMPX_vgqQnM",
        albumCover: "assets/album2.png",
    },
    {
        title: "POOLS",
        artist: "By the Bay",
        videoId: "33hMB7yo32Q",
        albumCover: "assets/album1.png",
    }
];

function onYouTubeIframeAPIReady() {
    loadSong(currentSongIndex);
}

function loadSong(index) {
    const song = playlist[index];
    document.getElementById('song-title').textContent = song.title;
    document.getElementById('artist').textContent = song.artist;
    document.getElementById('album-cover-img').src = song.albumCover;

    if (player) {
        player.loadVideoById(song.videoId);
    } else {
        player = new YT.Player('player', {
            height: '0',
            width: '0',
            videoId: song.videoId,
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

    updateUpcomingList();
}

function onPlayerReady(event) {
    event.target.playVideo();
    document.getElementById('play-pause-btn').textContent = '⏸️';
    updateProgressBar();
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        nextSong();
    }
    if (event.data == YT.PlayerState.PAUSED) {
        document.getElementById('play-pause-btn').textContent = '▶️';
    }
    if (event.data == YT.PlayerState.PLAYING) {
        document.getElementById('play-pause-btn').textContent = '⏸️';
    }
}

function playPauseSong() {
    const playerState = player.getPlayerState();
    if (playerState == YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
}

function rewindSong() {
    player.seekTo(0);
}

function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const currentTime = document.getElementById('current-time');
    const duration = document.getElementById('duration');

    setInterval(() => {
        if (player && player.getCurrentTime) {
            const current = player.getCurrentTime();
            const total = player.getDuration();
            progressBar.value = (current / total) * 100;
            currentTime.textContent = formatTime(current);
            duration.textContent = formatTime(total);
        }
    }, 1000);
    
    // Seek to the position when the user changes the progress bar
    progressBar.addEventListener('input', () => {
        const seekTo = (progressBar.value / 100) * player.getDuration();
        player.seekTo(seekTo);
    });
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

async function updateUpcomingList() {
    const upcomingList = document.getElementById('upcoming-list');
    upcomingList.innerHTML = '';

    for (let i = currentSongIndex + 1; i < playlist.length; i++) {
        const li = document.createElement('li');

        const img = document.createElement('img');
        img.src = playlist[i].albumCover;
        img.alt = `Album cover for ${playlist[i].title}`;
        img.style.width = '50px';  // Adjust the size as needed
        img.style.height = '50px';
        img.style.borderRadius = '5px';
        img.style.marginRight = '10px';

        li.appendChild(img);

        // Fetch video duration from YouTube API
        const duration = await fetchVideoDuration(playlist[i].videoId);
        li.appendChild(document.createTextNode(`${playlist[i].title} - ${playlist[i].artist} (${duration})`));

        upcomingList.appendChild(li);
    }
}

async function fetchVideoDuration(videoId) {
    const apiKey = 'YOUR_YOUTUBE_API_KEY';
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const durationISO = data.items[0].contentDetails.duration;
    return convertISO8601Duration(durationISO);
}

function convertISO8601Duration(duration) {
    const match = duration.match(/PT(\d+M)?(\d+S)?/);
    const minutes = match[1] ? parseInt(match[1]) : 0;
    const seconds = match[2] ? parseInt(match[2]) : 0;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}
}

document.getElementById('play-pause-btn').addEventListener('click', playPauseSong);
document.getElementById('next-btn').addEventListener('click', nextSong);
document.getElementById('prev-btn').addEventListener('click', prevSong);
document.getElementById('rewind-btn').addEventListener('click', rewindSong);

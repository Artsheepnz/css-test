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
        title: "Hi bili wyd?",
        artist: "bcksht girl auck",
        videoId: "huGd4efgdPA",
        albumCover: "assets/album2.png",
    },
    {
        title: "PLS STAY",
        artist: "ben bones",
        videoId: "Oa_RSwwpPaA",
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
    if (event.data == YT.PlayerState.PLAYING) {
        updateSongDuration();
    }
}

function updateSongDuration() {
    const duration = player.getDuration();
    document.getElementById('duration').textContent = formatTime(duration);
}

function updateUpcomingList() {
    const upcomingList = document.getElementById('upcoming-list');
    upcomingList.innerHTML = '';

    playlist.forEach((song, index) => {
        if (index > currentSongIndex) {
            const tempPlayer = new YT.Player(`temp-player-${index}`, {
                height: '0',
                width: '0',
                videoId: song.videoId,
                events: {
                    'onReady': function(event) {
                        const duration = event.target.getDuration();
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <img src="${song.albumCover}" alt="Album Cover">
                            <span class="upcoming-title">${song.title} - ${song.artist}</span>
                            <span class="upcoming-time">${formatTime(duration)}</span>
                        `;
                        upcomingList.appendChild(li);
                        tempPlayer.destroy();
                    }
                }
            });
        }
    });
}

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    progressBar.value = (currentTime / duration) * 100;

    document.getElementById('current-time').textContent = formatTime(currentTime);

    if (player.getPlayerState() == YT.PlayerState.PLAYING) {
        requestAnimationFrame(updateProgressBar);
    }
}

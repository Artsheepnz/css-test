let player;
let currentSongIndex = 0;

const playlist = [
    {
        title: "HEAT WAV.",
        artist: "Wavey Davey",
        videoId: "mRD0-GxqHVo",
        albumCover: "assets/album1.png",
        duration: "3:56"
    },
    {
        title: "song title",
        artist: "artist",
        videoId: "RMPX_vgqQnM",
        albumCover: "assets/album2.png",
        duration: "4:15"
    },
    {
        title: "POOLS",
        artist: "By the Bay",
        videoId: "33hMB7yo32Q",
        albumCover: "assets/album1.png",
        duration: "2:45"
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

function updateUpcomingList() {
    const upcomingList = document.getElementById('upcoming-list');
    upcomingList.innerHTML = '';
    
    for (let i = currentSongIndex + 1; i < playlist.length; i++) {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.marginBottom = '10px'; // Add margin between list items

        // Create album cover
        const img = document.createElement('img');
        img.src = playlist[i].albumCover;
        img.alt = `Album cover for ${playlist[i].title}`;
        img.style.width = '50px';
        img.style.height = '50px';
        img.style.borderRadius = '5px';
        img.style.marginRight = '10px';

        // Create div to hold song info and duration
        const songInfo = document.createElement('div');
        songInfo.style.flex = '1'; // Allow it to grow and take up remaining space

        // Create song title and artist
        const titleArtist = document.createElement('p');
        titleArtist.textContent = `${playlist[i].title} - ${playlist[i].artist}`;
        titleArtist.style.margin = '0'; // Remove margin for cleaner layout

        // Create duration element
        const duration = document.createElement('span');
        duration.textContent = playlist[i].duration;
        duration.classList.add('upcoming-time');
        duration.style.marginLeft = 'auto'; // Align duration to the right
        duration.style.color = '#666'; // Match your existing styling

        // Append title and duration to song info
        songInfo.appendChild(titleArtist);
        songInfo.appendChild(duration);

        // Append image and song info to list item
        li.appendChild(img);
        li.appendChild(songInfo);
        
        // Append the list item to the upcoming list
        upcomingList.appendChild(li);
    }
}

document.getElementById('play-pause-btn').addEventListener('click', playPauseSong);
document.getElementById('next-btn').addEventListener('click', nextSong);
document.getElementById('prev-btn').addEventListener('click', prevSong);
document.getElementById('rewind-btn').addEventListener('click', rewindSong);

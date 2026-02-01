/**
 * Coronary CT Angiography Audio Guide
 * Audio Player Controller
 * Compatible with iOS Safari and Android Chrome
 */

(function() {
    'use strict';

    const audioPlayer = document.getElementById('audioPlayer');
    const playButton = document.getElementById('playButton');
    const audioStatus = document.getElementById('audioStatus');
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');

    if (!audioPlayer || !playButton) {
        return;
    }

    let isPlaying = false;
    let isLoaded = false;

    function init() {
        audioPlayer.load();

        playButton.addEventListener('click', togglePlayPause);
        audioPlayer.addEventListener('loadedmetadata', handleLoadedMetadata);
        audioPlayer.addEventListener('canplay', handleCanPlay);
        audioPlayer.addEventListener('playing', handlePlaying);
        audioPlayer.addEventListener('pause', handlePause);
        audioPlayer.addEventListener('ended', handleEnded);
        audioPlayer.addEventListener('error', handleError);
        audioPlayer.addEventListener('timeupdate', handleTimeUpdate);

        if ('wakeLock' in navigator) {
            requestWakeLock();
        }

        updateUI();
    }

    function togglePlayPause() {
        if (audioPlayer.paused) {
            playAudio();
        } else {
            pauseAudio();
        }
    }

    function playAudio() {
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updateUI();
            }).catch(() => {
                updateStatus('Playback failed');
                isPlaying = false;
                updateUI();
            });
        }
    }

    function pauseAudio() {
        audioPlayer.pause();
        isPlaying = false;
        updateUI();
    }

    function handleLoadedMetadata() {
        isLoaded = true;
        updateStatus(`Ready to play (${formatTime(audioPlayer.duration)})`);
    }

    function handleCanPlay() {
        isLoaded = true;
    }

    function handlePlaying() {
        isPlaying = true;
        updateUI();
        updateStatus('Playing...');
    }

    function handlePause() {
        if (!audioPlayer.ended) {
            isPlaying = false;
            updateUI();
            updateStatus('Paused');
        }
    }

    function handleEnded() {
        isPlaying = false;
        updateUI();
        updateStatus('Completed');
        audioPlayer.currentTime = 0;
    }

    function handleError() {
        updateStatus('Audio file not found');
        isPlaying = false;
        updateUI();
    }

    function handleTimeUpdate() {
        if (isPlaying) {
            updateStatus(`${formatTime(audioPlayer.currentTime)} / ${formatTime(audioPlayer.duration)}`);
        }
    }

    function updateUI() {
        if (isPlaying) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }
    }

    function updateStatus(text) {
        if (audioStatus) audioStatus.textContent = text;
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }

    let wakeLock = null;
    async function requestWakeLock() {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
        } catch {}
    }

    function releaseWakeLock() {
        if (wakeLock) wakeLock.release();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && isPlaying) {
            requestWakeLock();
        }
    });

    window.addEventListener('beforeunload', releaseWakeLock);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

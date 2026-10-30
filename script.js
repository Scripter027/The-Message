const videos = [
    'company_disclaimer.mp4',
    'title_intro.mp4'
];

let currentVideoIndex = 0;

const videoContainer = document.getElementById('videoContainer');
const videoElement = document.getElementById('introVideo');
const mainMenu = document.getElementById('mainMenu');

function playNextVideo() {
    if (currentVideoIndex < videos.length) {
        videoElement.src = videos[currentVideoIndex];
        videoElement.load();
        
        let playPromise = videoElement.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                videoElement.muted = true;
                videoElement.play().catch(() => {
                    document.addEventListener('click', forceStartOnUserGesture, { once: true });
                });
            });
        }
        
        currentVideoIndex++;
    } else {
        transitionToMenu();
    }
}

function forceStartOnUserGesture() {
    videoElement.muted = false;
    videoElement.play().catch(() => {
        transitionToMenu();
    });
}

function transitionToMenu() {
    videoContainer.style.transition = 'opacity 1.0s ease';
    videoContainer.style.opacity = '0';
    
    setTimeout(() => {
        videoContainer.style.display = 'none';
        mainMenu.classList.remove('hidden');
        
        setTimeout(() => {
            mainMenu.classList.add('visible');
        }, 50);
        
    }, 1000);
}

videoElement.addEventListener('ended', playNextVideo);

videoElement.addEventListener('error', () => {
    transitionToMenu();
});

window.addEventListener('DOMContentLoaded', () => {
    playNextVideo();
});

(function() {
    let activeWindow = null;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let highestZIndex = 100;

    window.bringToFront = function(win) {
        if (!win) return;
        highestZIndex++;
        win.style.zIndex = highestZIndex;
    };

    function initWindowManager() {
        const windows = document.querySelectorAll('.desktop-window');
        
        windows.forEach(win => {
            const header = win.querySelector('.window-header');
            if (!header) return;

            win.addEventListener('mousedown', () => {
                window.bringToFront(win);
            });

            header.style.cursor = 'move';
            
            header.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('window-close-btn')) return;
                
                isDragging = true;
                activeWindow = win;
                window.bringToFront(win);

                startX = e.clientX;
                startY = e.clientY;

                const rect = win.getBoundingClientRect();
                const parentRect = document.getElementById('desktopEnv').getBoundingClientRect();
                
                initialLeft = rect.left - parentRect.left;
                initialTop = rect.top - parentRect.top;

                win.style.transform = 'none';
                win.style.left = initialLeft + 'px';
                win.style.top = initialTop + 'px';

                document.body.style.cursor = 'move';
                e.preventDefault();
            });
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !activeWindow) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const parentRect = document.getElementById('desktopEnv').getBoundingClientRect();
        
        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;

        newLeft = Math.max(0, Math.min(newLeft, parentRect.width - activeWindow.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, parentRect.height - activeWindow.offsetHeight - 45));

        activeWindow.style.left = newLeft + 'px';
        activeWindow.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            activeWindow = null;
            document.body.style.cursor = '';
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        const desktopEnv = document.getElementById('desktopEnv');
        const observer = new MutationObserver(() => {
            if (!desktopEnv.classList.contains('hidden')) {
                initWindowManager();
                observer.disconnect();
            }
        });
        observer.observe(desktopEnv, { attributes: true, attributeFilter: ['class'] });
    });
})();

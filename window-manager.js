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
        if (window.innerWidth <= 768) {
            win.classList.remove('custom-pos');
            win.style.left = '';
            win.style.top = '';
        }
    };

    window.makeWindowDraggable = function(win) {
        if (!win || win.dataset.draggableInit === 'true') return;
        win.dataset.draggableInit = 'true';

        const header = win.querySelector('.window-header');
        if (!header) return;

        const onBring = () => {
            window.bringToFront(win);
        };

        win.addEventListener('mousedown', onBring);
        win.addEventListener('touchstart', onBring, { passive: true });

        header.style.cursor = 'move';

        const onDragStart = (e) => {
            if (window.innerWidth <= 768) return;
            if (e.target.closest('.window-close-btn')) return;

            isDragging = true;
            activeWindow = win;
            activeWindow.classList.add('is-dragging');
            window.bringToFront(win);

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;

            const rect = win.getBoundingClientRect();
            const env = document.getElementById('desktopEnv');
            const parentRect = env ? env.getBoundingClientRect() : { left: 0, top: 0 };

            initialLeft = rect.left - parentRect.left;
            initialTop = rect.top - parentRect.top;

            win.classList.add('custom-pos');
            win.style.left = initialLeft + 'px';
            win.style.top = initialTop + 'px';

            document.body.style.cursor = 'move';
            if (!e.touches) {
                e.preventDefault();
            }
        };

        header.addEventListener('mousedown', onDragStart);
        header.addEventListener('touchstart', onDragStart, { passive: true });
    };

    function initWindowManager() {
        document.querySelectorAll('.desktop-window').forEach(win => {
            window.makeWindowDraggable(win);
        });
    }

    const onDragMove = (e) => {
        if (!isDragging || !activeWindow) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        const env = document.getElementById('desktopEnv');
        const parentRect = env ? env.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
        const taskbar = document.querySelector('.taskbar');
        const taskbarHeight = taskbar ? taskbar.offsetHeight : 46;

        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;

        const maxLeft = Math.max(0, parentRect.width - activeWindow.offsetWidth);
        const maxTop = Math.max(0, parentRect.height - activeWindow.offsetHeight - taskbarHeight);

        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));

        activeWindow.style.left = newLeft + 'px';
        activeWindow.style.top = newTop + 'px';
    };

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('touchmove', onDragMove, { passive: true });

    const onDragEnd = () => {
        if (isDragging) {
            if (activeWindow) activeWindow.classList.remove('is-dragging');
            isDragging = false;
            activeWindow = null;
            document.body.style.cursor = '';
        }
    };

    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchend', onDragEnd);

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            document.querySelectorAll('.desktop-window.custom-pos').forEach(win => {
                win.classList.remove('custom-pos');
                win.style.left = '';
                win.style.top = '';
            });
        }
    });

    document.addEventListener('DOMContentLoaded', initWindowManager);
})();

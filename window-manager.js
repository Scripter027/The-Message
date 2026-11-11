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

    window.makeWindowDraggable = function(win) {
        if (!win || win.dataset.draggableInit === 'true') return;
        win.dataset.draggableInit = 'true';

        const header = win.querySelector('.window-header');
        if (!header) return;

        const onMouseDown = () => {
            window.bringToFront(win);
        };

        win.addEventListener('mousedown', onMouseDown);
        win.addEventListener('touchstart', onMouseDown, { passive: true });

        header.style.cursor = 'move';
        
        const onDragStart = (e) => {
            if (e.target.classList.contains('window-close-btn')) return;
            
            isDragging = true;
            activeWindow = win;
            window.bringToFront(win);

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;

            const rect = win.getBoundingClientRect();
            const parentRect = document.getElementById('desktopEnv').getBoundingClientRect();
            
            initialLeft = rect.left - parentRect.left;
            initialTop = rect.top - parentRect.top;

            win.style.transform = 'none';
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

        const parentRect = document.getElementById('desktopEnv').getBoundingClientRect();
        
        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;

        newLeft = Math.max(0, Math.min(newLeft, parentRect.width - activeWindow.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, parentRect.height - activeWindow.offsetHeight - 45));

        activeWindow.style.left = newLeft + 'px';
        activeWindow.style.top = newTop + 'px';
    };

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('touchmove', onDragMove, { passive: false });

    const onDragEnd = () => {
        if (isDragging) {
            isDragging = false;
            activeWindow = null;
            document.body.style.cursor = '';
        }
    };

    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchend', onDragEnd);

    document.addEventListener('DOMContentLoaded', initWindowManager);
})();

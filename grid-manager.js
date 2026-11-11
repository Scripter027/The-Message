(function() {
    const desktopMain = document.querySelector(".desktop-main");
    let draggedElement = null;
    let hasMoved = false;
    let startTouchX = 0;
    let startTouchY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let lastClickTime = 0;
    let lastClickTarget = null;

    const cellWidth = 90;
    const cellHeight = 90;
    const margin = 20;

    function findFreeGridPosition() {
        const parentRect = desktopMain.getBoundingClientRect();
        const cols = Math.max(1, Math.floor((parentRect.width - margin) / cellWidth));
        const rows = Math.max(1, Math.floor((parentRect.height - margin - 45) / cellHeight));
        const takenPositions = Object.values(window.AppConfig.state.positions);

        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                const checkLeft = c * cellWidth + margin;
                const checkTop = r * cellHeight + margin;
                const isTaken = takenPositions.some(pos => {
                    return Math.abs(pos.left - checkLeft) < 10 && Math.abs(pos.top - checkTop) < 10;
                });
                if (!isTaken) {
                    return { left: checkLeft, top: checkTop };
                }
            }
        }
        return { left: margin, top: margin };
    }

    window.renderDesktopIcons = function() {
        if (!desktopMain) return;
        document.querySelectorAll(".desktop-icon").forEach(el => el.remove());
        const lang = document.documentElement.lang || "ru";

        window.AppConfig.state.installed.forEach(appId => {
            if (window.AppConfig.state.trashContents.includes(appId)) return;

            const appData = window.AppConfig.allApps[appId];
            if (!appData) return;

            const iconEl = document.createElement("div");
            iconEl.classList.add("desktop-icon");
            iconEl.setAttribute("data-app-id", appId);
            iconEl.style.position = "absolute";
            
            let savedPos = window.AppConfig.state.positions[appId];
            if (!savedPos) {
                savedPos = findFreeGridPosition();
                window.AppConfig.state.positions[appId] = savedPos;
                window.AppConfig.save();
            }

            iconEl.style.left = savedPos.left + "px";
            iconEl.style.top = savedPos.top + "px";

            const visualEl = document.createElement("div");
            visualEl.classList.add("icon-visual");
            visualEl.textContent = appData.icon;

            const nameEl = document.createElement("div");
            nameEl.classList.add("icon-name");
            nameEl.textContent = lang === "ru" ? appData.nameRu : appData.nameEn;

            iconEl.appendChild(visualEl);
            iconEl.appendChild(nameEl);
            desktopMain.appendChild(iconEl);

            setupIconEvents(iconEl);
        });
    };

    function handleDragStart(e, el) {
        draggedElement = el;
        hasMoved = false;
        const rect = el.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startTouchX = clientX;
        startTouchY = clientY;
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;
        el.style.zIndex = 1000;
    }

    function setupIconEvents(el) {
        el.addEventListener("mousedown", (e) => handleDragStart(e, el));
        el.addEventListener("touchstart", (e) => handleDragStart(e, el), { passive: true });

        el.addEventListener("touchend", (e) => {
            if (!hasMoved) {
                e.preventDefault();
                const appId = el.getAttribute("data-app-id");
                window.openApplicationWindow(appId);
            }
        });

        el.addEventListener("click", () => {
            if (hasMoved) return;
            const currentTime = new Date().getTime();
            const appId = el.getAttribute("data-app-id");
            if (lastClickTarget === el && (currentTime - lastClickTime) < 350) {
                window.openApplicationWindow(appId);
                lastClickTime = 0;
            } else {
                lastClickTime = currentTime;
                lastClickTarget = el;
            }
        });
    }

    function handleDragMove(e) {
        if (!draggedElement) return;
        const parentRect = desktopMain.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        if (Math.abs(clientX - startTouchX) > 6 || Math.abs(clientY - startTouchY) > 6) {
            hasMoved = true;
        }

        if (!hasMoved) return;

        let left = clientX - parentRect.left - offsetX;
        let top = clientY - parentRect.top - offsetY;

        left = Math.max(0, Math.min(left, parentRect.width - draggedElement.offsetWidth));
        top = Math.max(0, Math.min(top, parentRect.height - draggedElement.offsetHeight));

        draggedElement.style.left = left + "px";
        draggedElement.style.top = top + "px";
    }

    function handleDragEnd() {
        if (!draggedElement) return;
        
        const appId = draggedElement.getAttribute("data-app-id");
        const appData = window.AppConfig.allApps[appId];
        
        if (hasMoved) {
            let left = parseInt(draggedElement.style.left);
            let top = parseInt(draggedElement.style.top);
            
            left = Math.round((left - margin) / cellWidth) * cellWidth + margin;
            top = Math.round((top - margin) / cellHeight) * cellHeight + margin;

            const parentRect = desktopMain.getBoundingClientRect();
            left = Math.max(margin, Math.min(left, parentRect.width - draggedElement.offsetWidth));
            top = Math.max(margin, Math.min(top, parentRect.height - draggedElement.offsetHeight - 45));

            const trashPos = window.AppConfig.state.positions["trash"];
            if (trashPos && appData && appData.type !== 'system') {
                if (Math.abs(left - trashPos.left) < 10 && Math.abs(top - trashPos.top) < 10) {
                    draggedElement.remove();
                    draggedElement = null;
                    if (window.moveAppToTrash) {
                        window.moveAppToTrash(appId);
                    }
                    return;
                }
            }

            draggedElement.style.left = left + "px";
            draggedElement.style.top = top + "px";

            window.AppConfig.state.positions[appId] = { left, top };
            window.AppConfig.save();
        }

        draggedElement.style.zIndex = "";
        draggedElement = null;
    }

    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("touchmove", handleDragMove, { passive: false });

    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchend", handleDragEnd);

    window.openApplicationWindow = function(appId) {
        let win = null;
        if (appId === "trash" && window.initTrashApp) { window.initTrashApp(); win = document.getElementById('windowTrash'); }
        if (appId === "explorer" && window.initExplorerApp) { window.initExplorerApp(); win = document.getElementById('windowExplorer'); }
        if (appId === "store" && window.initStoreApp) { window.initStoreApp(); win = document.getElementById('windowStore'); }
        if (appId === "tetris" && window.initTetrisApp) { window.initTetrisApp(); win = document.getElementById('windowTetris'); }
        
        if (win && window.bringToFront) {
            window.bringToFront(win);
        }
    };
})();

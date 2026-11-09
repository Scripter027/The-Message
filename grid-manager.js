(function() {
    const desktopMain = document.querySelector(".desktop-main");
    let draggedElement = null;
    let offsetX = 0;
    let offsetY = 0;
    let lastClickTime = 0;
    let lastClickTarget = null;

    window.renderDesktopIcons = function() {
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
            
            const savedPos = window.AppConfig.state.positions[appId];
            if (savedPos) {
                iconEl.style.left = savedPos.left + "px";
                iconEl.style.top = savedPos.top + "px";
            } else {
                const index = window.AppConfig.state.installed.indexOf(appId);
                iconEl.style.left = "30px";
                iconEl.style.top = (30 + index * 100) + "px";
            }

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

    function setupIconEvents(el) {
        el.addEventListener("mousedown", (e) => {
            draggedElement = el;
            const rect = el.getBoundingClientRect();
            const parentRect = desktopMain.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            el.style.zIndex = 1000;
        });

        el.addEventListener("click", (e) => {
            const currentTime = new Date().getTime();
            const appId = el.getAttribute("data-app-id");
            
            if (lastClickTarget === el && (currentTime - lastClickTime) < 300) {
                window.openApplicationWindow(appId);
            }
            lastClickTime = currentTime;
            lastClickTarget = el;
        });
    }

    document.addEventListener("mousemove", (e) => {
        if (!draggedElement) return;
        const parentRect = desktopMain.getBoundingClientRect();
        let left = e.clientX - parentRect.left - offsetX;
        let top = e.clientY - parentRect.top - offsetY;

        left = Math.max(0, Math.min(left, parentRect.width - draggedElement.offsetWidth));
        top = Math.max(0, Math.min(top, parentRect.height - draggedElement.offsetHeight));

        draggedElement.style.left = left + "px";
        draggedElement.style.top = top + "px";
    });

    document.addEventListener("mouseup", () => {
        if (!draggedElement) return;
        
        let left = parseInt(draggedElement.style.left);
        let top = parseInt(draggedElement.style.top);
        
        left = Math.round(left / 90) * 90 + 20;
        top = Math.round(top / 90) * 90 + 20;

        draggedElement.style.left = left + "px";
        draggedElement.style.top = top + "px";
        draggedElement.style.zIndex = "";

        const appId = draggedElement.getAttribute("data-app-id");
        window.AppConfig.state.positions[appId] = { left, top };
        window.AppConfig.save();

        draggedElement = null;
    });

    window.openApplicationWindow = function(appId) {
        if (appId === "trash" && window.initTrashApp) window.initTrashApp();
        if (appId === "explorer" && window.initExplorerApp) window.initExplorerApp();
        if (appId === "store" && window.initStoreApp) window.initStoreApp();
    };

    document.addEventListener("DOMContentLoaded", () => {
        const observer = new MutationObserver(() => {
            if (!document.getElementById("desktopEnv").classList.contains("hidden")) {
                window.renderDesktopIcons();
                observer.disconnect();
            }
        });
        observer.observe(document.getElementById("desktopEnv"), { attributes: true, attributeFilter: ["class"] });
    });
})();

(function() {
    const loadingScreen = document.getElementById('loadingScreen');

    window.triggerLoading = function(onComplete) {
        loadingScreen.classList.remove('hidden');
        setTimeout(() => loadingScreen.classList.add('visible'), 50);
        
        setTimeout(() => {
            loadingScreen.classList.remove('visible');
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                onComplete();
            }, 500);
        }, 3000);
    };

    window.triggerGameOverScreen = function(reasonText) {
        const checkOverlay = document.getElementById("failOverlay");
        if (checkOverlay) checkOverlay.remove();

        const overlay = document.createElement("div");
        overlay.id = "failOverlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "#000";
        overlay.style.zIndex = "25000";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.fontFamily = "Russo One, sans-serif";
        overlay.style.overflow = "hidden";

        overlay.innerHTML = `
            <div style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; opacity:0.15; background: repeating-linear-gradient(90deg, transparent, transparent 40px, #ff3333 40px, #ff3333 41px), repeating-linear-gradient(45deg, transparent, transparent 20px, #ff3333 20px, #ff3333 21px); transform: scale(1.2); animation: fail-bg-shake 0.1s infinite steps(2);"></div>
            <div style="color:#ff3333; font-size:4rem; margin-bottom:10px; font-weight:bold; text-shadow:0 0 15px #ff3333; animation: eye-pulse 2s infinite alternate;">V</div>
            <div style="color:#ff3333; font-size:2rem; text-transform:uppercase; letter-spacing:2px; margin-bottom:20px; text-shadow:0 0 10px #ff3333;">Game Over</div>
            <div id="failReasonText" style="color:#ff3333; font-size:1rem; text-align:center; max-width:500px; margin-bottom:40px; padding:0 20px; opacity:0.8; font-family:monospace; line-height:1.4;"></div>
            <div style="display:flex; flex-direction:column; gap:15px; width:100%; max-width:280px; z-index:26;">
                <button id="btnRetryChapter" class="menu-btn" style="border-color:#00ff66; color:#00ff66; box-shadow:0 0 10px rgba(0,255,102,0.3); width:100%;">Переиграть</button>
                <button id="btnGoToMainMenu" class="menu-btn" style="border-color:#ff3333; color:#ff3333; box-shadow:0 0 10px rgba(255,51,51,0.3); width:100%;">Главное меню</button>
            </div>
        `;

        const styleEl = document.createElement("style");
        styleEl.textContent = `
            @keyframes fail-bg-shake {
                0% { transform: translate(1px, -1px) scale(1.2); }
                100% { transform: translate(-1px, 2px) scale(1.2); }
            }
            @keyframes eye-pulse {
                0% { transform: scale(0.95); filter: brightness(0.8); }
                100% { transform: scale(1.05); filter: brightness(1.2); }
            }
        `;
        document.head.appendChild(styleEl);
        document.body.appendChild(overlay);

        document.getElementById("failReasonText").textContent = reasonText + " (Провал главы!)";
        document.getElementById("btnRetryChapter").addEventListener("click", () => {
            overlay.remove();
            if (window.AppConfig) {
                window.AppConfig.setupChapterOneMode();
            }
            const env = document.getElementById("desktopEnv");
            if (env) {
                env.style.display = "flex";
                env.style.filter = "none";
            }
            if (window.initChapterOne) {
                window.initChapterOne();
            }
        });

        document.getElementById("btnGoToMainMenu").addEventListener("click", () => {
            overlay.remove();
            if (window.AppConfig) {
                window.AppConfig.resetToDesktopDefault();
            }
            location.reload();
        });
    };
})();

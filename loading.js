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
        overlay.style.display = "grid";
        overlay.style.gridTemplateColumns = "40% 60%";
        overlay.style.fontFamily = "Russo One, sans-serif";
        overlay.style.overflow = "hidden";

        overlay.innerHTML = `
            <div style="border-right:3px solid #ff3333; position:relative; background:repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,51,51,0.1) 15px, rgba(255,51,51,0.1) 16px);">
                <svg viewBox="0 0 100 400" style="width:100%; height:100%; stroke:#ff3333; stroke-width:4; fill:none; stroke-linecap:round; stroke-linejoin:round; opacity:0.85; animation: fail-zig-shake 0.12s infinite steps(2);">
                    <path d="M-10,20 L40,50 L5,90 L65,130 L10,180 L80,220 L25,270 L55,310 L-5,350 L45,390" />
                </svg>
            </div>
            <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; padding:40px; position:relative; background:#020000;">
                <div style="display:flex; gap:60px; margin-bottom:15px; position:relative;">
                    <div style="width:40px; height:40px; border-left:6px solid #ff3333; border-bottom:6px solid #ff3333; transform:rotate(-45deg); filter:drop-shadow(0 0 8px #ff3333);"></div>
                    <div style="width:8px; height:40px; background:#ff3333; box-shadow:0 0 12px #ff3333; animation: over-wink 2s infinite steps(1);"></div>
                </div>
                <div style="width:140px; height:30px; border-left:3px solid #ff3333; border-right:3px solid #ff3333; clip-path:polygon(0% 0%, 15% 100%, 30% 0%, 45% 100%, 60% 0%, 75% 100%, 100% 0%); background:transparent; margin-bottom:30px; filter:drop-shadow(0 0 4px #ff3333);"></div>
                <div style="color:#ff3333; font-size:2.8rem; text-transform:uppercase; letter-spacing:3px; font-weight:bold; margin-bottom:15px; text-shadow:0 0 15px #ff3333;">Game Over</div>
                <div id="failReasonText" style="color:rgba(255,51,51,0.7); font-size:0.9rem; text-align:center; max-width:420px; margin-bottom:40px; font-family:monospace; line-height:1.4;"></div>
                <div style="display:flex; flex-direction:column; gap:16px; width:100%; max-width:260px;">
                    <button id="btnRetryChapter" class="menu-btn" style="border:2px solid #00ff66; color:#00ff66; padding:12px; box-shadow:0 0 10px rgba(0,255,102,0.2); width:100%; background:transparent; font-family:Russo One; text-transform:uppercase; cursor:pointer;">Restart</button>
                    <button id="btnGoToMainMenu" class="menu-btn" style="border:2px solid #ff3333; color:#ff3333; padding:12px; box-shadow:0 0 10px rgba(255,51,51,0.2); width:100%; background:transparent; font-family:Russo One; text-transform:uppercase; cursor:pointer;">Main Menu</button>
                </div>
            </div>
        `;

        const styleEl = document.createElement("style");
        styleEl.textContent = `
            @keyframes fail-zig-shake {
                0% { transform: translate(1px, -1px); }
                100% { transform: translate(-1px, 1px); }
            }
            @keyframes over-wink {
                0%, 100% { height: 40px; margin-top: 0; }
                45%, 55% { height: 6px; margin-top: 17px; }
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

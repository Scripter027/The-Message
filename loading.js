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
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.background = "#020000";
        overlay.style.zIndex = "25000";
        overlay.style.fontFamily = "Russo One, sans-serif";
        overlay.style.overflow = "hidden";

        overlay.innerHTML = `
            <div style="position:absolute; top:0; left:0; width:35%; height:100%; border-right:3px solid #ff3333; box-shadow:5px 0 15px rgba(255,51,51,0.2); background:rgba(255,51,51,0.02); overflow:hidden;">
                <svg viewBox="0 0 100 400" preserveAspectRatio="none" style="width:100%; height:100%; stroke:#ff3333; stroke-width:5; fill:none; stroke-linecap:round; stroke-linejoin:round; animation: fail-zig-shake 0.1s infinite steps(2);">
                    <path d="M-10,10 L70,45 L15,95 L85,145 L20,195 L90,245 L15,295 L75,345 L5,385 L80,410" />
                </svg>
            </div>
            <div style="position:absolute; top:0; left:35%; width:65%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:20px;">
                <div style="position:relative; width:200px; height:180px; margin-bottom:10px; display:flex; justify-content:center;">
                    <div style="position:absolute; top:0; width:130px; height:170px; border:3px solid #ff3333; clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); background:#050000; box-shadow:0 0 25px rgba(255,51,51,0.3);"></div>
                    <div style="position:absolute; top:55px; left:52px; width:96px; height:30px; display:flex; justify-content:space-between;">
                        <div style="width:22px; height:22px; border-left:4px solid #ff3333; border-bottom:4px solid #ff3333; transform:rotate(-45deg); filter:drop-shadow(0 0 5px #ff3333);"></div>
                        <div style="width:5px; height:22px; background:#ff3333; box-shadow:0 0 10px #ff3333; animation: over-wink 2s infinite steps(1);"></div>
                    </div>
                    <div style="position:absolute; top:95px; width:70px; height:18px; border-left:3px solid #ff3333; border-right:3px solid #ff3333; border-bottom:2px solid #ff3333; clip-path:polygon(0% 0%, 15% 100%, 30% 0%, 45% 100%, 60% 0%, 75% 100%, 100% 0%); background:transparent;"></div>
                </div>
                <div style="color:#ff3333; font-size:2.5rem; text-transform:uppercase; letter-spacing:2px; font-weight:bold; margin-bottom:10px; text-shadow:0 0 15px #ff3333; text-align:center;">Game Over</div>
                <div id="failReasonText" style="color:rgba(255,51,51,0.6); font-size:0.85rem; text-align:center; max-width:400px; margin-bottom:30px; font-family:monospace; line-height:1.4;"></div>
                <div style="display:flex; flex-direction:column; gap:14px; width:100%; max-width:240px;">
                    <button id="btnRetryChapter" class="menu-btn" style="border:2px solid #00ff66; color:#00ff66; padding:10px; box-shadow:0 0 8px rgba(0,255,102,0.2); width:100%; background:transparent; font-family:Russo One; text-transform:uppercase; cursor:pointer;">Restart</button>
                    <button id="btnGoToMainMenu" class="menu-btn" style="border:2px solid #ff3333; color:#ff3333; padding:10px; box-shadow:0 0 8px rgba(255,51,51,0.2); width:100%; background:transparent; font-family:Russo One; text-transform:uppercase; cursor:pointer;">Main Menu</button>
                </div>
            </div>
        `;

        const styleEl = document.createElement("style");
        styleEl.textContent = `
            @keyframes fail-zig-shake {
                0% { transform: translate(1px, -2px); }
                100% { transform: translate(-1px, 2px); }
            }
            @keyframes over-wink {
                0%, 100% { height: 22px; margin-top: 0; }
                45%, 55% { height: 4px; margin-top: 9px; }
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

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

        const lang = document.documentElement.lang || 'ru';
        const reasonLabel = lang === 'ru' ? 'Причина:' : 'Reason:';
        const retryLabel = lang === 'ru' ? 'Переиграть' : 'Retry';
        const menuLabel = lang === 'ru' ? 'Главное меню' : 'Main Menu';

        const overlay = document.createElement("div");
        overlay.id = "failOverlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.background = "#020000";
        overlay.style.zIndex = "25000";
        overlay.style.fontFamily = "'Russo One', sans-serif";
        overlay.style.overflow = "hidden";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.justifyContent = "space-between";
        overlay.style.alignItems = "center";

        overlay.innerHTML = `
            <div style="position:absolute; inset:0; background:radial-gradient(circle, rgba(45,0,0,0.4) 0%, rgba(0,0,0,1) 82%); pointer-events:none; z-index:1;"></div>
            <div style="position:absolute; inset:0; background:repeating-linear-gradient(0deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4) 1px, transparent 1px, transparent 2px); opacity:0.8; pointer-events:none; z-index:2;"></div>

            <div style="position:relative; z-index:5; width:100%; max-width:960px; flex:1; display:flex; align-items:flex-start; justify-content:space-between; padding:35px 40px 0 40px; box-sizing:border-box;">
                <div style="width:110px; height:140px; flex-shrink:0; animation: go-glitch 3.2s infinite alternate;">
                    <svg viewBox="0 0 110 140" fill="none" style="width:100%; height:100%; filter:drop-shadow(0 0 10px rgba(255,51,51,0.75));">
                        <path d="M 18 14 L 54 126 L 92 14" stroke="#ff3333" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M 27 24 L 54 106 L 81 24" stroke="#ff3333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.55" />
                    </svg>
                </div>

                <div style="flex:1; display:flex; flex-direction:column; align-items:center; text-align:center; padding:5px 20px 0 20px;">
                    <div style="color:#ff3333; font-size:clamp(2.2rem, 5vw, 3.8rem); letter-spacing:3px; text-shadow:0 0 16px rgba(255,51,51,0.85); line-height:1.1; margin-bottom:14px; animation: go-glitch 2.8s infinite alternate;">GaMe OvEr</div>
                    <div style="color:#ff3333; font-size:1.15rem; letter-spacing:1px; margin-bottom:8px; text-shadow:0 0 8px rgba(255,51,51,0.6);">${reasonLabel}</div>
                    <div id="failReasonText" style="color:rgba(255,85,85,0.85); font-size:0.95rem; max-width:460px; line-height:1.45; min-height:42px; margin-bottom:22px; border-bottom:1px dashed rgba(255,51,51,0.3); padding-bottom:10px;"></div>
                    <div style="display:flex; flex-direction:column; gap:12px; width:100%; max-width:250px;">
                        <button id="btnRetryChapter" class="go-action-btn">${retryLabel}</button>
                        <button id="btnGoToMainMenu" class="go-action-btn">${menuLabel}</button>
                    </div>
                </div>

                <div style="width:110px; height:140px; flex-shrink:0; display:flex; justify-content:center; animation: go-glitch 3.5s infinite alternate;">
                    <svg viewBox="0 0 110 140" fill="none" style="width:100%; height:100%; filter:drop-shadow(0 0 10px rgba(255,51,51,0.75)); transform-origin:55px 70px; animation: go-eye-wink 3.6s infinite steps(1);">
                        <path d="M 56 12 L 52 128" stroke="#ff3333" stroke-width="7" stroke-linecap="round" />
                        <path d="M 65 28 L 57 62" stroke="#ff3333" stroke-width="3" stroke-linecap="round" stroke-opacity="0.75" />
                    </svg>
                </div>
            </div>

            <div style="position:relative; z-index:4; width:100%; height:34vh; min-height:160px; max-height:270px; pointer-events:none; margin-top:-15px; animation: go-lurk-pulse 6s infinite ease-in-out;">
                <svg viewBox="0 0 1000 260" preserveAspectRatio="none" fill="none" style="width:100%; height:100%;">
                    <path d="M 55 18 L 118 112 L 155 135 L 182 192 L 218 152 L 258 214 L 302 168 L 348 228 L 398 180 L 450 236 L 500 184 L 550 236 L 602 180 L 652 228 L 698 168 L 742 214 L 782 152 L 818 192 L 845 135 L 882 112 L 945 18 L 868 122 L 828 165 L 775 202 L 710 226 L 635 240 L 500 246 L 365 240 L 290 226 L 225 202 L 172 165 L 132 122 Z" stroke="#520808" stroke-width="2.2" stroke-linejoin="miter" fill="rgba(28, 2, 2, 0.28)" />
                    <path d="M 48 12 L 135 128 L 220 198 L 350 238 L 500 245 L 650 238 L 780 198 L 865 128 L 952 12" stroke="#7a0d0d" stroke-width="1.8" stroke-linecap="round" stroke-opacity="0.65" />
                </svg>
            </div>
        `;

        if (!document.getElementById("gameOverCustomStyles")) {
            const styleEl = document.createElement("style");
            styleEl.id = "gameOverCustomStyles";
            styleEl.textContent = `
                .go-action-btn {
                    background: rgba(15, 0, 0, 0.88);
                    border: 2px solid #ff3333;
                    color: #ff3333;
                    padding: 11px 18px;
                    width: 100%;
                    font-family: 'Russo One', sans-serif;
                    font-size: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    box-shadow: 0 0 10px rgba(255, 51, 51, 0.25);
                }
                .go-action-btn:hover {
                    background: #ff3333;
                    color: #000;
                    box-shadow: 0 0 22px #ff3333;
                }
                .go-action-btn:active {
                    transform: scale(0.97);
                }
                @keyframes go-lurk-pulse {
                    0%, 100% { opacity: 0.22; }
                    45% { opacity: 0.34; }
                    50% { opacity: 0.52; }
                    55% { opacity: 0.26; }
                }
                @keyframes go-eye-wink {
                    0%, 91%, 100% { transform: scaleY(1); }
                    94%, 97% { transform: scaleY(0.08); }
                }
                @keyframes go-glitch {
                    0%, 93%, 100% { transform: translate(0); }
                    95% { transform: translate(-2px, 1px); }
                    98% { transform: translate(2px, -1px); }
                }
                @media (max-height: 540px) {
                    #failOverlay > div:nth-child(3) {
                        padding-top: 15px !important;
                    }
                    #failOverlay > div:nth-child(4) {
                        height: 28vh !important;
                        min-height: 120px !important;
                    }
                }
            `;
            document.head.appendChild(styleEl);
        }

        document.body.appendChild(overlay);

        document.getElementById("failReasonText").textContent = reasonText;

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
            const env = document.getElementById("desktopEnv");
            if (env) {
                env.style.display = "none";
                env.classList.remove("visible");
                env.classList.add("hidden");
            }
            window.triggerLoading(() => {
                const mainMenu = document.getElementById("mainMenu");
                if (mainMenu) {
                    mainMenu.classList.remove("hidden");
                    setTimeout(() => mainMenu.classList.add("visible"), 50);
                }
            });
        });
    };
})();

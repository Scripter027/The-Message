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
        if (window.YandexModule) {
            window.YandexModule.stopGameplay();
        }

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
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity 0.7s ease-in-out";

        overlay.innerHTML = `
            <div style="position:absolute; inset:0; background:radial-gradient(circle, rgba(45,0,0,0.38) 0%, rgba(0,0,0,1) 82%); pointer-events:none; z-index:1;"></div>
            <div style="position:absolute; inset:0; background:repeating-linear-gradient(0deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4) 1px, transparent 1px, transparent 2px); opacity:0.8; pointer-events:none; z-index:2;"></div>

            <div style="position:absolute; top:32px; left:40px; width:105px; height:135px; pointer-events:none; z-index:4; animation: go-glitch 3.2s infinite alternate;">
                <svg viewBox="0 0 110 140" fill="none" style="width:100%; height:100%; filter:drop-shadow(0 0 10px rgba(255,51,51,0.75));">
                    <path d="M 18 14 L 54 126 L 92 14" stroke="#ff3333" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M 27 24 L 54 106 L 81 24" stroke="#ff3333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.55" />
                </svg>
            </div>

            <div style="position:absolute; top:32px; right:40px; width:105px; height:135px; pointer-events:none; z-index:4; animation: go-glitch 3.5s infinite alternate;">
                <svg viewBox="0 0 110 140" fill="none" style="width:100%; height:100%; filter:drop-shadow(0 0 10px rgba(255,51,51,0.75)); transform-origin:55px 70px; animation: go-eye-wink 3.6s infinite steps(1);">
                    <path d="M 56 12 L 52 128" stroke="#ff3333" stroke-width="7" stroke-linecap="round" />
                    <path d="M 65 28 L 57 62" stroke="#ff3333" stroke-width="3" stroke-linecap="round" stroke-opacity="0.75" />
                </svg>
            </div>

            <div style="position:relative; z-index:6; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px; max-width:520px; width:100%;">
                <div style="color:#ff3333; font-size:clamp(2.3rem, 5vw, 3.8rem); letter-spacing:3px; text-shadow:0 0 16px rgba(255,51,51,0.85); line-height:1.1; margin-bottom:14px; animation: go-glitch 2.8s infinite alternate;">GaMe OvEr</div>
                <div style="color:#ff3333; font-size:1.15rem; letter-spacing:1px; margin-bottom:8px; text-shadow:0 0 8px rgba(255,51,51,0.6);">${reasonLabel}</div>
                <div id="failReasonText" style="color:rgba(255,85,85,0.88); font-size:0.95rem; max-width:460px; line-height:1.45; min-height:42px; margin-bottom:24px; border-bottom:1px dashed rgba(255,51,51,0.3); padding-bottom:10px;"></div>
                <div style="display:flex; flex-direction:column; gap:12px; width:100%; max-width:250px;">
                    <button id="btnRetryChapter" class="go-action-btn">${retryLabel}</button>
                    <button id="btnGoToMainMenu" class="go-action-btn">${menuLabel}</button>
                </div>
            </div>

            <div style="position:absolute; bottom:0; left:0; width:100%; height:36vh; min-height:170px; max-height:290px; pointer-events:none; z-index:3; animation: go-lurk-pulse 6s infinite ease-in-out;">
                <svg viewBox="0 0 1000 280" preserveAspectRatio="none" fill="none" style="width:100%; height:100%;">
                    <path d="M 48 16 L 135 112 L 220 164 L 350 192 L 500 198 L 650 192 L 780 164 L 865 112 L 952 16 L 872 128 L 785 198 L 650 246 L 500 256 L 350 246 L 215 198 L 128 128 Z" fill="rgba(22, 2, 2, 0.34)" stroke="#520808" stroke-width="1.8" stroke-linejoin="miter" />
                    <path d="M 110 86 L 146 154 L 182 138 L 218 202 L 258 172 L 302 228 L 348 188 L 398 242 L 450 194 L 500 248 L 550 194 L 602 242 L 652 188 L 698 228 L 742 172 L 782 202 L 818 138 L 854 154 L 890 86" stroke="#680a0a" stroke-width="2" stroke-linejoin="miter" fill="rgba(35, 3, 3, 0.25)" />
                    <path d="M 118 118 L 155 142 L 182 198 L 218 162 L 258 222 L 302 182 L 348 238 L 398 194 L 450 248 L 500 202 L 550 248 L 602 194 L 652 238 L 698 182 L 742 222 L 782 162 L 818 198 L 845 142 L 882 118" stroke="#680a0a" stroke-width="2" stroke-linejoin="miter" fill="rgba(35, 3, 3, 0.25)" />
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
                .win-action-btn {
                    background: rgba(0, 18, 5, 0.88);
                    border: 2px solid #00ff66;
                    color: #00ff66;
                    padding: 11px 18px;
                    width: 100%;
                    font-family: 'Russo One', sans-serif;
                    font-size: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    box-shadow: 0 0 10px rgba(0, 255, 102, 0.25);
                }
                .win-action-btn:hover {
                    background: #00ff66;
                    color: #000;
                    box-shadow: 0 0 22px #00ff66;
                }
                .win-action-btn:active {
                    transform: scale(0.97);
                }
                @keyframes go-lurk-pulse {
                    0%, 100% { opacity: 0.24; }
                    45% { opacity: 0.36; }
                    50% { opacity: 0.54; }
                    55% { opacity: 0.28; }
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
                @media (max-width: 768px) {
                    #failOverlay > div:nth-child(3),
                    #failOverlay > div:nth-child(4),
                    #chapterWinOverlay > div:nth-child(3),
                    #chapterWinOverlay > div:nth-child(4) {
                        width: 70px !important;
                        height: 90px !important;
                        top: 18px !important;
                    }
                    #failOverlay > div:nth-child(3),
                    #chapterWinOverlay > div:nth-child(3) { left: 18px !important; }
                    #failOverlay > div:nth-child(4),
                    #chapterWinOverlay > div:nth-child(4) { right: 18px !important; }
                }
                @media (max-height: 540px) {
                    #failOverlay > div:nth-child(6),
                    #chapterWinOverlay > div:nth-child(6) {
                        height: 28vh !important;
                        min-height: 120px !important;
                    }
                }
            `;
            document.head.appendChild(styleEl);
        }

        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.style.opacity = "1";
            });
        });

        document.getElementById("failReasonText").textContent = reasonText;

        document.getElementById("btnRetryChapter").addEventListener("click", () => {
            overlay.style.opacity = "0";
            setTimeout(() => {
                overlay.remove();
                if (window.AppConfig) {
                    window.AppConfig.setupChapterOneMode();
                }
                const env = document.getElementById("desktopEnv");
                if (env) {
                    env.style.display = "flex";
                    env.style.filter = "none";
                }
                if (window.YandexModule) {
                    window.YandexModule.startGameplay();
                }
                if (window.initChapterOne) {
                    window.initChapterOne();
                }
            }, 400);
        });

        document.getElementById("btnGoToMainMenu").addEventListener("click", () => {
            overlay.style.opacity = "0";
            setTimeout(() => {
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
                const goMenu = () => {
                    window.triggerLoading(() => {
                        const mainMenu = document.getElementById("mainMenu");
                        if (mainMenu) {
                            mainMenu.classList.remove("hidden");
                            setTimeout(() => mainMenu.classList.add("visible"), 50);
                        }
                    });
                };
                if (window.YandexModule) {
                    window.YandexModule.showAd(goMenu);
                } else {
                    goMenu();
                }
            }, 400);
        });
    };
    window.triggerChapterCompleteScreen = function(chapterNum, subtitleText) {
        if (window.YandexModule) {
            window.YandexModule.stopGameplay();
        }

        const oldWin = document.getElementById("chapterWinOverlay");
        if (oldWin) oldWin.remove();

        const lang = document.documentElement.lang || 'ru';
        const titleText = lang === 'ru' ? `ГЛАВА ${chapterNum} ПРОЙДЕНА` : `CHAPTER ${chapterNum} COMPLETE`;
        const menuLabel = lang === 'ru' ? 'Главное меню' : 'Main Menu';

        const overlay = document.createElement("div");
        overlay.id = "chapterWinOverlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.background = "#000501";
        overlay.style.zIndex = "25000";
        overlay.style.fontFamily = "'Russo One', sans-serif";
        overlay.style.overflow = "hidden";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity 0.7s ease-in-out";

        overlay.innerHTML = `
            <div style="position:absolute; inset:0; background:radial-gradient(circle, rgba(0,55,20,0.42) 0%, rgba(0,0,0,1) 82%); pointer-events:none; z-index:1;"></div>
            <div style="position:absolute; inset:0; background:repeating-linear-gradient(0deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4) 1px, transparent 1px, transparent 2px); opacity:0.8; pointer-events:none; z-index:2;"></div>

            <div style="position:absolute; top:32px; left:40px; width:105px; height:135px; pointer-events:none; z-index:4; animation: go-glitch 3.2s infinite alternate;">
                <svg viewBox="0 0 110 140" fill="none" style="width:100%; height:100%; filter:drop-shadow(0 0 10px rgba(0,255,102,0.75));">
                    <path d="M 18 14 L 54 126 L 92 14" stroke="#00ff66" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M 27 24 L 54 106 L 81 24" stroke="#00ff66" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.55" />
                </svg>
            </div>

            <div style="position:absolute; top:32px; right:40px; width:105px; height:135px; pointer-events:none; z-index:4; animation: go-glitch 3.5s infinite alternate;">
                <svg viewBox="0 0 110 140" fill="none" style="width:100%; height:100%; filter:drop-shadow(0 0 10px rgba(0,255,102,0.75)); transform-origin:55px 70px; animation: go-eye-wink 3.6s infinite steps(1);">
                    <path d="M 56 12 L 52 128" stroke="#00ff66" stroke-width="7" stroke-linecap="round" />
                    <path d="M 65 28 L 57 62" stroke="#00ff66" stroke-width="3" stroke-linecap="round" stroke-opacity="0.75" />
                </svg>
            </div>

            <div style="position:relative; z-index:6; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px; max-width:540px; width:100%;">
                <div style="color:#00ff66; font-size:clamp(2rem, 4.5vw, 3.3rem); letter-spacing:3px; text-shadow:0 0 16px rgba(0,255,102,0.85); line-height:1.15; margin-bottom:16px; animation: go-glitch 2.8s infinite alternate;">${titleText}</div>
                <div style="color:rgba(0,255,102,0.88); font-size:1rem; max-width:460px; line-height:1.45; min-height:42px; margin-bottom:26px; border-bottom:1px dashed rgba(0,255,102,0.35); padding-bottom:12px;">${subtitleText}</div>
                <div style="display:flex; flex-direction:column; gap:12px; width:100%; max-width:250px;">
                    <button id="btnWinMainMenu" class="win-action-btn">${menuLabel}</button>
                </div>
            </div>

            <div style="position:absolute; bottom:0; left:0; width:100%; height:36vh; min-height:170px; max-height:290px; pointer-events:none; z-index:3; animation: go-lurk-pulse 6s infinite ease-in-out;">
                <svg viewBox="0 0 1000 280" preserveAspectRatio="none" fill="none" style="width:100%; height:100%;">
                    <path d="M 48 16 L 135 112 L 220 164 L 350 192 L 500 198 L 650 192 L 780 164 L 865 112 L 952 16 L 872 128 L 785 198 L 650 246 L 500 256 L 350 246 L 215 198 L 128 128 Z" fill="rgba(2, 26, 8, 0.36)" stroke="#074d1e" stroke-width="1.8" stroke-linejoin="miter" />
                    <path d="M 110 86 L 146 154 L 182 138 L 218 202 L 258 172 L 302 228 L 348 188 L 398 242 L 450 194 L 500 248 L 550 194 L 602 242 L 652 188 L 698 228 L 742 172 L 782 202 L 818 138 L 854 154 L 890 86" stroke="#0a6b29" stroke-width="2" stroke-linejoin="miter" fill="rgba(4, 38, 14, 0.25)" />
                    <path d="M 118 118 L 155 142 L 182 198 L 218 162 L 258 222 L 302 182 L 348 238 L 398 194 L 450 248 L 500 202 L 550 248 L 602 194 L 652 238 L 698 182 L 742 222 L 782 162 L 818 198 L 845 142 L 882 118" stroke="#0a6b29" stroke-width="2" stroke-linejoin="miter" fill="rgba(4, 38, 14, 0.25)" />
                </svg>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.style.opacity = "1";
            });
        });

        document.getElementById("btnWinMainMenu").addEventListener("click", () => {
            overlay.style.opacity = "0";
            setTimeout(() => {
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
                const goMenu = () => {
                    window.triggerLoading(() => {
                        const mainMenu = document.getElementById("mainMenu");
                        if (mainMenu) {
                            mainMenu.classList.remove("hidden");
                            setTimeout(() => mainMenu.classList.add("visible"), 50);
                        }
                    });
                };
                if (window.YandexModule) {
                    window.YandexModule.showAd(goMenu);
                } else {
                    goMenu();
                }
            }, 400);
        });
    };
})();

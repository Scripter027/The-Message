(function() {
    let currentStage = "start";
    let selectedUser = null;
    let notifyTimeout = null;
    let typingTimeout = null;
    let hackerTypeInterval = null;
    let isTyping = false;
    let isChapterOneActive = false;

    const storyState = {
        dinoTaskReceived: false,
        dinoScoreBeaten: false,
        unreadBro: 1,
        unreadHacker: 0,
        pinnedNotice: true
    };

    window.canPlayDino = function() {
        if (!isChapterOneActive) return true;
        return storyState.dinoTaskReceived;
    };

    function getCurrentTimeStr() {
        const now = new Date();
        return String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0');
    }

    window.initChapterOne = function() {
        isChapterOneActive = true;
        currentStage = "start";
        selectedUser = null;
        isTyping = false;
        storyState.dinoTaskReceived = false;
        storyState.dinoScoreBeaten = false;
        storyState.unreadBro = 1;
        storyState.unreadHacker = 0;
        storyState.pinnedNotice = true;

        if (typingTimeout) clearTimeout(typingTimeout);
        if (hackerTypeInterval) clearInterval(hackerTypeInterval);

        const hackerOverlay = document.getElementById("hackerOverlay");
        if (hackerOverlay) {
            hackerOverlay.classList.remove("visible");
            hackerOverlay.style.display = "none";
        }

        const crashOverlay = document.getElementById("systemCrashOverlay");
        if (crashOverlay) crashOverlay.remove();

        document.querySelectorAll('.desktop-window').forEach(w => w.classList.add('hidden'));

        if (window.AppConfig) {
            window.AppConfig.setupChapterOneMode();
            window.AppConfig.save();
        }
        
        const checkVisible = () => {
            const mainZone = document.querySelector(".desktop-main");
            if (mainZone && mainZone.clientWidth > 0) {
                if (window.renderDesktopIcons) window.renderDesktopIcons();
                createMessWindow();
                createDinoGameWindow();
                createHackerOverlay();
                setTimeout(() => {
                    showMessNotification("Бро", "Хей, Айв! Как дела? Все еще за уроками сидишь?");
                }, 1200);
            } else {
                setTimeout(checkVisible, 200);
            }
        };
        checkVisible();
    };

    function showMessNotification(from, text) {
        const oldNotify = document.getElementById("activeMessNotify");
        if (oldNotify) oldNotify.remove();
        if (notifyTimeout) clearTimeout(notifyTimeout);

        const notify = document.createElement("div");
        notify.id = "activeMessNotify";
        notify.style.position = "fixed";
        notify.style.bottom = "60px";
        notify.style.right = "20px";
        notify.style.background = "#000";
        notify.style.border = "2px solid #00ff66";
        notify.style.padding = "12px 16px";
        notify.style.color = "#00ff66";
        notify.style.fontFamily = "Russo One, sans-serif";
        notify.style.zIndex = "10000";
        notify.style.cursor = "pointer";
        notify.style.boxShadow = "0 0 12px #00ff66";
        notify.innerHTML = `<div style="font-weight:bold; text-shadow:0 0 5px #00ff66; margin-bottom:4px;">${from}</div><div style="font-size:0.85rem;">${text}</div>`;
        
        notify.addEventListener("click", () => {
            notify.remove();
            window.openApplicationWindow("messenger");
        });
        document.body.appendChild(notify);
        notifyTimeout = setTimeout(() => { if (notify.parentNode) notify.remove(); }, 6000);
    }

    function createMessWindow() {
        if (document.getElementById("windowMessenger")) return;
        const mainZone = document.querySelector(".desktop-main");
        if (!mainZone) return;
        
        const win = document.createElement("div");
        win.id = "windowMessenger";
        win.classList.add("desktop-window", "hidden");
        win.style.width = "560px";
        win.style.height = "410px";

        win.innerHTML = `
            <div class="window-header">
                <span class="window-title">Mess</span>
                <button class="window-close-btn" id="btnCloseMessenger">X</button>
            </div>
            <div class="window-content" style="flex-direction:row; padding:0; height:calc(100% - 35px); gap:0;">
                <div style="width:36%; border-right:1px solid rgba(0,255,102,0.25); background:rgba(0,5,0,0.75); display:flex; flex-direction:column;">
                    <div style="padding:8px 10px; border-bottom:1px solid rgba(0,255,102,0.2); display:flex; align-items:center; justify-content:space-between; color:#00ff66; font-size:0.8rem;">
                        <span>☰ Чаты</span>
                        <span style="opacity:0.6; font-size:0.7rem;">v2.4</span>
                    </div>
                    <div id="messUserList" style="flex:1; overflow-y:auto; color:#00ff66; font-size:0.85rem; cursor:pointer;"></div>
                </div>
                <div id="messChatZone" style="width:64%; background:rgba(0,0,0,0.95); display:flex; flex-direction:column; justify-content:space-between; position:relative;"></div>
            </div>
        `;
        mainZone.appendChild(win);
        document.getElementById("btnCloseMessenger").addEventListener("click", () => {
            win.classList.add("hidden");
        });
        if (window.makeWindowDraggable) window.makeWindowDraggable(win);
    }
    window.openApplicationWindow = (originalOpen => {
        return function(appId) {
            if (appId === "messenger") {
                const win = document.getElementById("windowMessenger");
                if (win) {
                    win.classList.remove("hidden");
                    renderMess();
                    if (window.bringToFront) window.bringToFront(win);
                }
                return;
            }
            if (appId === "dino") {
                if (window.canPlayDino && !window.canPlayDino()) {
                    showMessNotification("Система", "Сначала проверьте сообщения в Mess и получите задание!");
                    return;
                }
                if (!document.getElementById("windowDino")) createDinoGameWindow();
                const win = document.getElementById("windowDino");
                if (win) {
                    win.classList.remove("hidden");
                    if (window.bringToFront) window.bringToFront(win);
                    if (window.initDinoGame) window.initDinoGame();
                }
                return;
            }
            if (originalOpen) originalOpen(appId);
        };
    })(window.openApplicationWindow);

    function triggerFail(reasonText) {
        isChapterOneActive = false;
        if (window.triggerGameOverScreen) {
            window.triggerGameOverScreen(reasonText);
        }
    }

    function renderMess() {
        const userList = document.getElementById("messUserList");
        const chatZone = document.getElementById("messChatZone");
        if (!userList || !chatZone) return;
        userList.innerHTML = "";
        
        const broItem = document.createElement("div");
        broItem.style.padding = "10px";
        broItem.style.borderBottom = "1px solid rgba(0,255,102,0.12)";
        broItem.style.color = "#00ff66";
        broItem.style.display = "flex";
        broItem.style.justifyContent = "space-between";
        broItem.style.alignItems = "center";
        broItem.style.gap = "6px";
        if (selectedUser === "bro") {
            broItem.style.background = "rgba(0,255,102,0.18)";
            storyState.unreadBro = 0;
        }

        const broPreview = isTyping && selectedUser === "bro" ? "печатает..." : (currentStage === "bro_record" ? "Мой рекорд 1000!..." : "Хей, Айв! Как дела?...");
        broItem.innerHTML = `
            <div style="overflow:hidden; flex:1;">
                <div style="font-weight:bold; display:flex; align-items:center; gap:5px;">
                    <span style="display:inline-block; width:7px; height:7px; background:#00ff66; border-radius:50%; box-shadow:0 0 5px #00ff66;"></span>
                    <span>Бро</span>
                </div>
                <div style="font-size:0.72rem; opacity:${isTyping && selectedUser === "bro" ? "1" : "0.6"}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">${broPreview}</div>
            </div>
            ${storyState.unreadBro > 0 ? `<div style="background:#00ff66; color:#000; font-size:0.7rem; padding:2px 6px; font-weight:bold;">${storyState.unreadBro}</div>` : ""}
        `;
        
        broItem.addEventListener("click", () => {
            selectedUser = "bro";
            storyState.unreadBro = 0;
            renderMess();
        });
        userList.appendChild(broItem);

        if (storyState.dinoScoreBeaten) {
            const hackerItem = document.createElement("div");
            hackerItem.style.padding = "10px";
            hackerItem.style.borderBottom = "1px solid rgba(255,51,51,0.18)";
            hackerItem.style.color = "#ff3333";
            hackerItem.style.display = "flex";
            hackerItem.style.justifyContent = "space-between";
            hackerItem.style.alignItems = "center";
            hackerItem.style.gap = "6px";
            if (selectedUser === "hacker") {
                hackerItem.style.background = "rgba(255,51,51,0.18)";
                storyState.unreadHacker = 0;
            }
            hackerItem.innerHTML = `
                <div style="overflow:hidden; flex:1;">
                    <div style="font-weight:bold;">❓ ???</div>
                    <div style="font-size:0.72rem; opacity:0.7; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">Хочешь помогу...</div>
                </div>
                ${storyState.unreadHacker > 0 ? `<div style="background:#ff3333; color:#000; font-size:0.7rem; padding:2px 6px; font-weight:bold;">${storyState.unreadHacker}</div>` : ""}
            `;
            
            hackerItem.addEventListener("click", () => {
                selectedUser = "hacker";
                storyState.unreadHacker = 0;
                renderMess();
            });
            userList.appendChild(hackerItem);
        }

        if (!selectedUser) {
            chatZone.innerHTML = `<div style="color:rgba(0,255,102,0.45); text-align:center; margin:auto; font-size:0.8rem; max-width:85%; padding:15px; border:1px dashed rgba(0,255,102,0.25);">Выберите чат слева, чтобы начать общение.<br><br>Mess был обновлен и все старые истории были стерты.</div>`;
            return;
        }

        if (selectedUser === "bro") {
            renderBroChat(chatZone);
        } else if (selectedUser === "hacker") {
            renderHackerChat(chatZone);
        }
    }
    function triggerBroReply(nextStage) {
        isTyping = true;
        renderMess();
        if (typingTimeout) clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            isTyping = false;
            currentStage = nextStage;
            if (nextStage === "bro_record") {
                storyState.dinoTaskReceived = true;
            }
            if (selectedUser !== "bro") {
                storyState.unreadBro = 1;
            }
            renderMess();
        }, 900);
    }

    function renderBroChat(zone) {
        const statusText = isTyping ? "печатает..." : "в сети";
        const showPin = storyState.dinoTaskReceived && storyState.pinnedNotice;
        zone.innerHTML = `
            <div style="padding:8px 12px; border-bottom:1px solid rgba(0,255,102,0.25); display:flex; justify-content:space-between; align-items:center; background:rgba(0,15,0,0.6);">
                <div>
                    <div style="color:#00ff66; font-weight:bold; font-size:0.9rem; text-shadow:0 0 3px #00ff66;">👦 Бро</div>
                    <div style="color:#00ff66; font-size:0.7rem; opacity:${isTyping ? "1" : "0.65"};">${statusText}</div>
                </div>
                <button id="btnMessBack" style="background:transparent; border:1px solid rgba(0,255,102,0.4); color:#00ff66; padding:3px 8px; font-family:'Russo One', sans-serif; font-size:0.7rem; cursor:pointer;">Назад</button>
            </div>
            ${showPin ? `
            <div id="messPinnedBar" style="padding:5px 10px; background:rgba(0,255,102,0.08); border-bottom:1px solid rgba(0,255,102,0.2); display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; color:#00ff66;">
                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">📌 Закреплено: Цель — 1000 очков в Dino</span>
                <span id="closePinBtn" style="cursor:pointer; padding-left:8px; opacity:0.7;">✕</span>
            </div>` : ""}
            <div id="messLogs" style="flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:10px;"></div>
            <div id="messOptions" style="padding:8px 10px; display:flex; flex-direction:column; gap:6px; border-top:1px solid rgba(0,255,102,0.2); background:rgba(0,10,0,0.8);"></div>
        `;

        const backBtn = document.getElementById("btnMessBack");
        if (backBtn) {
            backBtn.addEventListener("click", () => {
                selectedUser = null;
                renderMess();
            });
        }

        const closePin = document.getElementById("closePinBtn");
        if (closePin) {
            closePin.addEventListener("click", () => {
                storyState.pinnedNotice = false;
                renderMess();
            });
        }

        const msgContainer = document.getElementById("messLogs");
        const optContainer = document.getElementById("messOptions");
        const timeStr = getCurrentTimeStr();

        if (currentStage === "start") {
            appendMessLog(msgContainer, "Бро", "Хей, Айв! Как дела? Все еще за уроками сидишь?", false, timeStr);
            if (!isTyping) {
                createMessOption(optContainer, "1. Отвали", () => triggerFail("Бро обиделся и перестал писать. Вы остались делать уроки."));
                createMessOption(optContainer, "2. Да, а что?", () => triggerBroReply("bro_dino"));
                createMessOption(optContainer, "3. Ты кто?", () => triggerFail("Бро подумал, что вы сошли с ума, и заблокировал вас."));
            }
        } else if (currentStage === "bro_dino") {
            appendMessLog(msgContainer, "Бро", "Хей, Айв! Как дела? Все еще за уроками сидишь?", false, timeStr);
            appendMessLog(msgContainer, "Вы", "Да, а что?", true, timeStr);
            if (!isTyping) {
                appendMessLog(msgContainer, "Бро", "Да хватит тухнуть! Давай ка мы на секунду представим, что ты не дорожишь званием «умника школы» и твои родители не ругают тебя за плохие оценки! Попробуй побить рекорд в динозаврике! Ты ведь его не удалил?", false, timeStr);
                createMessOption(optContainer, "1. Ты кто?", () => triggerFail("Бро решил не общаться с шутником."));
                createMessOption(optContainer, "2. Отвали, я хочу доделать уроки!", () => triggerFail("Вы зарылись в учебники и проиграли жизнь."));
                createMessOption(optContainer, "3. Черт, кажись удалил! Я хотел чтобы родители думали что я только занимаюсь учебой на этом компе. Ладно, завтра сделаю уроки. Какой там рекорд?", () => triggerBroReply("bro_record"));
            }
        } else if (currentStage === "bro_record") {
            appendMessLog(msgContainer, "Вы", "Черт, кажись удалил! Я хотел чтобы родители думали что я только занимаюсь учебой на этом компе. Ладно, завтра сделаю уроки. Какой там рекорд?", true, timeStr);
            if (!isTyping) {
                appendMessLog(msgContainer, "Бро", "Вот он! Старый добрый Айв! Мой рекорд 1000! Сможешь побить? Или не сможешь нажать на пробел когда надо? Ха-ха!", false, timeStr);
                
                const hint = document.createElement("div");
                hint.style.color = "#ffaa00";
                hint.style.textAlign = "center";
                hint.style.fontSize = "0.78rem";
                hint.style.marginTop = "6px";
                hint.style.padding = "6px";
                hint.style.border = "1px dashed #ffaa00";
                hint.textContent = "[Задание: Зайдите в Магазин и скачайте Динозаврика]";
                msgContainer.appendChild(hint);
            }
        }
    }
    function appendMessLog(container, sender, text, isOut, timeStr) {
        const msg = document.createElement("div");
        msg.style.maxWidth = "82%";
        msg.style.padding = "7px 11px";
        msg.style.fontSize = "0.82rem";
        msg.style.lineHeight = "1.4";
        msg.style.border = "1px solid " + (isOut ? "#00ff66" : "rgba(0,255,102,0.35)");
        msg.style.background = isOut ? "rgba(0,255,102,0.12)" : "rgba(0,12,0,0.6)";
        msg.style.color = "#00ff66";
        msg.style.alignSelf = isOut ? "flex-end" : "flex-start";
        const ticks = isOut ? ` <span style="font-size:0.68rem;">✓✓</span>` : "";
        msg.innerHTML = `
            <span style="font-weight:bold; display:block; margin-bottom:2px; font-size:0.75rem; opacity:0.85;">${sender}</span>
            <div>${text}</div>
            <div style="text-align:right; font-size:0.65rem; opacity:0.65; margin-top:4px;">${timeStr || "00:00"}${ticks}</div>
        `;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    function createMessOption(parent, text, callback) {
        const btn = document.createElement("button");
        btn.style.background = "transparent";
        btn.style.border = "1px solid #00ff66";
        btn.style.color = "#00ff66";
        btn.style.padding = "7px 9px";
        btn.style.textAlign = "left";
        btn.style.cursor = "pointer";
        btn.style.fontFamily = "Russo One, sans-serif";
        btn.style.fontSize = "0.78rem";
        btn.textContent = text;
        btn.addEventListener("click", callback);
        parent.appendChild(btn);
    }

    function createDinoGameWindow() {
        if (document.getElementById("windowDino")) return;
        const mainZone = document.querySelector(".desktop-main");
        const win = document.createElement("div");
        win.id = "windowDino";
        win.classList.add("desktop-window", "hidden");
        win.style.width = "480px";
        win.style.height = "250px";
        win.innerHTML = `
            <div class="window-header"><span class="window-title">Dino Game</span><button class="window-close-btn" id="btnCloseDino">X</button></div>
            <div class="window-content" style="padding:8px; background:#000; overflow:hidden; position:relative;">
                <canvas id="dinoCanvas" style="display:block; width:100%; height:150px; background:#000;"></canvas>
                <div id="dino-over-box" style="text-align:center; margin-top:5px; font-family:Russo One; min-height:18px;"></div>
            </div>
        `;
        mainZone.appendChild(win);
        document.getElementById("btnCloseDino").addEventListener("click", () => win.classList.add("hidden"));
        if (window.makeWindowDraggable) window.makeWindowDraggable(win);
    }

    window.triggerDinoScoreBeaten = function() {
        if (storyState.dinoScoreBeaten) return;
        storyState.dinoScoreBeaten = true;
        storyState.unreadHacker = 1;
        selectedUser = "hacker";
        renderMess();
        showMessNotification("???", "Хочешь помогу побить рекорд? Свяжись со мной");
    };

    function triggerErrorSequence() {
        const dinoWin = document.getElementById("windowDino");
        if (dinoWin) dinoWin.classList.add("hidden");
        const messWin = document.getElementById("windowMessenger");
        if (messWin) messWin.classList.add("hidden");

        const crash = document.createElement("div");
        crash.id = "systemCrashOverlay";

        const particlesLayer = document.createElement("div");
        particlesLayer.className = "crash-particles-layer";

        const colors = ["#ff3333", "#00ff66", "#ffffff", "#ffaa00"];
        for (let i = 0; i < 65; i++) {
            const p = document.createElement("div");
            p.className = "crash-particle";
            p.style.left = Math.random() * 100 + "vw";
            p.style.top = Math.random() * 100 + "vh";
            p.style.width = (Math.random() * 24 + 4) + "px";
            p.style.height = (Math.random() * 14 + 3) + "px";
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.animationDelay = (Math.random() * 0.25) + "s";
            particlesLayer.appendChild(p);
        }

        const errText = document.createElement("div");
        errText.className = "crash-error-text";
        errText.textContent = "ERROR";

        crash.appendChild(particlesLayer);
        crash.appendChild(errText);
        document.body.appendChild(crash);

        const particleShuffle = setInterval(() => {
            particlesLayer.querySelectorAll(".crash-particle").forEach(p => {
                p.style.left = Math.random() * 100 + "vw";
                p.style.top = Math.random() * 100 + "vh";
            });
            errText.style.opacity = Math.random() > 0.25 ? "1" : "0.15";
        }, 120);

        setTimeout(() => {
            clearInterval(particleShuffle);
            crash.remove();

            const env = document.getElementById("desktopEnv");
            if (env) env.style.display = "none";

            setTimeout(() => {
                const overlay = document.getElementById("hackerOverlay");
                if (overlay) {
                    overlay.style.opacity = "0";
                    overlay.style.display = "flex";
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            overlay.classList.add("visible");
                            overlay.style.opacity = "1";
                        });
                    });
                    setTimeout(() => {
                        runHackerDialog("start");
                    }, 900);
                }
            }, 1400);
        }, 2200);
    }
    function renderHackerChat(zone) {
        const timeStr = getCurrentTimeStr();
        zone.innerHTML = `
            <div style="padding:8px 12px; border-bottom:1px solid #ff3333; display:flex; justify-content:space-between; align-items:center; background:rgba(25,0,0,0.7);">
                <div>
                    <div style="color:#ff3333; font-weight:bold; font-size:0.9rem;">❓ ???</div>
                    <div style="color:#ff3333; font-size:0.7rem; opacity:0.75;">был(а) только что</div>
                </div>
                <button id="btnHackerBack" style="background:transparent; border:1px solid rgba(255,51,51,0.5); color:#ff3333; padding:3px 8px; font-family:'Russo One', sans-serif; font-size:0.7rem; cursor:pointer;">Назад</button>
            </div>
            <div id="messHackerLogs" style="flex:1; overflow-y:auto; padding:15px; display:flex; flex-direction:column; gap:12px;"></div>
        `;
        const backBtn = document.getElementById("btnHackerBack");
        if (backBtn) {
            backBtn.addEventListener("click", () => {
                selectedUser = null;
                renderMess();
            });
        }

        const container = document.getElementById("messHackerLogs");
        const msg = document.createElement("div");
        msg.style.maxWidth = "82%";
        msg.style.padding = "8px 12px";
        msg.style.fontSize = "0.85rem";
        msg.style.border = "1px solid #ff3333";
        msg.style.background = "rgba(30,0,0,0.45)";
        msg.style.color = "#ff3333";
        msg.innerHTML = `
            <span style="font-weight:bold; display:block; margin-bottom:2px; font-size:0.75rem;">???</span>
            <div>Хочешь помогу побить рекорд? <span id="hackerLink" style="text-decoration:underline; cursor:pointer; color:#ffaa00; font-weight:bold;">Свяжись со мной</span></div>
            <div style="text-align:right; font-size:0.65rem; opacity:0.65; margin-top:4px;">${timeStr}</div>
        `;
        container.appendChild(msg);
        
        const link = document.getElementById("hackerLink");
        if (link) {
            link.addEventListener("click", () => {
                triggerErrorSequence();
            });
        }
    }

    function createHackerOverlay() {
        if (document.getElementById("hackerOverlay")) return;
        const overlay = document.createElement("div");
        overlay.id = "hackerOverlay";
        overlay.innerHTML = `
            <div class="hacker-bg-effects"><div class="hacker-noise"></div></div>
            <div class="hacker-portrait-wrapper">
                <div class="hacker-frame">
                    <svg class="hacker-svg" viewBox="0 0 200 260" fill="none" xmlns="http://w3.org">
                        <defs>
                            <pattern id="sketchHatch" width="8" height="8" patternTransform="rotate(35 0 0)" patternUnits="userSpaceOnUse">
                                <line x1="0" y1="0" x2="0" y2="8" stroke="#ff3333" stroke-width="1.2" stroke-opacity="0.32" />
                            </pattern>
                        </defs>
                        <path d="M 32 260 L 36 165 Q 40 132 76 128 L 93 128 M 107 128 L 124 128 Q 160 132 164 165 L 168 260" stroke="#ff3333" stroke-width="3" stroke-linecap="round" />
                        <path d="M 48 165 L 46 255 M 57 175 L 56 248" stroke="#ff3333" stroke-width="2" stroke-linecap="round" />
                        <path d="M 152 165 L 154 255 M 143 175 L 144 248" stroke="#ff3333" stroke-width="2" stroke-linecap="round" />
                        <path d="M 100 136 Q 96 152 102 168 T 99 200 T 101 235" stroke="#ff3333" stroke-width="2.2" stroke-linecap="round" />
                        <path d="M 100 24 C 132 24 146 52 134 86 C 124 112 108 128 100 134 C 92 128 76 112 66 86 C 54 52 68 24 100 24 Z" fill="url(#sketchHatch)" stroke="#ff3333" stroke-width="3" stroke-linejoin="round" />
                        <path d="M 76 58 L 83 88 L 95 54" stroke="#ff3333" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
                        <g class="hacker-eye-right">
                            <path d="M 116 54 L 114 92" stroke="#ff3333" stroke-width="3.5" stroke-linecap="round" />
                            <path d="M 122 50 L 117 62" stroke="#ff3333" stroke-width="2.2" stroke-linecap="round" />
                        </g>
                        <path d="M 96 108 L 100 115 L 105 107" stroke="#ff3333" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
                <div class="hacker-caption">* дЬяВоЛ68 *</div>
            </div>
            <div class="hacker-text-container"><div class="hacker-msg"></div></div>
            <div class="hacker-options-zone"></div>
        `;
        document.body.appendChild(overlay);
    }

    function typeHackerText(msgEl, fullText, onComplete) {
        if (hackerTypeInterval) clearInterval(hackerTypeInterval);
        msgEl.textContent = "";
        let index = 0;
        hackerTypeInterval = setInterval(() => {
            if (index < fullText.length) {
                msgEl.textContent += fullText.charAt(index);
                index++;
            } else {
                clearInterval(hackerTypeInterval);
                hackerTypeInterval = null;
                if (onComplete) onComplete();
            }
        }, 28);
    }

    function runHackerDialog(node) {
        const msgEl = document.querySelector(".hacker-msg");
        const optZone = document.querySelector(".hacker-options-zone");
        if (!msgEl || !optZone) return;
        optZone.innerHTML = "";

        if (node === "start") {
            typeHackerText(msgEl, "Хотел поиграть в игру? Ну давай поиграем! С этого момента ты будешь исполнять мои желания. А при невыполнении ты будешь наказан!", () => {
                createHackerOption(optZone, "1. А с чего это я должен что то выполнять?", () => runHackerDialog("ans1"));
                createHackerOption(optZone, "2. Я позвоню в полицию!", () => runHackerDialog("ans2"));
                createHackerOption(optZone, "3. Что за задания?", () => runHackerDialog("ans3"));
            });
        } else if (node === "ans1") {
            typeHackerText(msgEl, "Ну давай я подсуну тебе под подушку окровавленные конечности твоих друзей или родителей? Быть может тогда ты поймешь что со мной шутки плохи.", () => {
                createHackerOption(optZone, "3. Что за задания?", () => runHackerDialog("ans3"));
            });
        } else if (node === "ans2") {
            typeHackerText(msgEl, "Ого! Заднюю хочешь дать? Не дружок, ты уже не отвертишься! Ты в моей власти! Хочешь - звони, только твой комп уже сгорит, а потом они еще долго будут искать твоих родных по разным уголкам города. Но ты рискни!", () => {
                createHackerOption(optZone, "3. Что за задания?", () => runHackerDialog("ans3"));
            });
        } else if (node === "ans3") {
            typeHackerText(msgEl, "Уже хороший вопрос! Понимаешь, мне ужасно нравится играть с судьбами людей! Я же как никак дЬяВоЛ! Так вот, ты будешь играть в игры которые я скажу, писать родителям, друзьям, да даже обычным людям, то что я скажу, а также жить только как я скажу! Готов?", () => {
                createFinalOptions(optZone);
            });
        }
    }

    function createHackerOption(parent, text, callback) {
        const btn = document.createElement("button");
        btn.classList.add("hacker-btn");
        btn.textContent = text;
        btn.addEventListener("click", callback);
        parent.appendChild(btn);
    }

    function createFinalOptions(parent) {
        for (let i = 0; i < 3; i++) {
            createHackerOption(parent, "Да", () => {
                isChapterOneActive = false;
                const overlay = document.getElementById("hackerOverlay");
                if (overlay) {
                    overlay.classList.remove("visible");
                    overlay.style.display = "none";
                }
                
                if (window.triggerChapterCompleteScreen) {
                    window.triggerChapterCompleteScreen(1, "Вы в ловушке дЬяВоЛа68...");
                }
            });
        }
    }
})();

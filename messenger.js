(function() {
    let currentStage = "start";
    let selectedUser = null;
    let notifyTimeout = null;

    const storyState = {
        dinoDownloaded: false,
        dinoScoreBeaten: false
    };

    window.initChapterOne = function() {
        currentStage = "start";
        selectedUser = null;
        storyState.dinoDownloaded = false;
        storyState.dinoScoreBeaten = false;

        const hackerOverlay = document.getElementById("hackerOverlay");
        if (hackerOverlay) hackerOverlay.style.display = "none";

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
        win.style.width = "520px";
        win.style.height = "390px";

        win.innerHTML = `
            <div class="window-header">
                <span class="window-title">Mess</span>
                <button class="window-close-btn" id="btnCloseMessenger">X</button>
            </div>
            <div class="window-content" style="flex-direction:row; padding:0; height:calc(100% - 35px); gap:0;">
                <div id="messUserList" style="width:35%; border-right:1px solid rgba(0,255,102,0.2); background:rgba(0,5,0,0.6); padding:10px; color:#00ff66; font-size:0.85rem; cursor:pointer;"></div>
                <div id="messChatZone" style="width:65%; background:rgba(0,0,0,0.95); display:flex; flex-direction:column; justify-content:space-between; position:relative;"></div>
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
        broItem.style.borderBottom = "1px solid rgba(0,255,102,0.1)";
        broItem.style.color = "#00ff66";
        if (selectedUser === "bro") broItem.style.background = "rgba(0,255,102,0.15)";
        broItem.innerHTML = `<div style="font-weight:bold;">👦 Бро</div><div style="font-size:0.75rem; opacity:0.6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Хей, Айв! Как дела?...</div>`;
        
        broItem.addEventListener("click", () => {
            selectedUser = "bro";
            renderMess();
        });
        userList.appendChild(broItem);

        if (storyState.dinoScoreBeaten) {
            const hackerItem = document.createElement("div");
            hackerItem.style.padding = "10px";
            hackerItem.style.borderBottom = "1px solid rgba(0,255,102,0.1)";
            hackerItem.style.color = "#ff3333";
            if (selectedUser === "hacker") hackerItem.style.background = "rgba(255,51,51,0.15)";
            hackerItem.innerHTML = `<div style="font-weight:bold;">❓ ???</div><div style="font-size:0.75rem; opacity:0.6;">Хочешь побольше...</div>`;
            
            hackerItem.addEventListener("click", () => {
                selectedUser = "hacker";
                renderMess();
            });
            userList.appendChild(hackerItem);
        }

        if (!selectedUser) {
            chatZone.innerHTML = `<div style="color:rgba(0,255,102,0.4); text-align:center; margin:auto; font-size:0.8rem; max-width:85%; padding:15px; border:1px dashed rgba(0,255,102,0.2);">Mess был обновлен и все старые истории были стерты. Приносим извинения за неполадки. Обещаем все исправить очень скоро!</div>`;
            return;
        }

        if (selectedUser === "bro") {
            renderBroChat(chatZone);
        } else if (selectedUser === "hacker") {
            renderHackerChat(chatZone);
        }
    }
    function renderBroChat(zone) {
        zone.innerHTML = `
            <div style="padding:10px; border-bottom:1px solid rgba(0,255,102,0.2); color:#00ff66; font-weight:bold; text-shadow:0 0 3px #00ff66;">Бро [В сети]</div>
            <div id="messLogs" style="flex:1; overflow-y:auto; padding:15px; display:flex; flex-direction:column; gap:12px;"></div>
            <div id="messOptions" style="padding:10px; display:flex; flex-direction:column; gap:6px; border-top:1px solid rgba(0,255,102,0.2);"></div>
        `;
        const msgContainer = document.getElementById("messLogs");
        const optContainer = document.getElementById("messOptions");

        if (currentStage === "start") {
            appendMessLog(msgContainer, "Бро", "Хей, Айв! Как дела? Все еще за уроками сидишь?", false);
            createMessOption(optContainer, "1. Отвали", () => triggerFail("Бро обиделся и перестал писать. Вы остались делать уроки."));
            createMessOption(optContainer, "2. Да, а что?", () => { currentStage = "bro_dino"; renderMess(); });
            createMessOption(optContainer, "3. Ты кто?", () => triggerFail("Бро подумал, что вы сошли с ума, и заблокировал вас."));
        } else if (currentStage === "bro_dino") {
            appendMessLog(msgContainer, "Бро", "Хей, Айв! Как дела? Все еще за уроками сидишь?", false);
            appendMessLog(msgContainer, "Вы", "Да, а что?", true);
            appendMessLog(msgContainer, "Бро", "Да хватит тухнуть! Давай ка мы на секунду представим, что ты не дорожишь званием «умника школы» и твои родители не ругают тебя за плохие оценки! Попробуй побить рекорд в динозаврике! Ты ведь его не удалил?", false);
            createMessOption(optContainer, "1. Ты кто?", () => triggerFail("Бро решил не общаться с шутником."));
            createMessOption(optContainer, "2. Отвали, я хочу доделать уроки!", () => triggerFail("Вы зарылись в учебники и проиграли жизнь."));
            createMessOption(optContainer, "3. Черт, кажись удалил! Я хотел чтобы родители думали что я только занимаюсь учебой на этом компе. Ладно, завтра сделаю уроки. Какой там рекорд?", () => { currentStage = "bro_record"; renderMess(); });
        } else if (currentStage === "bro_record") {
            appendMessLog(msgContainer, "Вы", "Черт, кажись удалил! Я хотел чтобы родители думали что я только занимаюсь учебой на этом компе. Ладно, завтра сделаю уроки. Какой там рекорд?", true);
            appendMessLog(msgContainer, "Бро", "Вот он! Старый добрый Айв! Мой рекорд 300! Сможешь побить? Или не сможешь нажать на пробел когда надо? Ха-ха!", false);
            
            const hint = document.createElement("div");
            hint.style.color = "#ffaa00";
            hint.style.textAlign = "center";
            hint.style.fontSize = "0.8rem";
            hint.style.marginTop = "10px";
            hint.textContent = "[Задание: Зайдите в Магазин и скачайте Динозаврика]";
            msgContainer.appendChild(hint);
            storyState.dinoDownloaded = true;
        }
    }

    function appendMessLog(container, sender, text, isOut) {
        const msg = document.createElement("div");
        msg.style.maxWidth = "80%";
        msg.style.padding = "8px 12px";
        msg.style.fontSize = "0.85rem";
        msg.style.lineHeight = "1.4";
        msg.style.border = "1px solid " + (isOut ? "#00ff66" : "rgba(0,255,102,0.3)");
        msg.style.background = isOut ? "rgba(0,255,102,0.1)" : "transparent";
        msg.style.color = "#00ff66";
        msg.style.alignSelf = isOut ? "flex-end" : "flex-start";
        msg.innerHTML = `<span style="font-weight:bold; display:block; margin-bottom:2px;">${sender}:</span>${text}`;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    function createMessOption(parent, text, callback) {
        const btn = document.createElement("button");
        btn.style.background = "transparent";
        btn.style.border = "1px solid #00ff66";
        btn.style.color = "#00ff66";
        btn.style.padding = "8px";
        btn.style.textAlign = "left";
        btn.style.cursor = "pointer";
        btn.style.fontFamily = "Russo One, sans-serif";
        btn.style.fontSize = "0.8rem";
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
        selectedUser = "hacker";
        renderMess();
        showMessNotification("???", "Хочешь побольше новых игр? Кликай сюда: *ссылка*");
    };
    function renderHackerChat(zone) {
        zone.innerHTML = `
            <div style="padding:10px; border-bottom:1px solid #ff3333; color:#ff3333; font-weight:bold;">❓ ???</div>
            <div id="messHackerLogs" style="flex:1; overflow-y:auto; padding:15px; display:flex; flex-direction:column; gap:12px;"></div>
        `;
        const container = document.getElementById("messHackerLogs");
        const msg = document.createElement("div");
        msg.style.maxWidth = "80%";
        msg.style.padding = "8px 12px";
        msg.style.fontSize = "0.85rem";
        msg.style.border = "1px solid #ff3333";
        msg.style.color = "#ff3333";
        msg.innerHTML = `<span style="font-weight:bold; display:block; margin-bottom:2px;">???:</span>Хочешь побольше новых игр? Кликай сюда: <span id="hackerLink" style="text-decoration:underline; cursor:pointer; color:#ffaa00; font-weight:bold;">*ссылка*</span>`;
        container.appendChild(msg);
        
        const link = document.getElementById("hackerLink");
        if (link) {
            link.addEventListener("click", () => {
                const env = document.getElementById("desktopEnv");
                if (env) env.style.filter = "hue-rotate(270deg) blur(3px) brightness(0.4)";
                setTimeout(() => {
                    if (env) env.style.display = "none";
                    const overlay = document.getElementById("hackerOverlay");
                    if (overlay) overlay.style.display = "flex";
                    runHackerDialog("start");
                }, 1500);
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
                        <!-- Плечи и корпус -->
                        <path d="M 32 260 L 36 165 Q 40 132 76 128 L 93 128 M 107 128 L 124 128 Q 160 132 164 165 L 168 260" stroke="#ff3333" stroke-width="3" stroke-linecap="round" />
                        <!-- Вертикальные складки на рукавах/одежде -->
                        <path d="M 48 165 L 46 255 M 57 175 L 56 248" stroke="#ff3333" stroke-width="2" stroke-linecap="round" />
                        <path d="M 152 165 L 154 255 M 143 175 L 144 248" stroke="#ff3333" stroke-width="2" stroke-linecap="round" />
                        <!-- Волнистая линия по центру груди -->
                        <path d="M 100 136 Q 96 152 102 168 T 99 200 T 101 235" stroke="#ff3333" stroke-width="2.2" stroke-linecap="round" />
                        <!-- Голова-маска со штриховкой -->
                        <path d="M 100 24 C 132 24 146 52 134 86 C 124 112 108 128 100 134 C 92 128 76 112 66 86 C 54 52 68 24 100 24 Z" fill="url(#sketchHatch)" stroke="#ff3333" stroke-width="3" stroke-linejoin="round" />
                        <!-- Левый глаз (острая галочка V) -->
                        <path d="M 76 58 L 83 88 L 95 54" stroke="#ff3333" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
                        <!-- Правый глаз (вертикальная полоса с косой чертой) -->
                        <g class="hacker-eye-right">
                            <path d="M 116 54 L 114 92" stroke="#ff3333" stroke-width="3.5" stroke-linecap="round" />
                            <path d="M 122 50 L 117 62" stroke="#ff3333" stroke-width="2.2" stroke-linecap="round" />
                        </g>
                        <!-- Маленький рот-галочка внизу -->
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

    function runHackerDialog(node) {
        const msgEl = document.querySelector(".hacker-msg");
        const optZone = document.querySelector(".hacker-options-zone");
        if (!msgEl || !optZone) return;
        msgEl.textContent = "";
        optZone.innerHTML = "";

        if (node === "start") {
            msgEl.innerHTML = `<span style="color:#ff3333; font-weight:bold; display:block; font-size:1.4rem; margin-bottom:15px; text-shadow:0 0 10px #ff3333;">дЬяВоЛ68</span>Хотел поиграть в игру? Ну давай поиграем! С этого момента ты будешь исполнять мои желания. А при невыполнении ты будешь наказан!`;
            createHackerOption(optZone, "1. А с чего это я должен что то выполнять?", () => runHackerDialog("ans1"));
            createHackerOption(optZone, "2. Я позвоню в полицию!", () => runHackerDialog("ans2"));
            createHackerOption(optZone, "3. Что за задания?", () => runHackerDialog("ans3"));
        } else if (node === "ans1") {
            msgEl.textContent = "Думаешь, сможешь просто закрыть это окно? Я уже скопировал все твои личные данные, пароли и адреса твоих близких. Будешь спорить — пострадают все.";
            createFinalOptions(optZone);
        } else if (node === "ans2") {
            msgEl.textContent = "Ого! Заднюю хочешь дать? Не дружок, ты уже не отвертишься! Ты в моей власти! Хочешь — звони, только твой комп сгорит раньше, чем ты наберешь номер. Но ты рискни!";
            createFinalOptions(optZone);
        } else if (node === "ans3") {
            msgEl.textContent = "Уже хороший вопрос! Понимаешь, мне ужасно нравится играть с судьбами людей! Я же как никак дЬяВоЛ! Так вот, ты будешь играть в игры которые я скажу, писать родителям, друзьям, да даже обычным людям, то что я скажу, а также жить только как я скажу! Готов?";
            createFinalOptions(optZone);
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
                const overlay = document.getElementById("hackerOverlay");
                if (overlay) overlay.style.display = "none";
                
                if (window.triggerLoading) {
                    window.triggerLoading(() => {
                        const mainMenu = document.getElementById("mainMenu");
                        if (mainMenu) {
                            mainMenu.classList.remove("hidden");
                            setTimeout(() => mainMenu.classList.add("visible"), 50);
                        }
                    });
                }
            });
        }
    }
})();

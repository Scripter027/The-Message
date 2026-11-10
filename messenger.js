(function() {
    let currentStage = "start";
    let selectedUser = null;
    let dinoScore = 0;

    const storyState = {
        dinoDownloaded: false,
        dinoScoreBeaten: false
    };

    window.initChapterOne = function() {
        if (window.AppConfig) {
            window.AppConfig.state.installed = ["messenger", "store"];
            window.AppConfig.state.positions = {};
            window.AppConfig.state.trashContents = [];
            window.AppConfig.save();
        }
        
        const checkVisible = () => {
            const mainZone = document.querySelector(".desktop-main");
            if (mainZone && mainZone.clientWidth > 0) {
                if (window.renderDesktopIcons) window.renderDesktopIcons();
                createTelegramWindow();
                createDinoWindow();
                createHackerOverlay();
                setTimeout(() => {
                    showTelegramNotification("Бро", "Хей, Айв! Как дела? Все еще за уроками сидишь?");
                }, 1500);
            } else {
                setTimeout(checkVisible, 200);
            }
        };
        checkVisible();
    };

    function showTelegramNotification(from, text) {
        const notify = document.createElement("div");
        notify.style.position = "fixed";
        notify.style.bottom = "60px";
        notify.style.right = "20px";
        notify.style.background = "#242f3d";
        notify.style.border = "1px solid #5288c1";
        notify.style.borderRadius = "10px";
        notify.style.padding = "12px 16px";
        notify.style.color = "#fff";
        notify.style.fontFamily = "sans-serif";
        notify.style.zIndex = "10000";
        notify.style.cursor = "pointer";
        notify.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
        notify.innerHTML = `<div style="font-weight:bold; color:#5288c1; margin-bottom:4px;">${from}</div><div style="font-size:0.9rem;">${text}</div>`;
        
        notify.addEventListener("click", () => {
            notify.remove();
            window.openApplicationWindow("messenger");
        });
        document.body.appendChild(notify);
        setTimeout(() => { if (notify.parentNode) notify.remove(); }, 6000);
    }

    function createTelegramWindow() {
        if (document.getElementById("windowMessenger")) return;
        const mainZone = document.querySelector(".desktop-main");
        if (!mainZone) return;
        
        const win = document.createElement("div");
        win.id = "windowMessenger";
        win.classList.add("desktop-window", "hidden");
        win.style.width = "550px";
        win.style.height = "420px";
        win.style.background = "#182533";
        win.style.border = "1px solid #101921";
        win.style.fontFamily = "sans-serif";

        win.innerHTML = `
            <div class="window-header" style="background:#242f3d; color:#fff; border-bottom:1px solid #101921;">
                <span class="window-title">Telegram</span>
                <button class="window-close-btn" id="btnCloseMessenger" style="color:#fff;">X</button>
            </div>
            <div class="window-content" style="flex-direction:row; padding:0; height:calc(100% - 35px); gap:0; background:#182533;">
                <div id="tgUserList" style="width:35%; border-right:1px solid #101921; background:#17212b; display:flex; flex-direction:column;"></div>
                <div id="tgChatZone" style="width:65%; background:#0e1621; display:flex; flex-direction:column; justify-content:space-between; position:relative;"></div>
            </div>
        `;
        mainZone.appendChild(win);
        document.getElementById("btnCloseMessenger").addEventListener("click", () => {
            win.classList.add("hidden");
        });
        if (window.bringToFront) {
            win.addEventListener("mousedown", () => window.bringToFront(win));
            win.addEventListener("touchstart", () => window.bringToFront(win), {passive:true});
        }
    }
    window.openApplicationWindow = (originalOpen => {
        return function(appId) {
            if (appId === "messenger") {
                const win = document.getElementById("windowMessenger");
                if (win) {
                    win.classList.remove("hidden");
                    renderTelegram();
                    if (window.bringToFront) window.bringToFront(win);
                }
                return;
            }
            if (appId === "dino") {
                if (storyState.dinoDownloaded) {
                    const win = document.getElementById("windowDino");
                    if (win) {
                        win.classList.remove("hidden");
                        if (window.bringToFront) window.bringToFront(win);
                    }
                }
                return;
            }
            originalOpen(appId);
        };
    })(window.openApplicationWindow);

    function renderTelegram() {
        const userList = document.getElementById("tgUserList");
        const chatZone = document.getElementById("tgChatZone");
        if (!userList || !chatZone) return;
        userList.innerHTML = "";
        
        const broItem = document.createElement("div");
        broItem.style.padding = "10px 15px";
        broItem.style.display = "flex";
        broItem.style.alignItems = "center";
        broItem.style.gap = "10px";
        broItem.style.cursor = "pointer";
        broItem.style.borderBottom = "1px solid #101921";
        broItem.style.background = selectedUser === "bro" ? "#2b394a" : "transparent";
        broItem.innerHTML = `<div style="width:35px; height:35px; background:#5288c1; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">Б</div><div style="flex:1;"><div style="color:#fff; font-size:0.9rem; font-weight:bold;">Бро</div><div style="color:#7f91a4; font-size:0.75rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Хей, Айв! Как дела?...</div></div>`;
        
        broItem.addEventListener("click", () => {
            selectedUser = "bro";
            renderTelegram();
        });
        userList.appendChild(broItem);

        if (storyState.dinoScoreBeaten) {
            const hackerItem = document.createElement("div");
            hackerItem.style.padding = "10px 15px";
            hackerItem.style.display = "flex";
            hackerItem.style.alignItems = "center";
            hackerItem.style.gap = "10px";
            hackerItem.style.cursor = "pointer";
            hackerItem.style.borderBottom = "1px solid #101921";
            hackerItem.style.background = selectedUser === "hacker" ? "#2b394a" : "transparent";
            hackerItem.innerHTML = `<div style="width:35px; height:35px; background:#e53935; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">Д</div><div style="flex:1;"><div style="color:#ff5252; font-size:0.9rem; font-weight:bold;">дЬяВоЛ68</div><div style="color:#7f91a4; font-size:0.75rem;">Хочешь побольше...</div></div>`;
            
            hackerItem.addEventListener("click", () => {
                selectedUser = "hacker";
                renderTelegram();
            });
            userList.appendChild(hackerItem);
        }

        if (!selectedUser) {
            chatZone.innerHTML = `<div style="color:#7f91a4; text-align:center; margin:auto; font-size:0.85rem; max-width:80%; padding:20px; background:#182533; border-radius:10px; border:1px solid #101921;">Mess был обновлен и все старые истории были стерты. Приносим извинения за неполадки. Обещаем все исправить очень скоро!</div>`;
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
            <div style="background:#17212b; padding:10px 15px; border-bottom:1px solid #101921; color:#fff; font-weight:bold; font-size:0.95rem;">Бро <span style="color:#5288c1; font-size:0.75rem; font-weight:normal; display:block;">в сети</span></div>
            <div id="tgMessages" style="flex:1; overflow-y:auto; padding:15px; display:flex; flex-direction:column; gap:10px;"></div>
            <div id="tgOptions" style="background:#17212b; padding:10px; display:flex; flex-direction:column; gap:6px; border-top:1px solid #101921;"></div>
        `;
        const msgContainer = document.getElementById("tgMessages");
        const optContainer = document.getElementById("tgOptions");

        if (currentStage === "start") {
            appendTgMessage(msgContainer, "Бро", "Хей, Айв! Как дела? Все еще за уроками сидишь?", false);
            createTgOption(optContainer, "Отвали", () => triggerFail("Бро обиделся и перестал писать. Вы остались делать уроки."));
            createTgOption(optContainer, "Да, а что?", () => { currentStage = "bro_dino"; renderTelegram(); });
            createTgOption(optContainer, "Ты кто?", () => triggerFail("Бро подумал, что вы сошли с ума, и заблокировал вас."));
        } else if (currentStage === "bro_dino") {
            appendTgMessage(msgContainer, "Бро", "Хей, Айв! Как дела? Все еще за уроками сидишь?", false);
            appendTgMessage(msgContainer, "Вы", "Да, а что?", true);
            appendTgMessage(msgContainer, "Бро", "Да хватит тухнуть! Давай ка мы на секунду представим, что ты не дорожишь званием «умника школы» и твои родители не ругают тебя за плохие оценки! Попробуй побить рекорд в динозаврике! Ты ведь его не удалил?", false);
            createTgOption(optContainer, "Ты кто?", () => triggerFail("Бро решил не общаться с шутником."));
            createTgOption(optContainer, "Отвали, я хочу доделать уроки!", () => triggerFail("Вы зарылись в учебники и проиграли жизнь."));
            createTgOption(optContainer, "Черт, кажись удалил! Я хотел чтобы родители думали что я только занимаюсь учебой на этом компе. Ладно, завтра сделаю уроки. Какой там рекорд?", () => { currentStage = "bro_record"; renderTelegram(); });
        } else if (currentStage === "bro_record") {
            appendTgMessage(msgContainer, "Вы", "Черт, кажись удалил! Я хотел чтобы родители думали что я только занимаюсь учебой на этом компе. Ладно, завтра сделаю уроки. Какой там рекорд?", true);
            appendTgMessage(msgContainer, "Бро", "Вот он! Старый добрый Айв! Мой рекорд 2000! Сможешь побить? Или не сможешь нажать на пробел когда надо? Ха-ха!", false);
            if (!storyState.dinoDownloaded) {
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
    }
    function appendTgMessage(container, sender, text, isOut) {
        const msg = document.createElement("div");
        msg.style.maxWidth = "75%";
        msg.style.padding = "8px 12px";
        msg.style.borderRadius = "8px";
        msg.style.fontSize = "0.85rem";
        msg.style.lineHeight = "1.4";
        if (isOut) {
            msg.style.alignSelf = "flex-end";
            msg.style.background = "#2b5278";
            msg.style.color = "#fff";
        } else {
            msg.style.alignSelf = "flex-start";
            msg.style.background = "#182533";
            msg.style.color = "#fff";
            msg.style.border = "1px solid #202b36";
        }
        msg.textContent = text;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    function createTgOption(parent, text, callback) {
        const btn = document.createElement("button");
        btn.style.background = "#242f3d";
        btn.style.border = "1px solid #324356";
        btn.style.borderRadius = "6px";
        btn.style.color = "#5288c1";
        btn.style.padding = "8px 12px";
        btn.style.textAlign = "left";
        btn.style.cursor = "pointer";
        btn.style.fontSize = "0.85rem";
        btn.style.transition = "background 0.2s";
        btn.textContent = text;
        btn.addEventListener("click", callback);
        parent.appendChild(btn);
    }

    function triggerFail(text) {
        alert(text + " (Провал главы!)");
        location.reload();
    }

    function createDinoWindow() {
        if (document.getElementById("windowDino")) return;
        const mainZone = document.querySelector(".desktop-main");
        const win = document.createElement("div");
        win.id = "windowDino";
        win.classList.add("desktop-window", "hidden");
        win.style.width = "400px";
        win.style.height = "280px";

        win.innerHTML = `
            <div class="window-header">
                <span class="window-title">Dino Game</span>
                <button class="window-close-btn" id="btnCloseDino">X</button>
            </div>
            <div class="window-content" style="align-items:center; justify-content:center; gap:20px;">
                <div style="font-size:3rem;">🦖</div>
                <div id="dinoScoreBoard" style="color:#00ff66; font-size:1.1rem;">Рекорд Бро: 2000 | Ваш Счет: 0</div>
                <button id="btnPlayDino" class="action-btn" style="border:2px solid #00ff66; color:#00ff66; width:auto; padding:8px 24px;">Прыгнуть через кактус!</button>
            </div>
        `;
        mainZone.appendChild(win);
        document.getElementById("btnCloseDino").addEventListener("click", () => win.classList.add("hidden"));
        document.getElementById("btnPlayDino").addEventListener("click", () => {
            if (storyState.dinoScoreBeaten) return;
            dinoScore += Math.floor(Math.random() * 150) + 120;
            if (dinoScore > 2000) {
                dinoScore = 2001;
                document.getElementById("dinoScoreBoard").textContent = `Рекорд Бро: 2000 | Ваш Счет: ${dinoScore}`;
                setTimeout(() => {
                    win.classList.add("hidden");
                    storyState.dinoScoreBeaten = true;
                    selectedUser = "hacker";
                    renderTelegram();
                    showTelegramNotification("дЬяВоЛ68", "Хочешь побольше новых игр? Кликай сюда: *ссылка*");
                }, 800);
            } else {
                document.getElementById("dinoScoreBoard").textContent = `Рекорд Бро: 2000 | Ваш Счет: ${dinoScore}`;
            }
        });
    }

    function renderHackerChat(zone) {
        zone.innerHTML = `
            <div style="background:#17212b; padding:10px 15px; border-bottom:1px solid #101921; color:#ff5252; font-weight:bold; font-size:0.95rem;">дЬяВоЛ68</div>
            <div id="tgHackerMessages" style="flex:1; overflow-y:auto; padding:15px; display:flex; flex-direction:column; gap:10px;"></div>
        `;
        const msgContainer = document.getElementById("tgHackerMessages");
        appendTgMessage(msgContainer, "Hacker", "Хочешь побольше новых игр? Кликай сюда: *ссылка*", false);
        
        setTimeout(() => {
            msgContainer.style.cursor = "pointer";
            msgContainer.addEventListener("click", () => {
                const env = document.getElementById("desktopEnv");
                if (env) env.style.filter = "hue-rotate(270deg) blur(3px)";
                setTimeout(() => {
                    if (env) env.style.display = "none";
                    const overlay = document.getElementById("hackerOverlay");
                    if (overlay) overlay.style.display = "flex";
                    runHackerDialog("start");
                }, 1500);
            }, { once: true });
        }, 100);
    }

    function createHackerOverlay() {
        if (document.getElementById("hackerOverlay")) return;
        const overlay = document.createElement("div");
        overlay.id = "hackerOverlay";
        overlay.innerHTML = `
            <div class="hacker-bg-effects"><div class="hacker-noise"></div></div>
            <div class="hacker-silhouette"></div>
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
            msgEl.textContent = "Хотел поиграть в игру? Ну давай поиграем! С этого момента ты будешь исполнять мои желания. А при невыполнении ты будешь наказан!";
            createHackerOption(optZone, "1. А с чего это я должен что то выполнять?", () => runHackerDialog("ans1"));
            createHackerOption(optZone, "2. Я позвоню в полицию!", () => runHackerDialog("ans2"));
            createHackerOption(optZone, "3. Что за задания?", () => runHackerDialog("ans3"));
        } else if (node === "ans1") {
            msgEl.textContent = "Ну давай я подсуну тебе под подушку окровавленные конечности твоих друзей или родителей? Быть может тогда ты поймешь что со мной шутки плохи.";
            createFinalOptions(optZone);
        } else if (node === "ans2") {
            msgEl.textContent = "Ого! Заднюю хочешь дать? Не дружок, ты уже не отвертишься! Ты в моей власти! Хочешь - звони, только твой комп уже сгорит, а потом они еще долго будут искать твоих родных по разным уголкам города. Но ты рискни!";
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
                alert("Глава 1 успешно пройдена! Вы в ловушке дЬяВоЛа68...");
                location.reload();
            });
        }
    }
})();

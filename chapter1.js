(function() {
    let currentStage = "start";
    let messAppOpen = false;
    let selectedUser = null;

    const storyState = {
        messNotificationShown: false,
        dinoDownloaded: false,
        dinoScoreBeaten: false,
        hackerTriggered: false
    };

    window.initChapterOne = function() {
        if (window.AppConfig) {
            window.AppConfig.allApps.messenger = {
                id: "messenger",
                nameRu: "Mess",
                nameEn: "Mess",
                icon: "💬",
                type: "system"
            };
            if (!window.AppConfig.state.installed.includes("messenger")) {
                window.AppConfig.state.installed.push("messenger");
                window.AppConfig.save();
            }
        }
        createMessengerWindow();
        createHackerOverlay();
        setTimeout(() => {
            showNotification("Бро", "Хей, Айв! Как дела?");
        }, 3000);
    };

    function showNotification(from, text) {
        const notify = document.createElement("div");
        notify.style.position = "fixed";
        notify.style.bottom = "60px";
        notify.style.right = "20px";
        notify.style.background = "#000";
        notify.style.border = "2px solid #00ff66";
        notify.style.padding = "10px 20px";
        notify.style.color = "#00ff66";
        notify.style.fontFamily = "Russo One, sans-serif";
        notify.style.zIndex = "9999";
        notify.style.cursor = "pointer";
        notify.textContent = `${from}: ${text}`;
        notify.addEventListener("click", () => {
            notify.remove();
            window.openApplicationWindow("messenger");
        });
        document.body.appendChild(notify);
        setTimeout(() => { if (notify.parentNode) notify.remove(); }, 6000);
    }

    function createMessengerWindow() {
        if (document.getElementById("windowMessenger")) return;
        const mainZone = document.querySelector(".desktop-main");
        const win = document.createElement("div");
        win.id = "windowMessenger";
        win.classList.add("desktop-window", "hidden");
        win.style.width = "480px";
        win.style.height = "380px";

        win.innerHTML = `
            <div class="window-header">
                <span class="window-title">Mess</span>
                <button class="window-close-btn" id="btnCloseMessenger">X</button>
            </div>
            <div class="window-content" style="flex-direction:row; padding:0; height:calc(100% - 35px); gap:0;">
                <div id="messUserList" style="width:30%; border-right:1px solid rgba(0,255,102,0.2); background:rgba(0,5,0,0.6); padding:10px; color:#00ff66; font-size:0.85rem; cursor:pointer;"></div>
                <div id="messChatZone" style="width:70%; background:rgba(0,0,0,0.9); padding:15px; display:flex; flex-direction:column; justify-content:space-between;"></div>
            </div>
        `;
        mainZone.appendChild(win);
        document.getElementById("btnCloseMessenger").addEventListener("click", () => {
            win.classList.add("hidden");
            messAppOpen = false;
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
                    messAppOpen = true;
                    renderMessenger();
                    if (window.bringToFront) window.bringToFront(win);
                }
                return;
            }
            originalOpen(appId);
        };
    })(window.openApplicationWindow);

    function renderMessenger() {
        const userList = document.getElementById("messUserList");
        const chatZone = document.getElementById("messChatZone");
        userList.innerHTML = "";
        
        const userItem = document.createElement("div");
        userItem.textContent = "👦 Бро";
        userItem.style.padding = "5px";
        userItem.style.borderBottom = "1px solid rgba(0,255,102,0.1)";
        if (selectedUser === "bro") userItem.style.background = "rgba(0,255,102,0.2)";
        
        userItem.addEventListener("click", () => {
            selectedUser = "bro";
            renderMessenger();
        });
        userList.appendChild(userItem);

        if (storyState.dinoScoreBeaten) {
            const hackerItem = document.createElement("div");
            hackerItem.textContent = "💀 дЬяВоЛ68";
            hackerItem.style.padding = "5px";
            hackerItem.style.color = "#ff3333";
            if (selectedUser === "hacker") hackerItem.style.background = "rgba(255,51,51,0.2)";
            hackerItem.addEventListener("click", () => {
                selectedUser = "hacker";
                renderMessenger();
            });
            userList.appendChild(hackerItem);
        }

        if (!selectedUser) {
            chatZone.innerHTML = `<div style="color:rgba(0,255,102,0.5); text-align:center; margin-top:40%; font-size:0.9rem;">Mess был обновлен и все старые истории были стерты. Приносим извинения за неполадки. Обещаем все исправить очень скоро!</div>`;
            return;
        }

        if (selectedUser === "bro") {
            renderBroChat(chatZone);
        } else if (selectedUser === "hacker") {
            renderHackerChat(chatZone);
        }
    }
    function renderBroChat(zone) {
        zone.innerHTML = "";
        const msgContainer = document.createElement("div");
        msgContainer.style.flex = "1";
        msgContainer.style.overflowY = "auto";
        msgContainer.style.color = "#00ff66";
        msgContainer.style.fontSize = "0.85rem";
        
        const optContainer = document.createElement("div");
        optContainer.style.display = "flex";
        optContainer.style.flexDirection = "column";
        optContainer.style.gap = "5px";

        if (currentStage === "start") {
            msgContainer.innerHTML = `<div><b>Сегодня</b></div><div style="margin-top:5px;"><b>Бро:</b> Хей, Айв! Как дела? Все еще за уроками сидишь?</div>`;
            createOption(optContainer, "1. Отвали", () => triggerFail("Бро обиделся и перестал писать. Вы остались делать уроки."));
            createOption(optContainer, "2. Да, а что?", () => { currentStage = "bro_dino"; renderMessenger(); });
            createOption(optContainer, "3. Ты кто?", () => triggerFail("Бро подумал, что вы сошли с ума, и заблокировал вас."));
        } else if (currentStage === "bro_dino") {
            msgContainer.innerHTML = `
                <div><b>Бро:</b> Хей, Айв! Как дела? Все еще за уроками сидишь?</div>
                <div style="color:rgba(0,255,102,0.7)"><b>Вы:</b> Да, а что?</div>
                <div style="margin-top:5px;"><b>Бро:</b> Да хватит тухнуть! Давай ка мы на секунду представим, что ты не дорожишь званием «умника школы» и твои родители не ругают тебя за плохие оценки! Попробуй побить рекорд в динозаврике! Ты ведь его не удалил?</div>
            `;
            createOption(optContainer, "1. Ты кто?", () => triggerFail("Бро решил не общаться с шутником."));
            createOption(optContainer, "2. Отвали, я хочу доделать уроки!", () => triggerFail("Вы зарылись в учебники и проиграли жизнь."));
            createOption(optContainer, "3. Черт, кажись удалил! Какой там рекорд?", () => { currentStage = "bro_record"; renderMessenger(); });
        } else if (currentStage === "bro_record") {
            msgContainer.innerHTML = `
                <div style="margin-bottom:5px;"><b>Бро:</b> ...Попробуй побить рекорд в динозаврике! Ты ведь его не удалил?</div>
                <div style="color:rgba(0,255,102,0.7)"><b>Вы:</b> Черт, кажись удалил! Я хотел чтобы родители думали что я только занимаюсь учебой на этом компе. Ладно, завтра сделаю уроки. Какой там рекорд?</div>
                <div style="margin-top:5px;"><b>Бро:</b> Вот он! Старый добрый Айв! Мой рекорд 2000! Сможешь побить? Или не сможешь нажать на пробел когда надо? Ха-ха!</div>
            `;
            if (!storyState.dinoDownloaded) {
                const hint = document.createElement("div");
                hint.style.color = "#ffaa00";
                hint.style.marginTop = "10px";
                hint.textContent = "[Задание: Зайдите в Магазин и скачайте Динозаврика]";
                msgContainer.appendChild(hint);
                enableDinoInStore();
            }
        }
        zone.appendChild(msgContainer);
        zone.appendChild(optContainer);
    }

    function createOption(parent, text, callback) {
        const btn = document.createElement("button");
        btn.style.background = "transparent";
        btn.style.border = "1px solid #00ff66";
        btn.style.color = "#00ff66";
        btn.style.padding = "5px";
        btn.style.textAlign = "left";
        btn.style.cursor = "pointer";
        btn.style.fontFamily = "Russo One, sans-serif";
        btn.style.fontSize = "0.8rem";
        btn.textContent = text;
        btn.addEventListener("click", callback);
        parent.appendChild(btn);
    }

    function triggerFail(text) {
        alert(text + " (Провал главы!)");
        location.reload();
    }

    function enableDinoInStore() {
        storyState.dinoDownloaded = true;
        window.openApplicationWindow = (originalOpen => {
            return function(appId) {
                if (appId === "dino" && storyState.dinoDownloaded) {
                    mockDinoGame();
                    return;
                }
                originalOpen(appId);
            };
        })(window.openApplicationWindow);
    }

    function mockDinoGame() {
        alert("Вы запустили Динозаврика и усердно играете...");
        alert("Ура! Вы набрали 2001 очко и побили рекорд Бро!");
        storyState.dinoScoreBeaten = true;
        selectedUser = "hacker";
        if (messAppOpen) renderMessenger();
        showNotification("дЬяВоЛ68", "Хочешь побольше новых игр? Кликай сюда...");
    }

    function renderHackerChat(zone) {
        zone.innerHTML = "";
        const msgContainer = document.createElement("div");
        msgContainer.style.flex = "1";
        msgContainer.style.color = "#ff3333";
        msgContainer.style.fontSize = "0.85rem";
        msgContainer.innerHTML = `<div><b>дЬяВоЛ68:</b> Хочешь побольше новых игр? Кликай сюда: <span id="hackerLink" style="text-decoration:underline; cursor:pointer; color:#ffaa00;">*ссылка*</span></div>`;
        zone.appendChild(msgContainer);
        
        setTimeout(() => {
            const link = document.getElementById("hackerLink");
            if (link) {
                link.addEventListener("click", () => {
                    triggerHackerGlitch();
                });
            }
        }, 100);
    }

    function triggerHackerGlitch() {
        const env = document.getElementById("desktopEnv");
        env.style.filter = "hue-rotate(270deg) blur(2px)";
        setTimeout(() => {
            env.style.display = "none";
            const overlay = document.getElementById("hackerOverlay");
            overlay.style.display = "flex";
            runHackerDialog("start");
        }, 1500);
    }

    function createHackerOverlay() {
        if (document.getElementById("hackerOverlay")) return;
        const overlay = document.createElement("div");
        overlay.id = "hackerOverlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "#000";
        overlay.style.zIndex = "10000";
        overlay.style.display = "none";
        overlay.style.flexDirection = "column";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.fontFamily = "Russo One, sans-serif";
        overlay.style.color = "#ff3333";
        overlay.style.padding = "20px";
        document.body.appendChild(overlay);
    }

    function runHackerDialog(node) {
        const overlay = document.getElementById("hackerOverlay");
        overlay.innerHTML = "";
        
        const textZone = document.createElement("div");
        textZone.style.fontSize = "1.2rem";
        textZone.style.textAlign = "center";
        textZone.style.marginBottom = "40px";
        textZone.style.maxWidth = "600px";
        
        const optZone = document.createElement("div");
        optZone.style.display = "flex";
        optZone.style.flexDirection = "column";
        optZone.style.gap = "15px";
        optZone.style.width = "100%";
        optZone.style.maxWidth = "400px";

        if (node === "start") {
            textZone.textContent = "Хотел поиграть в игру? Ну давай поиграем! С этого момента ты будешь исполнять мои желания. А при невыполнении ты будешь наказан!";
            createHackerOption(optZone, "1. А с чего это я должен что то выполнять?", () => runHackerDialog("ans1"));
            createHackerOption(optZone, "2. Я позвоню в полицию!", () => runHackerDialog("ans2"));
            createHackerOption(optZone, "3. Что за задания?", () => runHackerDialog("ans3"));
        } else if (node === "ans1") {
            textZone.textContent = "Ну давай я подсуну тебе под подушку окровавленные конечности твоих друзей или родителей? Быть может тогда ты поймешь что со мной шутки плохи.";
            createFinalOptions(optZone);
        } else if (node === "ans2") {
            textZone.textContent = "Ого! Заднюю хочешь дать? Не дружок, ты уже не отвертишься! Ты в моей власти! Хочешь - звони, только твой комп уже сгорит, а потом они еще долго будут искать твоих родных по разным уголкам города. Но ты рискни!";
            createFinalOptions(optZone);
        } else if (node === "ans3") {
            textZone.textContent = "Уже хороший вопрос! Понимаешь, мне ужасно нравится играть с судьбами людей! Я же как никак дЬяВоЛ! Так вот, ты будешь играть в игры которые я скажу, писать родителям, друзьям, да даже обычным людям, то что я скажу, а также жить только как я скажу! Готов?";
            createFinalOptions(optZone);
        }
        overlay.appendChild(textZone);
        overlay.appendChild(optZone);
    }

    function createHackerOption(parent, text, callback) {
        const btn = document.createElement("button");
        btn.style.background = "transparent";
        btn.style.border = "2px solid #ff3333";
        btn.style.color = "#ff3333";
        btn.style.padding = "10px";
        btn.style.cursor = "pointer";
        btn.style.fontFamily = "Russo One, sans-serif";
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

(function() {
    const articlesDb = [
        {
            id: 'school_1290',
            keys: ['1290', 'школ', 'останк', 'мусор', 'новост'],
            title: 'СРОЧНО: Страшная находка возле школы № 1290',
            text: 'Сегодня утром в мусорном баке были найдены останки пропавших школьников школы 1290. Их не могли найти около двух недель и вот наконец останки были найдены. Виновник все еще не обличен, но он будет и будет наказан за это ужасное деяние.',
            linkText: 'Далее к комментариям родителей пропавших'
        },
        {
            id: 'missing_2022',
            keys: ['пропавш', 'дет', '5 лет', 'архив', 'дело', 'поиск', 'исчез'],
            title: 'Архив МВД: Серия исчезновений подростков в районе',
            text: 'За последние 5 лет в городе зафиксировано более 90 случаев бесследного исчезновения школьников 13–16 лет. По словам следователей, перед пропажей все подростки резко ссорились с друзьями, ухудшали успеваемость и совершали неадекватные поступки в школе.'
        },
        {
            id: 'devil_rumors',
            keys: ['дьявол', 'devil', '68', 'шантаж', 'взлом', 'угроз'],
            title: 'Городские слухи: Анонимный шантажист в сети',
            text: 'На местных форумах родители обсуждают сообщения от неизвестного аккаунта. Злоумышленник запугивает школьников, заставляет их разрывать общение с близкими и угрожает расправой над семьей при неповиновении.'
        },
        {
            id: 'olympiad',
            keys: ['айв', 'медал', 'учеб', 'экзамен'],
            title: 'Городской портал образования: Списки кандидатов на медаль',
            text: 'Ученики, претенющие на золотую медаль, обязаны не иметь дисциплинарных взысканий и состоять на безупречном счету у администрации школы.'
        }
    ];

    let graveClicks = 0;
    let slideIndex = 0;
    let fourthSlideErased = false;
    let momReportsDone = 10;

    window.resetExtraAppsState = function() {
        graveClicks = 0;
        slideIndex = 0;
        fourthSlideErased = false;
        momReportsDone = 10;
    };

    window.getGraveClickCount = function() {
        return graveClicks;
    };

    window.triggerBrowserErrorCrash = function(onComplete) {
        const oldCrash = document.getElementById('systemCrashOverlay');
        if (oldCrash) oldCrash.remove();

        const crash = document.createElement('div');
        crash.id = 'systemCrashOverlay';

        const particlesLayer = document.createElement('div');
        particlesLayer.className = 'crash-particles-layer';

        const colors = ['#ff3333', '#00ff66', '#ffffff', '#ffaa00'];
        for (let i = 0; i < 65; i++) {
            const p = document.createElement('div');
            p.className = 'crash-particle';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.top = Math.random() * 100 + 'vh';
            p.style.width = (Math.random() * 24 + 4) + 'px';
            p.style.height = (Math.random() * 14 + 3) + 'px';
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.animationDelay = (Math.random() * 0.25) + 's';
            particlesLayer.appendChild(p);
        }

        const errText = document.createElement('div');
        errText.className = 'crash-error-text';
        errText.textContent = 'ERROR';

        crash.appendChild(particlesLayer);
        crash.appendChild(errText);
        document.body.appendChild(crash);

        const particleShuffle = setInterval(() => {
            particlesLayer.querySelectorAll('.crash-particle').forEach(p => {
                p.style.left = Math.random() * 100 + 'vw';
                p.style.top = Math.random() * 100 + 'vh';
            });
            errText.style.opacity = Math.random() > 0.25 ? '1' : '0.15';
        }, 120);

        setTimeout(() => {
            clearInterval(particleShuffle);
            crash.remove();
            if (onComplete) onComplete();
        }, 2000);
    };
    window.initBrowserApp = function(initialArticleId) {
        let win = document.getElementById('windowBrowser');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowBrowser';
            win.classList.add('desktop-window');
            win.style.width = 'min(540px, 94vw)';
            win.style.height = 'min(410px, calc(100dvh - 54px))';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">Поисковик</span>
                    <button class="window-close-btn" id="btnCloseBrowser">X</button>
                </div>
                <div class="window-content" style="gap:10px;">
                    <div class="browser-bar">
                        <input type="text" class="browser-input" id="browserQuery" placeholder="Введите поисковый запрос...">
                        <button class="browser-btn" id="btnBrowserSearch">Поиск</button>
                    </div>
                    <div id="browserResults" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:10px;"></div>
                </div>
            `;
            mainZone.appendChild(win);
            document.getElementById('btnCloseBrowser').addEventListener('click', () => win.classList.add('hidden'));
            document.getElementById('btnBrowserSearch').addEventListener('click', () => {
                runBrowserSearch(document.getElementById('browserQuery').value);
            });
            document.getElementById('browserQuery').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') runBrowserSearch(e.target.value);
            });
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }

        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);

        const qInput = document.getElementById('browserQuery');
        if (qInput) qInput.value = '';

        if (initialArticleId) {
            const art = articlesDb.find(a => a.id === initialArticleId);
            if (art) {
                if (qInput) qInput.value = 'https://news-city.local';
                renderArticles([art]);
            }
        } else {
            renderArticles([]);
        }
    };

    function runBrowserSearch(query) {
        const q = (query || '').toLowerCase().trim();
        if (!q) {
            renderArticles([]);
            return;
        }
        const found = articlesDb.filter(a => {
            if (a.id === 'school_1290' && !window.allowSchool1290InSearch && !q.includes('1290')) return false;
            return a.keys.some(k => q.includes(k)) || a.title.toLowerCase().includes(q);
        });
        renderArticles(found);
        if (window.onBrowserSearched) {
            window.onBrowserSearched(q, found);
        }
    }

    function renderArticles(list) {
        const box = document.getElementById('browserResults');
        if (!box) return;
        box.innerHTML = '';

        if (!list || list.length === 0) {
            box.innerHTML = `<div style="color:rgba(0,255,102,0.55); font-size:0.82rem; padding:12px;">Введите ключевое слово в строку поиска выше.</div>`;
            return;
        }

        list.forEach(art => {
            const card = document.createElement('div');
            card.className = 'article-card';
            card.innerHTML = `
                <div class="article-title">${art.title}</div>
                <div>${art.text}</div>
                ${art.linkText ? `<div class="article-link" id="artLink_${art.id}">${art.linkText}</div>` : ''}
            `;
            box.appendChild(card);

            if (art.linkText) {
                const linkEl = document.getElementById(`artLink_${art.id}`);
                if (linkEl) {
                    linkEl.addEventListener('click', () => {
                        if (window.onSchoolLinkClicked) {
                            window.onSchoolLinkClicked();
                        }
                    });
                }
            }
        });
    }

    window.initSlidesApp = function() {
        let win = document.getElementById('windowSlides');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowSlides';
            win.classList.add('desktop-window');
            win.style.width = 'min(500px, 94vw)';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">Проект_Кассандры.ppt</span>
                    <button class="window-close-btn" id="btnCloseSlides">X</button>
                </div>
                <div class="window-content">
                    <div id="slideViewport"></div>
                </div>
            `;
            mainZone.appendChild(win);
            document.getElementById('btnCloseSlides').addEventListener('click', () => win.classList.add('hidden'));
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }

        slideIndex = 0;
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);
        renderSlide();
    };
        function renderSlide() {
        const vp = document.getElementById('slideViewport');
        if (!vp) return;

        const slidesData = [
            {
                num: 'Слайд 1 / 3',
                title: 'Кибербезопасность и мошенничество в сети',
                body: 'Каждый день миллионы подростков сталкиваются с фишинговыми ссылками и шантажом в мессенджерах. Никогда не переходите по подозрительным ссылкам от незнакомцев.'
            },
            {
                num: 'Слайд 2 / 3',
                title: 'Как действуют злоумышленники',
                body: 'Преступники собирают личные данные, запугивают жертву угрозами в адрес семьи и заставляют совершать необдуманные поступки, изолируя от друзей.'
            },
            {
                num: 'Слайд 3 / 3',
                title: 'Выводы и защита',
                body: 'Главная защита от манипуляций — не молчать и сразу рассказать взрослым. ' + (fourthSlideErased ? 'Спасибо за внимание!' : 'Как все это избежать? След. слайд')
            }
        ];

        if (slideIndex < 3) {
            const s = slidesData[slideIndex];
            vp.innerHTML = `
                <div class="slide-box">
                    <div>
                        <div style="font-size:0.75rem; opacity:0.65; margin-bottom:6px;">${s.num}</div>
                        <div style="font-size:1.05rem; margin-bottom:10px; border-bottom:1px solid rgba(0,255,102,0.3); padding-bottom:6px;">${s.title}</div>
                        <div style="font-size:0.86rem; line-height:1.5;">${s.body}</div>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:16px;">
                        <button class="browser-btn" id="btnSlidePrev" ${slideIndex === 0 ? 'disabled style="opacity:0.3;"' : ''}>Назад</button>
                        ${(slideIndex < 2 || !fourthSlideErased) ? `<button class="browser-btn" id="btnSlideNext">След. слайд</button>` : ''}
                    </div>
                </div>
            `;
            const prev = document.getElementById('btnSlidePrev');
            const next = document.getElementById('btnSlideNext');
            if (prev) prev.addEventListener('click', () => { if (slideIndex > 0) { slideIndex--; renderSlide(); } });
            if (next) next.addEventListener('click', () => {
                if (slideIndex === 2 && !fourthSlideErased) {
                    const revealFourthSlide = () => {
                        slideIndex = 3;
                        fourthSlideErased = true;
                        if (window.onFourthSlideTriggered) window.onFourthSlideTriggered();
                        renderSlide();
                    };
                    if (window.triggerBrowserErrorCrash) {
                        window.triggerBrowserErrorCrash(revealFourthSlide);
                    } else {
                        revealFourthSlide();
                    }
                } else if (slideIndex < 2) {
                    slideIndex++;
                    renderSlide();
                }
            });
        } else {
            vp.innerHTML = `
                <div class="slide-box slide-graveyard" id="graveyardCard">
                    <div style="font-size:1.15rem; letter-spacing:2px; text-shadow:0 0 10px #ff3333;">НАПИШИ МНЕ!</div>
                    <div class="grave-grid">
                        <div class="grave-stone">✝<br>АЙВ</div>
                        <div class="grave-stone">✝<br>АЙВ</div>
                        <div class="grave-stone">✝<br>АЙВ</div>
                        <div class="grave-stone">✝<br>АЙВ</div>
                        <div class="grave-stone">✝<br>АЙВ</div>
                        <div class="grave-stone">✝<br>АЙВ</div>
                    </div>
                    <div style="font-size:0.75rem; opacity:0.8;" id="graveCounterHint">Ночь. Кладбище. На каждом камне твоё имя...</div>
                </div>
            `;
            const card = document.getElementById('graveyardCard');
            if (card) {
                card.addEventListener('click', () => {
                    graveClicks++;
                    card.style.transform = `scale(${1 + Math.min(graveClicks * 0.002, 0.08)})`;
                    setTimeout(() => { if (card) card.style.transform = 'scale(1)'; }, 70);
                    const hint = document.getElementById('graveCounterHint');
                    if (hint && graveClicks >= 68) {
                        hint.textContent = '68... ПАМЯТЬ РАЗБЛОКИРОВАНА';
                        hint.style.color = '#ffaa00';
                    } else if (hint && graveClicks > 10) {
                        hint.textContent = `Глитч памяти... [${graveClicks}/68]`;
                    }
                    if (window.onGraveClicked) {
                        window.onGraveClicked(graveClicks);
                    }
                });
            }
        }
    }

    window.initReportsApp = function() {
        let win = document.getElementById('windowReports');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowReports';
            win.classList.add('desktop-window');
            win.style.width = 'min(440px, 92vw)';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">Рабочие отчеты</span>
                    <button class="window-close-btn" id="btnCloseReports">X</button>
                </div>
                <div class="window-content" id="reportsBody"></div>
            `;
            mainZone.appendChild(win);
            document.getElementById('btnCloseReports').addEventListener('click', () => win.classList.add('hidden'));
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }

        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);
        renderReports();
    };

    function renderReports() {
        const body = document.getElementById('reportsBody');
        if (!body) return;
        const doneAll = momReportsDone >= 15;
        body.innerHTML = `
            <div style="font-size:0.9rem;">Статус смены: <b>${momReportsDone} / 15</b> отчетов проверено</div>
            <div style="font-size:0.8rem; opacity:0.85;">${doneAll ? 'Все отчеты на сегодня готовы. Можно проверить сообщения.' : 'Нажмите кнопку ниже, чтобы сверить и подписать следующий квартальный отчет.'}</div>
            ${!doneAll ? `<button class="browser-btn" id="btnSignReport">Подписать отчет #${momReportsDone + 1}</button>` : ''}
        `;
        const btn = document.getElementById('btnSignReport');
        if (btn) {
            btn.addEventListener('click', () => {
                momReportsDone++;
                renderReports();
                if (momReportsDone >= 15 && window.onMomReportsCompleted) {
                    window.onMomReportsCompleted();
                }
            });
        }
    }

    window.initSecretFileApp = function() {
        let win = document.getElementById('windowSecretFile');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowSecretFile';
            win.classList.add('desktop-window');
            win.style.width = 'min(440px, 92vw)';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">АРХИВ_ВЙА.DAT</span>
                    <button class="window-close-btn" id="btnCloseSecretFile">X</button>
                </div>
                <div class="window-content">
                    <div style="color:#ffaa00; font-size:0.88rem; line-height:1.45;">ВНИМАНИЕ: Получен зашифрованный пакет данных от пользователя «вйА». Содержимое помечено как критически опасное.</div>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
                        <button class="action-btn" id="btnOpenDangerFile">Открыть файл и прочитать</button>
                        <button class="browser-btn" id="btnCloseKeepSafe">Закрыть и отправить ??? не открывая</button>
                    </div>
                </div>
            `;
            mainZone.appendChild(win);
            document.getElementById('btnCloseSecretFile').addEventListener('click', () => win.classList.add('hidden'));
            document.getElementById('btnOpenDangerFile').addEventListener('click', () => {
                win.classList.add('hidden');
                if (window.onSecretFileOpened) window.onSecretFileOpened();
            });
            document.getElementById('btnCloseKeepSafe').addEventListener('click', () => {
                win.classList.add('hidden');
                if (window.openApplicationWindow) window.openApplicationWindow('messenger');
            });
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }

        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);
    };
})();

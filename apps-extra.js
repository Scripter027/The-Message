(function() {
    const articlesDb = new Array(
        {
            id: 'school_1290',
            keys: new Array('1290', 'школ', 'останк', 'мусор', 'новост'),
            title: 'СРОЧНО: Страшная находка возле школы № 1290',
            text: 'Сегодня утром в мусорном баке были найдены останки пропавших школьников школы 1290. Их не могли найти около двух недель и вот наконец останки были найдены. Виновник все еще не обличен, но он будет и будет наказан за это ужасное деяние.',
            linkText: 'Далее к комментариям родителей пропавших'
        },
        {
            id: 'missing_2022',
            keys: new Array('пропавш', 'дет', '5 лет', 'архив', 'дело', 'поиск', 'исчез'),
            title: 'Архив МВД: Серия исчезновений подростков в районе',
            text: 'За последние 5 лет в городе зафиксировано более 90 случаев бесследного исчезновения школьников 13–16 лет. По словам следователей, перед пропажей все подростки резко ссорились с друзьями, ухудшали успеваемость и совершали неадекватные поступки в школе.'
        },
        {
            id: 'devil_rumors',
            keys: new Array('дьявол', 'devil', '68', 'шантаж', 'взлом', 'угроз'),
            title: 'Городские слухи: Анонимный шантажист в сети',
            text: 'На местных форумах родители обсуждают сообщения от неизвестного аккаунта. Злоумышленник запугивает школьников, заставляет их разрывать общение с близкими и угрожает расправой над семьей при неповиновении.'
        },
        {
            id: 'forum_threads',
            keys: new Array('форум', 'жертв', 'свидетел', 'полиц', 'улик'),
            title: 'Городской форум: Обсуждение серии пропаж (Тема #409)',
            text: 'Пользователь Anon_Father: «Мой племянник перед исчезновением вдруг начал грубить матери, удалил все игры, кроме какого-то старого тетриса, и твердил, что за ним следят через веб-камеру. Полиция разводит руками — следов взлома в квартире не нашли».'
        },
        {
            id: 'olympiad',
            keys: new Array('айв', 'медал', 'учеб', 'экзамен', 'олимпиад'),
            title: 'Городской портал образования: Списки кандидатов на медаль',
            text: 'Ученики, претендующие на золотую медаль, обязаны не иметь дисциплинарных взысканий и состоять на безупречном счету у администрации школы. Ближайший срез успеваемости состоится на этой неделе.'
        },
        {
            id: 'cyber_virus',
            keys: new Array('вирус', 'ссылк', 'фишинг', 'троян', 'безопасн'),
            title: 'Бюллетень кибербезопасности: Новый троян-вымогатель',
            text: 'Специалисты предупреждают о вредоносных ссылках в мессенджере Mess. Программа блокирует доступ к сетевым настройкам, перехватывает управление окнами и имитирует системные сбои.'
        }
    );

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

        if (window.GamePrefs) {
            window.GamePrefs.playTone(140, 0.35, 'sawtooth', 0.08);
            window.GamePrefs.vibrate(45);
        }

        const crash = document.createElement('div');
        crash.id = 'systemCrashOverlay';

        const particlesLayer = document.createElement('div');
        particlesLayer.className = 'crash-particles-layer';

        const colors = new Array('#ff3333', '#00ff66', '#ffffff', '#ffaa00');
        for (let i = 0; i < 65; i++) {
            const p = document.createElement('div');
            p.className = 'crash-particle';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.top = Math.random() * 100 + 'vh';
            p.style.width = (Math.random() * 24 + 4) + 'px';
            p.style.height = (Math.random() * 14 + 3) + 'px';
            p.style.background = colors.at(Math.floor(Math.random() * colors.length));
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
        }, 1900);
    };
    window.initBrowserApp = function(initialArticleId) {
        let win = document.getElementById('windowBrowser');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowBrowser';
            win.classList.add('desktop-window');
            win.style.width = 'min(560px, 94vw)';
            win.style.height = 'min(430px, calc(100dvh - 54px))';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">Поисковик</span>
                    <button class="window-close-btn" id="btnCloseBrowser">X</button>
                </div>
                <div class="window-content" style="gap:10px;">
                    <div class="browser-bar">
                        <input type="text" class="browser-input" id="browserQuery" placeholder="Введите запрос или выберите тег...">
                        <button class="browser-btn" id="btnBrowserSearch">Поиск</button>
                    </div>
                    <div class="browser-tags" id="browserQuickTags">
                        <button class="browser-tag" data-q="пропавшие дети">#пропавшие_дети</button>
                        <button class="browser-tag" data-q="форум">#форум_409</button>
                        <button class="browser-tag" data-q="шантаж">#шантаж_в_сети</button>
                        <button class="browser-tag" data-q="медаль">#золотая_медаль</button>
                        <button class="browser-tag" data-q="вирус">#троян_mess</button>
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
            win.querySelectorAll('.browser-tag').forEach(tag => {
                tag.addEventListener('click', () => {
                    const val = tag.getAttribute('data-q');
                    document.getElementById('browserQuery').value = val;
                    runBrowserSearch(val);
                });
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
                renderArticles(new Array(art));
            }
        } else {
            renderArticles(new Array());
        }
    };

    function runBrowserSearch(query) {
        const q = (query || '').toLowerCase().trim();
        if (!q) {
            renderArticles(new Array());
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
            box.innerHTML = `<div style="color:rgba(0,255,102,0.55); font-size:0.82rem; padding:12px;">Введите ключевое слово или нажмите на один из тегов выше.</div>`;
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

        const slidesData = new Array(
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
        );

        if (slideIndex < 3) {
            const s = slidesData.at(slideIndex);
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
                    if (window.GamePrefs) {
                        window.GamePrefs.playTone(220 + Math.min(graveClicks * 6, 400), 0.03, 'sawtooth', 0.03);
                        window.GamePrefs.vibrate(12);
                    }
                    card.style.transform = `scale(${1 + Math.min(graveClicks * 0.002, 0.08)})`;
                    setTimeout(() => { if (card) card.style.transform = 'scale(1)'; }, 70);
                    const hint = document.getElementById('graveCounterHint');
                    if (hint && graveClicks >= 68) {
                        hint.textContent = '68... ПАМЯТЬ РАЗБЛОКИРОВАНА';
                        hint.style.color = '#ffaa00';
                    } else if (hint && graveClicks > 10) {
                        hint.textContent = `Глитч памяти... (${graveClicks}/68)`;
                    }
                    if (window.onGraveClicked) {
                        window.onGraveClicked(graveClicks);
                    }
                });
            }
        }
    }
    const invoicesList = new Array(
        { num: '#11', items: '12 400 ₽ + 7 600 ₽', declared: '20 000 ₽', valid: true },
        { num: '#12', items: '8 500 ₽ + 4 300 ₽', declared: '13 800 ₽', valid: false },
        { num: '#13', items: '15 200 ₽ + 9 800 ₽', declared: '25 000 ₽', valid: true },
        { num: '#14', items: '6 750 ₽ + 3 450 ₽', declared: '10 100 ₽', valid: false },
        { num: '#15', items: '19 100 ₽ + 11 900 ₽', declared: '31 000 ₽', valid: true }
    );

    window.initReportsApp = function() {
        let win = document.getElementById('windowReports');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowReports';
            win.classList.add('desktop-window');
            win.style.width = 'min(480px, 94vw)';
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

    function renderReports(errorHint) {
        const body = document.getElementById('reportsBody');
        if (!body) return;
        const doneAll = momReportsDone >= 15;
        if (doneAll) {
            body.innerHTML = `
                <div style="font-size:0.95rem;">Статус смены: <b>15 / 15</b> отчетов проверено</div>
                <div style="font-size:0.84rem; opacity:0.9; line-height:1.45;">Все квартальные накладные сверены и закрыты. Можно проверить сообщения от школы.</div>
            `;
            return;
        }
        const inv = invoicesList.at(momReportsDone - 10);
        body.innerHTML = `
            <div style="font-size:0.88rem;">Смена Лоры: <b>${momReportsDone} / 15</b> накладных закрыто</div>
            <div style="border:1px solid currentColor; padding:12px; display:flex; flex-direction:column; gap:8px; background:rgba(255,102,178,0.06);">
                <div style="font-size:0.95rem;"><b>Накладная ${inv.num}</b></div>
                <div style="font-size:0.84rem;">Позиции: ${inv.items}</div>
                <div style="font-size:0.88rem;">Указанный итог: <b>${inv.declared}</b></div>
            </div>
            ${errorHint ? `<div style="color:#ff3333; font-size:0.8rem;">${errorHint}</div>` : `<div style="font-size:0.78rem; opacity:0.8;">Проверьте сложение: если сумма верна — подпишите, если есть ошибка — верните на правку.</div>`}
            <div style="display:flex; gap:8px;">
                <button class="browser-btn" style="flex:1;" id="btnReportAccept">Подписать</button>
                <button class="action-btn" style="flex:1; padding:8px;" id="btnReportReject">В брак (ошибка)</button>
            </div>
        `;
        const handleChoice = (userSaysValid) => {
            if (userSaysValid === inv.valid) {
                momReportsDone++;
                if (window.GamePrefs) { window.GamePrefs.playTone(660, 0.05); window.GamePrefs.vibrate(15); }
                renderReports();
                if (momReportsDone >= 15 && window.onMomReportsCompleted) {
                    window.onMomReportsCompleted();
                }
            } else {
                if (window.GamePrefs) { window.GamePrefs.playTone(180, 0.14, 'sawtooth'); window.GamePrefs.vibrate(40); }
                renderReports('Ошибка сверки! Пересчитайте сумму позиций внимательнее.');
            }
        };
        document.getElementById('btnReportAccept')?.addEventListener('click', () => handleChoice(true));
        document.getElementById('btnReportReject')?.addEventListener('click', () => handleChoice(false));
    }

    window.initNotesApp = function(mode) {
        let win = document.getElementById('windowNotes');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowNotes';
            win.classList.add('desktop-window');
            win.style.width = 'min(480px, 94vw)';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">Заметки</span>
                    <button class="window-close-btn" id="btnCloseNotes">X</button>
                </div>
                <div class="window-content" id="notesBody"></div>
            `;
            mainZone.appendChild(win);
            document.getElementById('btnCloseNotes').addEventListener('click', () => win.classList.add('hidden'));
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);

        const body = document.getElementById('notesBody');
        const isMom = document.body.classList.contains('theme-mom') || mode === 'mom';
        const entries = isMom ? new Array(
            { title: 'Список дел на неделю', text: '1. Закрыть 15 квартальных отчетов.\n2. Проверить оценки Айва перед педсоветом.\n3. Записаться к врачу на пятницу.' },
            { title: 'Памятка по карте', text: 'Семейная карта привязана к магазину приложений. Кодовое слово для подтверждения покупок — имя нашего сына.' },
            { title: 'Тревожные мысли', text: 'Айв в последнее время сам не свой. Сидит за компьютером до ночи, вздрагивает от каждого уведомления. Надо поговорить с ним по душам.' }
        ) : new Array(
            { title: 'План подготовки к медали', text: 'Математика: повторить логарифмы и прогрессии.\nИнформатика: дописать проект по нейросетям и алгоритмам.\nГлавное — ни одной четверки в четверти, иначе мама снова устроит скандал.' },
            { title: 'Пароли и заметки', text: 'Школьный портал: логин ive_1290.\nНе забыть удалить игры с рабочего стола перед приходом родителей!' },
            { title: 'Черновик сообщения', text: 'Бро звал побить его рекорд в Динозаврике. Надо хотя бы на 10 минут отвлечься от учебников, иначе голова лопнет.' }
        );

        body.innerHTML = entries.map(e => `
            <div class="article-card">
                <div class="article-title">${e.title}</div>
                <div style="white-space:pre-line;">${e.text}</div>
            </div>
        `).join('');
    };
    const hwQuestions = new Array(
        {
            q: '1. Информатика: Чему равно число 68 в двоичной системе счисления?',
            opts: new Array('1000100', '1010100', '1001000'),
            ans: 0
        },
        {
            q: '2. Алгебра: Найдите значение log₂(64) + 3².',
            opts: new Array('13', '15', '17'),
            ans: 1
        },
        {
            q: '3. Алгоритмы: Какая сложность у бинарного поиска в отсортированном массиве из N элементов?',
            opts: new Array('O(N)', 'O(N²)', 'O(log N)'),
            ans: 2
        },
        {
            q: '4. Кибербезопасность: Что категорически нельзя делать при получении ссылки от неизвестного контакта?',
            opts: new Array('Закрыть диалог', 'Переходить по ссылке и вводить данные', 'Заблокировать отправителя'),
            ans: 1
        }
    );

    window.initHomeworkApp = function() {
        let win = document.getElementById('windowHomework');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowHomework';
            win.classList.add('desktop-window');
            win.style.width = 'min(490px, 94vw)';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">Школьный портал — ДЗ</span>
                    <button class="window-close-btn" id="btnCloseHw">X</button>
                </div>
                <div class="window-content" id="hwBody"></div>
            `;
            mainZone.appendChild(win);
            document.getElementById('btnCloseHw').addEventListener('click', () => win.classList.add('hidden'));
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);

        let step = 0;
        const body = document.getElementById('hwBody');

        const drawHw = (err) => {
            if (step >= hwQuestions.length) {
                body.innerHTML = `
                    <div style="font-size:1rem; color:#00ff66;">Домашнее задание выполнено на 5+!</div>
                    <div style="font-size:0.84rem; opacity:0.85; line-height:1.45;">Все задачи по алгебре и информатике отправлены учителю. Теперь можно немного отдохнуть.</div>
                `;
                if (window.onHomeworkCompleted) window.onHomeworkCompleted();
                return;
            }
            const item = hwQuestions.at(step);
            body.innerHTML = `
                <div style="font-size:0.78rem; opacity:0.75;">Задание ${step + 1} из ${hwQuestions.length} (Кандидат на золотую медаль)</div>
                <div style="font-size:0.94rem; line-height:1.45; border-bottom:1px solid rgba(0,255,102,0.3); padding-bottom:8px;">${item.q}</div>
                ${err ? `<div style="color:#ff3333; font-size:0.8rem;">${err}</div>` : ''}
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${item.opts.map((opt, idx) => `<button class="browser-btn" style="text-align:left;" data-idx="${idx}">${idx + 1}. ${opt}</button>`).join('')}
                </div>
            `;
            body.querySelectorAll('button').forEach(btn => {
                if (!btn.hasAttribute('data-idx')) return;
                btn.addEventListener('click', () => {
                    const chosen = Number(btn.getAttribute('data-idx'));
                    if (chosen === item.ans) {
                        step++;
                        if (window.GamePrefs) { window.GamePrefs.playTone(680, 0.05); window.GamePrefs.vibrate(14); }
                        drawHw();
                    } else {
                        if (window.GamePrefs) { window.GamePrefs.playTone(170, 0.14, 'sawtooth'); window.GamePrefs.vibrate(35); }
                        drawHw('Неверный ответ! Мама не простит ошибку, пересчитай.');
                    }
                });
            });
        };
        drawHw();
    };
    window.initNetHackApp = function() {
        let win = document.getElementById('windowNetHack');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowNetHack';
            win.classList.add('desktop-window');
            win.style.width = 'min(420px, 94vw)';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">Обход шлюза 4x4</span>
                    <button class="window-close-btn" id="btnCloseNetHack">X</button>
                </div>
                <div class="window-content" id="netHackBody"></div>
            `;
            mainZone.appendChild(win);
            document.getElementById('btnCloseNetHack').addEventListener('click', () => win.classList.add('hidden'));
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);

        const baseGrid = new Array(
            { type: 'L', rot: 1 }, { type: 'I', rot: 0 }, { type: 'L', rot: 2 }, { type: 'L', rot: 0 },
            { type: 'I', rot: 1 }, { type: 'L', rot: 0 }, { type: 'I', rot: 1 }, { type: 'I', rot: 0 },
            { type: 'L', rot: 0 }, { type: 'I', rot: 0 }, { type: 'L', rot: 3 }, { type: 'I', rot: 1 },
            { type: 'L', rot: 3 }, { type: 'I', rot: 1 }, { type: 'I', rot: 1 }, { type: 'L', rot: 3 }
        );
        const cells = baseGrid.map(c => ({ type: c.type, rot: c.rot }));

        function getOpenings(cell) {
            const r = cell.rot % 4;
            if (cell.type === 'I') {
                return r % 2 === 0 ? new Array(1, 0, 1, 0) : new Array(0, 1, 0, 1);
            }
            const base = new Array(1, 1, 0, 0);
            return new Array(0, 1, 2, 3).map(i => base.at((i - r + 4) % 4));
        }

        function checkConnected() {
            const visited = new Set();
            const queue = new Array(0);
            const firstOp = getOpenings(cells.at(0));
            if (!firstOp.at(0) && !firstOp.at(3)) return false;
            visited.add(0);
            while (queue.length > 0) {
                const idx = queue.shift();
                const lastOp = getOpenings(cells.at(15));
                if (idx === 15 && (lastOp.at(1) || lastOp.at(2))) return true;
                const r = Math.floor(idx / 4);
                const c = idx % 4;
                const op = getOpenings(cells.at(idx));
                const dirs = new Array(
                    { dr: -1, dc: 0, me: 0, opp: 2 },
                    { dr: 0, dc: 1, me: 1, opp: 3 },
                    { dr: 1, dc: 0, me: 2, opp: 0 },
                    { dr: 0, dc: -1, me: 3, opp: 1 }
                );
                dirs.forEach(d => {
                    const nr = r + d.dr;
                    const nc = c + d.dc;
                    if (nr < 0 || nr >= 4 || nc < 0 || nc >= 4) return;
                    const nIdx = nr * 4 + nc;
                    if (visited.has(nIdx)) return;
                    const nextOp = getOpenings(cells.at(nIdx));
                    if (op.at(d.me) && nextOp.at(d.opp)) {
                        visited.add(nIdx);
                        queue.push(nIdx);
                    }
                });
            }
            return false;
        }

        const body = document.getElementById('netHackBody');
        const renderGrid = () => {
            const solved = checkConnected();
            body.innerHTML = `
                <div style="font-size:0.8rem; opacity:0.85;">Нажимайте на узлы, чтобы повернуть канал и соединить <b>IN</b> с <b>OUT</b>.</div>
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; max-width:280px; width:100%; margin:4px auto;">
                    ${cells.map((cell, i) => {
                        const sym = cell.type === 'I' ? '┃' : '┗';
                        const deg = (cell.rot % 4) * 90;
                        const tag = i === 0 ? 'IN' : (i === 15 ? 'OUT' : '');
                        return `<button class="browser-btn" data-cell="${i}" style="height:56px; font-size:1.35rem; position:relative; display:flex; align-items:center; justify-content:center; ${solved ? 'border-color:#ffaa00; color:#ffaa00;' : ''}">
                            <span style="display:inline-block; transform:rotate(${deg}deg); transition:transform 0.14s ease;">${sym}</span>
                            ${tag ? `<span style="position:absolute; top:2px; left:4px; font-size:0.55rem; opacity:0.85;">${tag}</span>` : ''}
                        </button>`;
                    }).join('')}
                </div>
                ${solved ? `<div style="color:#ffaa00; text-align:center; font-size:0.9rem;">ШЛЮЗ ВЗЛОМАН! ДОСТУП ОТКРЫТ.</div>` : ''}
            `;
            if (solved) {
                if (window.GamePrefs) { window.GamePrefs.playTone(760, 0.12); window.GamePrefs.vibrate(30); }
                if (window.onNetHackCompleted) {
                    const cb = window.onNetHackCompleted;
                    window.onNetHackCompleted = null;
                    setTimeout(cb, 700);
                }
                return;
            }
            body.querySelectorAll('button').forEach(btn => {
                if (!btn.hasAttribute('data-cell')) return;
                btn.addEventListener('click', () => {
                    const idx = Number(btn.getAttribute('data-cell'));
                    const item = cells.at(idx);
                    item.rot = (item.rot + 1) % 4;
                    if (window.GamePrefs) { window.GamePrefs.playTone(480, 0.03); window.GamePrefs.vibrate(8); }
                    renderGrid();
                });
            });
        };
        renderGrid();
    };
    window.initMinesweeperApp = function() {
        let win = document.getElementById('windowMinesweeper');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowMinesweeper';
            win.classList.add('desktop-window');
            win.style.width = 'min(380px, 94vw)';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">Сапёр.exe</span>
                    <button class="window-close-btn" id="btnCloseMine">X</button>
                </div>
                <div class="window-content" id="mineBody"></div>
            `;
            mainZone.appendChild(win);
            document.getElementById('btnCloseMine').addEventListener('click', () => win.classList.add('hidden'));
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }
        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);

        const SIZE = 7;
        const MINES = 8;
        let flagMode = false;
        let finished = false;
        let grid = new Array();

        function setupMineBoard() {
            finished = false;
            grid = Array.from({ length: SIZE * SIZE }, () => ({ mine: false, open: false, flag: false, count: 0 }));
            let placed = 0;
            while (placed < MINES) {
                const idx = Math.floor(Math.random() * grid.length);
                if (!grid.at(idx).mine) {
                    grid.at(idx).mine = true;
                    placed++;
                }
            }
            for (let i = 0; i < grid.length; i++) {
                if (grid.at(i).mine) continue;
                const r = Math.floor(i / SIZE);
                const c = i % SIZE;
                let cnt = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && grid.at(nr * SIZE + nc).mine) cnt++;
                    }
                }
                grid.at(i).count = cnt;
            }
        }

        function floodOpen(idx) {
            if (idx < 0 || idx >= grid.length) return;
            const cell = grid.at(idx);
            if (cell.open || cell.flag) return;
            cell.open = true;
            if (cell.count === 0 && !cell.mine) {
                const r = Math.floor(idx / SIZE);
                const c = idx % SIZE;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) floodOpen(nr * SIZE + nc);
                    }
                }
            }
        }

        const body = document.getElementById('mineBody');
        const renderMine = (statusMsg) => {
            const won = !finished && grid.every(c => c.mine || c.open);
            if (won) finished = true;
            body.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                    <button class="browser-btn" id="btnMineMode" style="flex:1;">Режим: ${flagMode ? '🚩 ФЛАГ' : '⛏️ ОТКРЫТЬ'}</button>
                    <button class="browser-btn" id="btnMineReset">Заново</button>
                </div>
                ${statusMsg ? `<div style="color:#ff3333; text-align:center; font-size:0.84rem;">${statusMsg}</div>` : ''}
                ${won ? `<div style="color:#ffaa00; text-align:center; font-size:0.9rem;">ПОЛЕ РАЗМИНИРОВАНО!</div>` : ''}
                <div style="display:grid; grid-template-columns:repeat(${SIZE}, 1fr); gap:4px; max-width:290px; width:100%; margin:0 auto;">
                    ${grid.map((c, i) => {
                        let label = '';
                        let bg = 'rgba(0,255,102,0.08)';
                        let col = '#00ff66';
                        if (c.open) {
                            bg = 'rgba(0,0,0,0.85)';
                            if (c.mine) { label = '💣'; col = '#ff3333'; }
                            else if (c.count > 0) { label = String(c.count); }
                        } else if (c.flag) {
                            label = '🚩';
                            col = '#ffaa00';
                        }
                        return `<button data-m="${i}" style="height:36px; border:1px solid #00ff66; background:${bg}; color:${col}; font-family:'Russo One',sans-serif; font-size:0.85rem; cursor:pointer;">${label}</button>`;
                    }).join('')}
                </div>
            `;
            if (won && window.onMinesweeperWon) {
                const cb = window.onMinesweeperWon;
                window.onMinesweeperWon = null;
                setTimeout(cb, 700);
            }
            document.getElementById('btnMineMode')?.addEventListener('click', () => {
                flagMode = !flagMode;
                renderMine();
            });
            document.getElementById('btnMineReset')?.addEventListener('click', () => {
                setupMineBoard();
                renderMine();
            });
            body.querySelectorAll('button').forEach(btn => {
                if (!btn.hasAttribute('data-m')) return;
                btn.addEventListener('click', () => {
                    if (finished) return;
                    const idx = Number(btn.getAttribute('data-m'));
                    const cell = grid.at(idx);
                    if (flagMode) {
                        if (!cell.open) cell.flag = !cell.flag;
                        renderMine();
                        return;
                    }
                    if (cell.flag || cell.open) return;
                    if (cell.mine) {
                        finished = true;
                        grid.forEach(x => { if (x.mine) x.open = true; });
                        if (window.GamePrefs) { window.GamePrefs.playTone(130, 0.25, 'sawtooth'); window.GamePrefs.vibrate(60); }
                        renderMine('ВЗРЫВ! Нажмите «Заново», чтобы попробовать снова.');
                        return;
                    }
                    floodOpen(idx);
                    if (window.GamePrefs) { window.GamePrefs.playTone(580, 0.03); window.GamePrefs.vibrate(8); }
                    renderMine();
                });
            });
        };

        setupMineBoard();
        renderMine();
    };

    window.initSecretFileApp = function() {
        let win = document.getElementById('windowSecretFile');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowSecretFile';
            win.classList.add('desktop-window');
            win.style.width = 'min(440px, 94vw)';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">ПАКЕТ_ДАННЫХ.DAT</span>
                    <button class="window-close-btn" id="btnCloseSecretFile">X</button>
                </div>
                <div class="window-content">
                    <div style="color:#ffaa00; font-size:0.88rem; line-height:1.45;">ВНИМАНИЕ: Получен зашифрованный пакет данных. Содержимое помечено как критически опасное.</div>
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

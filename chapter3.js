(function() {
    window.initChapterThree = function() {
        const E = window.StoryEngine;
        const S = window.StoryDB.ch3;
        if (window.resetExtraAppsState) window.resetExtraAppsState();
        E.resetGraveClicks();
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'browser', 'store'];

        E.setChats({
            cass: { t: 'Кассандра', av: '👧', hide: true, m: [], o: [] },
            mom: { t: 'Мама', av: '👩', m: [], o: [] },
            d: { t: '???', av: '❓', red: true, m: [], o: [] }
        });

        E.toast('Мысли Айва', 'Откройте Браузер и поищите информацию о пропавших детях.');

        window.onBrowserSearched = (q) => {
            const chats = E.getChats();
            if (chats.cass && chats.cass.hide && (q.includes('пропав') || q.includes('дет') || q.includes('дьявол') || q.includes('исчез'))) {
                E.later(() => {
                    chats.cass.hide = false;
                    E.addM('cass', 'Кассандра', S.cass1);
                    E.setOpt('cass', [
                        { l: '1. Знаешь я сегодня очень занят и не смогу помочь', f: () => {
                            E.addM('cass', 'Айв', 'Знаешь я сегодня очень занят и не смогу помочь', true);
                            E.addM('cass', 'Кассандра', S.cassPersuade);
                            E.setOpt('cass', [{ l: 'Ладно, открываю проект...', f: () => openProject() }]);
                        }},
                        { l: '2. Ладно, сейчас гляну.', f: () => {
                            E.addM('cass', 'Айв', 'Ладно, сейчас гляну.', true);
                            openProject();
                        }}
                    ]);
                    E.toast('Кассандра', 'Привет, Айв. Поможешь с проектом?');
                }, 1500);
            }
        };

        function openProject() {
            if (!window.AppConfig.state.installed.includes('slides')) {
                window.AppConfig.state.installed.push('slides');
                if (window.renderDesktopIcons) window.renderDesktopIcons();
            }
            document.getElementById('windowMessenger')?.classList.add('hidden');
            if (window.initSlidesApp) window.initSlidesApp();
        }

        window.onGraveClicked = (n) => {
            E.setGraveClicks(n);
        };

        window.onFourthSlideTriggered = () => {
            E.setOpt('cass', [{ l: 'Что за чертовщина на 4 слайде!?', f: () => {
                E.addM('cass', 'Айв', 'Что за чертовщина на 4 слайде!?', true);
                E.addM('cass', 'Кассандра', S.cassSlide4);
                E.setOpt('cass', []);
            }}]);
            E.setOpt('d', [{ l: 'У тебя есть новое ужасное задание?', f: () => {
                E.addM('d', 'Айв', 'У тебя есть новое ужасное задание?', true);
                E.addM('d', '???', S.devil1);
                E.addM('d', 'Айв', 'Купить? Он же платный!', true);
                E.addM('d', '???', S.devil2);
                E.setTimer(30, () => E.over('30 минут истекли. Вы не купили Тетрис...'));
                E.setOpt('mom', [{ l: 'Эй мам. Помнишь я хотел одну игру? Можешь пожалуйста купить мне тетрис?', f: () => {
                    E.addM('mom', 'Айв', 'Эй мам. Помнишь я хотел одну игру? Можешь пожалуйста купить мне тетрис?', true);
                    E.addM('mom', 'Мама', S.momNoGame);
                    E.setOpt('mom', []);
                }}]);
                E.setOpt('d', [{ l: 'Зайти в Магазин и купить Тетрис (пароль: Айв)', f: () => {
                    const p = prompt('Пароль от привязанной карты (Подсказка: Имя любимого сына):');
                    if (p && p.trim().toLowerCase() === 'айв') {
                        E.clearTimer();
                        E.setOpt('d', []);
                        if (!window.AppConfig.state.installed.includes('tetris')) {
                            window.AppConfig.state.installed.push('tetris');
                            if (window.renderDesktopIcons) window.renderDesktopIcons();
                        }
                        E.addM('d', '???', S.devil3);
                        E.addM('d', 'Айв', 'Ты же обещал что её это касаться не будет!', true);
                        E.addM('d', '???', S.devil4);
                        E.setChatId('mom');
                        E.setTimer(5, () => E.over('5 минут истекли! Вы не успели написать маме.'));
                        E.setOpt('mom', [
                            { l: '1. Ну как обычно. Ты меня не понимаешь вот и все!', f: () => {
                                E.addM('mom', 'Айв', 'Ну как обычно. Ты меня не понимаешь вот и все!', true);
                                E.addM('mom', 'Мама', S.momOk);
                                E.setOpt('mom', []);
                                E.clearTimer();
                                E.later(() => {
                                    E.addM('d', '???', S.devilEnd1);
                                    E.addM('d', 'Айв', 'Твоя цель рассорить меня со всеми?', true);
                                    E.addM('d', '???', S.devilEnd2);
                                    E.setChatId('d');
                                    E.later(() => E.win(3, 'Тетрис куплен. Отношения с мамой разрушены.'), 15000);
                                }, 1500);
                            }},
                            { l: '2. Я люблю тебя.', f: () => E.over(S.momFailLove) },
                            { l: '3. Я купил тетрис.', f: () => E.over(S.momFailTetris) }
                        ]);
                    }
                }}]);
            }}]);
        };
    };
})();

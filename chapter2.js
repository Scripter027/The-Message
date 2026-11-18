(function() {
    window.initChapterTwo = function() {
        const E = window.StoryEngine;
        const S = window.StoryDB.ch2;
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'browser', 'notes', 'homework'];
        E.setChats({
            mom: { t: 'Мама', av: '👩', m: [], o: [] },
            sam: { t: 'Бро', av: '👦', m: [], o: [] },
            cls: { t: '10-А Класс', av: '🏫', m: [], o: [] },
            d: { t: '???', av: '❓', red: true, hide: true, m: [], o: [] }
        });

        let classAnswered = false;
        let samIntroAnswered = false;

        E.addM('cls', 'Староста', S.class1);
        E.setOpt('cls', [
            { l: '1. Просто голова разболелась на контрольной...', f: () => {
                E.addM('cls', 'Айв', 'Просто голова разболелась на контрольной...', true);
                E.addM('cls', 'Староста', S.class2);
                E.setOpt('cls', []);
                classAnswered = true;
            }},
            { l: '2. Не твое дело, отстань!', f: () => {
                E.addM('cls', 'Айв', 'Не твое дело, отстань!', true);
                E.addM('cls', 'Староста', S.class3);
                E.setOpt('cls', []);
                classAnswered = true;
            }}
        ]);

        E.addM('sam', 'Бро', S.samIntro);
        E.setOpt('sam', [
            { l: '1. Позже спишемся, мама сейчас убьет за двойку...', f: () => {
                E.addM('sam', 'Айв', 'Позже спишемся, мама сейчас убьет за двойку...', true);
                E.addM('sam', 'Бро', S.samIntroReply);
                E.setOpt('sam', []);
                samIntroAnswered = true;
            }}
        ]);

        E.addM('mom', 'Мама', S.mom1);
        E.setOpt('mom', [
            { l: '1. Мам, мне угрожали! Мой компьютер взломали и какой-то человек мне угрожал!', f: () => E.over(S.momFail1) },
            { l: '2. Боже да отвали от меня! Ты меня вообще не понимаешь!', f: () => E.over(S.momFail2) },
            { l: '3. Прости…', f: () => {
                E.addM('mom', 'Айв', 'Прости…', true);
                E.addM('mom', 'Мама', S.mom2);
                E.setOpt('mom', [
                    { l: '1. Мам, я хотел тебе кое что сказать… Мне угрожали! Мой компьютер взломали!', f: () => E.over(S.momFail3) },
                    { l: '2. Мам, я хотел тебе кое что сказать… Я люблю тебя.', f: () => {
                        E.addM('mom', 'Айв', 'Мам, я хотел тебе кое что сказать… Я люблю тебя.', true);
                        E.addM('mom', 'Мама', S.mom3);
                        E.setOpt('mom', []);
                        startDevilSequence();
                    }}
                ]);
            }}
        ]);
        function startDevilSequence() {
            E.later(() => {
                const chats = E.getChats();
                if (!chats.d) return;
                chats.d.hide = false;
                if (!window.AppConfig.state.installed.includes('nethack')) {
                    window.AppConfig.state.installed.push('nethack');
                    if (window.renderDesktopIcons) window.renderDesktopIcons();
                }
                E.addM('d', '???', S.devil1);
                E.setOpt('d', [{ l: 'Открыть «Шлюз 4x4» и восстановить канал связи', f: () => {
                    document.getElementById('windowMessenger')?.classList.add('hidden');
                    window.onNetHackCompleted = () => {
                        document.getElementById('windowNetHack')?.classList.add('hidden');
                        E.unlockBrowser();
                        document.getElementById('windowOfflineBrowser')?.classList.add('hidden');
                        if (window.initBrowserApp) window.initBrowserApp('school_1290');
                        window.onSchoolLinkClicked = () => {
                            document.getElementById('windowBrowser')?.classList.add('hidden');
                            document.getElementById('windowMessenger')?.classList.add('hidden');
                            const launchCrashAndDevil = () => {
                                E.addM('d', '???', S.devil2);
                                E.setChatId('d');
                                E.openMess();
                                E.setTimer(15, () => E.over('Время вышло! Вы не успели поссориться с другом...'));
                                E.setOpt('sam', [{ l: 'Мы больше не друзья!', f: () => {
                                    E.addM('sam', 'Айв', 'Мы больше не друзья!', true);
                                    E.addM('sam', 'Бро', S.sam1);
                                    E.setOpt('sam', [
                                        { l: '1. Если я не поссорюсь с тобой, то тебя и моих родителей убьют!', f: () => E.over(S.samFail1) },
                                        { l: '2. Мама не хочет, чтобы я дружил с тобой, Сэм.', f: () => {
                                            E.addM('sam', 'Айв', 'Мама не хочет, чтобы я дружил с тобой, Сэм.', true);
                                            E.addM('sam', 'Бро', S.samOk);
                                            E.setOpt('sam', []);
                                            E.clearTimer();
                                            E.later(() => {
                                                E.addM('d', '???', S.devilEnd);
                                                E.setChatId('d');
                                                E.later(() => E.win(2, 'Вы спасли близких ценой лучшего друга...'), 8000);
                                            }, 1200);
                                        }},
                                        { l: '3. Потому что', f: () => E.over(S.samFail3) }
                                    ]);
                                }}]);
                            };
                            if (window.triggerBrowserErrorCrash) {
                                window.triggerBrowserErrorCrash(launchCrashAndDevil);
                            } else {
                                launchCrashAndDevil();
                            }
                        };
                    };
                    if (window.initNetHackApp) window.initNetHackApp();
                }}]);
                E.toast('???', 'В следующий раз будь еще осторожнее...');
            }, 1200);
        }

        E.toast('Мама', 'Айв что с тобой? У тебя двойка...');
    };
})();

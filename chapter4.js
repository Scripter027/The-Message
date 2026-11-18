(function() {
    window.initChapterFour = function() {
        const E = window.StoryEngine;
        const S = window.StoryDB.ch4;
        if (window.resetExtraAppsState) window.resetExtraAppsState();
        document.body.classList.add('theme-mom');
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'notes'];
        if (window.renderDesktopIcons) window.renderDesktopIcons();

        E.setChats({
            kir: { t: 'Кирилл', av: '❤️', m: [], o: [] },
            col: { t: 'Бухгалтерия', av: '💼', m: [], o: [] },
            le: { t: 'Лариса Эдуардовна', av: '👩‍🏫', hide: true, m: [], o: [] }
        });

        E.addM('col', 'Главбух', S.col1);
        E.setOpt('col', [{ l: 'Ответить: Поняла, сейчас открою «Отчеты» и всё пересчитаю.', f: () => {
            E.addM('col', 'Лора', 'Поняла, сейчас открою «Отчеты» и всё пересчитаю.', true);
            E.addM('col', 'Главбух', S.col2);
            E.setOpt('col', []);
        }}]);

        E.addM('kir', 'Кирилл', S.kir1);
        E.setOpt('kir', [{ l: 'Ответить: Ох, Кир, да на работе все хорошо, 10 отчетов из 15 закончены...', f: () => {
            E.addM('kir', 'Лора', S.lora1, true);
            E.addM('kir', 'Кирилл', S.kir2);
            E.setOpt('kir', [{ l: 'Ответить: В этом и проблема! Пишет, да еще как!...', f: () => {
                E.addM('kir', 'Лора', S.lora2, true);
                E.addM('kir', 'Кирилл', S.kir3);
                E.setOpt('kir', [{ l: 'Ответить: Ну вот видишь! Он еще и не слушается нас!...', f: () => {
                    E.addM('kir', 'Лора', S.lora3, true);
                    E.addM('kir', 'Кирилл', S.kir4);
                    E.setOpt('kir', [{ l: 'Ответить: Да не знаю я! Хорошо, поговори с ним, как дома будешь...', f: () => {
                        E.addM('kir', 'Лора', S.lora4, true);
                        E.setOpt('kir', []);
                        window.AppConfig.state.installed.push('reports');
                        if (window.renderDesktopIcons) window.renderDesktopIcons();
                        E.toast('Работа', 'Откройте «Отчеты» и проверьте 5 накладных на ошибки!');
                    }}]);
                }}]);
            }}]);
        }}]);
        window.onMomReportsCompleted = () => {
            document.getElementById('windowReports')?.classList.add('hidden');
            const chats = E.getChats();
            if (!chats.le) return;
            chats.le.hide = false;
            E.addM('le', 'Лариса Эдуардовна', S.le1);
            E.toast('Лариса Эдуардовна', 'Здравствуйте, Элеонора Степановна...');
            E.setOpt('le', [{ l: 'здравствуйте, что произошло?', f: () => {
                E.addM('le', 'Лора', S.lora5, true);
                E.addM('le', 'Лариса Эдуардовна', S.le2);
                E.setOpt('le', [{ l: 'Я даже не знаю что сказать! Он никогда себя так не вел.', f: () => {
                    E.addM('le', 'Лора', S.lora6, true);
                    E.addM('le', 'Лариса Эдуардовна', S.le3);
                    E.setOpt('le', [{ l: 'Мне очень стыдно за него, Лариса Эдуардовна!', f: () => {
                        E.addM('le', 'Лора', S.lora7, true);
                        E.addM('le', 'Лариса Эдуардовна', S.le4);
                        E.setOpt('le', [{ l: 'Не может быть! Он не получит золотую медаль?!', f: () => {
                            E.addM('le', 'Лора', S.lora8, true);
                            E.addM('le', 'Лариса Эдуардовна', S.le5);
                            E.setOpt('le', []);
                            E.later(() => switchToIve(), 2800);
                        }}]);
                    }}]);
                }}]);
            }}]);
        };

        function switchToIve() {
            document.getElementById('windowMessenger')?.classList.add('hidden');
            window.triggerLoading(() => {
                document.body.classList.remove('theme-mom');
                window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'tetris', 'notes'];
                if (window.renderDesktopIcons) window.renderDesktopIcons();
                let readCount = 0;

                const checkAllRead = () => {
                    readCount++;
                    if (readCount >= 4) {
                        E.later(() => E.win(4, 'Айв остался один. На краю от отчисления, позора и гибели...'), 3000);
                    }
                };

                E.setChats({
                    dad: { t: 'Папа', av: '👨', m: [], o: [], onRead: checkAllRead },
                    d: { t: '???', av: '❓', red: true, hide: true, m: [], o: [], onRead: checkAllRead },
                    mom: { t: 'Мама', av: '👩', hide: true, m: [], o: [], onRead: checkAllRead },
                    sam: { t: 'Бро', av: '👦', hide: true, m: [], o: [], onRead: checkAllRead }
                });

                E.addM('dad', 'Папа', S.dadEnd);
                E.toast('Папа', 'Сын, мы сегодня с мамой задерживаемся...');

                E.later(() => {
                    const c = E.getChats();
                    if (!c.d) return;
                    c.d.hide = false;
                    E.addM('d', '???', S.devilEnd);
                    E.toast('???', 'Прицел будет снят только после твоей смерти...');
                }, 3000);

                E.later(() => {
                    const c = E.getChats();
                    if (!c.mom) return;
                    c.mom.hide = false;
                    E.addM('mom', 'Мама', S.momEnd);
                    E.toast('Мама', 'Я очень разочарована в тебе...');
                }, 6000);

                E.later(() => {
                    const c = E.getChats();
                    if (!c.sam) return;
                    c.sam.hide = false;
                    E.addM('sam', 'Бро', S.broEnd);
                    E.toast('Бро', 'Я так разочарован в тебе. (Прочитайте все 4 диалога)');
                }, 9000);
            });
        }

        E.toast('Кирилл', 'Лора, как дела на работе?');
    };
})();

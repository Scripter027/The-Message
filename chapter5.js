(function() {
    window.initChapterFive = function() {
        const E = window.StoryEngine;
        const S = window.StoryDB.ch5;
        window.AppConfig.state.installed = ['trash', 'explorer', 'messenger', 'tetris'];
        if (window.renderDesktopIcons) window.renderDesktopIcons();

        E.setChats({
            le: { t: 'Лариса Эдуардовна', av: '👩‍🏫', m: [], o: [] },
            dad: { t: 'Папа', av: '👨', m: [], o: [] },
            mom: { t: 'Мама', av: '👩', m: [], o: [] },
            sam: { t: 'Бро', av: '👦', m: [], o: [] },
            d: { t: '???', av: '❓', red: true, m: [], o: [] },
            via: { t: 'вйА', av: '👁️', hide: true, m: [], o: [] }
        });

        let sent = 0;
        const onSent = () => {
            sent++;
            if (sent < 4) return;
            E.setTetrisEvil(true);
            if (window.setTetrisPossessed) window.setTetrisPossessed(true);
            E.toast('Мысли Айва', 'Все дела завершены. Поторопите ??? в чате или откройте Тетрис...');
            E.setOpt('d', [{ l: 'Поторопить: Ну и долго ты собираешься идти? Я уже не боюсь тебя!', f: () => {
                E.addM('d', 'Айв', S.provokeIve, true);
                E.setOpt('d', []);
                startSequentialProvoke();
            }}]);
        };

        function startSequentialProvoke() {
            const steps = [
                { chat: 'd', sender: '???', text: S.provoke1, btn: 'Читать дальше...' },
                { chat: 'dad', sender: 'Папа', text: S.provoke2, btn: 'Открыть сообщение от Папы' },
                { chat: 'le', sender: 'ЛЭ', text: S.provoke3, btn: 'Открыть сообщение от Ларисы Эдуардовны' },
                { chat: 'mom', sender: 'Мама', text: S.provoke4, btn: 'Открыть сообщение от Мамы' },
                { chat: 'sam', sender: 'Бро', text: S.provoke5, btn: 'Открыть сообщение от Бро' },
                { chat: 'd', sender: '???', text: S.provoke6, btn: 'Открыть сообщение от ???' }
            ];

            let idx = 0;

            const showStepButton = () => {
                if (idx >= steps.length) {
                    const lastChat = steps[steps.length - 1].chat;
                    E.setOpt(lastChat, [{ l: 'Осознать происходящее...', f: () => {
                        E.setOpt(lastChat, []);
                        E.bsod(S.bsodFake);
                    }}]);
                    return;
                }

                const step = steps[idx];
                const targetOptChat = idx === 0 ? 'd' : steps[idx - 1].chat;
                E.setOpt(targetOptChat, [{ l: step.btn, f: () => {
                    E.setOpt(targetOptChat, []);
                    E.addM(step.chat, step.sender, step.text);
                    E.setChatId(step.chat);
                    idx++;
                    showStepButton();
                }}]);
            };

            showStepButton();
        }

        E.setOpt('le', [{ l: 'Написать извинения Ларисе Эдуардовне', f: () => { E.addM('le', 'Айв', S.toTeacher, true); E.setOpt('le', []); onSent(); } }]);
        E.setOpt('dad', [{ l: 'Написать прощание Папе', f: () => { E.addM('dad', 'Айв', S.toDad, true); E.setOpt('dad', []); onSent(); } }]);
        E.setOpt('mom', [{ l: 'Написать прощание Маме', f: () => { E.addM('mom', 'Айв', S.toMom, true); E.setOpt('mom', []); onSent(); } }]);
        E.setOpt('sam', [{ l: 'Написать прощание Бро', f: () => { E.addM('sam', 'Айв', S.toBro, true); E.setOpt('sam', []); onSent(); } }]);

        window.onEvilTetris = () => {
            const chats = E.getChats();
            if (!chats.via || !chats.via.hide) return;
            E.setOpt('d', []);
            chats.via.hide = false;
            E.addM('via', 'вйА', S.viaMsg);
            E.toast('вйА', S.viaMsg);
            E.setOpt('via', [
                { l: 'Открыть файл и посмотреть содержимое', f: () => E.bsod(S.bsodFile) },
                { l: 'Не открывать и сразу отправить файл ???', f: () => {
                    E.setOpt('via', []);
                    E.setChatId('d');
                    E.addM('d', 'Айв', S.sendFileIve, true);
                    E.later(() => E.addM('d', '???', S.devilFile1), 2500);
                    E.later(() => E.addM('d', '???', S.devilFile2), 6000);
                    E.later(() => E.addM('d', '???', S.devilFile3), 9500);
                    E.later(() => {
                        if (E.getGraveClicks() >= 68) {
                            if (window.triggerMadEnding) {
                                window.triggerMadEnding(() => E.win(5, 'Безумная концовка: Настоящий Дьявол во Плоти.'));
                            } else {
                                E.win(5, 'Безумная концовка: Настоящий Дьявол во Плоти.');
                            }
                        } else {
                            E.win(5, S.goodEnding);
                        }
                    }, 15000);
                }}
            ]);
        };

        E.toast('Мысли Айва', 'Откройте Mess и напишите всем, кого обидели...');
    };
})();

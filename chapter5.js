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
                E.later(() => E.addM('d', '???', S.provoke1), 900);
                E.later(() => E.addM('dad', 'Папа', S.provoke2), 1800);
                E.later(() => E.addM('le', 'ЛЭ', S.provoke3), 2700);
                E.later(() => E.addM('mom', 'Мама', S.provoke4), 3600);
                E.later(() => E.addM('sam', 'Бро', S.provoke5), 4500);
                E.later(() => E.addM('d', '???', S.provoke6), 5400);
                E.later(() => E.bsod(S.bsodFake), 7500);
            }}]);
        };

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
                    E.later(() => E.addM('d', '???', S.devilFile1), 1500);
                    E.later(() => E.addM('d', '???', S.devilFile2), 3400);
                    E.later(() => E.addM('d', '???', S.devilFile3), 5200);
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
                    }, 7200);
                }}
            ]);
        };

        E.toast('Мысли Айва', 'Откройте Mess и напишите всем, кого обидели...');
    };
})();

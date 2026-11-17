(function() {
    window.handleInteractiveApp = function() {
        return false;
    };

    window.resetInteractiveState = function() {};

    setInterval(() => {
        const env = document.getElementById('desktopEnv');
        if (!env || env.classList.contains('hidden')) return;

        const clock = document.getElementById('taskbarClock');
        const isPanic = clock && clock.classList.contains('timer-panic');
        if (clock && !isPanic && Math.random() < 0.1) {
            const orig = clock.textContent;
            const words = ['68:68:68', 'ОН ТУТ', 'СЛЕДЯТ'];
            clock.textContent = words[Math.floor(Math.random() * words.length)];
            clock.style.color = '#ff3333';
            setTimeout(() => {
                clock.style.color = '';
                if (!clock.classList.contains('timer-panic')) clock.textContent = orig;
            }, 600);
        }
    }, 1000);

    window.triggerMadEnding = function(onFinish) {
        const env = document.getElementById('desktopEnv');
        if (env) env.style.display = 'none';
        let ov = document.getElementById('hackerOverlay');
        if (!ov) {
            ov = document.createElement('div');
            ov.id = 'hackerOverlay';
            ov.innerHTML = `<div class="hacker-bg-effects"><div class="hacker-noise"></div></div><div class="hacker-caption">* дЬяВоЛ68 *</div><div class="hacker-text-container"><div class="hacker-msg"></div></div><div class="hacker-options-zone"></div>`;
            document.body.appendChild(ov);
        }
        ov.style.display = 'flex';
        ov.style.opacity = '1';
        ov.classList.add('visible');
        const lines = window.StoryDB ? window.StoryDB.ch5.madLines : [{ who: 'Айв', text: 'Я и есть Настоящий Дьявол во Плоти!' }];
        let st = 0;
        const msgEl = ov.querySelector('.hacker-msg');
        const optEl = ov.querySelector('.hacker-options-zone');
        const draw = () => {
            const c = lines[st];
            msgEl.innerHTML = `<div style="color:${c.who === 'Айв' ? '#00ff66' : '#ff3333'};margin-bottom:8px;">[${c.who}]</div><div>${c.text}</div>`;
            optEl.innerHTML = '';
            const b = document.createElement('button');
            b.className = 'hacker-btn';
            b.textContent = st < lines.length - 1 ? 'Далее' : 'Завершить';
            b.onclick = () => {
                if (st < lines.length - 1) {
                    st++;
                    draw();
                } else {
                    ov.classList.remove('visible');
                    ov.style.display = 'none';
                    if (onFinish) onFinish();
                }
            };
            optEl.appendChild(b);
        };
        draw();
    };
})();

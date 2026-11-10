window.initDinoGame = function() {
    const canvas = document.getElementById('dinoCanvas');
    const overBox = document.getElementById('dino-over-box');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let isPlaying = false;
    let score = 0;
    let highscore = localStorage.getItem('kpr_dino_highscore') || 0;
    
    let gameSpeed = 300;
    let speedIncrement = 8;
    let dino = { x: 40, y: 115, w: 18, h: 26, vy: 0, gravity: 38, jumpForce: -650, isGrounded: true, animFrame: 0, coyoteTimer: 0 };
    let obstacles = [];
    let lastTime = 0;

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width - 16;
        canvas.height = 150;
    }
    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
    });
    resizeObserver.observe(canvas.parentElement);

    function getLang() {
        return document.documentElement.lang || 'ru';
    }

    function spawnObstacle() {
        let minGap = 200 + ((gameSpeed / 60) * 10);
        let maxGap = 360 + ((gameSpeed / 60) * 18);
        let randomGap = Math.random() * (maxGap - minGap) + minGap;
        let lastObstacle = obstacles[obstacles.length - 1];
        let startX = lastObstacle ? lastObstacle.x + randomGap : canvas.width + 50;
        
        let randType = Math.random();
        if (score > 150 && randType < 0.25) {
            let birdY = Math.random() > 0.5 ? 90 : 112;
            obstacles.push({ x: startX, y: birdY, w: 16, h: 10, type: 'bird', frame: 0 });
        } else if (randType < 0.65) {
            obstacles.push({ x: startX, y: 115, w: 10, h: 24, type: 'cactus_small' });
        } else {
            obstacles.push({ x: startX, y: 110, w: 20, h: 30, type: 'cactus_large' });
        }
    }
    function resetGame() {
        score = 0;
        gameSpeed = 300;
        obstacles = [];
        dino.y = 115;
        dino.vy = 0;
        dino.isGrounded = true;
        dino.coyoteTimer = 0;
        isPlaying = true;
        lastTime = performance.now();
        if (overBox) overBox.innerHTML = '';
        spawnObstacle();
    }
    window.resetDinoGame = resetGame;

    function jump() {
        if (!isPlaying) {
            resetGame();
            return;
        }
        if (dino.isGrounded || dino.coyoteTimer > 0) {
            dino.vy = dino.jumpForce;
            dino.isGrounded = false;
            dino.coyoteTimer = 0;
        }
    }
    window.triggerDinoJump = jump;

    window.addEventListener('keydown', (e) => { 
        const win = document.getElementById('windowDino');
        if (!win || win.classList.contains('hidden')) return;
        if (e.code === 'Space' || e.code === 'ArrowUp') { 
            jump(); 
            e.preventDefault(); 
        } 
    });

    canvas.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        jump();
    });

    function update(dt) {
        if (!isPlaying) return;
        
        gameSpeed += speedIncrement * dt;
        score += 10 * dt;
        
        if (score >= 301) {
            isPlaying = false;
            const win = document.getElementById('windowDino');
            if (win) win.classList.add('hidden');
            if (window.triggerDinoScoreBeaten) {
                window.triggerDinoScoreBeaten();
            }
            return;
        }
        
        dino.vy += dino.gravity * 60 * dt;
        dino.y += dino.vy * dt;
        
        if (dino.y >= 115) {
            dino.y = 115;
            dino.vy = 0;
            dino.isGrounded = true;
            dino.coyoteTimer = 0;
        } else {
            if (dino.isGrounded) {
                dino.coyoteTimer = 0.1;
            }
            dino.coyoteTimer -= dt;
        }

        if (dino.isGrounded) {
            dino.animFrame += 12 * dt;
        }

        if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width) {
            spawnObstacle();
        }
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let o = obstacles[i];
            o.x -= gameSpeed * dt;
            if (o.type === 'bird') o.frame += 8 * dt;

            if (o.x + o.w < 0) {
                obstacles.splice(i, 1);
                continue;
            }

            if (dino.x < o.x + o.w && dino.x + dino.w > o.x && dino.y < o.y + o.h && dino.y + dino.h > o.y) {
                isPlaying = false;
                if (score > highscore) {
                    highscore = Math.floor(score);
                    localStorage.setItem('kpr_dino_highscore', highscore);
                }
                if (overBox) {
                    overBox.innerHTML = `<span style="color:#ff3333; font-size:12px; font-family:Russo One;">${getLang() === 'ru' ? 'СИСТЕМА СБОЯ! НАЖМИТЕ ДЛЯ СТАРТА' : 'SYSTEM CRASH! CLICK TO REBOOT'}</span>`;
                }
            }
        }
    }

    function drawDino(x, y) {
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(x + 10, y, 12, 10);
        ctx.fillRect(x + 18, y + 2, 2, 2);
        ctx.fillRect(x + 6, y + 6, 6, 8);
        ctx.fillRect(x, y + 10, 8, 12);
        ctx.fillRect(x, y + 12, 18, 10);
        ctx.fillRect(x + 12, y + 20, 6, 4);
        
        let legFrame = Math.floor(dino.animFrame) % 2;
        if (!isPlaying) {
            ctx.fillRect(x + 4, y + 22, 2, 6);
            ctx.fillRect(x + 12, y + 22, 2, 6);
        } else if (legFrame === 0) {
            ctx.fillRect(x + 4, y + 22, 2, 8);
            ctx.fillRect(x + 12, y + 22, 2, 4);
        } else {
            ctx.fillRect(x + 4, y + 22, 2, 4);
            ctx.fillRect(x + 12, y + 22, 2, 8);
        }
    }
    function drawObstacle(o) {
        ctx.fillStyle = '#00ff66';
        if (o.type === 'cactus_small') {
            ctx.fillRect(o.x + 4, o.y, 4, 30);
            ctx.fillRect(o.x, o.y + 8, 4, 10);
            ctx.fillRect(o.x + 8, o.y + 12, 4, 8);
            ctx.fillRect(o.x, o.y + 16, 12, 2);
        } else if (o.type === 'cactus_large') {
            ctx.fillRect(o.x + 8, o.y, 6, 35);
            ctx.fillRect(o.x, o.y + 10, 8, 4);
            ctx.fillRect(o.x, o.y + 6, 4, 8);
            ctx.fillRect(o.x + 14, o.y + 14, 10, 4);
            ctx.fillRect(o.x + 20, o.y + 10, 4, 8);
        } else if (o.type === 'bird') {
            let birdFrame = Math.floor(o.frame) % 2;
            ctx.fillRect(o.x, o.y + 4, 20, 4);
            ctx.fillRect(o.x + 8, o.y, 6, 6);
            if (birdFrame === 0) {
                ctx.fillRect(o.x + 4, o.y, 4, 4);
            } else {
                ctx.fillRect(o.x + 4, o.y + 8, 4, 4);
            }
        }
    }

    function render() {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 144);
        ctx.lineTo(canvas.width, 144);
        ctx.stroke();
        
        drawDino(dino.x, dino.y);
        obstacles.forEach(o => { drawObstacle(o); });
        
        ctx.fillStyle = '#00ff66';
        ctx.font = '10px Courier New';
        ctx.fillText(`HI: ${Math.floor(highscore)}  SCORE: ${Math.floor(score)}`, 10, 20);
    }

    function loop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        let dt = (timestamp - lastTime) / 1000;
        if (dt > 0.1) dt = 0.1;
        lastTime = timestamp;

        update(dt);
        render();
        requestAnimationFrame(loop);
    }

    resetGame();
    requestAnimationFrame(loop);
};

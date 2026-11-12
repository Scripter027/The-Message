(function() {
    let tetrisInterval = null;
    let board = [];
    let currentPiece = null;
    let score = 0;
    let lines = 0;
    let isGameOver = false;
    let isPossessedMode = false;

    const COLS = 10;
    const ROWS = 18;
    const BLOCK = 18;

    const SHAPES = [
        [[1, 1, 1, 1]],
        [[1, 1], [1, 1]],
        [[0, 1, 0], [1, 1, 1]],
        [[1, 0, 0], [1, 1, 1]],
        [[0, 0, 1], [1, 1, 1]],
        [[0, 1, 1], [1, 1, 0]],
        [[1, 1, 0], [0, 1, 1]]
    ];

    window.setTetrisPossessed = function(val) {
        isPossessedMode = !!val;
    };

    window.initTetrisApp = function() {
        let win = document.getElementById('windowTetris');
        if (!win) {
            const mainZone = document.querySelector('.desktop-main');
            if (!mainZone) return;
            win = document.createElement('div');
            win.id = 'windowTetris';
            win.classList.add('desktop-window');
            win.style.width = 'min(320px, 92vw)';
            win.innerHTML = `
                <div class="window-header">
                    <span class="window-title">Тетрис</span>
                    <button class="window-close-btn" id="btnCloseTetris">X</button>
                </div>
                <div class="window-content">
                    <div class="tetris-wrap" id="tetrisWrap">
                        <div id="tetrisStats" style="color:#00ff66; font-size:0.85rem;">Очки: 0 | Линии: 0</div>
                        <canvas id="tetrisCanvas" width="180" height="324" style="border:2px solid #00ff66; background:#000;"></canvas>
                        <div class="tetris-controls">
                            <button class="tetris-btn" id="tLeft">◀</button>
                            <button class="tetris-btn" id="tRotate">↻</button>
                            <button class="tetris-btn" id="tDown">▼</button>
                            <button class="tetris-btn" id="tRight">▶</button>
                        </div>
                    </div>
                </div>
            `;
            mainZone.appendChild(win);
            document.getElementById('btnCloseTetris').addEventListener('click', () => {
                win.classList.add('hidden');
                if (tetrisInterval) clearInterval(tetrisInterval);
            });
            document.getElementById('tLeft').addEventListener('click', () => movePiece(-1, 0));
            document.getElementById('tRight').addEventListener('click', () => movePiece(1, 0));
            document.getElementById('tDown').addEventListener('click', () => movePiece(0, 1));
            document.getElementById('tRotate').addEventListener('click', rotatePiece);
            if (window.makeWindowDraggable) window.makeWindowDraggable(win);
        }

        win.classList.remove('hidden');
        if (window.bringToFront) window.bringToFront(win);

        if (isPossessedMode) {
            if (tetrisInterval) clearInterval(tetrisInterval);
            const wrap = document.getElementById('tetrisWrap');
            wrap.innerHTML = `
                <div style="width:100%; height:300px; background:#000; border:2px solid #ff3333; display:flex; align-items:center; justify-content:center; text-align:center; padding:16px;">
                    <div style="color:#ff3333; font-size:1.4rem; letter-spacing:2px; text-shadow:0 0 12px #ff3333;">Я уже тут.</div>
                </div>
            `;
            if (window.onTetrisPossessedOpened) {
                window.onTetrisPossessedOpened();
            }
            return;
        }

        startNewTetris();
    };

    function startNewTetris() {
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        score = 0;
        lines = 0;
        isGameOver = false;
        spawnPiece();
        updateStats();
        drawBoard();

        if (tetrisInterval) clearInterval(tetrisInterval);
        tetrisInterval = setInterval(() => {
            const win = document.getElementById('windowTetris');
            if (!win || win.classList.contains('hidden') || isGameOver) return;
            movePiece(0, 1);
        }, 550);
    }

    function spawnPiece() {
        const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        currentPiece = {
            shape: shape,
            x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
            y: 0
        };
        if (collides(currentPiece.x, currentPiece.y, currentPiece.shape)) {
            isGameOver = true;
            const stats = document.getElementById('tetrisStats');
            if (stats) stats.textContent = `ИГРА ОКОНЧЕНА | Очки: ${score}`;
            setTimeout(() => {
                if (!isPossessedMode) startNewTetris();
            }, 1800);
        }
    }

    function collides(nx, ny, shape) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;
                const bx = nx + c;
                const by = ny + r;
                if (bx < 0 || bx >= COLS || by >= ROWS) return true;
                if (by >= 0 && board[by][bx]) return true;
            }
        }
        return false;
    }

    function mergePiece() {
        currentPiece.shape.forEach((row, r) => {
            row.forEach((val, c) => {
                if (val && currentPiece.y + r >= 0) {
                    board[currentPiece.y + r][currentPiece.x + c] = 1;
                }
            });
        });
        clearLines();
        spawnPiece();
    }

    function clearLines() {
        let cleared = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r].every(cell => cell === 1)) {
                board.splice(r, 1);
                board.unshift(Array(COLS).fill(0));
                cleared++;
                r++;
            }
        }
        if (cleared > 0) {
            lines += cleared;
            score += cleared * 100;
            updateStats();
            if (window.onTetrisScoreUpdate) {
                window.onTetrisScoreUpdate(score, lines);
            }
        }
    }

    function movePiece(dx, dy) {
        if (isGameOver || !currentPiece || isPossessedMode) return;
        if (!collides(currentPiece.x + dx, currentPiece.y + dy, currentPiece.shape)) {
            currentPiece.x += dx;
            currentPiece.y += dy;
        } else if (dy === 1) {
            mergePiece();
        }
        drawBoard();
    }

    function rotatePiece() {
        if (isGameOver || !currentPiece || isPossessedMode) return;
        const rotated = currentPiece.shape[0].map((_, idx) =>
            currentPiece.shape.map(row => row[idx]).reverse()
        );
        if (!collides(currentPiece.x, currentPiece.y, rotated)) {
            currentPiece.shape = rotated;
            drawBoard();
        }
    }

    function updateStats() {
        const stats = document.getElementById('tetrisStats');
        if (stats) stats.textContent = `Очки: ${score} | Линии: ${lines}`;
    }

    function drawBoard() {
        const canvas = document.getElementById('tetrisCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(0, 255, 102, 0.1)';
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                ctx.strokeRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);
                if (board[r][c]) {
                    ctx.fillStyle = '#00ff66';
                    ctx.fillRect(c * BLOCK + 1, r * BLOCK + 1, BLOCK - 2, BLOCK - 2);
                }
            }
        }

        if (currentPiece) {
            ctx.fillStyle = '#00ff66';
            currentPiece.shape.forEach((row, r) => {
                row.forEach((val, c) => {
                    if (val) {
                        ctx.fillRect((currentPiece.x + c) * BLOCK + 1, (currentPiece.y + r) * BLOCK + 1, BLOCK - 2, BLOCK - 2);
                    }
                });
            });
        }
    }

    window.addEventListener('keydown', (e) => {
        const win = document.getElementById('windowTetris');
        if (!win || win.classList.contains('hidden') || isPossessedMode) return;
        if (e.code === 'ArrowLeft') { movePiece(-1, 0); e.preventDefault(); }
        if (e.code === 'ArrowRight') { movePiece(1, 0); e.preventDefault(); }
        if (e.code === 'ArrowDown') { movePiece(0, 1); e.preventDefault(); }
        if (e.code === 'ArrowUp' || e.code === 'Space') { rotatePiece(); e.preventDefault(); }
    });
})();

/* =========================================================
   DODGE ARENA
   Komplettes Spiel
   ========================================================= */

/* =========================
   SUPABASE
   ========================= */

const SUPABASE_URL =
    "https://yjuwplccnklrznrgdfgx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_xRHst0TbOBTYvQySeauSQ_LUex_5IC";

let supabaseClient = null;

if (window.supabase) {
    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
}


/* =========================
   ELEMENTE
   ========================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const menu = document.getElementById("menu");
const nameScreen = document.getElementById("nameScreen");
const shop = document.getElementById("shop");
const leaderboard = document.getElementById("leaderboard");
const gameScreen = document.getElementById("gameScreen");
const pauseMenu = document.getElementById("pauseMenu");
const gameOver = document.getElementById("gameOver");

const normalButton = document.getElementById("normalButton");
const hardcoreButton = document.getElementById("hardcoreButton");
const nameButton = document.getElementById("nameButton");
const shopButton = document.getElementById("shopButton");
const leaderboardButton = document.getElementById("leaderboardButton");

const saveNameButton = document.getElementById("saveNameButton");
const shopBackButton = document.getElementById("shopBackButton");
const leaderboardBackButton =
    document.getElementById("leaderboardBackButton");

const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resumeButton");
const pauseMenuButton = document.getElementById("pauseMenuButton");

const restartButton = document.getElementById("restartButton");
const gameOverMenuButton =
    document.getElementById("gameOverMenuButton");

const nameInput = document.getElementById("nameInput");
const nameError = document.getElementById("nameError");

const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");

const menuPlayerName =
    document.getElementById("menuPlayerName");

const menuCoins =
    document.getElementById("menuCoins");

const shopCoins =
    document.getElementById("shopCoins");

const menuHighscore =
    document.getElementById("menuHighscore");

const skinList =
    document.getElementById("skinList");

const leaderboardList =
    document.getElementById("leaderboardList");

const finalScore =
    document.getElementById("finalScore");

const coinsEarned =
    document.getElementById("coinsEarned");

const newHighscore =
    document.getElementById("newHighscore");


/* =========================
   SPIELDATEN
   ========================= */

let playerName =
    localStorage.getItem("dodgeArenaName") || "Spieler";

let coins =
    Number(localStorage.getItem("dodgeArenaCoins") || 0);

let normalHighscore =
    Number(localStorage.getItem("dodgeArenaNormalHighscore") || 0);

let hardcoreHighscore =
    Number(localStorage.getItem("dodgeArenaHardcoreHighscore") || 0);

let selectedSkin =
    localStorage.getItem("dodgeArenaSkin") || "blue";

let currentMode = "normal";

let score = 0;
let lives = 2;

let running = false;
let paused = false;

let gameStartTime = 0;
let lastTime = 0;

let animationFrame = null;

let enemyTimer = 0;
let powerTimer = 0;

let difficulty = 1;

let enemies = [];
let powerUps = [];
let particles = [];


/* =========================
   SKINS
   ========================= */

const skins = [
    {
        id: "blue",
        name: "Blue",
        price: 0,
        color: "#00aaff"
    },
    {
        id: "red",
        name: "Red",
        price: 100,
        color: "#ff3b3b"
    },
    {
        id: "green",
        name: "Green",
        price: 200,
        color: "#35e06f"
    },
    {
        id: "purple",
        name: "Purple",
        price: 350,
        color: "#a855f7"
    },
    {
        id: "gold",
        name: "Gold",
        price: 750,
        color: "#ffd43b"
    }
];

let ownedSkins =
    JSON.parse(
        localStorage.getItem("dodgeArenaOwnedSkins") ||
        '["blue"]'
    );


/* =========================
   PLAYER
   ========================= */

const player = {
    x: 0,
    y: 0,
    radius: 18,
    speed: 7,
    targetX: 0,
    targetY: 0,
    shield: false
};


/* =========================
   BUTTON-HILFE
   ========================= */

function connectButton(element, callback) {
    if (!element) return;

    element.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        callback();
    });

    element.addEventListener("touchend", function(event) {
        event.preventDefault();
        event.stopPropagation();
        callback();
    }, { passive: false });
}


/* =========================
   ANZEIGE
   ========================= */

function hideAllScreens() {
    if (menu) menu.style.display = "none";
    if (nameScreen) nameScreen.style.display = "none";
    if (shop) shop.style.display = "none";
    if (leaderboard) leaderboard.style.display = "none";
    if (gameScreen) gameScreen.style.display = "none";
    if (pauseMenu) pauseMenu.style.display = "none";
    if (gameOver) gameOver.style.display = "none";
}

function showMenu() {
    running = false;
    paused = false;

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    hideAllScreens();

    if (menu) {
        menu.style.display = "flex";
    }

    updateMenu();
}

function showNameScreen() {
    hideAllScreens();

    if (nameScreen) {
        nameScreen.style.display = "flex";
    }

    if (nameInput) {
        nameInput.value =
            playerName === "Spieler" ? "" : playerName;

        setTimeout(() => {
            nameInput.focus();
        }, 100);
    }
}

function showShop() {
    hideAllScreens();

    if (shop) {
        shop.style.display = "flex";
    }

    updateShop();
}

function showLeaderboard(mode = "normal") {
    hideAllScreens();

    if (leaderboard) {
        leaderboard.style.display = "flex";
    }

    if (leaderboardList) {
        leaderboardList.innerHTML =
            "<p>⏳ Lade Bestenliste...</p>";
    }

    loadLeaderboard(mode);
}


/* =========================
   MENU
   ========================= */

function updateMenu() {
    if (menuPlayerName) {
        menuPlayerName.textContent = playerName;
    }

    if (menuCoins) {
        menuCoins.textContent = coins;
    }

    if (menuHighscore) {
        const best =
            currentMode === "hardcore"
                ? hardcoreHighscore
                : normalHighscore;

        menuHighscore.textContent = best;
    }
}


/* =========================
   NAME
   ========================= */

const blockedNames = [
    "arsch",
    "hurensohn",
    "hure",
    "wichser",
    "fick",
    "fotze",
    "bastard"
];

function validName(name) {
    const clean = name.trim();

    if (clean.length < 2) {
        return false;
    }

    const lower = clean.toLowerCase();

    for (const word of blockedNames) {
        if (lower.includes(word)) {
            return false;
        }
    }

    return true;
}

function saveName() {
    if (!nameInput) return;

    const newName =
        nameInput.value.trim();

    if (!validName(newName)) {
        if (nameError) {
            nameError.textContent =
                "❌ Dieser Name ist nicht erlaubt.";
        }
        return;
    }

    playerName = newName;

    localStorage.setItem(
        "dodgeArenaName",
        playerName
    );

    if (nameError) {
        nameError.textContent = "";
    }

    showMenu();
}


/* =========================
   COINS
   ========================= */

function saveCoins() {
    localStorage.setItem(
        "dodgeArenaCoins",
        String(coins)
    );
}

function addCoins(amount) {
    coins += amount;

    if (coins < 0) {
        coins = 0;
    }

    saveCoins();
    updateMenu();
    updateShop();
}


/* =========================
   SHOP
   ========================= */

function saveOwnedSkins() {
    localStorage.setItem(
        "dodgeArenaOwnedSkins",
        JSON.stringify(ownedSkins)
    );
}

function saveSelectedSkin() {
    localStorage.setItem(
        "dodgeArenaSkin",
        selectedSkin
    );
}

function updateShop() {
    if (shopCoins) {
        shopCoins.textContent = coins;
    }

    if (!skinList) return;

    skinList.innerHTML = "";

    skins.forEach(skin => {
        const item =
            document.createElement("div");

        item.className = "skinItem";

        const owned =
            ownedSkins.includes(skin.id);

        const selected =
            selectedSkin === skin.id;

        let buttonText = "";

        if (selected) {
            buttonText = "✓ Ausgewählt";
        } else if (owned) {
            buttonText = "Auswählen";
        } else {
            buttonText =
                `🪙 ${skin.price}`;
        }

        item.innerHTML = `
            <div class="skinPreview"
                 style="
                    width:50px;
                    height:50px;
                    border-radius:50%;
                    background:${skin.color};
                    margin:auto;
                 ">
            </div>

            <h3>${skin.name}</h3>

            <button class="skinButton">
                ${buttonText}
            </button>
        `;

        const button =
            item.querySelector(".skinButton");

        button.addEventListener("click", () => {
            if (owned) {
                selectedSkin = skin.id;
                saveSelectedSkin();
                updateShop();
                return;
            }

            if (coins >= skin.price) {
                coins -= skin.price;

                ownedSkins.push(skin.id);

                saveCoins();
                saveOwnedSkins();

                selectedSkin = skin.id;
                saveSelectedSkin();

                updateShop();
                updateMenu();
            }
        });

        skinList.appendChild(item);
    });
}


/* =========================
   CANVAS
   ========================= */

function resizeCanvas() {
    if (!canvas) return;

    const rect =
        canvas.getBoundingClientRect();

    canvas.width =
        Math.max(1, Math.floor(rect.width));

    canvas.height =
        Math.max(1, Math.floor(rect.height));

    if (canvas.width < 100) {
        canvas.width = window.innerWidth;
    }

    if (canvas.height < 100) {
        canvas.height = window.innerHeight;
    }
}

window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================
   MODE
   ========================= */

function startGame(mode) {
    currentMode = mode;

    score = 0;

    lives =
        mode === "hardcore"
            ? 1
            : 2;

    running = true;
    paused = false;

    difficulty = 1;

    enemies = [];
    powerUps = [];
    particles = [];

    enemyTimer = 0;
    powerTimer = 0;

    player.shield = false;

    hideAllScreens();

    if (gameScreen) {
        gameScreen.style.display = "flex";
    }

    resizeCanvas();

    player.x =
        canvas.width / 2;

    player.y =
        canvas.height - 90;

    player.targetX =
        player.x;

    player.targetY =
        player.y;

    updateHUD();

    gameStartTime =
        performance.now();

    lastTime =
        performance.now();

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }

    animationFrame =
        requestAnimationFrame(gameLoop);
}


/* =========================
   HUD
   ========================= */

function updateHUD() {
    if (scoreElement) {
        scoreElement.textContent =
            `SCORE: ${Math.floor(score)}`;
    }

    if (livesElement) {
        if (currentMode === "hardcore") {
            livesElement.textContent =
                lives > 0 ? "❤️" : "";
        } else {
            livesElement.textContent =
                "❤️".repeat(Math.max(0, lives));
        }
    }
}


/* =========================
   ENEMIES
   ========================= */

function spawnEnemy() {
    if (!canvas) return;

    const width =
        20 + Math.random() * 35;

    const height =
        20 + Math.random() * 35;

    const x =
        Math.random() *
        Math.max(1, canvas.width - width);

    const speed =
        2.5 +
        Math.random() * 2.5 +
        difficulty * 0.35;

    enemies.push({
        x,
        y: -height - 10,
        width,
        height,
        speed,
        rotation:
            Math.random() * Math.PI,
        rotationSpeed:
            (Math.random() - 0.5) * 0.08
    });
}


/* =========================
   POWER UPS
   ========================= */

function spawnPowerUp() {
    if (currentMode === "hardcore") {
        return;
    }

    if (!canvas) return;

    powerUps.push({
        x:
            25 +
            Math.random() *
            Math.max(1, canvas.width - 50),

        y: -30,

        radius: 14,

        speed:
            2.2 +
            Math.random() * 1.2,

        type: "shield"
    });
}


/* =========================
   KOLLISION
   ========================= */

function circleRectCollision(
    circle,
    rect
) {
    const closestX =
        Math.max(
            rect.x,
            Math.min(
                circle.x,
                rect.x + rect.width
            )
        );

    const closestY =
        Math.max(
            rect.y,
            Math.min(
                circle.y,
                rect.y + rect.height
            )
        );

    const dx =
        circle.x - closestX;

    const dy =
        circle.y - closestY;

    return (
        dx * dx +
        dy * dy <
        circle.radius * circle.radius
    );
}


/* =========================
   SCHADEN
   ========================= */

function playerHit() {
    if (!running || paused) {
        return;
    }

    if (player.shield) {
        player.shield = false;
        createParticles(
            player.x,
            player.y,
            18
        );
        return;
    }

    lives--;

    createParticles(
        player.x,
        player.y,
        25
    );

    updateHUD();

    if (lives <= 0) {
        endGame();
    }
}


/* =========================
   GAME OVER
   ========================= */

function endGame() {
    if (!running) return;

    running = false;
    paused = false;

    const final =
        Math.floor(score);

    const earned =
        Math.max(
            1,
            Math.floor(final / 10)
        );

    addCoins(earned);

    let isNewHighscore = false;

    if (currentMode === "hardcore") {
        if (final > hardcoreHighscore) {
            hardcoreHighscore = final;

            localStorage.setItem(
                "dodgeArenaHardcoreHighscore",
                String(hardcoreHighscore)
            );

            isNewHighscore = true;
        }
    } else {
        if (final > normalHighscore) {
            normalHighscore = final;

            localStorage.setItem(
                "dodgeArenaNormalHighscore",
                String(normalHighscore)
            );

            isNewHighscore = true;
        }
    }

    if (finalScore) {
        finalScore.textContent =
            `Score: ${final}`;
    }

    if (coinsEarned) {
        coinsEarned.textContent =
            `🪙 +${earned} Coins`;
    }

    if (newHighscore) {
        newHighscore.style.display =
            isNewHighscore
                ? "block"
                : "none";
    }

    hideAllScreens();

    if (gameOver) {
        gameOver.style.display =
            "flex";
    }

    submitScore(
        playerName,
        final,
        currentMode
    );
}


/* =========================
   PAUSE
   ========================= */

function pauseGame() {
    if (!running || paused) {
        return;
    }

    paused = true;

    if (pauseMenu) {
        pauseMenu.style.display =
            "flex";
    }
}

function resumeGame() {
    if (!running) {
        return;
    }

    paused = false;

    if (pauseMenu) {
        pauseMenu.style.display =
            "none";
    }

    lastTime =
        performance.now();
}

function restartGame() {
    if (gameOver) {
        gameOver.style.display =
            "none";
    }

    startGame(currentMode);
}


/* =========================
   PARTIKEL
   ========================= */

function createParticles(
    x,
    y,
    amount
) {
    for (let i = 0; i < amount; i++) {
        particles.push({
            x,
            y,

            vx:
                (Math.random() - 0.5) * 8,

            vy:
                (Math.random() - 0.5) * 8,

            life: 1,

            size:
                2 + Math.random() * 4
        });
    }
}

function updateParticles(delta) {
    particles.forEach(p => {
        p.x += p.vx * delta * 0.06;
        p.y += p.vy * delta * 0.06;

        p.vy +=
            0.15 * delta * 0.06;

        p.life -=
            0.025 * delta * 0.06;
    });

    particles =
        particles.filter(
            p => p.life > 0
        );
}


/* =========================
   UPDATE
   ========================= */

function update(delta) {
    if (!running || paused) {
        return;
    }

    score +=
        delta * 0.01;

    difficulty =
        1 +
        (performance.now() - gameStartTime) /
        30000;

    enemyTimer -= delta;

    const spawnDelay =
        Math.max(
            180,
            850 -
            difficulty * 65
        );

    if (enemyTimer <= 0) {
        spawnEnemy();
        enemyTimer = spawnDelay;
    }

    if (currentMode !== "hardcore") {
        powerTimer -= delta;

        if (powerTimer <= 0) {
            spawnPowerUp();

            powerTimer =
                9000 +
                Math.random() * 7000;
        }
    }

    /* Spieler bewegen */

    const dx =
        player.targetX - player.x;

    const dy =
        player.targetY - player.y;

    player.x +=
        dx * 0.18;

    player.y +=
        dy * 0.18;

    player.x =
        Math.max(
            player.radius,
            Math.min(
                canvas.width -
                player.radius,
                player.x
            )
        );

    player.y =
        Math.max(
            player.radius,
            Math.min(
                canvas.height -
                player.radius,
                player.y
            )
        );

    /* Gegner */

    enemies.forEach(enemy => {
        enemy.y +=
            enemy.speed *
            delta *
            0.06;

        enemy.rotation +=
            enemy.rotationSpeed *
            delta;

        if (
            circleRectCollision(
                player,
                enemy
            )
        ) {
            enemy.hit = true;
            playerHit();
        }
    });

    enemies =
        enemies.filter(
            enemy =>
                !enemy.hit &&
                enemy.y <
                canvas.height + 100
        );

    /* Power Ups */

    powerUps.forEach(power => {
        power.y +=
            power.speed *
            delta *
            0.06;

        const dx =
            player.x - power.x;

        const dy =
            player.y - power.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distance <
            player.radius +
            power.radius
        ) {
            player.shield = true;
            power.collected = true;

            createParticles(
                power.x,
                power.y,
                15
            );
        }
    });

    powerUps =
        powerUps.filter(
            power =>
                !power.collected &&
                power.y <
                canvas.height + 50
        );

    updateParticles(delta);
    updateHUD();
}


/* =========================
   DRAW
   ========================= */

function drawBackground() {
    if (!ctx) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    /* Hintergrund */

    ctx.fillStyle = "#070b16";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    /* Raster */

    ctx.strokeStyle =
        "rgba(255,255,255,0.045)";

    ctx.lineWidth = 1;

    const grid = 40;

    for (
        let x = 0;
        x < canvas.width;
        x += grid
    ) {
        ctx.beginPath();

        ctx.moveTo(x, 0);
        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();
    }

    for (
        let y = 0;
        y < canvas.height;
        y += grid
    ) {
        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();
    }
}

function drawPlayer() {
    if (!ctx) return;

    const skin =
        skins.find(
            s => s.id === selectedSkin
        ) || skins[0];

    /* Schild */

    if (player.shield) {
        ctx.beginPath();

        ctx.arc(
            player.x,
            player.y,
            player.radius + 9,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "rgba(50,180,255,0.9)";

        ctx.lineWidth = 4;

        ctx.stroke();

        ctx.beginPath();

        ctx.arc(
            player.x,
            player.y,
            player.radius + 14,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "rgba(50,180,255,0.25)";

        ctx.lineWidth = 3;

        ctx.stroke();
    }

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        skin.color;

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        player.x - 6,
        player.y - 6,
        5,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(255,255,255,0.55)";

    ctx.fill();
}

function drawEnemies() {
    if (!ctx) return;

    enemies.forEach(enemy => {
        ctx.save();

        ctx.translate(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2
        );

        ctx.rotate(
            enemy.rotation
        );

        ctx.fillStyle =
            "#ff3548";

        ctx.shadowColor =
            "rgba(255,50,70,0.5)";

        ctx.shadowBlur = 12;

        ctx.fillRect(
            -enemy.width / 2,
            -enemy.height / 2,
            enemy.width,
            enemy.height
        );

        ctx.restore();
    });
}

function drawPowerUps() {
    if (!ctx) return;

    powerUps.forEach(power => {
        ctx.beginPath();

        ctx.arc(
            power.x,
            power.y,
            power.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#35c7ff";

        ctx.shadowColor =
            "#35c7ff";

        ctx.shadowBlur = 18;

        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "bold 14px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            "S",
            power.x,
            power.y
        );
    });
}

function drawParticles() {
    if (!ctx) return;

    particles.forEach(p => {
        ctx.globalAlpha =
            Math.max(0, p.life);

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.fill();
    });

    ctx.globalAlpha = 1;
}

function draw() {
    drawBackground();
    drawPowerUps();
    drawEnemies();
    drawParticles();
    drawPlayer();
}


/* =========================
   GAME LOOP
   ========================= */

function gameLoop(timestamp) {
    if (!running) {
        draw();
        return;
    }

    const delta =
        Math.min(
            50,
            timestamp - lastTime
        );

    lastTime = timestamp;

    if (!paused) {
        update(delta);
        draw();
    }

    animationFrame =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================
   MAUS
   ========================= */

if (canvas) {
    canvas.addEventListener(
        "mousemove",
        event => {
            if (!running || paused) {
                return;
            }

            const rect =
                canvas.getBoundingClientRect();

            player.targetX =
                event.clientX -
                rect.left;

            player.targetY =
                event.clientY -
                rect.top;
        }
    );

    canvas.addEventListener(
        "mousedown",
        event => {
            if (!running || paused) {
                return;
            }

            const rect =
                canvas.getBoundingClientRect();

            player.targetX =
                event.clientX -
                rect.left;

            player.targetY =
                event.clientY -
                rect.top;
        }
    );

    canvas.addEventListener(
        "touchstart",
        event => {
            if (!running || paused) {
                return;
            }

            const touch =
                event.touches[0];

            if (!touch) return;

            const rect =
                canvas.getBoundingClientRect();

            player.targetX =
                touch.clientX -
                rect.left;

            player.targetY =
                touch.clientY -
                rect.top;
        },
        { passive: true }
    );

    canvas.addEventListener(
        "touchmove",
        event => {
            if (!running || paused) {
                return;
            }

            const touch =
                event.touches[0];

            if (!touch) return;

            const rect =
                canvas.getBoundingClientRect();

            player.targetX =
                touch.clientX -
                rect.left;

            player.targetY =
                touch.clientY -
                rect.top;
        },
        { passive: true }
    );
}


/* =========================
   BUTTONS
   ========================= */

/* Normal */

connectButton(
    normalButton,
    () => startGame("normal")
);

/* Hardcore */

connectButton(
    hardcoreButton,
    () => startGame("hardcore")
);

/* Name */

connectButton(
    nameButton,
    () => showNameScreen()
);

/* Shop */

connectButton(
    shopButton,
    () => showShop()
);

/* Bestenliste */

connectButton(
    leaderboardButton,
    () => showLeaderboard("normal")
);

/* Name speichern */

connectButton(
    saveNameButton,
    () => saveName()
);

/* Shop zurück */

connectButton(
    shopBackButton,
    () => showMenu()
);

/* Bestenliste zurück */

connectButton(
    leaderboardBackButton,
    () => showMenu()
);

/* Pause */

connectButton(
    pauseButton,
    () => pauseGame()
);

/* Weiter */

connectButton(
    resumeButton,
    () => resumeGame()
);

/* Pause -> Menü */

connectButton(
    pauseMenuButton,
    () => showMenu()
);

/* Nochmal */

connectButton(
    restartButton,
    () => restartGame()
);

/* Game Over -> Menü */

connectButton(
    gameOverMenuButton,
    () => showMenu()
);


/* =========================
   BESTENLISTE
   ========================= */

function getLeaderboardTable(mode) {
    return mode === "hardcore"
        ? "hardcore"
        : "normal";
}

async function loadLeaderboard(mode) {
    const table =
        getLeaderboardTable(mode);

    if (!leaderboardList) {
        return;
    }

    if (!supabaseClient) {
        leaderboardList.innerHTML =
            "<p>❌ Bestenliste konnte nicht geladen werden.</p>";

        return;
    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from(table)
            .select("name, score")
            .order("score", {
                ascending: false
            })
            .limit(10);

    if (error) {
        console.error(
            "Leaderboard Fehler:",
            error
        );

        leaderboardList.innerHTML =
            "<p>❌ Bestenliste konnte nicht geladen werden.</p>";

        return;
    }

    if (!data || data.length === 0) {
        leaderboardList.innerHTML =
            "<p>Noch keine Scores vorhanden.</p>";

        return;
    }

    leaderboardList.innerHTML = "";

    const title =
        document.createElement("h2");

    title.textContent =
        mode === "hardcore"
            ? "🔴 HARDCORE"
            : "🟢 NORMAL";

    leaderboardList.appendChild(title);

    data.forEach((entry, index) => {
        const row =
            document.createElement("div");

        row.className =
            "leaderboardRow";

        row.innerHTML = `
            <span>#${index + 1}</span>
            <strong>${escapeHTML(entry.name)}</strong>
            <span>${Number(entry.score) || 0}</span>
        `;

        leaderboardList.appendChild(row);
    });
}

async function submitScore(
    name,
    playerScore,
    mode
) {
    if (!supabaseClient) {
        return;
    }

    if (
        !name ||
        !Number.isFinite(playerScore)
    ) {
        return;
    }

    const table =
        getLeaderboardTable(mode);

    const {
        error
    } =
        await supabaseClient
            .from(table)
            .insert({
                name:
                    name.substring(0, 16),
                score:
                    Math.floor(playerScore)
            });

    if (error) {
        console.error(
            "Score konnte nicht gespeichert werden:",
            error
        );
    }
}


/* =========================
   SICHERHEIT
   ========================= */

function escapeHTML(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================
   START
   ========================= */

updateMenu();

hideAllScreens();

if (menu) {
    menu.style.display = "flex";
}

resizeCanvas();

console.log(
    "Dodge Arena erfolgreich gestartet."
);
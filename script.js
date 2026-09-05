"use strict";

/* =========================================================
   DODGE ARENA
   ========================================================= */


/* =========================================================
   SUPABASE
   ========================================================= */

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


/* =========================================================
   HTML ELEMENTE
   ========================================================= */

const $ = id => document.getElementById(id);

const menu = $("menu");
const nameScreen = $("nameScreen");
const shop = $("shop");
const leaderboard = $("leaderboard");
const gameScreen = $("gameScreen");
const pauseMenu = $("pauseMenu");
const gameOver = $("gameOver");

const normalButton = $("normalButton");
const hardcoreButton = $("hardcoreButton");
const nameButton = $("nameButton");
const shopButton = $("shopButton");
const leaderboardButton = $("leaderboardButton");

const saveNameButton = $("saveNameButton");
const nameBackButton = $("nameBackButton");
const shopBackButton = $("shopBackButton");
const leaderboardBackButton = $("leaderboardBackButton");

const leaderboardNormalButton =
    $("leaderboardNormalButton");

const leaderboardHardcoreButton =
    $("leaderboardHardcoreButton");

const pauseButton = $("pauseButton");
const resumeButton = $("resumeButton");
const pauseMenuButton = $("pauseMenuButton");

const restartButton = $("restartButton");
const gameOverMenuButton = $("gameOverMenuButton");

const nameInput = $("nameInput");
const nameError = $("nameError");

const menuPlayerName = $("menuPlayerName");
const menuCoins = $("menuCoins");
const menuHighscore = $("menuHighscore");

const shopCoins = $("shopCoins");
const skinList = $("skinList");

const leaderboardList = $("leaderboardList");

const scoreElement = $("score");
const livesElement = $("lives");

const finalScore = $("finalScore");
const coinsEarned = $("coinsEarned");
const newHighscore = $("newHighscore");


/* =========================================================
   CANVAS
   ========================================================= */

const canvas = $("gameCanvas");

const ctx = canvas
    ? canvas.getContext("2d")
    : null;


/* =========================================================
   SPIELERDATEN
   ========================================================= */

let playerName =
    localStorage.getItem("dodgeArenaName") ||
    "Spieler";

let coins =
    Number(
        localStorage.getItem("dodgeArenaCoins") || 0
    );

let normalHighscore =
    Number(
        localStorage.getItem(
            "dodgeArenaNormalHighscore"
        ) || 0
    );

let hardcoreHighscore =
    Number(
        localStorage.getItem(
            "dodgeArenaHardcoreHighscore"
        ) || 0
    );

let currentSkin =
    localStorage.getItem(
        "dodgeArenaSkin"
    ) || "blue";

let ownedSkins =
    JSON.parse(
        localStorage.getItem(
            "dodgeArenaOwnedSkins"
        ) || '["blue"]'
    );


/* =========================================================
   SPIELSTATUS
   ========================================================= */

let currentMode = "normal";

let gameRunning = false;
let gamePaused = false;

let score = 0;
let lives = 2;

let difficulty = 1;

let lastTime = 0;
let gameStartTime = 0;

let animationId = null;

let enemySpawnTimer = 0;
let powerUpTimer = 0;

let selectedLeaderboard = "normal";


/* =========================================================
   PLAYER
   ========================================================= */

const player = {
    x: 0,
    y: 0,

    radius: 19,

    targetX: 0,

    shield: false
};


/* =========================================================
   OBJEKTE
   ========================================================= */

let enemies = [];
let powerUps = [];
let particles = [];


/* =========================================================
   SKINS
   ========================================================= */

const skins = [
    {
        id: "blue",
        name: "Blue",
        price: 0,
        color: "#28a9ff"
    },

    {
        id: "red",
        name: "Red",
        price: 100,
        color: "#ff3d4f"
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
    },

    {
        id: "cyan",
        name: "Cyan",
        price: 1000,
        color: "#00e5ff"
    }
];


/* =========================================================
   SCREEN SYSTEM
   ========================================================= */

function hideScreens() {

    if (menu)
        menu.classList.remove("active");

    if (nameScreen)
        nameScreen.classList.remove("active");

    if (shop)
        shop.classList.remove("active");

    if (leaderboard)
        leaderboard.classList.remove("active");

    if (gameScreen)
        gameScreen.classList.remove("active");

    if (pauseMenu)
        pauseMenu.classList.remove("active");

    if (gameOver)
        gameOver.classList.remove("active");
}


function showScreen(screen) {

    hideScreens();

    if (screen)
        screen.classList.add("active");
}


function showMenu() {

    stopGame();

    showScreen(menu);

    updateMenu();
}


function showNameScreen() {

    showScreen(nameScreen);

    if (nameInput) {

        nameInput.value =
            playerName === "Spieler"
                ? ""
                : playerName;

        setTimeout(() => {
            nameInput.focus();
        }, 100);
    }

    if (nameError)
        nameError.textContent = "";
}


function showShop() {

    showScreen(shop);

    updateShop();
}


function showLeaderboardScreen() {

    showScreen(leaderboard);

    loadLeaderboard(
        selectedLeaderboard
    );
}


/* =========================================================
   MENU
   ========================================================= */

function updateMenu() {

    if (menuPlayerName)
        menuPlayerName.textContent =
            playerName;

    if (menuCoins)
        menuCoins.textContent =
            coins;

    if (menuHighscore) {

        const highscore =
            currentMode === "hardcore"
                ? hardcoreHighscore
                : normalHighscore;

        menuHighscore.textContent =
            highscore;
    }
}


/* =========================================================
   NAME
   ========================================================= */

const forbiddenWords = [
    "arsch",
    "hurensohn",
    "wichser",
    "fick",
    "fotze",
    "hure",
    "bastard"
];


function nameIsValid(name) {

    const clean =
        name.trim();

    if (clean.length < 2)
        return false;

    const lower =
        clean.toLowerCase();

    for (const word of forbiddenWords) {

        if (lower.includes(word))
            return false;
    }

    return true;
}


function saveName() {

    if (!nameInput)
        return;

    const newName =
        nameInput.value.trim();

    if (!nameIsValid(newName)) {

        if (nameError)
            nameError.textContent =
                "❌ Dieser Name ist nicht erlaubt.";

        return;
    }

    playerName =
        newName.substring(0, 16);

    localStorage.setItem(
        "dodgeArenaName",
        playerName
    );

    showMenu();
}


/* =========================================================
   COINS
   ========================================================= */

function saveCoins() {

    localStorage.setItem(
        "dodgeArenaCoins",
        String(coins)
    );
}


function addCoins(amount) {

    coins += amount;

    if (coins < 0)
        coins = 0;

    saveCoins();

    updateMenu();
    updateShop();
}


/* =========================================================
   SHOP
   ========================================================= */

function saveSkins() {

    localStorage.setItem(
        "dodgeArenaOwnedSkins",
        JSON.stringify(ownedSkins)
    );
}


function saveSkin() {

    localStorage.setItem(
        "dodgeArenaSkin",
        currentSkin
    );
}


function updateShop() {

    if (shopCoins)
        shopCoins.textContent =
            coins;

    if (!skinList)
        return;

    skinList.innerHTML = "";

    skins.forEach(skin => {

        const owned =
            ownedSkins.includes(
                skin.id
            );

        const selected =
            currentSkin === skin.id;

        const item =
            document.createElement("div");

        item.className =
            "skinItem";

        item.innerHTML = `
            <div
                class="skinPreview"
                style="
                    width:52px;
                    height:52px;
                    border-radius:50%;
                    background:${skin.color};
                    margin:auto;
                "
            ></div>

            <h3>${escapeHTML(skin.name)}</h3>

            <button class="skinButton">
                ${
                    selected
                        ? "✓ Ausgewählt"
                        : owned
                            ? "Auswählen"
                            : `🪙 ${skin.price}`
                }
            </button>
        `;

        const button =
            item.querySelector(
                ".skinButton"
            );

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                if (owned) {

                    currentSkin =
                        skin.id;

                    saveSkin();
                    updateShop();

                    return;
                }

                if (coins >= skin.price) {

                    coins -=
                        skin.price;

                    ownedSkins.push(
                        skin.id
                    );

                    currentSkin =
                        skin.id;

                    saveCoins();
                    saveSkins();
                    saveSkin();

                    updateShop();
                    updateMenu();
                }
            }
        );

        skinList.appendChild(item);
    });
}


/* =========================================================
   CANVAS GRÖSSE
   ========================================================= */

function resizeCanvas() {

    if (!canvas)
        return;

    const width =
        window.innerWidth;

    const height =
        Math.max(
            300,
            window.innerHeight -
            70
        );

    canvas.width =
        width;

    canvas.height =
        height;

    if (gameRunning) {

        player.y =
            canvas.height - 70;

        player.x =
            Math.max(
                player.radius,
                Math.min(
                    canvas.width -
                    player.radius,
                    player.x
                )
            );

        player.targetX =
            Math.max(
                player.radius,
                Math.min(
                    canvas.width -
                    player.radius,
                    player.targetX
                )
            );
    }
}


window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================================================
   GAME START
   ========================================================= */

function startGame(mode) {

    currentMode =
        mode;

    score = 0;

    lives =
        mode === "hardcore"
            ? 1
            : 2;

    difficulty = 1;

    gameRunning = true;
    gamePaused = false;

    enemies = [];
    powerUps = [];
    particles = [];

    enemySpawnTimer = 400;
    powerUpTimer = 6000;

    player.shield = false;

    showScreen(gameScreen);

    resizeCanvas();

    player.x =
        canvas.width / 2;

    player.targetX =
        player.x;

    player.y =
        canvas.height - 70;

    gameStartTime =
        performance.now();

    lastTime =
        performance.now();

    updateHUD();

    if (animationId)
        cancelAnimationFrame(
            animationId
        );

    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================================
   GAME STOP
   ========================================================= */

function stopGame() {

    gameRunning = false;
    gamePaused = false;

    if (animationId) {

        cancelAnimationFrame(
            animationId
        );

        animationId = null;
    }
}


/* =========================================================
   HUD
   ========================================================= */

function updateHUD() {

    if (scoreElement) {

        scoreElement.textContent =
            "SCORE: " +
            Math.floor(score);
    }

    if (livesElement) {

        if (currentMode === "hardcore") {

            livesElement.textContent =
                lives > 0
                    ? "❤️"
                    : "";

        } else {

            livesElement.textContent =
                "❤️".repeat(
                    Math.max(
                        0,
                        lives
                    )
                );
        }
    }
}


/* =========================================================
   ENEMY SPAWN
   ========================================================= */

function spawnEnemy() {

    const width =
        25 +
        Math.random() * 40;

    const height =
        25 +
        Math.random() * 45;

    const x =
        Math.random() *
        (canvas.width - width);

    const speed =
        3 +
        Math.random() * 2 +
        difficulty * 0.5;

    enemies.push({

        x,
        y: -height - 20,

        width,
        height,

        speed,

        rotation:
            Math.random() *
            Math.PI * 2,

        rotationSpeed:
            (Math.random() - 0.5) *
            0.08
    });
}


/* =========================================================
   POWER UP
   ========================================================= */

function spawnPowerUp() {

    if (currentMode === "hardcore")
        return;

    powerUps.push({

        x:
            25 +
            Math.random() *
            (canvas.width - 50),

        y: -30,

        radius: 15,

        speed:
            2.5 +
            Math.random(),

        type: "shield"
    });
}


/* =========================================================
   COLLISION
   ========================================================= */

function circleRectangleCollision(
    circle,
    rect
) {

    const closestX =
        Math.max(
            rect.x,
            Math.min(
                circle.x,
                rect.x +
                rect.width
            )
        );

    const closestY =
        Math.max(
            rect.y,
            Math.min(
                circle.y,
                rect.y +
                rect.height
            )
        );

    const dx =
        circle.x -
        closestX;

    const dy =
        circle.y -
        closestY;

    return (
        dx * dx +
        dy * dy
        <
        circle.radius *
        circle.radius
    );
}


/* =========================================================
   PLAYER HIT
   ========================================================= */

function hitPlayer() {

    if (!gameRunning ||
        gamePaused)
        return;

    if (player.shield) {

        player.shield =
            false;

        createParticles(
            player.x,
            player.y,
            25
        );

        return;
    }

    lives--;

    createParticles(
        player.x,
        player.y,
        35
    );

    updateHUD();

    if (lives <= 0)
        endGame();
}


/* =========================================================
   GAME OVER
   ========================================================= */

function endGame() {

    if (!gameRunning)
        return;

    gameRunning = false;
    gamePaused = false;

    if (animationId) {

        cancelAnimationFrame(
            animationId
        );

        animationId = null;
    }

    const final =
        Math.floor(score);

    const earned =
        Math.max(
            1,
            Math.floor(
                final / 10
            )
        );

    addCoins(earned);

    let isNew =
        false;

    if (currentMode === "hardcore") {

        if (final > hardcoreHighscore) {

            hardcoreHighscore =
                final;

            localStorage.setItem(
                "dodgeArenaHardcoreHighscore",
                String(
                    hardcoreHighscore
                )
            );

            isNew = true;
        }

    } else {

        if (final > normalHighscore) {

            normalHighscore =
                final;

            localStorage.setItem(
                "dodgeArenaNormalHighscore",
                String(
                    normalHighscore
                )
            );

            isNew = true;
        }
    }

    if (finalScore)
        finalScore.textContent =
            "Score: " + final;

    if (coinsEarned)
        coinsEarned.textContent =
            "🪙 +" +
            earned +
            " Coins";

    if (newHighscore)
        newHighscore.style.display =
            isNew
                ? "block"
                : "none";

    showScreen(gameOver);

    submitScore(
        playerName,
        final,
        currentMode
    );
}


/* =========================================================
   PAUSE
   ========================================================= */

function pauseGame() {

    if (!gameRunning ||
        gamePaused)
        return;

    gamePaused = true;

    if (pauseMenu)
        pauseMenu.classList.add(
            "active"
        );
}


function resumeGame() {

    if (!gameRunning)
        return;

    gamePaused = false;

    if (pauseMenu)
        pauseMenu.classList.remove(
            "active"
        );

    lastTime =
        performance.now();
}


function restartGame() {

    startGame(
        currentMode
    );
}


/* =========================================================
   PARTICLES
   ========================================================= */

function createParticles(
    x,
    y,
    amount
) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        particles.push({

            x,
            y,

            vx:
                (Math.random() - 0.5) *
                9,

            vy:
                (Math.random() - 0.5) *
                9,

            size:
                2 +
                Math.random() *
                4,

            life: 1
        });
    }
}


function updateParticles(delta) {

    particles.forEach(
        particle => {

            particle.x +=
                particle.vx *
                delta *
                0.06;

            particle.y +=
                particle.vy *
                delta *
                0.06;

            particle.vy +=
                0.15 *
                delta *
                0.06;

            particle.life -=
                0.03 *
                delta *
                0.06;
        }
    );

    particles =
        particles.filter(
            particle =>
                particle.life > 0
        );
}


/* =========================================================
   GAME UPDATE
   ========================================================= */

function update(delta) {

    if (!gameRunning ||
        gamePaused)
        return;

    score +=
        delta *
        0.012;

    const elapsed =
        performance.now() -
        gameStartTime;

    difficulty =
        1 +
        elapsed /
        30000;

    /* Gegner */

    enemySpawnTimer -=
        delta;

    const spawnDelay =
        Math.max(
            160,
            700 -
            difficulty * 55
        );

    if (enemySpawnTimer <= 0) {

        spawnEnemy();

        enemySpawnTimer =
            spawnDelay;
    }

    /* Power Up */

    if (currentMode !== "hardcore") {

        powerUpTimer -=
            delta;

        if (powerUpTimer <= 0) {

            spawnPowerUp();

            powerUpTimer =
                7000 +
                Math.random() *
                7000;
        }
    }

    /* Nur LINKS / RECHTS */

    player.x +=
        (
            player.targetX -
            player.x
        ) *
        0.18;

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
        canvas.height -
        70;

    /* Gegner bewegen */

    enemies.forEach(
        enemy => {

            enemy.y +=
                enemy.speed *
                delta *
                0.06;

            enemy.rotation +=
                enemy.rotationSpeed *
                delta;

            if (
                circleRectangleCollision(
                    player,
                    enemy
                )
            ) {

                enemy.dead = true;

                hitPlayer();
            }
        }
    );

    enemies =
        enemies.filter(
            enemy =>
                !enemy.dead &&
                enemy.y <
                canvas.height + 100
        );

    /* Power Ups */

    powerUps.forEach(
        power => {

            power.y +=
                power.speed *
                delta *
                0.06;

            const dx =
                player.x -
                power.x;

            const dy =
                player.y -
                power.y;

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

                player.shield =
                    true;

                power.collected =
                    true;

                createParticles(
                    power.x,
                    power.y,
                    20
                );
            }
        }
    );

    powerUps =
        powerUps.filter(
            power =>
                !power.collected &&
                power.y <
                canvas.height + 60
        );

    updateParticles(delta);

    updateHUD();
}


/* =========================================================
   DRAW BACKGROUND
   ========================================================= */

function drawBackground() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle =
        "#070b16";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    /* Grid */

    ctx.strokeStyle =
        "rgba(255,255,255,0.045)";

    ctx.lineWidth = 1;

    const gridSize = 45;

    for (
        let x = 0;
        x < canvas.width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();
    }

    for (
        let y = 0;
        y < canvas.height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();
    }
}


/* =========================================================
   DRAW PLAYER
   ========================================================= */

function drawPlayer() {

    const skin =
        skins.find(
            s =>
                s.id ===
                currentSkin
        ) ||
        skins[0];

    /* Shield */

    if (player.shield) {

        ctx.beginPath();

        ctx.arc(
            player.x,
            player.y,
            player.radius + 11,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "rgba(40,190,255,0.95)";

        ctx.lineWidth = 5;

        ctx.shadowColor =
            "#28c7ff";

        ctx.shadowBlur = 18;

        ctx.stroke();

        ctx.shadowBlur = 0;
    }

    /* Ball */

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

    ctx.shadowColor =
        skin.color;

    ctx.shadowBlur = 18;

    ctx.fill();

    ctx.shadowBlur = 0;

    /* Lichtpunkt */

    ctx.beginPath();

    ctx.arc(
        player.x - 6,
        player.y - 7,
        5,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(255,255,255,0.65)";

    ctx.fill();
}


/* =========================================================
   DRAW ENEMIES
   ========================================================= */

function drawEnemies() {

    enemies.forEach(
        enemy => {

            ctx.save();

            ctx.translate(
                enemy.x +
                enemy.width / 2,
                enemy.y +
                enemy.height / 2
            );

            ctx.rotate(
                enemy.rotation
            );

            ctx.fillStyle =
                "#ff3548";

            ctx.shadowColor =
                "#ff3548";

            ctx.shadowBlur = 14;

            ctx.fillRect(
                -enemy.width / 2,
                -enemy.height / 2,
                enemy.width,
                enemy.height
            );

            ctx.shadowBlur = 0;

            ctx.restore();
        }
    );
}


/* =========================================================
   DRAW POWER UPS
   ========================================================= */

function drawPowerUps() {

    powerUps.forEach(
        power => {

            ctx.beginPath();

            ctx.arc(
                power.x,
                power.y,
                power.radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#28c7ff";

            ctx.shadowColor =
                "#28c7ff";

            ctx.shadowBlur = 20;

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
        }
    );
}


/* =========================================================
   DRAW PARTICLES
   ========================================================= */

function drawParticles() {

    particles.forEach(
        particle => {

            ctx.globalAlpha =
                Math.max(
                    0,
                    particle.life
                );

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "#ffffff";

            ctx.fill();
        }
    );

    ctx.globalAlpha = 1;
}


/* =========================================================
   DRAW
   ========================================================= */

function draw() {

    if (!ctx)
        return;

    drawBackground();

    drawPowerUps();

    drawEnemies();

    drawParticles();

    drawPlayer();
}


/* =========================================================
   GAME LOOP
   ========================================================= */

function gameLoop(timestamp) {

    if (!gameRunning)
        return;

    const delta =
        Math.min(
            50,
            timestamp -
            lastTime
        );

    lastTime =
        timestamp;

    if (!gamePaused) {

        update(delta);

        draw();
    }

    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================================
   TOUCH STEUERUNG
   NUR LINKS / RECHTS
   ========================================================= */

let touchActive = false;


function movePlayerToScreenX(
    screenX
) {

    if (!canvas ||
        !gameRunning ||
        gamePaused)
        return;

    const rect =
        canvas.getBoundingClientRect();

    const x =
        screenX -
        rect.left;

    player.targetX =
        Math.max(
            player.radius,
            Math.min(
                canvas.width -
                player.radius,
                x
            )
        );
}


/* Touch Start */

canvas.addEventListener(
    "touchstart",
    event => {

        if (!gameRunning)
            return;

        touchActive = true;

        const touch =
            event.touches[0];

        if (touch)
            movePlayerToScreenX(
                touch.clientX
            );
    },
    {
        passive: true
    }
);


/* Finger bewegen */

canvas.addEventListener(
    "touchmove",
    event => {

        if (!touchActive)
            return;

        const touch =
            event.touches[0];

        if (touch)
            movePlayerToScreenX(
                touch.clientX
            );
    },
    {
        passive: true
    }
);


/* Finger loslassen */

canvas.addEventListener(
    "touchend",
    () => {

        touchActive = false;

    },
    {
        passive: true
    }
);


/* =========================================================
   MOUSE STEUERUNG
   ========================================================= */

canvas.addEventListener(
    "mousemove",
    event => {

        if (!gameRunning ||
            gamePaused)
            return;

        movePlayerToScreenX(
            event.clientX
        );
    }
);


/* =========================================================
   BESTENLISTE
   ========================================================= */

function leaderboardTable(
    mode
) {

    return mode === "hardcore"
        ? "hardcore"
        : "normal";
}


async function loadLeaderboard(
    mode
) {

    selectedLeaderboard =
        mode;

    if (!leaderboardList)
        return;

    leaderboardList.innerHTML =
        "<p>⏳ Lade Bestenliste...</p>";

    if (!supabaseClient) {

        leaderboardList.innerHTML =
            "<p>❌ Supabase konnte nicht geladen werden.</p>";

        return;
    }

    const table =
        leaderboardTable(mode);

    const result =
        await supabaseClient
            .from(table)
            .select(
                "name, score"
            )
            .order(
                "score",
                {
                    ascending: false
                }
            )
            .limit(10);

    if (result.error) {

        console.error(
            result.error
        );

        leaderboardList.innerHTML =
            "<p>❌ Fehler beim Laden.</p>";

        return;
    }

    if (
        !result.data ||
        result.data.length === 0
    ) {

        leaderboardList.innerHTML =
            "<p>Noch keine Scores.</p>";

        return;
    }

    leaderboardList.innerHTML = "";

    const title =
        document.createElement(
            "h2"
        );

    title.textContent =
        mode === "hardcore"
            ? "🔴 HARDCORE"
            : "🟢 NORMAL";

    leaderboardList.appendChild(
        title
    );

    result.data.forEach(
        (entry, index) => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "leaderboardRow";

            row.innerHTML = `
                <span>#${index + 1}</span>
                <strong>
                    ${escapeHTML(entry.name)}
                </strong>
                <span>
                    ${Number(entry.score) || 0}
                </span>
            `;

            leaderboardList.appendChild(
                row
            );
        }
    );
}


/* =========================================================
   SCORE SPEICHERN
   ========================================================= */

async function submitScore(
    name,
    playerScore,
    mode
) {

    if (!supabaseClient)
        return;

    const table =
        leaderboardTable(mode);

    const safeScore =
        Math.floor(
            Number(playerScore)
        );

    if (
        !name ||
        !Number.isFinite(
            safeScore
        )
    )
        return;

    const result =
        await supabaseClient
            .from(table)
            .insert({
                name:
                    name.substring(
                        0,
                        16
                    ),

                score:
                    safeScore
            });

    if (result.error) {

        console.error(
            "Score Fehler:",
            result.error
        );
    }
}


/* =========================================================
   HTML SICHER MACHEN
   ========================================================= */

function escapeHTML(
    value
) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =========================================================
   BUTTONS
   ========================================================= */

/* NORMAL */

normalButton.addEventListener(
    "click",
    () => {

        startGame(
            "normal"
        );
    }
);


/* HARDCORE */

hardcoreButton.addEventListener(
    "click",
    () => {

        startGame(
            "hardcore"
        );
    }
);


/* NAME */

nameButton.addEventListener(
    "click",
    () => {

        showNameScreen();
    }
);


/* SHOP */

shopButton.addEventListener(
    "click",
    () => {

        showShop();
    }
);


/* BESTENLISTE */

leaderboardButton.addEventListener(
    "click",
    () => {

        selectedLeaderboard =
            "normal";

        showLeaderboardScreen();
    }
);


/* NAME SPEICHERN */

saveNameButton.addEventListener(
    "click",
    () => {

        saveName();
    }
);


/* NAME ZURÜCK */

nameBackButton.addEventListener(
    "click",
    () => {

        showMenu();
    }
);


/* SHOP ZURÜCK */

shopBackButton.addEventListener(
    "click",
    () => {

        showMenu();
    }
);


/* BESTENLISTE ZURÜCK */

leaderboardBackButton.addEventListener(
    "click",
    () => {

        showMenu();
    }
);


/* NORMAL BESTENLISTE */

leaderboardNormalButton.addEventListener(
    "click",
    () => {

        loadLeaderboard(
            "normal"
        );
    }
);


/* HARDCORE BESTENLISTE */

leaderboardHardcoreButton.addEventListener(
    "click",
    () => {

        loadLeaderboard(
            "hardcore"
        );
    }
);


/* PAUSE */

pauseButton.addEventListener(
    "click",
    event => {

        event.preventDefault();

        pauseGame();
    }
);


/* WEITERSPIELEN */

resumeButton.addEventListener(
    "click",
    () => {

        resumeGame();
    }
);


/* PAUSE -> MENÜ */

pauseMenuButton.addEventListener(
    "click",
    () => {

        showMenu();
    }
);


/* RESTART */

restartButton.addEventListener(
    "click",
    () => {

        restartGame();
    }
);


/* GAME OVER -> MENÜ */

gameOverMenuButton.addEventListener(
    "click",
    () => {

        showMenu();
    }
);


/* =========================================================
   ENTER BEIM NAMEN
   ========================================================= */

if (nameInput) {

    nameInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                saveName();
            }
        }
    );
}


/* =========================================================
   START
   ========================================================= */

resizeCanvas();

updateMenu();

updateShop();

showMenu();

console.log(
    "DODGE ARENA: READY"
);
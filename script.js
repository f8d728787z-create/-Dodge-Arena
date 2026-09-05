// ==========================================
// DODGE ARENA - SCRIPT.JS
// ==========================================

// ---------- SUPABASE ----------
const SUPABASE_URL =
    "https://yjuwplccnklrznrgdfgx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_xRHst0TbOBTYvQy4SeauSQ_LUex_5IC";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ---------- CANVAS ----------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

function resizeCanvas() {
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();


// ---------- ELEMENTS ----------
const menu = document.getElementById("menu");
const nameScreen = document.getElementById("nameScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const nameInput = document.getElementById("nameInput");

const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");

const finalScoreText =
    document.getElementById("finalScore");

const highscoreText =
    document.getElementById("highscore");

const coinsText =
    document.getElementById("coins");

const leaderboardList =
    document.getElementById("leaderboardList");


// ---------- GAME DATA ----------
let playerName =
    localStorage.getItem("dodgePlayerName") || "";

let coins =
    Number(localStorage.getItem("dodgeCoins")) || 0;

let highscore =
    Number(localStorage.getItem("dodgeHighscore")) || 0;

let selectedSkin =
    localStorage.getItem("dodgeSkin") || "blue";

let ownedSkins;

try {
    ownedSkins =
        JSON.parse(
            localStorage.getItem("dodgeOwnedSkins")
        ) || ["blue"];
} catch {
    ownedSkins = ["blue"];
}


// ---------- GAME VARIABLES ----------
let gameRunning = false;
let gamePaused = false;

let gameMode = "normal";

let score = 0;
let lives = 2;

let player = null;

let enemies = [];
let particles = [];
let powerUps = [];

let lastTime = 0;
let enemyTimer = 0;
let powerUpTimer = 0;

let difficulty = 1;

let shieldActive = false;
let shieldTimer = 0;

let gameOverCalled = false;


// ---------- SKINS ----------
const skins = {
    blue: {
        name: "Blue",
        price: 0,
        color: "#3498db"
    },

    red: {
        name: "Red",
        price: 100,
        color: "#e74c3c"
    },

    energy: {
        name: "Energy",
        price: 250,
        color: "#00ffff"
    },

    toxic: {
        name: "Toxic",
        price: 400,
        color: "#39ff14"
    },

    void: {
        name: "Void",
        price: 600,
        color: "#8e44ad"
    },

    gold: {
        name: "Gold",
        price: 1000,
        color: "#ffd700"
    },

    galaxy: {
        name: "Galaxy",
        price: 1500,
        color: "#ff00ff"
    },

    diamond: {
        name: "Diamond",
        price: 2500,
        color: "#b9f2ff"
    }
};


// ---------- NAME FILTER ----------
const bannedWords = [
    "fuck",
    "shit",
    "bitch",
    "nazi",
    "hitler"
];

function validName(name) {

    name = name.trim();

    if (!name) return false;

    if (name.length > 16) return false;

    const lower = name.toLowerCase();

    for (const word of bannedWords) {
        if (lower.includes(word)) {
            return false;
        }
    }

    return true;
}


// ---------- LOCAL STORAGE ----------
function saveData() {

    localStorage.setItem(
        "dodgePlayerName",
        playerName
    );

    localStorage.setItem(
        "dodgeCoins",
        String(coins)
    );

    localStorage.setItem(
        "dodgeHighscore",
        String(highscore)
    );

    localStorage.setItem(
        "dodgeSkin",
        selectedSkin
    );

    localStorage.setItem(
        "dodgeOwnedSkins",
        JSON.stringify(ownedSkins)
    );
}


// ---------- MENU ----------
function updateMenu() {

    if (highscoreText) {
        highscoreText.textContent = highscore;
    }

    if (coinsText) {
        coinsText.textContent = coins;
    }
}


// ---------- NAME SCREEN ----------
function showNameScreen() {

    if (menu) {
        menu.style.display = "none";
    }

    if (nameScreen) {
        nameScreen.style.display = "flex";
    }

    if (nameInput) {
        nameInput.value = playerName;
        nameInput.focus();
    }
}


// ---------- SHOP ----------
function renderShop() {

    const shop =
        document.getElementById("shop");

    if (!shop) return;

    shop.innerHTML = "";

    for (const key in skins) {

        const skin = skins[key];

        const item =
            document.createElement("div");

        item.className = "skin";

        const owned =
            ownedSkins.includes(key);

        const selected =
            selectedSkin === key;

        item.innerHTML = `
            <div
                class="skin-preview"
                style="background:${skin.color}"
            ></div>

            <h3>${skin.name}</h3>

            ${
                selected
                    ? `<button disabled>
                        Ausgewählt
                       </button>`
                    : owned
                        ? `<button data-select-skin="${key}">
                            Auswählen
                           </button>`
                        : `<button data-buy-skin="${key}">
                            ${skin.price} 🪙
                           </button>`
            }
        `;

        shop.appendChild(item);
    }

    shop.querySelectorAll("[data-select-skin]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => selectSkin(
                    button.dataset.selectSkin
                )
            );
        });

    shop.querySelectorAll("[data-buy-skin]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => buySkin(
                    button.dataset.buySkin
                )
            );
        });
}


// ---------- BUY SKIN ----------
function buySkin(key) {

    const skin = skins[key];

    if (!skin) return;

    if (ownedSkins.includes(key)) {
        selectSkin(key);
        return;
    }

    if (coins < skin.price) {
        alert("Nicht genug Coins!");
        return;
    }

    coins -= skin.price;

    ownedSkins.push(key);

    selectedSkin = key;

    saveData();

    renderShop();
    updateMenu();
}


// ---------- SELECT SKIN ----------
function selectSkin(key) {

    if (!ownedSkins.includes(key)) {
        return;
    }

    selectedSkin = key;

    saveData();

    renderShop();
}


// ==========================================
// LEADERBOARD
// ==========================================

// Normal  -> normal
// Hardcore -> hardcore
function getLeaderboardTable(mode) {

    return mode === "hardcore"
        ? "hardcore"
        : "normal";
}


// ---------- LOAD ----------
async function loadLeaderboard(mode) {

    const table =
        getLeaderboardTable(mode);

    console.log(
        "Lade Bestenliste:",
        table
    );

    const result =
        await supabaseClient
            .from(table)
            .select("name, score")
            .order("score", {
                ascending: false
            })
            .limit(10);

    if (result.error) {

        console.error(
            "Bestenliste Fehler:",
            result.error
        );

        return [];
    }

    return result.data || [];
}


// ---------- SHOW ----------
async function showLeaderboard(mode = "normal") {

    if (!leaderboardList) {
        console.warn(
            "leaderboardList wurde nicht gefunden."
        );
        return;
    }

    leaderboardList.innerHTML =
        "<p>⏳ Bestenliste wird geladen...</p>";

    const data =
        await loadLeaderboard(mode);

    leaderboardList.innerHTML = "";

    const title =
        document.createElement("h2");

    title.textContent =
        mode === "hardcore"
            ? "🔥 HARDCORE"
            : "🏆 NORMAL";

    leaderboardList.appendChild(title);

    if (!data.length) {

        const empty =
            document.createElement("p");

        empty.textContent =
            "Noch keine Scores vorhanden.";

        leaderboardList.appendChild(empty);

        return;
    }

    data.forEach((entry, index) => {

        const row =
            document.createElement("div");

        row.className =
            "leaderboard-entry";

        const name =
            document.createElement("span");

        name.textContent =
            `#${index + 1} ${entry.name}`;

        const scoreElement =
            document.createElement("strong");

        scoreElement.textContent =
            Number(entry.score).toLocaleString();

        row.appendChild(name);
        row.appendChild(scoreElement);

        leaderboardList.appendChild(row);
    });
}


// ---------- SUBMIT SCORE ----------
async function submitScore(
    name,
    playerScore,
    mode
) {

    const table =
        getLeaderboardTable(mode);

    console.log(
        "Speichere Score in:",
        table
    );

    const result =
        await supabaseClient
            .from(table)
            .insert([
                {
                    name: name,
                    score: Math.floor(playerScore)
                }
            ]);

    if (result.error) {

        console.error(
            "Score konnte nicht gespeichert werden:",
            result.error
        );

        return false;
    }

    console.log(
        "Score erfolgreich gespeichert!"
    );

    return true;
}


// ==========================================
// GAME
// ==========================================

// ---------- START ----------
function startGame(mode = "normal") {

    if (!canvas || !ctx) {
        console.error(
            "gameCanvas wurde nicht gefunden."
        );
        return;
    }

    if (!playerName) {
        showNameScreen();
        return;
    }

    gameMode = mode;

    gameRunning = true;
    gamePaused = false;
    gameOverCalled = false;

    score = 0;

    lives =
        gameMode === "hardcore"
            ? 1
            : 2;

    difficulty = 1;

    enemies = [];
    particles = [];
    powerUps = [];

    shieldActive = false;
    shieldTimer = 0;

    enemyTimer = 0;
    powerUpTimer = 0;

    player = {
        x: canvas.width / 2,
        y: canvas.height - 100,
        radius: 20,
        speed: 700
    };

    if (menu) {
        menu.style.display = "none";
    }

    if (nameScreen) {
        nameScreen.style.display = "none";
    }

    if (gameOverScreen) {
        gameOverScreen.style.display = "none";
    }

    if (gameScreen) {
        gameScreen.style.display = "block";
    }

    updateHUD();

    lastTime =
        performance.now();

    requestAnimationFrame(gameLoop);
}


// ---------- HUD ----------
function updateHUD() {

    if (scoreText) {
        scoreText.textContent =
            Math.floor(score);
    }

    if (livesText) {

        if (gameMode === "hardcore") {

            livesText.textContent = "❤️";

        } else {

            livesText.textContent =
                "❤️".repeat(
                    Math.max(0, lives)
                );
        }
    }
}


// ---------- ENEMY ----------
function spawnEnemy() {

    const width =
        25 + Math.random() * 45;

    const height =
        25 + Math.random() * 55;

    enemies.push({

        x:
            Math.random() *
            Math.max(
                1,
                canvas.width - width
            ),

        y: -height,

        width: width,
        height: height,

        speed:
            180 +
            Math.random() * 160 +
            difficulty * 25
    });
}


// ---------- POWERUP ----------
function spawnPowerUp() {

    if (gameMode === "hardcore") {
        return;
    }

    powerUps.push({

        x:
            30 +
            Math.random() *
            Math.max(
                1,
                canvas.width - 60
            ),

        y: -30,

        radius: 15,

        speed: 160
    });
}


// ---------- PARTICLES ----------
function createParticles(
    x,
    y,
    amount = 12
) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        particles.push({

            x: x,
            y: y,

            vx:
                (Math.random() - 0.5) *
                300,

            vy:
                (Math.random() - 0.5) *
                300,

            life:
                0.5 +
                Math.random() * 0.5,

            maxLife: 1
        });
    }
}


// ---------- COLLISION ----------
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
        dy * dy
    ) <
    circle.radius *
    circle.radius;
}


// ---------- HIT ----------
function hitPlayer() {

    if (shieldActive) {
        shieldActive = false;
        shieldTimer = 0;
        return;
    }

    lives--;

    createParticles(
        player.x,
        player.y,
        20
    );

    updateHUD();

    if (lives <= 0) {
        gameOver();
    }
}


// ---------- POWERUP ----------
function collectPowerUp() {

    shieldActive = true;
    shieldTimer = 5;

    createParticles(
        player.x,
        player.y,
        15
    );
}


// ---------- GAME OVER ----------
async function gameOver() {

    if (gameOverCalled) {
        return;
    }

    gameOverCalled = true;
    gameRunning = false;

    const finalScore =
        Math.floor(score);

    if (finalScore > highscore) {

        highscore = finalScore;

        saveData();
    }

    coins +=
        Math.floor(
            finalScore / 10
        );

    saveData();

    if (finalScore > 0) {

        await submitScore(
            playerName,
            finalScore,
            gameMode
        );
    }

    if (finalScoreText) {
        finalScoreText.textContent =
            finalScore;
    }

    if (gameOverScreen) {
        gameOverScreen.style.display =
            "flex";
    }

    updateMenu();
}


// ==========================================
// DRAW
// ==========================================

// ---------- PLAYER ----------
function drawPlayer() {

    if (!player) return;

    const skin =
        skins[selectedSkin] ||
        skins.blue;

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

    if (shieldActive) {

        ctx.beginPath();

        ctx.arc(
            player.x,
            player.y,
            player.radius + 8,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 4;

        ctx.stroke();
    }
}


// ---------- ENEMIES ----------
function drawEnemies() {

    ctx.fillStyle =
        "#ff3b30";

    for (const enemy of enemies) {

        ctx.fillRect(
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
        );
    }
}


// ---------- POWERUPS ----------
function drawPowerUps() {

    if (gameMode === "hardcore") {
        return;
    }

    for (const power of powerUps) {

        ctx.beginPath();

        ctx.arc(
            power.x,
            power.y,
            power.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#00e5ff";

        ctx.fill();

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 2;

        ctx.stroke();
    }
}


// ---------- PARTICLES ----------
function drawParticles() {

    for (const p of particles) {

        ctx.globalAlpha =
            Math.max(
                0,
                p.life / p.maxLife
            );

        ctx.fillStyle =
            "#ffffff";

        ctx.fillRect(
            p.x,
            p.y,
            4,
            4
        );
    }

    ctx.globalAlpha = 1;
}


// ==========================================
// UPDATE
// ==========================================

function update(delta) {

    if (!player) return;

    score += delta * 10;

    difficulty =
        1 +
        score / 500;

    enemyTimer += delta;

    const enemyInterval =
        Math.max(
            0.18,
            0.8 -
            difficulty * 0.04
        );

    if (
        enemyTimer >= enemyInterval
    ) {

        enemyTimer = 0;

        spawnEnemy();
    }


    // Power-ups only in Normal
    if (gameMode !== "hardcore") {

        powerUpTimer += delta;

        if (powerUpTimer >= 8) {

            powerUpTimer = 0;

            if (
                Math.random() < 0.45
            ) {
                spawnPowerUp();
            }
        }
    }


    // Shield
    if (shieldActive) {

        shieldTimer -= delta;

        if (shieldTimer <= 0) {

            shieldTimer = 0;
            shieldActive = false;
        }
    }


    // Enemies
    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            enemies[i];

        enemy.y +=
            enemy.speed *
            delta;

        if (
            circleRectCollision(
                player,
                enemy
            )
        ) {

            enemies.splice(i, 1);

            hitPlayer();

            continue;
        }

        if (
            enemy.y >
            canvas.height + 100
        ) {

            enemies.splice(i, 1);
        }
    }


    // Power-ups
    for (
        let i = powerUps.length - 1;
        i >= 0;
        i--
    ) {

        const power =
            powerUps[i];

        power.y +=
            power.speed *
            delta;

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

            powerUps.splice(i, 1);

            collectPowerUp();

            continue;
        }

        if (
            power.y >
            canvas.height + 50
        ) {

            powerUps.splice(i, 1);
        }
    }


    // Particles
    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particles[i];

        p.x +=
            p.vx * delta;

        p.y +=
            p.vy * delta;

        p.life -= delta;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    updateHUD();
}


// ---------- DRAW ----------
function draw() {

    if (!ctx || !canvas) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawPowerUps();
    drawEnemies();
    drawPlayer();
    drawParticles();
}


// ---------- GAME LOOP ----------
function gameLoop(time) {

    if (!gameRunning) {
        return;
    }

    if (gamePaused) {
        return;
    }

    const delta =
        Math.min(
            0.033,
            (time - lastTime) / 1000
        );

    lastTime = time;

    update(delta);
    draw();

    requestAnimationFrame(gameLoop);
}


// ==========================================
// CONTROLS
// ==========================================

// ---------- MOUSE ----------
if (canvas) {

    canvas.addEventListener(
        "mousemove",
        event => {

            if (!player || !gameRunning) {
                return;
            }

            player.x = event.clientX;
            player.y = event.clientY;
        }
    );


    // ---------- TOUCH ----------
    canvas.addEventListener(
        "touchmove",
        event => {

            if (!player || !gameRunning) {
                return;
            }

            const touch =
                event.touches[0];

            if (!touch) return;

            player.x = touch.clientX;
            player.y = touch.clientY;

            event.preventDefault();
        },
        {
            passive: false
        }
    );
}


// ---------- KEYBOARD ----------
window.addEventListener(
    "keydown",
    event => {

        if (!player || !gameRunning) {
            return;
        }

        const amount = 35;

        const key =
            event.key.toLowerCase();

        if (
            event.key === "ArrowLeft" ||
            key === "a"
        ) {
            player.x -= amount;
        }

        if (
            event.key === "ArrowRight" ||
            key === "d"
        ) {
            player.x += amount;
        }

        if (
            event.key === "ArrowUp" ||
            key === "w"
        ) {
            player.y -= amount;
        }

        if (
            event.key === "ArrowDown" ||
            key === "s"
        ) {
            player.y += amount;
        }

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
    }
);


// ==========================================
// PAUSE
// ==========================================

function togglePause() {

    if (!gameRunning) {
        return;
    }

    gamePaused =
        !gamePaused;

    if (!gamePaused) {

        lastTime =
            performance.now();

        requestAnimationFrame(
            gameLoop
        );
    }
}


// ==========================================
// MENU
// ==========================================

function returnToMenu() {

    gameRunning = false;
    gamePaused = false;

    if (gameScreen) {
        gameScreen.style.display = "none";
    }

    if (gameOverScreen) {
        gameOverScreen.style.display = "none";
    }

    if (nameScreen) {
        nameScreen.style.display = "none";
    }

    if (menu) {
        menu.style.display = "flex";
    }

    updateMenu();
}


// ==========================================
// NAME
// ==========================================

function savePlayerName() {

    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    if (!validName(name)) {

        alert(
            "Bitte gib einen gültigen Namen ein."
        );

        return;
    }

    playerName = name;

    saveData();

    if (nameScreen) {
        nameScreen.style.display = "none";
    }

    if (menu) {
        menu.style.display = "flex";
    }

    updateMenu();
}


// ==========================================
// BUTTONS
// ==========================================

function connectButton(
    id,
    callback
) {

    const button =
        document.getElementById(id);

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        event => {

            event.preventDefault();

            callback();
        }
    );
}


// ---------- NORMAL ----------
connectButton(
    "normalButton",
    () => startGame("normal")
);

connectButton(
    "normalBtn",
    () => startGame("normal")
);


// ---------- HARDCORE ----------
connectButton(
    "hardcoreButton",
    () => startGame("hardcore")
);

connectButton(
    "hardcoreBtn",
    () => startGame("hardcore")
);


// ---------- NAME ----------
connectButton(
    "nameButton",
    savePlayerName
);

connectButton(
    "saveNameButton",
    savePlayerName
);


// ---------- PAUSE ----------
connectButton(
    "pauseButton",
    togglePause
);

connectButton(
    "pauseBtn",
    togglePause
);


// ---------- MENU ----------
connectButton(
    "menuButton",
    returnToMenu
);

connectButton(
    "backMenuButton",
    returnToMenu
);


// ---------- RESTART ----------
connectButton(
    "restartButton",
    () => startGame(gameMode)
);

connectButton(
    "restartBtn",
    () => startGame(gameMode)
);


// ---------- LEADERBOARD ----------
connectButton(
    "leaderboardNormal",
    () => showLeaderboard("normal")
);

connectButton(
    "leaderboardHardcore",
    () => showLeaderboard("hardcore")
);


// ---------- EXTRA LEADERBOARD IDs ----------
// Falls dein HTML andere Namen verwendet:
connectButton(
    "normalLeaderboard",
    () => showLeaderboard("normal")
);

connectButton(
    "hardcoreLeaderboard",
    () => showLeaderboard("hardcore")
);

connectButton(
    "leaderboardBtn",
    () => showLeaderboard("normal")
);


// ==========================================
// STARTUP
// ==========================================

updateMenu();
renderShop();

if (!playerName) {

    if (menu) {
        menu.style.display = "flex";
    }
}
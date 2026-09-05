/* =========================================================
   DODGE ARENA
   Neue Version:
   - Bewegung NUR links / rechts
   - Schwieriger
   - Mehr Gegner
   - Mehr Shop-Skins
   - Normal + Hardcore
   - Supabase Bestenlisten
========================================================= */


/* ================= SUPABASE ================= */

const SUPABASE_URL =
    "https://yjuwplccnklrznrgdfgx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_xRHst0TbOBTYvQySeauSQ_LUex_5IC";

let supabaseClient = null;

try {
    if (
        window.supabase &&
        SUPABASE_URL &&
        SUPABASE_KEY
    ) {
        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );
    }
} catch (error) {
    console.error("Supabase Fehler:", error);
}


/* ================= HILFSFUNKTION ================= */

const $ = id => document.getElementById(id);


/* ================= ELEMENTE ================= */

const menu = $("menu");
const nameScreen = $("nameScreen");
const shop = $("shop");
const leaderboard = $("leaderboard");
const gameScreen = $("gameScreen");

const pauseMenu = $("pauseMenu");
const gameOver = $("gameOver");

const canvas = $("gameCanvas");

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
const gameOverMenuButton =
    $("gameOverMenuButton");

const nameInput = $("nameInput");
const nameError = $("nameError");

const menuPlayerName =
    $("menuPlayerName");

const menuCoins =
    $("menuCoins");

const shopCoins =
    $("shopCoins");

const menuHighscore =
    $("menuHighscore");

const skinList =
    $("skinList");

const leaderboardList =
    $("leaderboardList");

const scoreDisplay =
    $("score");

const livesDisplay =
    $("lives");

const finalScore =
    $("finalScore");

const coinsEarned =
    $("coinsEarned");

const newHighscore =
    $("newHighscore");


/* ================= CANVAS ================= */

const ctx = canvas.getContext("2d");


function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight -
        70;

}


window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


/* ================= SPIELER ================= */

const player = {

    x: 0,

    y: 0,

    radius: 19,

    targetX: 0,

    shield: false

};


/* ================= SPIELDATEN ================= */

let currentMode = "normal";

let gameRunning = false;

let gamePaused = false;

let animationId = null;

let lastTime = 0;

let score = 0;

let lives = 2;

let coins = Number(
    localStorage.getItem("dodgeCoins")
) || 0;

let playerName =
    localStorage.getItem(
        "dodgePlayerName"
    ) || "Spieler";

let highscore =
    Number(
        localStorage.getItem(
            "dodgeHighscore"
        )
    ) || 0;


/* ================= SCHWIERIGKEIT ================= */

let difficulty = 1;

let enemyTimer = 0;

let powerupTimer = 0;

let elapsedTime = 0;


/* ================= OBJEKTE ================= */

let enemies = [];

let powerups = [];


/* ================= SHOP ================= */

const skins = [

    {
        id: "default",
        name: "Classic",
        price: 0,
        color: "#ffffff"
    },

    {
        id: "blue",
        name: "Ocean",
        price: 50,
        color: "#3498db"
    },

    {
        id: "green",
        name: "Toxic",
        price: 100,
        color: "#2ecc71"
    },

    {
        id: "purple",
        name: "Galaxy",
        price: 200,
        color: "#9b59b6"
    },

    {
        id: "gold",
        name: "Gold",
        price: 350,
        color: "#f1c40f"
    },

    {
        id: "red",
        name: "Inferno",
        price: 500,
        color: "#e74c3c"
    },

    {
        id: "cyan",
        name: "Cyber",
        price: 750,
        color: "#00ffff"
    },

    {
        id: "rainbow",
        name: "Rainbow",
        price: 1000,
        color: "rainbow"
    },

    {
        id: "diamond",
        name: "Diamond",
        price: 1500,
        color: "#b9f2ff"
    },

    {
        id: "shadow",
        name: "Shadow",
        price: 2500,
        color: "#333333"
    }

];


let ownedSkins =
    JSON.parse(
        localStorage.getItem(
            "dodgeOwnedSkins"
        )
    ) || ["default"];


let selectedSkin =
    localStorage.getItem(
        "dodgeSelectedSkin"
    ) || "default";


/* ================= NAME ================= */

function updateNameUI() {

    if (menuPlayerName) {

        menuPlayerName.textContent =
            playerName;

    }

    if (nameInput) {

        nameInput.value =
            playerName === "Spieler"
                ? ""
                : playerName;

    }

}


function savePlayerName() {

    let name =
        nameInput.value.trim();

    if (!name) {

        nameError.textContent =
            "Bitte gib einen Namen ein.";

        return;

    }

    if (name.length < 2) {

        nameError.textContent =
            "Der Name muss mindestens 2 Zeichen haben.";

        return;

    }

    const forbidden = [

        "fuck",
        "shit",
        "nazi",
        "hitler",
        "arsch",
        "hurensohn"

    ];

    const lower =
        name.toLowerCase();

    for (const word of forbidden) {

        if (lower.includes(word)) {

            nameError.textContent =
                "Dieser Name ist nicht erlaubt.";

            return;

        }

    }

    playerName = name;

    localStorage.setItem(
        "dodgePlayerName",
        playerName
    );

    nameError.textContent = "";

    updateNameUI();

    showScreen(menu);

}


/* ================= COINS ================= */

function updateCoinsUI() {

    if (menuCoins) {

        menuCoins.textContent =
            coins;

    }

    if (shopCoins) {

        shopCoins.textContent =
            coins;

    }

    localStorage.setItem(
        "dodgeCoins",
        coins
    );

}


/* ================= SHOP RENDERN ================= */

function renderShop() {

    if (!skinList) return;

    skinList.innerHTML = "";

    for (const skin of skins) {

        const button =
            document.createElement("button");

        button.className =
            "skinButton";

        const owned =
            ownedSkins.includes(
                skin.id
            );

        const selected =
            selectedSkin ===
            skin.id;

        let text = "";

        if (selected) {

            text =
                `✓ ${skin.name} – Ausgerüstet`;

        } else if (owned) {

            text =
                `✓ ${skin.name} – Ausrüsten`;

        } else {

            text =
                `🪙 ${skin.price} – ${skin.name}`;

        }

        button.textContent =
            text;

        button.addEventListener(
            "click",
            () => {

                if (
                    ownedSkins.includes(
                        skin.id
                    )
                ) {

                    selectedSkin =
                        skin.id;

                    localStorage.setItem(
                        "dodgeSelectedSkin",
                        selectedSkin
                    );

                    renderShop();

                    return;

                }

                if (
                    coins <
                    skin.price
                ) {

                    alert(
                        `Du brauchst ${skin.price} Coins.`
                    );

                    return;

                }

                coins -=
                    skin.price;

                ownedSkins.push(
                    skin.id
                );

                selectedSkin =
                    skin.id;

                localStorage.setItem(
                    "dodgeOwnedSkins",
                    JSON.stringify(
                        ownedSkins
                    )
                );

                localStorage.setItem(
                    "dodgeSelectedSkin",
                    selectedSkin
                );

                updateCoinsUI();

                renderShop();

            }
        );

        skinList.appendChild(
            button
        );

    }

}


/* ================= SKIN ================= */

function getPlayerColor() {

    const skin =
        skins.find(
            s =>
                s.id ===
                selectedSkin
        );

    if (!skin) {

        return "#ffffff";

    }

    if (
        skin.color ===
        "rainbow"
    ) {

        const hue =
            (Date.now() / 5) % 360;

        return `hsl(${hue}, 100%, 60%)`;

    }

    return skin.color;

}


/* ================= SCREENS ================= */

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


/* ================= SPIEL START ================= */

function startGame(mode) {

    currentMode =
        mode;

    gameRunning =
        true;

    gamePaused =
        false;

    score =
        0;

    difficulty =
        1;

    elapsedTime =
        0;

    enemyTimer =
        0;

    powerupTimer =
        0;

    enemies =
        [];

    powerups =
        [];

    if (
        currentMode ===
        "hardcore"
    ) {

        lives = 1;

    } else {

        lives = 2;

    }

    player.shield =
        false;

    player.x =
        canvas.width / 2;

    player.targetX =
        player.x;

    player.y =
        canvas.height - 70;

    updateGameUI();

    showScreen(
        gameScreen
    );

    lastTime =
        performance.now();

    if (animationId) {

        cancelAnimationFrame(
            animationId
        );

    }

    animationId =
        requestAnimationFrame(
            gameLoop
        );

}


/* ================= SPIELER STEUERUNG ================= */

/*
   WICHTIG:

   Der Spieler kann NUR links/rechts.
   Die Fingerposition auf der Y-Achse
   wird komplett ignoriert.
*/

function movePlayerToScreenX(
    screenX
) {

    if (
        !canvas ||
        !gameRunning ||
        gamePaused
    ) {

        return;

    }

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


canvas.addEventListener(
    "touchstart",
    event => {

        event.preventDefault();

        if (
            event.touches.length
        ) {

            movePlayerToScreenX(
                event.touches[0]
                    .clientX
            );

        }

    },
    { passive: false }
);


canvas.addEventListener(
    "touchmove",
    event => {

        event.preventDefault();

        if (
            event.touches.length
        ) {

            movePlayerToScreenX(
                event.touches[0]
                    .clientX
            );

        }

    },
    { passive: false }
);


canvas.addEventListener(
    "mousemove",
    event => {

        movePlayerToScreenX(
            event.clientX
        );

    }
);


/* ================= PAUSE ================= */

function pauseGame() {

    if (
        !gameRunning ||
        gamePaused
    ) {

        return;

    }

    gamePaused =
        true;

    if (pauseMenu) {

        pauseMenu.classList.add(
            "active"
        );

    }

}


function resumeGame() {

    if (!gameRunning)
        return;

    gamePaused =
        false;

    if (pauseMenu) {

        pauseMenu.classList.remove(
            "active"
        );

    }

    lastTime =
        performance.now();

}


/* ================= GEGNER ERSTELLEN ================= */

function spawnEnemy() {

    const width =
        25 +
        Math.random() * 45;

    const height =
        25 +
        Math.random() * 55;

    const x =
        Math.random() *
        (canvas.width - width);

    /*
       Je höher die Schwierigkeit,
       desto schneller werden die Gegner.
    */

    const speed =
        260 +
        difficulty * 45 +
        Math.random() * 170;

    enemies.push({

        x: x,

        y: -height,

        width: width,

        height: height,

        speed: speed,

        rotation:
            Math.random() * Math.PI,

        rotationSpeed:
            (Math.random() - 0.5) * 3

    });

}


/* ================= POWER-UPS ================= */

function spawnPowerup() {

    if (
        currentMode ===
        "hardcore"
    ) {

        return;

    }

    const types = [
        "shield",
        "coin"
    ];

    const type =
        types[
            Math.floor(
                Math.random() *
                types.length
            )
        ];

    powerups.push({

        x:
            25 +
            Math.random() *
            (canvas.width - 50),

        y:
            -30,

        radius:
            15,

        speed:
            180 +
            difficulty * 15,

        type:
            type

    });

}


/* ================= KOLLISION ================= */

function circleRectCollision(
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
    ) <
    circle.radius *
    circle.radius;

}


/* ================= SPIEL UPDATE ================= */

function updateGame(
    delta
) {

    /*
       Spieler bewegt sich nur X.
       Y bleibt IMMER unten.
    */

    player.x +=
        (
            player.targetX -
            player.x
        ) *
        0.22;

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
        canvas.height - 70;


    /* Schwierigkeit */

    elapsedTime +=
        delta;

    /*
       Alle 5 Sekunden etwas schwieriger.
    */

    difficulty =
        1 +
        elapsedTime / 5;


    /* Gegner */

    enemyTimer +=
        delta;

    /*
       Anfangs ca. alle 0,65 Sekunden.
       Später deutlich schneller.
    */

    const spawnInterval =
        Math.max(
            0.20,
            0.65 -
            difficulty * 0.035
        );

    if (
        enemyTimer >=
        spawnInterval
    ) {

        enemyTimer =
            0;

        spawnEnemy();

        /*
           Ab höherer Schwierigkeit
           manchmal gleich 2 Gegner.
        */

        if (
            difficulty > 7 &&
            Math.random() < 0.35
        ) {

            spawnEnemy();

        }

    }


    /* Power-ups */

    if (
        currentMode ===
        "normal"
    ) {

        powerupTimer +=
            delta;

        if (
            powerupTimer >=
            8
        ) {

            powerupTimer =
                0;

            spawnPowerup();

        }

    }


    /* Gegner bewegen */

    for (
        let i =
            enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            enemies[i];

        enemy.y +=
            enemy.speed *
            delta;

        enemy.rotation +=
            enemy.rotationSpeed *
            delta;


        if (
            circleRectCollision(
                player,
                enemy
            )
        ) {

            if (
                player.shield
            ) {

                player.shield =
                    false;

                enemies.splice(
                    i,
                    1
                );

            } else {

                lives--;

                enemies.splice(
                    i,
                    1
                );

                if (
                    lives <= 0
                ) {

                    endGame();

                    return;

                }

            }

        } else if (
            enemy.y >
            canvas.height + 100
        ) {

            enemies.splice(
                i,
                1
            );

            score += 1;

        }

    }


    /* Power-ups bewegen */

    for (
        let i =
            powerups.length - 1;
        i >= 0;
        i--
    ) {

        const powerup =
            powerups[i];

        powerup.y +=
            powerup.speed *
            delta;


        const dx =
            player.x -
            powerup.x;

        const dy =
            player.y -
            powerup.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <
            player.radius +
            powerup.radius
        ) {

            if (
                powerup.type ===
                "shield"
            ) {

                player.shield =
                    true;

            }

            if (
                powerup.type ===
                "coin"
            ) {

                coins += 10;

                updateCoinsUI();

            }

            powerups.splice(
                i,
                1
            );

        } else if (
            powerup.y >
            canvas.height + 50
        ) {

            powerups.splice(
                i,
                1
            );

        }

    }


    /*
       Score steigt mit der Zeit.
    */

    score +=
        delta *
        (
            1 +
            difficulty *
            0.15
        );

    updateGameUI();

}


/* ================= ZEICHNEN ================= */

function drawBackground() {

    ctx.fillStyle =
        "#080b12";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /*
       Arena-Linien
    */

    ctx.strokeStyle =
        "rgba(255,255,255,0.04)";

    ctx.lineWidth =
        1;

    const grid =
        50;

    for (
        let x = 0;
        x < canvas.width;
        x += grid
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

}


function drawPlayer() {

    const color =
        getPlayerColor();

    ctx.save();

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        color;

    ctx.shadowBlur =
        20;

    ctx.shadowColor =
        color;

    ctx.fill();

    ctx.restore();


    /*
       Schild
    */

    if (
        player.shield
    ) {

        ctx.save();

        ctx.beginPath();

        ctx.arc(
            player.x,
            player.y,
            player.radius + 8,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "#00ffff";

        ctx.lineWidth =
            4;

        ctx.shadowBlur =
            20;

        ctx.shadowColor =
            "#00ffff";

        ctx.stroke();

        ctx.restore();

    }

}


function drawEnemies() {

    for (
        const enemy of enemies
    ) {

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
            "#ff3b30";

        ctx.shadowBlur =
            12;

        ctx.shadowColor =
            "#ff3b30";

        ctx.fillRect(
            -enemy.width / 2,
            -enemy.height / 2,
            enemy.width,
            enemy.height
        );

        ctx.restore();

    }

}


function drawPowerups() {

    for (
        const powerup of powerups
    ) {

        ctx.save();

        ctx.beginPath();

        ctx.arc(
            powerup.x,
            powerup.y,
            powerup.radius,
            0,
            Math.PI * 2
        );

        if (
            powerup.type ===
            "shield"
        ) {

            ctx.fillStyle =
                "#00ffff";

        } else {

            ctx.fillStyle =
                "#ffd700";

        }

        ctx.shadowBlur =
            20;

        ctx.shadowColor =
            ctx.fillStyle;

        ctx.fill();

        ctx.restore();

    }

}


/* ================= RENDER ================= */

function render() {

    drawBackground();

    drawPowerups();

    drawEnemies();

    drawPlayer();

}


/* ================= GAME LOOP ================= */

function gameLoop(
    timestamp
) {

    if (
        !gameRunning
    ) {

        return;

    }

    if (
        gamePaused
    ) {

        animationId =
            requestAnimationFrame(
                gameLoop
            );

        return;

    }


    const delta =
        Math.min(
            (timestamp -
                lastTime) /
                1000,
            0.05
        );

    lastTime =
        timestamp;


    updateGame(
        delta
    );

    render();


    if (
        gameRunning
    ) {

        animationId =
            requestAnimationFrame(
                gameLoop
            );

    }

}


/* ================= UI ================= */

function updateGameUI() {

    if (scoreDisplay) {

        scoreDisplay.textContent =
            "SCORE: " +
            Math.floor(score);

    }


    if (livesDisplay) {

        if (
            currentMode ===
            "hardcore"
        ) {

            livesDisplay.textContent =
                lives > 0
                    ? "❤️"
                    : "";

        } else {

            livesDisplay.textContent =
                lives === 2
                    ? "❤️❤️"
                    : lives === 1
                        ? "❤️"
                        : "";

        }

    }

}


/* ================= GAME OVER ================= */

function endGame() {

    if (
        !gameRunning
    ) {

        return;

    }

    gameRunning =
        false;

    gamePaused =
        false;


    if (
        animationId
    ) {

        cancelAnimationFrame(
            animationId
        );

        animationId =
            null;

    }


    const final =
        Math.floor(score);

    /*
       Coins für den Score.
    */

    const earned =
        Math.max(
            1,
            Math.floor(
                final / 10
            )
        );

    coins +=
        earned;

    updateCoinsUI();


    let isNewHighscore =
        false;

    if (
        currentMode ===
        "normal" &&
        final > highscore
    ) {

        highscore =
            final;

        localStorage.setItem(
            "dodgeHighscore",
            highscore
        );

        isNewHighscore =
            true;

    }


    if (finalScore) {

        finalScore.textContent =
            "Score: " +
            final;

    }


    if (coinsEarned) {

        coinsEarned.textContent =
            "🪙 +" +
            earned +
            " Coins";

    }


    if (newHighscore) {

        newHighscore.style.display =
            isNewHighscore
                ? "block"
                : "none";

    }


    if (menuHighscore) {

        menuHighscore.textContent =
            highscore;

    }


    showScreen(
        gameOver
    );


    submitScore(
        playerName,
        final,
        currentMode
    );

}


/* ================= SUPABASE SCORE ================= */

function leaderboardTable(
    mode
) {

    return mode ===
        "hardcore"
        ? "hardcore"
        : "normal";

}


async function submitScore(
    name,
    scoreValue,
    mode
) {

    if (!supabaseClient)
        return;

    try {

        const table =
            leaderboardTable(
                mode
            );

        const {
            error
        } =
            await supabaseClient
                .from(table)
                .insert({

                    name:
                        name,

                    score:
                        Math.floor(
                            scoreValue
                        )

                });


        if (error) {

            console.error(
                "Score konnte nicht gespeichert werden:",
                error
            );

        }

    } catch (error) {

        console.error(
            error
        );

    }

}


/* ================= BESTENLISTE ================= */

async function loadLeaderboard(
    mode
) {

    if (!leaderboardList)
        return;


    leaderboardList.innerHTML =
        "<p>Lade Bestenliste...</p>";


    if (!supabaseClient) {

        leaderboardList.innerHTML =
            "<p>Bestenliste nicht verfügbar.</p>";

        return;

    }


    try {

        const table =
            leaderboardTable(
                mode
            );


        const {
            data,
            error
        } =
            await supabaseClient
                .from(table)
                .select(
                    "name, score"
                )
                .order(
                    "score",
                    {
                        ascending:
                            false
                    }
                )
                .limit(10);


        if (error) {

            console.error(
                error
            );

            leaderboardList.innerHTML =
                "<p>Fehler beim Laden.</p>";

            return;

        }


        if (
            !data ||
            data.length === 0
        ) {

            leaderboardList.innerHTML =
                "<p>Noch keine Einträge.</p>";

            return;

        }


        leaderboardList.innerHTML =
            "";


        data.forEach(
            (entry, index) => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "leaderboardRow";


                const rank =
                    document.createElement(
                        "span"
                    );

                rank.textContent =
                    "#" +
                    (index + 1);


                const name =
                    document.createElement(
                        "span"
                    );

                name.textContent =
                    entry.name;


                const score =
                    document.createElement(
                        "span"
                    );

                score.textContent =
                    Math.floor(
                        entry.score
                    );


                row.appendChild(
                    rank
                );

                row.appendChild(
                    name
                );

                row.appendChild(
                    score
                );


                leaderboardList.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            error
        );

        leaderboardList.innerHTML =
            "<p>Fehler beim Laden.</p>";

    }

}


/* ================= BUTTONS ================= */


/* NORMAL */

if (normalButton) {

    normalButton.addEventListener(
        "click",
        () => {

            startGame(
                "normal"
            );

        }
    );

}


/* HARDCORE */

if (hardcoreButton) {

    hardcoreButton.addEventListener(
        "click",
        () => {

            startGame(
                "hardcore"
            );

        }
    );

}


/* NAME */

if (nameButton) {

    nameButton.addEventListener(
        "click",
        () => {

            updateNameUI();

            showScreen(
                nameScreen
            );

        }
    );

}


/* SAVE NAME */

if (saveNameButton) {

    saveNameButton.addEventListener(
        "click",
        savePlayerName
    );

}


/* NAME BACK */

if (nameBackButton) {

    nameBackButton.addEventListener(
        "click",
        () => {

            showScreen(
                menu
            );

        }
    );

}


/* SHOP */

if (shopButton) {

    shopButton.addEventListener(
        "click",
        () => {

            updateCoinsUI();

            renderShop();

            showScreen(
                shop
            );

        }
    );

}


/* SHOP BACK */

if (shopBackButton) {

    shopBackButton.addEventListener(
        "click",
        () => {

            showScreen(
                menu
            );

        }
    );

}


/* LEADERBOARD */

if (leaderboardButton) {

    leaderboardButton.addEventListener(
        "click",
        () => {

            showScreen(
                leaderboard
            );

            loadLeaderboard(
                "normal"
            );

        }
    );

}


/* NORMAL LEADERBOARD */

if (
    leaderboardNormalButton
) {

    leaderboardNormalButton.addEventListener(
        "click",
        () => {

            loadLeaderboard(
                "normal"
            );

        }
    );

}


/* HARDCORE LEADERBOARD */

if (
    leaderboardHardcoreButton
) {

    leaderboardHardcoreButton.addEventListener(
        "click",
        () => {

            loadLeaderboard(
                "hardcore"
            );

        }
    );

}


/* LEADERBOARD BACK */

if (
    leaderboardBackButton
) {

    leaderboardBackButton.addEventListener(
        "click",
        () => {

            showScreen(
                menu
            );

        }
    );

}


/* PAUSE */

if (pauseButton) {

    pauseButton.addEventListener(
        "click",
        pauseGame
    );

}


/* RESUME */

if (resumeButton) {

    resumeButton.addEventListener(
        "click",
        resumeGame
    );

}


/* PAUSE → MENU */

if (pauseMenuButton) {

    pauseMenuButton.addEventListener(
        "click",
        () => {

            gameRunning =
                false;

            gamePaused =
                false;

            if (
                animationId
            ) {

                cancelAnimationFrame(
                    animationId
                );

                animationId =
                    null;

            }

            showScreen(
                menu
            );

        }
    );

}


/* RESTART */

if (restartButton) {

    restartButton.addEventListener(
        "click",
        () => {

            startGame(
                currentMode
            );

        }
    );

}


/* GAME OVER → MENU */

if (
    gameOverMenuButton
) {

    gameOverMenuButton.addEventListener(
        "click",
        () => {

            showScreen(
                menu
            );

        }
    );

}


/* ENTER BEIM NAMEN */

if (nameInput) {

    nameInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                savePlayerName();

            }

        }
    );

}


/* ================= START ================= */

updateNameUI();

updateCoinsUI();

if (menuHighscore) {

    menuHighscore.textContent =
        highscore;

}

showScreen(
    menu
);
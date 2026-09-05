const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


/* =========================
   ELEMENTE
========================= */

const menu = document.getElementById("menu");
const nameScreen = document.getElementById("nameScreen");
const shop = document.getElementById("shop");
const leaderboard = document.getElementById("leaderboard");
const gameScreen = document.getElementById("gameScreen");
const pauseMenu = document.getElementById("pauseMenu");
const gameOverScreen = document.getElementById("gameOver");

const scoreText =
    document.getElementById("score");

const livesText =
    document.getElementById("lives");

const newHighscore =
    document.getElementById("newHighscore");


/* =========================
   DATEN
========================= */

let playerName =
    localStorage.getItem("dodgePlayerName") || "";

let coins =
    Number(localStorage.getItem("dodgeCoins")) || 0;

let highscore =
    Number(localStorage.getItem("dodgeHighscore")) || 0;

let selectedSkin =
    localStorage.getItem("dodgeSelectedSkin") || "blue";

let ownedSkins =
    JSON.parse(
        localStorage.getItem("dodgeSkins") ||
        '["blue"]'
    );


/*
   Alte Bestenliste wird automatisch
   auf das neue System umgestellt.
*/

let leaderboardScores =
    JSON.parse(
        localStorage.getItem("dodgeLeaderboard") ||
        "[]"
    );


leaderboardScores =
    leaderboardScores
        .map(entry => {

            if (
                typeof entry === "number"
            ) {

                return {
                    name: "Unbekannt",
                    score: entry
                };
            }

            return {
                name:
                    entry.name ||
                    "Unbekannt",

                score:
                    Number(entry.score) || 0
            };
        })
        .filter(
            entry =>
                entry.score >= 0
        );


/* =========================
   SKINS
========================= */

const skins = [

    {
        id: "blue",
        name: "Blue",
        price: 0,
        description: "Standard"
    },

    {
        id: "red",
        name: "Red",
        price: 15,
        description: "Roter Glow"
    },

    {
        id: "energy",
        name: "Energy",
        price: 30,
        description: "Regenbogen"
    },

    {
        id: "toxic",
        name: "Toxic",
        price: 45,
        description: "Giftiger Glow"
    },

    {
        id: "void",
        name: "Void",
        price: 60,
        description: "Dunkle Energie"
    },

    {
        id: "gold",
        name: "Gold",
        price: 100,
        description: "Goldener Glow"
    },

    {
        id: "galaxy",
        name: "Galaxy",
        price: 150,
        description: "Galaxie-Effekt"
    },

    {
        id: "diamond",
        name: "Diamond",
        price: 250,
        description: "Diamanten-Glow"
    }
];


/* =========================
   SPIELDATEN
========================= */

let W = window.innerWidth;
let H = window.innerHeight;

canvas.width = W;
canvas.height = H;

let player;

let enemies = [];
let particles = [];
let stars = [];
let coinPickups = [];

let score = 0;
let speed = 4;

let lives = 2;

let mode = "normal";

let frame = 0;
let enemyTimer = 0;
let shieldTimer = 0;

let shieldPickup = null;
let shieldActive = false;

let gameRunning = false;
let gamePaused = false;


/* =========================
   NAME-FILTER
========================= */

const badWords = [

    "arsch",
    "arschloch",
    "idiot",
    "hurensohn",
    "hure",
    "wichser",
    "wixxer",
    "wixer",
    "fotze",
    "fick",
    "ficken",
    "scheisse",
    "scheiße",
    "schlampe",
    "bastard",
    "miststück",
    "penner",
    "spast",
    "spasti",
    "mongo",
    "nazi"

];


function normalizeName(name) {

    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-z0-9]/g,
            ""
        );
}


function isNameAllowed(name) {

    const clean =
        normalizeName(name);

    if (
        clean.length < 2 ||
        clean.length > 16
    ) {

        return false;
    }

    for (
        const word of badWords
    ) {

        if (
            clean.includes(word)
        ) {

            return false;
        }
    }

    return true;
}


function savePlayerName() {

    const input =
        document
            .getElementById("nameInput")
            .value
            .trim();

    const error =
        document
            .getElementById("nameError");


    if (
        input.length < 2
    ) {

        error.textContent =
            "❌ Der Name ist zu kurz.";

        return;
    }


    if (
        input.length > 16
    ) {

        error.textContent =
            "❌ Der Name darf maximal 16 Zeichen haben.";

        return;
    }


    if (
        !/^[A-Za-zÄÖÜäöüß0-9 _-]+$/.test(
            input
        )
    ) {

        error.textContent =
            "❌ Nur Buchstaben, Zahlen, Leerzeichen, _ und - erlaubt.";

        return;
    }


    if (
        !isNameAllowed(input)
    ) {

        error.textContent =
            "❌ Dieser Name ist nicht erlaubt.";

        return;
    }


    playerName = input;

    localStorage.setItem(
        "dodgePlayerName",
        playerName
    );


    document.getElementById(
        "menuPlayerName"
    ).textContent =
        playerName;


    error.textContent = "";

    nameScreen.style.display =
        "none";

    menu.style.display =
        "flex";
}


function openNameScreen() {

    menu.style.display =
        "none";

    nameScreen.style.display =
        "flex";


    const input =
        document.getElementById(
            "nameInput"
        );

    input.value =
        playerName;

    input.focus();
}


/* =========================
   ERSTER START
========================= */

if (!playerName) {

    menu.style.display =
        "none";

    nameScreen.style.display =
        "flex";

} else {

    document.getElementById(
        "menuPlayerName"
    ).textContent =
        playerName;
}


/* =========================
   COINS
========================= */

function updateCoins() {

    document.getElementById(
        "menuCoins"
    ).textContent =
        coins;

    document.getElementById(
        "shopCoins"
    ).textContent =
        coins;
}


function updateHighscore() {

    document.getElementById(
        "menuHighscore"
    ).textContent =
        highscore;
}


updateCoins();
updateHighscore();


/* =========================
   SHOP ERSTELLEN
========================= */

function createShop() {

    const list =
        document.getElementById(
            "skinList"
        );

    list.innerHTML = "";


    skins.forEach(
        skin => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "skinCard";


            const preview =
                document.createElement(
                    "div"
                );

            preview.className =
                "skinPreview " +
                skin.id +
                "Skin";


            const title =
                document.createElement(
                    "h2"
                );

            title.textContent =
                skin.name;


            const description =
                document.createElement(
                    "p"
                );

            description.textContent =
                skin.description;


            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "skinButton";


            button.addEventListener(
                "click",
                () =>
                    buyOrSelectSkin(
                        skin
                    )
            );


            card.appendChild(
                preview
            );

            card.appendChild(
                title
            );

            card.appendChild(
                description
            );

            card.appendChild(
                button
            );


            list.appendChild(
                card
            );
        }
    );


    updateShopButtons();
}


function updateShopButtons() {

    const buttons =
        document.querySelectorAll(
            ".skinButton"
        );


    buttons.forEach(
        (button, index) => {

            const skin =
                skins[index];


            if (
                selectedSkin ===
                skin.id
            ) {

                button.textContent =
                    "✓ AUSGEWÄHLT";

                return;
            }


            if (
                ownedSkins.includes(
                    skin.id
                )
            ) {

                button.textContent =
                    "AUSWÄHLEN";

                return;
            }


            if (
                skin.price === 0
            ) {

                button.textContent =
                    "KOSTENLOS";

            } else {

                button.textContent =
                    "🪙 " +
                    skin.price;
            }
        }
    );
}


function buyOrSelectSkin(skin) {

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

        updateShopButtons();

        return;
    }


    if (
        coins < skin.price
    ) {

        alert(
            "Du hast nicht genug Coins!"
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
        "dodgeCoins",
        coins
    );

    localStorage.setItem(
        "dodgeSkins",
        JSON.stringify(
            ownedSkins
        )
    );

    localStorage.setItem(
        "dodgeSelectedSkin",
        selectedSkin
    );


    updateCoins();

    updateShopButtons();
}


function openShop() {

    menu.style.display =
        "none";

    shop.style.display =
        "flex";

    updateCoins();

    updateShopButtons();
}


createShop();


/* =========================
   STERNE
========================= */

function createStars() {

    stars = [];

    for (
        let i = 0;
        i < 100;
        i++
    ) {

        stars.push({

            x:
                Math.random() * W,

            y:
                Math.random() * H,

            size:
                Math.random() * 2 +
                0.5,

            speed:
                Math.random() * 0.8 +
                0.2,

            alpha:
                Math.random() * 0.7 +
                0.2
        });
    }
}

createStars();


/* =========================
   SPIELER
========================= */

function createPlayer() {

    player = {

        x:
            W / 2,

        y:
            H - 110,

        radius:
            25,

        targetX:
            W / 2
    };
}


/* =========================
   SPIEL STARTEN
========================= */

function startGame(selectedMode) {

    mode =
        selectedMode;

    lives =
        mode === "normal"
            ? 2
            : 1;

    speed =
        mode === "hardcore"
            ? 5.8
            : 4;

    score = 0;

    frame = 0;

    enemyTimer = 0;

    shieldTimer = 0;

    enemies = [];

    particles = [];

    coinPickups = [];

    shieldPickup = null;

    shieldActive = false;

    gamePaused = false;

    createPlayer();


    menu.style.display =
        "none";

    nameScreen.style.display =
        "none";

    shop.style.display =
        "none";

    leaderboard.style.display =
        "none";

    pauseMenu.style.display =
        "none";

    gameOverScreen.style.display =
        "none";

    gameScreen.style.display =
        "block";


    updateLives();

    gameRunning = true;

    requestAnimationFrame(
        gameLoop
    );
}


/* =========================
   STEUERUNG
========================= */

canvas.addEventListener(
    "touchstart",
    movePlayer,
    { passive: false }
);

canvas.addEventListener(
    "touchmove",
    movePlayer,
    { passive: false }
);

canvas.addEventListener(
    "mousemove",
    e => {

        if (
            !gameRunning ||
            gamePaused
        ) return;

        player.targetX =
            e.clientX;
    }
);


function movePlayer(e) {

    if (
        !gameRunning ||
        gamePaused
    ) return;

    e.preventDefault();

    const touch =
        e.touches[0];

    if (touch) {

        player.targetX =
            touch.clientX;
    }
}


/* =========================
   GEGNER
========================= */

function spawnEnemy() {

    let width = 40;
    let height = 40;


    if (
        score >= 30 &&
        Math.random() < 0.5
    ) {

        if (
            Math.random() < 0.5
        ) {

            width = 120;
            height = 35;

        } else {

            width = 35;
            height = 120;
        }
    }


    if (
        mode === "hardcore" &&
        score >= 20 &&
        Math.random() < 0.25
    ) {

        width = 150;
        height = 32;
    }


    enemies.push({

        x:
            Math.random() *
            (W - width),

        y:
            -height,

        width,

        height,

        rotation:
            Math.random() *
            Math.PI,

        rotationSpeed:
            (
                Math.random() - 0.5
            ) * 0.08,

        speed:
            speed +
            Math.random() *
            (
                mode === "hardcore"
                    ? 3
                    : 2
            )
    });
}


/* =========================
   SCHILD
========================= */

function spawnShield() {

    if (
        mode === "hardcore"
    ) return;

    if (
        shieldPickup
    ) return;


    shieldPickup = {

        x:
            Math.random() *
            (W - 40) +
            20,

        y:
            -30,

        size:
            32,

        speed:
            3
    };
}


/* =========================
   COINS
========================= */

function spawnCoin() {

    /*
       8 % Chance auf einen
       goldenen Coin
    */

    const isGold =
        Math.random() < 0.08;


    coinPickups.push({

        x:
            Math.random() *
            (W - 50) +
            25,

        y:
            -30,

        size:
            isGold
                ? 25
                : 22,

        speed:
            isGold
                ? 3.3
                : 3,

        gold:
            isGold
    });
}


function updateCoinsInGame() {

    if (
        frame % 180 === 0 &&
        coinPickups.length < 2
    ) {

        spawnCoin();
    }


    for (
        let i =
            coinPickups.length - 1;
        i >= 0;
        i--
    ) {

        const coin =
            coinPickups[i];

        coin.y +=
            coin.speed;


        const dx =
            player.x -
            coin.x;

        const dy =
            player.y -
            coin.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <
            player.radius +
            coin.size
        ) {

            const value =
                coin.gold
                    ? 5
                    : 1;


            coins +=
                value;


            localStorage.setItem(
                "dodgeCoins",
                coins
            );


            updateCoins();


            createParticles(
                coin.x,
                coin.y,
                coin.gold
                    ? 35
                    : 18
            );


            coinPickups.splice(
                i,
                1
            );

            continue;
        }


        if (
            coin.y >
            H + 50
        ) {

            coinPickups.splice(
                i,
                1
            );
        }
    }
}


/* =========================
   PARTIKEL
========================= */

function createParticles(
    x,
    y,
    amount = 15
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
                (
                    Math.random() -
                    0.5
                ) * 8,

            vy:
                (
                    Math.random() -
                    0.5
                ) * 8,

            size:
                Math.random() * 4 +
                2,

            life:
                40
        });
    }
}


function updateParticles() {

    for (
        let i =
            particles.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particles[i];

        p.x += p.vx;

        p.y += p.vy;

        p.life--;

        p.size *= 0.96;


        if (
            p.life <= 0
        ) {

            particles.splice(
                i,
                1
            );
        }
    }
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
        dy * dy <
        circle.radius *
        circle.radius
    );
}


/* =========================
   LEBEN
========================= */

function updateLives() {

    if (
        mode === "hardcore"
    ) {

        livesText.textContent =
            lives > 0
                ? "❤️"
                : "";

        return;
    }


    livesText.textContent =
        "❤️".repeat(
            Math.max(
                0,
                lives
            )
        ) +
        "🖤".repeat(
            Math.max(
                0,
                2 - lives
            )
        );
}


/* =========================
   TREFFER
========================= */

function hitPlayer() {

    createParticles(
        player.x,
        player.y,
        25
    );


    if (
        mode === "normal" &&
        shieldActive
    ) {

        shieldActive = false;

        createParticles(
            player.x,
            player.y,
            35
        );

        return;
    }


    lives--;

    updateLives();


    if (
        lives <= 0
    ) {

        gameOver();
    }
}


/* =========================
   UPDATE
========================= */

function updateGame() {

    frame++;


    score +=
        mode === "hardcore"
            ? 0.035
            : 0.025;


    scoreText.textContent =
        "SCORE: " +
        Math.floor(score);


    speed +=
        mode === "hardcore"
            ? 0.0015
            : 0.0008;


    player.x +=
        (
            player.targetX -
            player.x
        ) * 0.18;


    player.x =
        Math.max(
            player.radius,
            Math.min(
                W -
                player.radius,
                player.x
            )
        );


    /* Gegner */

    enemyTimer++;


    let spawnInterval;


    if (
        mode === "hardcore"
    ) {

        spawnInterval =
            Math.max(
                10,
                27 -
                Math.floor(
                    score / 7
                )
            );

    } else {

        spawnInterval =
            Math.max(
                15,
                36 -
                Math.floor(
                    score / 8
                )
            );
    }


    if (
        enemyTimer >=
        spawnInterval
    ) {

        enemyTimer = 0;

        spawnEnemy();


        if (
            mode === "hardcore" &&
            score >= 40 &&
            Math.random() < 0.35
        ) {

            spawnEnemy();
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
            enemy.speed;

        enemy.rotation +=
            enemy.rotationSpeed;


        if (
            circleRectCollision(
                player,
                enemy
            )
        ) {

            hitPlayer();

            enemies.splice(
                i,
                1
            );

            continue;
        }


        if (
            enemy.y >
            H + 150
        ) {

            enemies.splice(
                i,
                1
            );
        }
    }


    /* Schild */

    if (
        mode === "normal"
    ) {

        shieldTimer++;


        if (
            shieldTimer >= 300 &&
            !shieldPickup &&
            !shieldActive
        ) {

            shieldTimer = 0;

            spawnShield();
        }


        if (
            shieldPickup
        ) {

            shieldPickup.y +=
                shieldPickup.speed;


            const dx =
                player.x -
                shieldPickup.x;

            const dy =
                player.y -
                shieldPickup.y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (
                distance <
                player.radius + 20
            ) {

                shieldActive = true;

                shieldPickup = null;

                createParticles(
                    player.x,
                    player.y,
                    25
                );
            }


            if (
                shieldPickup &&
                shieldPickup.y >
                H + 50
            ) {

                shieldPickup = null;
            }
        }
    }


    updateCoinsInGame();

    updateParticles();


    for (
        const star of stars
    ) {

        star.y +=
            star.speed;


        if (
            star.y > H
        ) {

            star.y = -5;

            star.x =
                Math.random() *
                W;
        }
    }
}


/* =========================
   SPIELER-FARBE
========================= */

function getSkinSettings() {

    switch (
        selectedSkin
    ) {

        case "red":
            return {
                color: "#ff4040",
                glow: "#ff3030"
            };

        case "energy":
            return {
                color: null,
                glow: "#9b5cff"
            };

        case "toxic":
            return {
                color: "#4cff00",
                glow: "#4cff00"
            };

        case "void":
            return {
                color: "#711cff",
                glow: "#8c35ff"
            };

        case "gold":
            return {
                color: "#ffd21f",
                glow: "#ffd700"
            };

        case "galaxy":
            return {
                color: null,
                glow: "#744cff"
            };

        case "diamond":
            return {
                color: null,
                glow: "#7deaff"
            };

        default:
            return {
                color: "#5570ff",
                glow: "#5570ff"
            };
    }
}


/* =========================
   ZEICHNEN
========================= */

function drawGame() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );

    gradient.addColorStop(
        0,
        "#03030d"
    );

    gradient.addColorStop(
        1,
        "#080820"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* Sterne */

    for (
        const star of stars
    ) {

        ctx.globalAlpha =
            star.alpha;

        ctx.fillStyle =
            "white";

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;


    /* Gegner */

    for (
        const enemy of enemies
    ) {

        ctx.save();

        const centerX =
            enemy.x +
            enemy.width / 2;

        const centerY =
            enemy.y +
            enemy.height / 2;

        ctx.translate(
            centerX,
            centerY
        );

        ctx.rotate(
            enemy.rotation
        );

        ctx.shadowBlur = 18;

        ctx.shadowColor =
            "#ff3030";

        ctx.fillStyle =
            "#e8334f";

        ctx.fillRect(
            -enemy.width / 2,
            -enemy.height / 2,
            enemy.width,
            enemy.height
        );

        ctx.shadowBlur = 0;

        ctx.restore();
    }


    /* Schild */

    if (
        shieldPickup
    ) {

        ctx.save();

        ctx.font =
            "30px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.shadowBlur = 20;

        ctx.shadowColor =
            "#20aaff";

        ctx.fillText(
            "🛡️",
            shieldPickup.x,
            shieldPickup.y
        );

        ctx.restore();
    }


    /* Coins */

    for (
        const coin of coinPickups
    ) {

        ctx.save();

        ctx.font =
            coin.gold
                ? "34px Arial"
                : "28px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.shadowBlur =
            coin.gold
                ? 30
                : 20;

        ctx.shadowColor =
            coin.gold
                ? "#ffd700"
                : "#ffd83d";

        ctx.fillText(
            coin.gold
                ? "🟡"
                : "🪙",
            coin.x,
            coin.y
        );

        ctx.restore();
    }


    /* Spieler */

    if (
        player
    ) {

        ctx.save();


        /* Schildring */

        if (
            shieldActive
        ) {

            ctx.beginPath();

            ctx.arc(
                player.x,
                player.y,
                player.radius + 10,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle =
                "#25aaff";

            ctx.lineWidth = 5;

            ctx.shadowBlur = 25;

            ctx.shadowColor =
                "#009dff";

            ctx.stroke();
        }


        const settings =
            getSkinSettings();


        /* Spezielle Skins */

        if (
            selectedSkin ===
            "energy"
        ) {

            const energy =
                ctx.createLinearGradient(
                    player.x - 25,
                    player.y - 25,
                    player.x + 25,
                    player.y + 25
                );

            energy.addColorStop(
                0,
                "#ff3030"
            );

            energy.addColorStop(
                0.25,
                "#ffd42f"
            );

            energy.addColorStop(
                0.5,
                "#30ff78"
            );

            energy.addColorStop(
                0.75,
                "#3c7cff"
            );

            energy.addColorStop(
                1,
                "#c735ff"
            );

            settings.color =
                energy;
        }


        if (
            selectedSkin ===
            "galaxy"
        ) {

            const galaxy =
                ctx.createRadialGradient(
                    player.x - 8,
                    player.y - 8,
                    2,
                    player.x,
                    player.y,
                    30
                );

            galaxy.addColorStop(
                0,
                "#ffffff"
            );

            galaxy.addColorStop(
                0.3,
                "#a55cff"
            );

            galaxy.addColorStop(
                0.7,
                "#3820a8"
            );

            galaxy.addColorStop(
                1,
                "#08051e"
            );

            settings.color =
                galaxy;
        }


        if (
            selectedSkin ===
            "diamond"
        ) {

            const diamond =
                ctx.createLinearGradient(
                    player.x - 25,
                    player.y - 25,
                    player.x + 25,
                    player.y + 25
                );

            diamond.addColorStop(
                0,
                "#ffffff"
            );

            diamond.addColorStop(
                0.35,
                "#79e8ff"
            );

            diamond.addColorStop(
                0.7,
                "#238dff"
            );

            diamond.addColorStop(
                1,
                "#ffffff"
            );

            settings.color =
                diamond;
        }


        /* Skin-Ring */

        if (
            selectedSkin !==
            "blue"
        ) {

            ctx.beginPath();

            ctx.arc(
                player.x,
                player.y,
                player.radius +
                7 +
                Math.sin(
                    frame * 0.12
                ) * 3,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle =
                settings.glow;

            ctx.lineWidth = 3;

            ctx.shadowBlur = 25;

            ctx.shadowColor =
                settings.glow;

            ctx.stroke();
        }


        /* Spieler */

        ctx.beginPath();

        ctx.arc(
            player.x,
            player.y,
            player.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            settings.color;

        ctx.shadowBlur = 25;

        ctx.shadowColor =
            settings.glow;

        ctx.fill();


        /* Glanz */

        ctx.beginPath();

        ctx.arc(
            player.x,
            player.y,
            player.radius - 7,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "rgba(255,255,255,0.25)";

        ctx.shadowBlur = 0;

        ctx.fill();


        ctx.restore();
    }


    /* Partikel */

    for (
        const p of particles
    ) {

        ctx.globalAlpha =
            p.life / 40;

        ctx.fillStyle =
            "#8aa0ff";

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;
}


/* =========================
   GAME LOOP
========================= */

function gameLoop() {

    if (
        !gameRunning
    ) return;


    if (
        !gamePaused
    ) {

        updateGame();

        drawGame();
    }


    requestAnimationFrame(
        gameLoop
    );
}


/* =========================
   PAUSE
========================= */

function pauseGame() {

    if (
        !gameRunning
    ) return;

    gamePaused = true;

    pauseMenu.style.display =
        "flex";
}


function resumeGame() {

    gamePaused = false;

    pauseMenu.style.display =
        "none";
}


/* =========================
   HAUPTMENÜ
========================= */

function goToMainMenu() {

    gameRunning = false;

    gamePaused = false;

    pauseMenu.style.display =
        "none";

    gameScreen.style.display =
        "none";

    gameOverScreen.style.display =
        "none";

    shop.style.display =
        "none";

    leaderboard.style.display =
        "none";

    menu.style.display =
        "flex";

    updateCoins();
    updateHighscore();
}


/* =========================
   GAME OVER
========================= */

function gameOver() {

    gameRunning = false;

    gamePaused = false;


    const final =
        Math.floor(score);


    const earnedCoins =
        Math.floor(
            final / 25
        );


    coins +=
        earnedCoins;


    localStorage.setItem(
        "dodgeCoins",
        coins
    );


    let isNewHighscore =
        false;


    if (
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


    leaderboardScores.push({

        name:
            playerName,

        score:
            final
    });


    leaderboardScores.sort(
        (a, b) =>
            b.score -
            a.score
    );


    leaderboardScores =
        leaderboardScores.slice(
            0,
            10
        );


    localStorage.setItem(
        "dodgeLeaderboard",
        JSON.stringify(
            leaderboardScores
        )
    );


    document.getElementById(
        "finalScore"
    ).textContent =
        playerName +
        " • Score: " +
        final;


    document.getElementById(
        "coinsEarned"
    ).textContent =
        "🪙 +" +
        earnedCoins +
        " Coins";


    newHighscore.style.display =
        isNewHighscore
            ? "block"
            : "none";


    updateCoins();
    updateHighscore();


    gameOverScreen.style.display =
        "flex";
}


/* =========================
   BESTENLISTE
========================= */

function showLeaderboard() {

    menu.style.display =
        "none";

    leaderboard.style.display =
        "flex";


    const list =
        document.getElementById(
            "leaderboardList"
        );


    list.innerHTML = "";


    if (
        leaderboardScores.length === 0
    ) {

        list.innerHTML =
            "<p>Noch keine Scores!</p>";

        return;
    }


    leaderboardScores.forEach(
        (entry, index) => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "leaderboardEntry";


            if (
                index === 0
            )
                div.classList.add(
                    "rank1"
                );


            if (
                index === 1
            )
                div.classList.add(
                    "rank2"
                );


            if (
                index === 2
            )
                div.classList.add(
                    "rank3"
                );


            const name =
                document.createElement(
                    "span"
                );

            name.textContent =
                "#" +
                (index + 1) +
                " " +
                entry.name;


            const points =
                document.createElement(
                    "span"
                );

            points.textContent =
                entry.score;


            div.appendChild(
                name
            );

            div.appendChild(
                points
            );


            list.appendChild(
                div
            );
        }
    );
}


/* =========================
   BUTTONS
========================= */

document
    .getElementById(
        "saveNameButton"
    )
    .addEventListener(
        "click",
        savePlayerName
    );


document
    .getElementById(
        "nameButton"
    )
    .addEventListener(
        "click",
        openNameScreen
    );


document
    .getElementById(
        "nameInput"
    )
    .addEventListener(
        "keydown",
        e => {

            if (
                e.key === "Enter"
            ) {

                savePlayerName();
            }
        }
    );


document
    .getElementById(
        "normalButton"
    )
    .addEventListener(
        "click",
        () =>
            startGame("normal")
    );


document
    .getElementById(
        "hardcoreButton"
    )
    .addEventListener(
        "click",
        () =>
            startGame("hardcore")
    );


document
    .getElementById(
        "pauseButton"
    )
    .addEventListener(
        "click",
        pauseGame
    );


document
    .getElementById(
        "resumeButton"
    )
    .addEventListener(
        "click",
        resumeGame
    );


document
    .getElementById(
        "pauseMenuButton"
    )
    .addEventListener(
        "click",
        goToMainMenu
    );


document
    .getElementById(
        "restartButton"
    )
    .addEventListener(
        "click",
        () =>
            startGame(mode)
    );


document
    .getElementById(
        "gameOverMenuButton"
    )
    .addEventListener(
        "click",
        goToMainMenu
    );


document
    .getElementById(
        "shopButton"
    )
    .addEventListener(
        "click",
        openShop
    );


document
    .getElementById(
        "shopBackButton"
    )
    .addEventListener(
        "click",
        goToMainMenu
    );


document
    .getElementById(
        "leaderboardButton"
    )
    .addEventListener(
        "click",
        showLeaderboard
    );


document
    .getElementById(
        "leaderboardBackButton"
    )
    .addEventListener(
        "click",
        goToMainMenu
    );

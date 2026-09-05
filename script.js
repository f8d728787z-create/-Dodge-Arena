/* =========================================================
   DODGE ARENA
   ========================================================= */


/* ================= SUPABASE ================= */

const SUPABASE_URL =
    "https://yjuwplccnklrznrgdfgx.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_xRHst0TbOBTYvQy4SeauSQ_LUex_5IC";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* ================= CANVAS ================= */

const canvas =
    document.getElementById("game");

const ctx =
    canvas.getContext("2d");


function resizeCanvas() {

    canvas.width =
        window.innerWidth *
        window.devicePixelRatio;

    canvas.height =
        window.innerHeight *
        window.devicePixelRatio;

    canvas.style.width =
        window.innerWidth + "px";

    canvas.style.height =
        window.innerHeight + "px";

    ctx.setTransform(
        window.devicePixelRatio,
        0,
        0,
        window.devicePixelRatio,
        0,
        0
    );
}


window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


/* ================= ELEMENTE ================= */

const menu =
    document.getElementById("menu");

const gameScreen =
    document.getElementById("gameScreen");

const nameScreen =
    document.getElementById("nameScreen");

const shop =
    document.getElementById("shop");

const leaderboard =
    document.getElementById("leaderboard");

const pauseMenu =
    document.getElementById("pauseMenu");

const gameOverScreen =
    document.getElementById("gameOver");

const scoreDisplay =
    document.getElementById("score");

const livesDisplay =
    document.getElementById("lives");

const menuPlayerName =
    document.getElementById("menuPlayerName");

const menuCoins =
    document.getElementById("menuCoins");

const menuHighscore =
    document.getElementById("menuHighscore");

const shopCoins =
    document.getElementById("shopCoins");

const skinList =
    document.getElementById("skinList");

const leaderboardList =
    document.getElementById("leaderboardList");

const nameInput =
    document.getElementById("nameInput");

const nameError =
    document.getElementById("nameError");


/* ================= LOCAL STORAGE ================= */

let playerName =
    localStorage.getItem("dodgePlayerName") ||
    "Spieler";

let coins =
    Number(
        localStorage.getItem("dodgeCoins")
    ) || 0;

let highscore =
    Number(
        localStorage.getItem("dodgeHighscore")
    ) || 0;

let selectedSkin =
    localStorage.getItem("dodgeSelectedSkin") ||
    "blue";

let ownedSkins =
    JSON.parse(
        localStorage.getItem(
            "dodgeOwnedSkins"
        )
    ) || ["blue"];


/* ================= SKINS ================= */

const skins = [

    {
        id: "blue",
        name: "Blue",
        price: 0,
        className: "blueSkin"
    },

    {
        id: "red",
        name: "Red",
        price: 100,
        className: "redSkin"
    },

    {
        id: "energy",
        name: "Energy",
        price: 250,
        className: "energySkin"
    },

    {
        id: "toxic",
        name: "Toxic",
        price: 500,
        className: "toxicSkin"
    },

    {
        id: "void",
        name: "Void",
        price: 750,
        className: "voidSkin"
    },

    {
        id: "gold",
        name: "Gold",
        price: 1000,
        className: "goldSkin"
    },

    {
        id: "galaxy",
        name: "Galaxy",
        price: 1500,
        className: "galaxySkin"
    },

    {
        id: "diamond",
        name: "Diamond",
        price: 2500,
        className: "diamondSkin"
    }

];


/* ================= SPIELVARIABLEN ================= */

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

let touchX = null;

let gameOverCalled = false;


/* ================= NAME FILTER ================= */

const badWords = [

    "hurensohn",
    "hure",
    "arschloch",
    "arsch",
    "fotze",
    "fick",
    "ficken",
    "wichser",
    "wixxer",
    "schlampe",
    "bastard",
    "spast",
    "penner",
    "idiot",
    "nazi"

];


function containsBadWord(name) {

    const lower =
        name.toLowerCase();

    return badWords.some(
        word =>
            lower.includes(word)
    );
}


/* ================= MENÜ AKTUALISIEREN ================= */

function updateMenu() {

    menuPlayerName.textContent =
        playerName;

    menuCoins.textContent =
        coins;

    menuHighscore.textContent =
        highscore;

    shopCoins.textContent =
        coins;
}


/* ================= SPEICHERN ================= */

function saveData() {

    localStorage.setItem(
        "dodgePlayerName",
        playerName
    );

    localStorage.setItem(
        "dodgeCoins",
        coins
    );

    localStorage.setItem(
        "dodgeHighscore",
        highscore
    );

    localStorage.setItem(
        "dodgeSelectedSkin",
        selectedSkin
    );

    localStorage.setItem(
        "dodgeOwnedSkins",
        JSON.stringify(ownedSkins)
    );
}


/* ================= NAME ================= */

function openNameScreen() {

    nameScreen.style.display =
        "flex";

    nameInput.value =
        playerName === "Spieler"
            ? ""
            : playerName;

    nameError.textContent = "";

    setTimeout(() => {
        nameInput.focus();
    }, 100);
}


function saveName() {

    const name =
        nameInput.value.trim();

    if (name.length < 2) {

        nameError.textContent =
            "Der Name muss mindestens 2 Zeichen haben.";

        return;
    }

    if (containsBadWord(name)) {

        nameError.textContent =
            "Dieser Name ist nicht erlaubt.";

        return;
    }

    playerName = name;

    saveData();

    updateMenu();

    nameScreen.style.display =
        "none";
}


/* ================= SHOP ================= */

function renderShop() {

    shopCoins.textContent =
        coins;

    skinList.innerHTML = "";

    skins.forEach(skin => {

        const card =
            document.createElement("div");

        card.className =
            "skinCard";

        const preview =
            document.createElement("div");

        preview.className =
            "skinPreview " +
            skin.className;

        const title =
            document.createElement("h2");

        title.textContent =
            skin.name;

        const price =
            document.createElement("p");

        if (ownedSkins.includes(skin.id)) {

            if (selectedSkin === skin.id) {

                price.textContent =
                    "✓ Ausgerüstet";

            } else {

                price.textContent =
                    "Besitzt du";
            }

        } else {

            price.textContent =
                "🪙 " + skin.price;
        }


        const button =
            document.createElement("button");

        button.className =
            "skinButton";


        if (ownedSkins.includes(skin.id)) {

            if (selectedSkin === skin.id) {

                button.textContent =
                    "Ausgerüstet";

            } else {

                button.textContent =
                    "Ausrüsten";
            }

        } else {

            button.textContent =
                "Kaufen";
        }


        button.addEventListener(
            "click",
            () => {

                if (
                    !ownedSkins.includes(
                        skin.id
                    )
                ) {

                    if (
                        coins <
                        skin.price
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
                }

                selectedSkin =
                    skin.id;

                saveData();

                updateMenu();

                renderShop();
            }
        );


        card.appendChild(
            preview
        );

        card.appendChild(
            title
        );

        card.appendChild(
            price
        );

        card.appendChild(
            button
        );

        skinList.appendChild(
            card
        );

    });
}


/* ================= SUPABASE BESTENLISTE ================= */

/*
   WICHTIG:
   Deine Tabelle heißt "leaderbord".
   Deshalb wird NICHT "scores" verwendet.
*/


async function loadLeaderboard() {

    const {
        data,
        error
    } = await supabaseClient
        .from("leaderbord")
        .select("name, score")
        .order(
            "score",
            {
                ascending: false
            }
        )
        .limit(10);


    if (error) {

        console.error(
            "Bestenliste konnte nicht geladen werden:",
            error
        );

        return null;
    }


    return data || [];
}


async function submitScore(
    name,
    playerScore
) {

    const {
        error
    } = await supabaseClient
        .from("leaderbord")
        .insert([
            {
                name: name,
                score: playerScore
            }
        ]);


    if (error) {

        console.error(
            "Score konnte nicht gespeichert werden:",
            error
        );

        return false;
    }


    return true;
}


/* ================= BESTENLISTE ANZEIGEN ================= */

async function showLeaderboard() {

    menu.style.display =
        "none";

    shop.style.display =
        "none";

    leaderboard.style.display =
        "flex";


    leaderboardList.innerHTML =
        "<p>⏳ Lade Bestenliste...</p>";


    const scores =
        await loadLeaderboard();


    if (scores === null) {

        leaderboardList.innerHTML =
            `
            <p>
                ❌ Bestenliste konnte nicht geladen werden.
            </p>

            <p style="font-size:12px;opacity:0.6;">
                Die Verbindung zur Bestenliste ist fehlgeschlagen.
            </p>
            `;

        return;
    }


    if (scores.length === 0) {

        leaderboardList.innerHTML =
            `
            <p>
                Noch keine Scores!
            </p>
            `;

        return;
    }


    leaderboardList.innerHTML =
        "";


    scores.forEach(
        (entry, index) => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "leaderboardEntry";


            if (index === 0) {

                row.classList.add(
                    "rank1"
                );

            }


            if (index === 1) {

                row.classList.add(
                    "rank2"
                );

            }


            if (index === 2) {

                row.classList.add(
                    "rank3"
                );

            }


            const name =
                document.createElement(
                    "span"
                );

            name.textContent =
                `${index + 1}. ${entry.name}`;


            const points =
                document.createElement(
                    "span"
                );

            points.textContent =
                Math.floor(
                    entry.score
                );


            row.appendChild(
                name
            );

            row.appendChild(
                points
            );


            leaderboardList.appendChild(
                row
            );

        }
    );
}


/* ================= SPIEL STARTEN ================= */

function startGame(mode) {

    gameMode =
        mode;

    gameRunning =
        true;

    gamePaused =
        false;

    gameOverCalled =
        false;

    score =
        0;

    difficulty =
        mode === "hardcore"
            ? 1.35
            : 1;

    lives =
        mode === "hardcore"
            ? 1
            : 2;

    enemies =
        [];

    particles =
        [];

    powerUps =
        [];

    shieldActive =
        false;

    shieldTimer =
        0;

    enemyTimer =
        0;

    powerUpTimer =
        0;


    player = {

        x:
            window.innerWidth / 2,

        y:
            window.innerHeight - 100,

        radius:
            20,

        speed:
            8

    };


    menu.style.display =
        "none";

    shop.style.display =
        "none";

    leaderboard.style.display =
        "none";

    nameScreen.style.display =
        "none";

    gameOverScreen.style.display =
        "none";

    pauseMenu.style.display =
        "none";

    gameScreen.style.display =
        "block";


    updateLives();

    updateScore();


    lastTime =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );
}


/* ================= SCORE ================= */

function updateScore() {

    scoreDisplay.textContent =
        "SCORE: " +
        Math.floor(score);
}


/* ================= LEBEN ================= */

function updateLives() {

    if (lives === 2) {

        livesDisplay.textContent =
            "❤️❤️";

    } else if (lives === 1) {

        livesDisplay.textContent =
            "❤️";

    } else {

        livesDisplay.textContent =
            "";
    }
}


/* ================= ENEMY ERSTELLEN ================= */

function spawnEnemy() {

    const width =
        25 +
        Math.random() * 45;

    const height =
        20 +
        Math.random() * 35;

    const x =
        Math.random() *
        (window.innerWidth - width);

    const speed =
        (
            3 +
            Math.random() * 3
        ) *
        difficulty;


    enemies.push({

        x: x,

        y: -height,

        width: width,

        height: height,

        speed: speed

    });
}


/* ================= POWER-UP ================= */

function spawnPowerUp() {

    if (gameMode === "hardcore") {

        return;
    }


    powerUps.push({

        x:
            30 +
            Math.random() *
            (window.innerWidth - 60),

        y:
            -30,

        radius:
            16,

        speed:
            2.5

    });
}


/* ================= PARTIKEL ================= */

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
                7,

            vy:
                (Math.random() - 0.5) *
                7,

            life: 1,

            size:
                2 +
                Math.random() * 4

        });

    }
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


/* ================= POWER-UP KOLLISION ================= */

function checkPowerUpCollision() {

    if (!player) {

        return;
    }


    for (
        let i = powerUps.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            powerUps[i];

        const dx =
            player.x -
            p.x;

        const dy =
            player.y -
            p.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <
            player.radius +
            p.radius
        ) {

            shieldActive =
                true;

            shieldTimer =
                6000;


            createParticles(
                p.x,
                p.y,
                20
            );


            powerUps.splice(
                i,
                1
            );
        }

    }
}


/* ================= SPIELER GETROFFEN ================= */

function hitPlayer() {

    if (!gameRunning) {

        return;
    }


    if (shieldActive) {

        shieldActive =
            false;

        shieldTimer =
            0;


        createParticles(
            player.x,
            player.y,
            25
        );


        return;
    }


    lives--;

    updateLives();


    createParticles(
        player.x,
        player.y,
        30
    );


    if (lives <= 0) {

        gameOver();

    }

}


/* ================= GAME OVER ================= */

async function gameOver() {

    if (gameOverCalled) {

        return;
    }


    gameOverCalled =
        true;

    gameRunning =
        false;

    gamePaused =
        false;


    const finalScore =
        Math.floor(score);


    const earnedCoins =
        Math.floor(
            finalScore / 25
        );


    coins +=
        earnedCoins;


    let newRecord =
        false;


    if (
        finalScore >
        highscore
    ) {

        highscore =
            finalScore;

        newRecord =
            true;
    }


    saveData();

    updateMenu();


    document.getElementById(
        "finalScore"
    ).textContent =
        "Score: " +
        finalScore;


    document.getElementById(
        "coinsEarned"
    ).textContent =
        "🪙 +" +
        earnedCoins +
        " Coins";


    document.getElementById(
        "newHighscore"
    ).style.display =
        newRecord
            ? "block"
            : "none";


    gameOverScreen.style.display =
        "flex";


    /*
       Score öffentlich speichern.
       Wenn Supabase nicht erreichbar ist,
       bleibt das Spiel trotzdem funktionsfähig.
    */

    await submitScore(
        playerName,
        finalScore
    );
}


/* ================= SKIN EINSTELLUNGEN ================= */

function getSkinSettings() {

    switch (selectedSkin) {

        case "red":

            return {
                main: "#ff4040",
                glow: "#ff4040"
            };


        case "energy":

            return {
                main: "#a855f7",
                glow: "#d946ef"
            };


        case "toxic":

            return {
                main: "#4cff00",
                glow: "#4cff00"
            };


        case "void":

            return {
                main: "#711cff",
                glow: "#a855ff"
            };


        case "gold":

            return {
                main: "#ffd21f",
                glow: "#ffd700"
            };


        case "galaxy":

            return {
                main: "#9b5cff",
                glow: "#744cff"
            };


        case "diamond":

            return {
                main: "#79e8ff",
                glow: "#7deaff"
            };


        default:

            return {
                main: "#5570ff",
                glow: "#5570ff"
            };

    }
}


/* ================= SPIEL ZEICHNEN ================= */

function drawGame() {

    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );


    ctx.fillStyle =
        "#03030a";

    ctx.fillRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );


    ctx.fillStyle =
        "rgba(100,120,255,0.12)";


    for (
        let i = 0;
        i < 50;
        i++
    ) {

        const x =
            (i * 97) %
            window.innerWidth;

        const y =
            (
                i * 173 +
                score * 0.2
            ) %
            window.innerHeight;


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            1.5,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    enemies.forEach(
        enemy => {

            ctx.save();

            ctx.fillStyle =
                "#ff3b3b";

            ctx.shadowColor =
                "#ff0000";

            ctx.shadowBlur =
                15;


            ctx.fillRect(
                enemy.x,
                enemy.y,
                enemy.width,
                enemy.height
            );


            ctx.restore();

        }
    );


    powerUps.forEach(
        powerUp => {

            ctx.save();

            ctx.beginPath();

            ctx.arc(
                powerUp.x,
                powerUp.y,
                powerUp.radius,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "#35a7ff";

            ctx.shadowColor =
                "#35a7ff";

            ctx.shadowBlur =
                25;

            ctx.fill();


            ctx.fillStyle =
                "white";

            ctx.font =
                "bold 16px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";


            ctx.fillText(
                "S",
                powerUp.x,
                powerUp.y
            );


            ctx.restore();

        }
    );


    if (player) {

        const skin =
            getSkinSettings();


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
            skin.main;

        ctx.shadowColor =
            skin.glow;

        ctx.shadowBlur =
            25;

        ctx.fill();

        ctx.restore();


        if (shieldActive) {

            ctx.save();

            ctx.beginPath();

            ctx.arc(
                player.x,
                player.y,
                player.radius + 10,
                0,
                Math.PI * 2
            );


            ctx.strokeStyle =
                "#35a7ff";

            ctx.lineWidth =
                4;

            ctx.shadowColor =
                "#35a7ff";

            ctx.shadowBlur =
                20;

            ctx.stroke();

            ctx.restore();
        }

    }


    particles.forEach(
        particle => {

            ctx.save();

            ctx.globalAlpha =
                particle.life;

            ctx.fillStyle =
                "#ffffff";


            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.restore();

        }
    );

}


/* ================= UPDATE ================= */

function updateGame(delta) {

    if (!gameRunning) {

        return;
    }


    if (gamePaused) {

        return;
    }


    score +=
        delta *
        0.01 *
        difficulty;


    updateScore();


    difficulty =
        (
            gameMode === "hardcore"
                ? 1.35
                : 1
        ) +
        score / 1200;


    enemyTimer +=
        delta;


    const spawnDelay =
        Math.max(
            280,
            850 -
            score * 1.5
        );


    if (
        enemyTimer >=
        spawnDelay
    ) {

        spawnEnemy();

        enemyTimer =
            0;
    }


    if (
        gameMode !== "hardcore"
    ) {

        powerUpTimer +=
            delta;


        if (
            powerUpTimer >=
            9000 +
            Math.random() * 7000
        ) {

            spawnPowerUp();

            powerUpTimer =
                0;
        }

    }


    for (
        let i = enemies.length - 1;
        i >= 0;
        i--
    ) {

        const enemy =
            enemies[i];


        enemy.y +=
            enemy.speed *
            delta *
            0.06;


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
            window.innerHeight +
            100
        ) {

            enemies.splice(
                i,
                1
            );
        }

    }


    for (
        let i = powerUps.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            powerUps[i];


        p.y +=
            p.speed *
            delta *
            0.06;


        if (
            p.y >
            window.innerHeight +
            50
        ) {

            powerUps.splice(
                i,
                1
            );
        }

    }


    checkPowerUpCollision();


    if (shieldActive) {

        shieldTimer -=
            delta;


        if (
            shieldTimer <= 0
        ) {

            shieldActive =
                false;

            shieldTimer =
                0;
        }

    }


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

            particle.life -=
                delta *
                0.002;

        }
    );


    particles =
        particles.filter(
            particle =>
                particle.life > 0
        );

}


/* ================= GAME LOOP ================= */

function gameLoop(timestamp) {

    if (!gameRunning) {

        drawGame();

        return;
    }


    const delta =
        Math.min(
            timestamp -
            lastTime,
            50
        );


    lastTime =
        timestamp;


    updateGame(delta);

    drawGame();


    if (gameRunning) {

        requestAnimationFrame(
            gameLoop
        );
    }

}


/* ================= TOUCH STEUERUNG ================= */

canvas.addEventListener(
    "touchstart",
    event => {

        if (!player) {

            return;
        }


        const touch =
            event.touches[0];

        touchX =
            touch.clientX;

    },
    {
        passive: true
    }
);


canvas.addEventListener(
    "touchmove",
    event => {

        if (
            !player ||
            touchX === null
        ) {

            return;
        }


        const touch =
            event.touches[0];

        const newX =
            touch.clientX;

        const difference =
            newX -
            touchX;


        player.x +=
            difference;


        player.x =
            Math.max(
                player.radius,
                Math.min(
                    window.innerWidth -
                    player.radius,
                    player.x
                )
            );


        touchX =
            newX;

    },
    {
        passive: true
    }
);


canvas.addEventListener(
    "touchend",
    () => {

        touchX =
            null;

    },
    {
        passive: true
    }
);


/* ================= MAUS / PC ================= */

canvas.addEventListener(
    "mousemove",
    event => {

        if (
            !player ||
            !gameRunning
        ) {

            return;
        }


        player.x =
            event.clientX;


        player.x =
            Math.max(
                player.radius,
                Math.min(
                    window.innerWidth -
                    player.radius,
                    player.x
                )
            );

    }
);


/* ================= PAUSE ================= */

function pauseGame() {

    if (!gameRunning) {

        return;
    }


    gamePaused =
        true;

    pauseMenu.style.display =
        "flex";
}


function resumeGame() {

    gamePaused =
        false;

    pauseMenu.style.display =
        "none";

    lastTime =
        performance.now();
}


function goToMainMenu() {

    gameRunning =
        false;

    gamePaused =
        false;

    pauseMenu.style.display =
        "none";

    gameOverScreen.style.display =
        "none";

    gameScreen.style.display =
        "none";

    shop.style.display =
        "none";

    leaderboard.style.display =
        "none";

    nameScreen.style.display =
        "none";

    menu.style.display =
        "flex";


    updateMenu();
}


/* ================= BUTTONS ================= */

document
    .getElementById(
        "normalButton"
    )
    .addEventListener(
        "click",
        () => {

            startGame("normal");

        }
    );


document
    .getElementById(
        "hardcoreButton"
    )
    .addEventListener(
        "click",
        () => {

            startGame("hardcore");

        }
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
        "saveNameButton"
    )
    .addEventListener(
        "click",
        saveName
    );


nameInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            saveName();

        }

    }
);


document
    .getElementById(
        "shopButton"
    )
    .addEventListener(
        "click",
        () => {

            menu.style.display =
                "none";

            renderShop();

            shop.style.display =
                "flex";

        }
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
        () => {

            startGame(
                gameMode
            );

        }
    );


document
    .getElementById(
        "gameOverMenuButton"
    )
    .addEventListener(
        "click",
        goToMainMenu
    );


/* ================= START ================= */

updateMenu();

renderShop();


if (
    !localStorage.getItem(
        "dodgePlayerName"
    )
) {

    setTimeout(
        openNameScreen,
        300
    );

}


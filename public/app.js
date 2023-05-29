import { drawBackground } from './background.js'

const canvas = document.getElementById('game-canvas')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

export let wallthickness = 5
export let playingwidth = 20
export let playingheight = 10

let playersidelength = 40

const player = {
    id: null,
    x: wallthickness * 512 - 256 + playersidelength / 2 + rand(0, 512 - playersidelength / 2),
    y: wallthickness * 512 - 256 + playersidelength / 2 + rand(0, playingheight * 512 - playersidelength / 2),
    width: playersidelength,
    height: playersidelength,
    speed: 6,
    health: 100,
    damage: 10,
    movingLeft: false,
    movingRight: false,
    movingUp: false,
    movingDown: false,
    petalRadius: 50,
    collidingwith: []
}

export let players = []
export let enemies = []
export let petals = []
let localpetals = [
    { rarity: "common", name: "rock" },
    { rarity: "common", name: "rock" },
    { rarity: "common", name: "rock" },
    { rarity: "common", name: "rock" },
    { rarity: "common", name: "rock" },
]

// const socket = io()
const socket = new WebSocket("ws://localhost:3000");

socket.addEventListener("open", () => {
    player.id = Math.random().toString(36).substring(2, 12)

    const message = {
        type: 'addPlayer',
        data: player
    };
    socket.send(JSON.stringify(message))

    gameLoop()
    backgroundLoop()
    playerLoop()
    enemyLoop()
    petalLoop()
});

socket.addEventListener("message", (event) => {
    let data = JSON.parse(event.data);
    switch (data.type) {
        case "update":
            players = data.players
            gameLoop()
            backgroundLoop()
            playerLoop()
            enemyLoop()
            petalLoop()
            break;
        case "petals":
            petals = data.petals
            break;
        case "enemies":
            enemies = data.enemies
            break;
    }
});

window.onbeforeunload = () => {
    socket.close(player.id);
};

function checkFlag() {
    if (player.id === null) {
        window.setTimeout(checkFlag, 1);
    } else {
        localpetals = localpetals.map((data, index) => ({ ...data, index: index, listlength: localpetals.length, playerid: player.id }))
        localpetals.forEach(petal => {
            const message = {
                type: 'addPetal',
                data: petal
            };
            socket.send(JSON.stringify(message))
        })
    }
}
checkFlag();

export let camera = {
    x: 0,
    y: 0,
}

function follow(player) {
    camera.x = player.x - canvas.width / 2
    camera.y = player.y - canvas.height / 2
}

function waitFor(conditionFunction) {
    const poll = resolve => {
        if (conditionFunction()) resolve();
        else setTimeout(_ => poll(resolve), 0);
    }
    return new Promise(poll);
}

function drawPlayers() {
    for (const [id, player] of Object.entries(players)) {
        let sprite = new Image()
        sprite.src = "sprites/woll.svg"
        ctx.save()
        ctx.translate(-camera.x, -camera.y)
        ctx.drawImage(sprite, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height)
        ctx.beginPath()
        ctx.roundRect(player.x - 50, player.y + player.height / 2 + 5, player.health, 5, 2);
        ctx.fillStyle = "#91dd46";
        ctx.fill()
        ctx.stroke()
        ctx.restore()
    }
}

function movePlayer() {
    const movementVector = {
        x: 0,
        y: 0
    }

    if (player.movingLeft) {
        movementVector.x -= 1
    }
    if (player.movingRight) {
        movementVector.x += 1
    }
    if (player.movingUp) {
        movementVector.y -= 1
    }
    if (player.movingDown) {
        movementVector.y += 1
    }

    const magnitude = Math.sqrt(movementVector.x ** 2 + movementVector.y ** 2)
    if (magnitude !== 0) {
        const normalizedVector = {
            x: movementVector.x / magnitude,
            y: movementVector.y / magnitude
        }

        // camera.x -= normalizedVector.x * player.speed
        // camera.y -= normalizedVector.y * player.speed
        player.x += normalizedVector.x * player.speed
        player.y += normalizedVector.y * player.speed
        petals.forEach(petal => {
            if (petal.playerid === player.id) {
                petal.x += normalizedVector.x * player.speed
                petal.y += normalizedVector.y * player.speed
            }
        })

        if (player.x - player.width / 2 < wallthickness * 512 - 256) {
            player.x = wallthickness * 512 - 256 + player.width / 2
        }

        if (player.y - player.height / 2 < wallthickness * 512 - 256) {
            player.y = wallthickness * 512 - 256 + player.height / 2
        }

        if (player.x + player.width / 2 > (wallthickness + playingwidth) * 512 - 256) {
            player.x = (wallthickness + playingwidth) * 512 - 256 - player.width / 2
        }
        if (player.y + player.height / 2 > (wallthickness + playingheight) * 512 - 256) {
            player.y = (wallthickness + playingheight) * 512 - 256 - player.height / 2
        }

        // socket.emit('update', player)
    }
}

function handleKeyDown(event) {
    if (event.keyCode === 65) {
        player.movingLeft = true
    }
    if (event.keyCode === 68) {
        player.movingRight = true
    }
    if (event.keyCode === 87) {
        player.movingUp = true
    }
    if (event.keyCode === 83) {
        player.movingDown = true
    }
    if (event.keyCode === 32) {
        player.petalRadius = 75
    }
}

function handleKeyUp(event) {
    if (event.keyCode === 65) {
        player.movingLeft = false
    }
    if (event.keyCode === 68) {
        player.movingRight = false
    }
    if (event.keyCode === 87) {
        player.movingUp = false
    }
    if (event.keyCode === 83) {
        player.movingDown = false
    }
    if (event.keyCode === 32) {
        player.petalRadius = 50
    }
}

export function isColliding(first, second) {
    if (first.x - first.width / 2 < second.x + second.width / 2 && first.x + first.width / 2 > second.x - second.width / 2 &&
        first.y - first.height / 2 < second.y + second.height / 2 && first.y + first.height / 2 > second.y - second.height / 2) {
        return true;
    } else {
        return false;
    }
}

export function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // requestAnimationFrame(gameLoop)
}

function backgroundLoop() {
    drawBackground(ctx, canvas.width, canvas.height, player)
    // requestAnimationFrame(backgroundLoop)
}

function playerLoop() {
    const message = {
        type: 'update',
        data: player
    };
    socket.send(JSON.stringify(message))

    drawPlayers()
    checkPlayerCollision()
    movePlayer()

    follow(player)
    // requestAnimationFrame(playerLoop)
}

function enemyLoop() {
    drawEnemies()
    // requestAnimationFrame(enemyLoop)
}

function petalLoop() {
    drawPetals()
    // requestAnimationFrame(petalLoop)
}

document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)

socket.addEventListener('enemies', (enemyData) => {
    enemies = enemyData
});

socket.addEventListener('petals', (petalData) => {
    petals = petalData
    console.log(petalData)
});

function checkPlayerCollision() {
    if (enemies.length !== 0) {
        enemies.forEach(enemy => {
            const index = player.collidingwith.findIndex(t => t.id === enemy.id);
            if (isColliding(player, enemy)) {
                if (index == -1) {
                    player.health -= enemy.damage
                    player.collidingwith.push(enemy)
                }
            } else {
                if (index !== -1) {
                    player.collidingwith.splice(index, 1)
                }
            }
        });
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.x + enemy.width / 2 >= player.x - canvas.width / 2 && enemy.x - enemy.width / 2 <= player.x + canvas.width / 2 || enemy.y + enemy.height / 2 >= player.y - canvas.height / 2 && enemy.y - enemy.height / 2 <= player.y + canvas.height / 2) {
            let sprite = new Image()
            sprite.src = enemy.img
            ctx.save()
            ctx.translate(-camera.x, -camera.y)
            ctx.rotate(enemy.rotation)
            ctx.drawImage(sprite, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height)
            ctx.beginPath()
            ctx.roundRect(enemy.x - (enemy.healthBarWidthMultiplier * enemy.health * enemy.healthmultiplier) / 2, enemy.y + enemy.height / 2 + 5, enemy.health * enemy.healthBarWidthMultiplier, 5, 2);
            ctx.fillStyle = "#91dd46";
            ctx.fill()
            ctx.stroke()
            ctx.restore()
        }
    })
}

function drawPetals() {
    petals.forEach(petal => {
        if (petal.health <= 0) {
            void 0;
        } else {
            let sprite = new Image()
            sprite.src = petal.img
            ctx.save()
            // ctx.rotate(petal.rotation)
            ctx.translate(-camera.x, -camera.y)
            ctx.drawImage(sprite, petal.x - petal.width / 2, petal.y - petal.height / 2, petal.width, petal.height)
            ctx.restore()
        }
    })
}

// follow(player)
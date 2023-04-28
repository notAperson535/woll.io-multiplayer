const canvas = document.getElementById('game-canvas')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const player = {
    id: null,
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    speed: 5,
    movingLeft: false,
    movingRight: false,
    movingUp: false,
    movingDown: false
}

export const players = {}
export let enemies = []
export let petals = []
let localpetals = [
    { rarity: "common", name: "rock" },
    { rarity: "common", name: "rock" },
    { rarity: "common", name: "rock" },
    { rarity: "common", name: "rock" },
]

const socket = io()

socket.on('connect', () => {
    player.id = socket.id

    players[player.id] = player

    socket.on('update', (state) => {
        // Merge the new game state with the local game state
        for (const [id, player] of Object.entries(state.players)) {
            players[id] = player;
        }

        const playerIds = Object.keys(players);
        const disconnectedPlayers = playerIds.filter(id => !state.players[id]);
        disconnectedPlayers.forEach(id => {
            delete players[id]
            socket.emit("removePetalsWithId", id)
        });
    })
})

function checkFlag() {
    if (player.id === null) {
        window.setTimeout(checkFlag, 1);
    } else {
        localpetals = localpetals.map((data, index) => ({ ...data, index: index, listlength: localpetals.length, playerid: player.id }))
        localpetals.forEach(petal => {
            socket.emit("addPetal", petal)
        })
    }
}
checkFlag();

let camera = {
    x: 0,
    y: 0,
}

function follow(player) {
    camera.x = player.x - canvas.width / 2
    camera.y = player.y - canvas.height / 2
}

function drawPlayers() {
    for (const [id, player] of Object.entries(players)) {
        let sprite = new Image()
        sprite.src = "sprites/woll.svg"
        ctx.save()
        ctx.translate(-camera.x, -camera.y)
        ctx.drawImage(sprite, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height)
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

        socket.emit('update', player)
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
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    requestAnimationFrame(gameLoop)
}

function playerLoop() {
    socket.emit('update', player)

    drawPlayers()
    movePlayer()

    // follow(player)
    requestAnimationFrame(playerLoop)
}

function enemyLoop() {
    drawEnemies()
    // updateEnemies()
    requestAnimationFrame(enemyLoop)
}

function petalLoop() {
    drawPetals()
    updatePetals()
    requestAnimationFrame(petalLoop)
}

document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)

socket.on('enemies', (enemyData) => {
    enemies = enemyData
});

socket.on('petals', (petalData) => {
    petals = petalData
});

function drawEnemies() {
    enemies.forEach(enemy => {
        let sprite = new Image()
        sprite.src = enemy.img
        ctx.save()
        ctx.translate(-camera.x, -camera.y)
        ctx.rotate(enemy.rotation)
        ctx.drawImage(sprite, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height)
        ctx.restore()
    })
}

function drawPetals() {
    petals.forEach(petal => {
        let sprite = new Image()
        sprite.src = petal.img
        ctx.save()
        ctx.translate(-camera.x, -camera.y)
        // ctx.rotate(petal.rotation)
        ctx.drawImage(sprite, petal.x - petal.width / 2, petal.y - petal.height / 2, petal.width, petal.height)
        ctx.restore()
    })
}

function updatePetals() {
    petals.forEach(petal => {
        let player = players[petal.playerid]
        petal.angle += petal.petalspeed;
        if (player == undefined) {
            socket.emit("removePetalsWithId", petal.playerid)
            return;
        }
        let x = player.x + Math.cos(petal.angle + 2 * Math.PI * petal.spriteIndex / petal.listLength) * petal.petalRadius;
        let y = player.y + Math.sin(petal.angle + 2 * Math.PI * petal.spriteIndex / petal.listLength) * petal.petalRadius;
        petal.x = x
        petal.y = y
        petal.rotation = petal.angle * 180 / Math.PI
    })
}

gameLoop()
playerLoop()
enemyLoop()
petalLoop()
// follow(player)
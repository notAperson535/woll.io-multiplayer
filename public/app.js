import { drawBackground } from './background.js'

const canvas = document.getElementById('game-canvas')
export const ctx = canvas.getContext('2d')

export const dpi = window.devicePixelRatio
let width = window.innerWidth, height = window.innerHeight
canvas.width = width * dpi
canvas.height = height * dpi
export let canvaswidth = canvas.width
export let canvasheight = canvas.height
canvas.style.width = width + "px"
canvas.style.height = height + "px"
ctx.scale(dpi, dpi)

ctx.fillStyle = "#000"
ctx.rect(0, 0, canvas.width, canvas.height)
ctx.fill()
ctx.fillStyle = "#fff"
ctx.font = "64px sans-serif"
ctx.textAlign = "center"
ctx.fillText("Loading...", canvas.width / 2 / dpi, canvas.height / 2 / dpi)

var Font = new FontFace('Font', 'url(./Ubuntu-Bold.ttf)')

Font.load().then(function (font) {
    document.fonts.add(font)
    drawHomeScreen()
})

export let wallthickness = 5
export let playingwidth = 20
export let playingheight = 10

let playersidelength = 40

export const player = {
    id: null,
    x: 0,
    y: 0,
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
    collidingwith: [],
}

export let players = []
export let enemies = []
export let petals = []
export let serverdrops = []
export let drops = []
let inventoryString = localStorage.getItem("inventory") || '""'
export let inventory = JSON.parse(inventoryString) || []

function updateLocalStorage() {
    let inventoryString = JSON.stringify(inventory)
    localStorage.setItem("inventory", inventoryString)
}

let localpetals = [
    { rarity: "common", name: "basic" },
    { rarity: "common", name: "rock" },
    { rarity: "common", name: "heavy" },
    { rarity: "common", name: "basic" },
    { rarity: "common", name: "rock" },
]

let socket = undefined
let gameStarted = false

let mousePos = undefined

window.addEventListener('mousemove', (event) => {
    mousePos = { x: event.clientX, y: event.clientY, width: 1, height: 1 }
})

let startbutton = { x: canvas.width / 2 / dpi, y: canvas.height / 2 / dpi, width: 150, height: 50 }

function drawHomeScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.roundRect(startbutton.x - 75, startbutton.y - 25, startbutton.width, startbutton.height, 2)
    ctx.fillStyle = "#29E025"
    ctx.strokeStyle = "#39B637"
    ctx.lineWidth = 4
    ctx.fill()
    ctx.stroke()
    ctx.lineWidth = 1
    ctx.fillStyle = "#fff"
    ctx.strokeStyle = "#000"
    ctx.textAlign = "center"
    ctx.font = "24px Font"
    ctx.fillText("Ready!", canvas.width / 2 / dpi, canvas.height / 2 / dpi + 8)
    ctx.strokeText("Ready!", canvas.width / 2 / dpi, canvas.height / 2 / dpi + 8)

    // inventory pane

    ctx.beginPath()
    ctx.roundRect(10, 10, 350, canvas.height / dpi - 20, 2)
    ctx.fillStyle = "#0b96ed"
    ctx.strokeStyle = "#1785c9"
    ctx.lineWidth = 3
    ctx.fill()
    ctx.stroke()

    ctx.textAlign = "center"
    ctx.fillStyle = "#fff"
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 1
    ctx.fillText("Inventory", 10 + 350 / 2, 50)
    ctx.strokeText("Inventory", 10 + 350 / 2, 50)

    let stackedinventory = []

    inventory.forEach(item => {
        let existingItem = stackedinventory.find(stackeditem => stackeditem.petal === item.petal && stackeditem.rarity === item.rarity)
        console.log(item)
        console.log(existingItem)

        if (existingItem) {
            existingItem.quantity++
        } else {
            item.x = undefined
            item.y = undefined
            item.width = undefined
            item.id = undefined
            item.quantity = 1
            stackedinventory.push(item)
        }
    })

}

canvas.addEventListener("click", (event) => {
    if (isColliding(mousePos, startbutton)) {
        if (gameStarted == false) {
            player.x = wallthickness * 512 - 256 + playersidelength / 2 + rand(0, 512 - playersidelength / 2)
            player.y = wallthickness * 512 - 256 + playersidelength / 2 + rand(0, playingheight * 512 - playersidelength / 2)
            socket = new WebSocket("ws://localhost:3000")
            // socket = new WebSocket("wss://wollio-multiplayer-production.up.railway.app")
            socket.addEventListener("open", () => {
                player.id = Math.random().toString(36).substring(2, 12)

                const message = {
                    type: 'addPlayer',
                    data: player
                }
                socket.send(JSON.stringify(message))

                playerLoop()
            })

            socket.addEventListener("message", (event) => {
                let data = JSON.parse(event.data)
                switch (data.type) {
                    case "update":
                        if (data.id == player.id) {
                            players = data.players
                            gameLoop()
                            drawBackground()
                            drawEnemies()
                            drawPetals()
                            checkDropState()
                            drawDrops()
                            checkDropCollisions()
                            playerLoop()
                        }
                        break
                    case "petals":
                        petals = data.petals
                        break
                    case "drops":
                        serverdrops = data.drops
                        break
                    case "enemies":
                        enemies = data.enemies
                        break
                }

            })
            socket.addEventListener('enemies', (enemyData) => {
                enemies = enemyData
            })

            socket.addEventListener('petals', (petalData) => {
                petals = petalData
            })
            gameStarted = true
        }
    }
})

window.onbeforeunload = () => {
    updateLocalStorage()
    socket.close()
}

function checkFlag() {
    if (player.id === null) {
        window.setTimeout(checkFlag, 1)
    } else {
        localpetals = localpetals.map((data, index) => ({ ...data, index: index, listlength: localpetals.length, playerid: player.id }))
        localpetals.forEach(petal => {
            const message = {
                type: 'addPetal',
                data: petal
            }
            socket.send(JSON.stringify(message))
        })
    }
}
checkFlag()

export let camera = {
    x: 0,
    y: 0,
}

function follow(player) {
    camera.x = player.x - canvas.width / 2 / dpi
    camera.y = player.y - canvas.height / 2 / dpi
}

function waitFor(conditionFunction) {
    const poll = resolve => {
        if (conditionFunction()) resolve()
        else setTimeout(_ => poll(resolve), 0)
    }
    return new Promise(poll)
}

function drawPlayers() {
    for (const [id, player] of Object.entries(players)) {
        let sprite = new Image()
        sprite.src = "sprites/woll.svg"
        ctx.save()
        ctx.translate(-camera.x, -camera.y)
        ctx.drawImage(sprite, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height)
        ctx.beginPath()
        ctx.roundRect(player.x - 50, player.y + player.height / 2 + 5, player.health, 5, 2)
        ctx.fillStyle = "#91dd46"
        ctx.lineWidth = 1
        ctx.strokeStyle = "#000"
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
        return true
    } else {
        return false
    }
}

export function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function playerLoop() {
    if (player.health <= 0) {
        socket.close()
        gameStarted = false
        drawHomeScreen()
    }
    else {
        const message = {
            type: 'update',
            data: player
        }
        socket.send(JSON.stringify(message))

        drawPlayers()
        checkPlayerCollision()
        movePlayer()

        follow(player)
    }
}

document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)

function checkPlayerCollision() {
    if (enemies.length !== 0) {
        enemies.forEach(enemy => {
            const index = player.collidingwith.findIndex(t => t.id === enemy.id)
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
        })
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.x + enemy.width / 2 >= player.x - canvas.width / 2 / dpi && enemy.x - enemy.width / 2 <= player.x + canvas.width / 2 / dpi || enemy.y + enemy.height / 2 >= player.y - canvas.height / 2 / dpi && enemy.y - enemy.height / 2 <= player.y + canvas.height / 2 / dpi) {
            let sprite = new Image()
            sprite.src = enemy.img
            ctx.save()
            ctx.translate(-camera.x, -camera.y)
            ctx.rotate(enemy.rotation)
            ctx.drawImage(sprite, enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height)
            ctx.beginPath()
            ctx.roundRect(enemy.x - (enemy.healthBarWidthMultiplier * enemy.health * enemy.healthmultiplier) / 2, enemy.y + enemy.height / 2 + 5, enemy.health * enemy.healthBarWidthMultiplier, 5, 2)
            ctx.fillStyle = "#91dd46"
            ctx.lineWidth = 1
            ctx.strokeStyle = "#000"
            ctx.fill()
            ctx.stroke()
            ctx.restore()
        }
    })
}

function drawPetals() {
    petals.forEach(petal => {
        if (petal.health <= 0) {
            void 0
        } else {
            let sprite = new Image()
            sprite.src = "sprites/petals/" + petal.name + ".svg"
            ctx.save()
            // ctx.rotate(petal.rotation)
            ctx.translate(-camera.x, -camera.y)
            ctx.drawImage(sprite, petal.x - petal.width / 2, petal.y - petal.height / 2, petal.width, petal.height)
            ctx.restore()
        }
    })
}

function checkDropState() {
    drops = []
    serverdrops.forEach(drop => {
        const index = inventory.findIndex(t => t.id === drop.id)
        if (index == -1) {
            drops.push(drop)
        }
    })
}

function drawDrops() {
    drops.forEach(drop => {
        let bordercolor = "#"
        let bgcolor = "#"

        switch (drop.rarity) {
            case "divine":
                bgcolor = "#DA781E"
                bordercolor = "#AC6625"
                break
            case "supreme":
                bgcolor = "#DA1E78"
                bordercolor = "#922258"
                break
            case "mythic":
                bgcolor = "#1CD4E0"
                bordercolor = "#1FC2CC"
                break
            case "legendary":
                bgcolor = "#C73030"
                bordercolor = "#982424"
                break
            case "epic":
                bgcolor = "#7B30C7"
                bordercolor = "#671D95"
                break
            case "rare":
                bgcolor = "#4530C7"
                bordercolor = "#1D2887"
                break
            case "uncommon":
                bgcolor = "#BBC730"
                bordercolor = "#A3AC37"
                break
            case "common":
                bgcolor = "#3CC730"
                bordercolor = "#37A82E"
                break
        }

        let sprite = new Image()
        sprite.src = "sprites/petals/" + drop.petal + ".svg"
        ctx.save()
        ctx.translate(-camera.x, -camera.y)
        ctx.beginPath()
        ctx.roundRect(drop.x - 25, drop.y - 25, 50, 50, 2.5)
        ctx.fillStyle = bgcolor
        ctx.lineWidth = 3
        ctx.strokeStyle = bordercolor
        ctx.fill()
        ctx.stroke()
        ctx.drawImage(sprite, drop.x - drop.width / 2, drop.y - drop.width / 2 - 6, drop.width, drop.width)
        ctx.textAlign = "center"
        ctx.fillStyle = "#fff"
        ctx.lineWidth = 0.7
        ctx.strokeStyle = "#000"
        ctx.font = "13px Font"
        ctx.fillText(drop.displayname, drop.x, drop.y + 15)
        ctx.strokeText(drop.displayname, drop.x, drop.y + 15)
        ctx.restore()
    })
}

function checkDropCollisions() {
    drops.forEach(drop => {
        let collisiondetector = {}
        collisiondetector.x = drop.x
        collisiondetector.y = drop.y
        collisiondetector.width = 50
        collisiondetector.height = 50
        if (isColliding(player, collisiondetector)) {
            inventory.push(drop)
            updateLocalStorage()
        }
    })
}
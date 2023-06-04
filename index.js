const http = require('http')
const fs = require('fs')
const path = require('path')
const WebSocket = require('ws')
const CircularJSON = require('circular-json')

const PORT = process.env.PORT || 3000

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
            if (err) {
                throw err
            }
            res.setHeader('Content-Type', 'text/html')
            res.end(content)
        })
    } else {
        const filePath = path.join(__dirname, 'public', req.url)
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404)
                res.end('File not found')
            } else {
                const ext = path.extname(filePath)
                let contentType = 'text/html'
                switch (ext) {
                    case '.js':
                        contentType = 'application/javascript'
                        break
                    case '.css':
                        contentType = 'text/css'
                        break
                    case '.png':
                        contentType = 'image/png'
                        break
                    case '.svg':
                        contentType = 'image/svg+xml'
                        break
                }
                res.setHeader('Content-Type', contentType)
                res.end(content)
            }
        })
    }
})
const wss = new WebSocket.Server({ server })

const players = []
const enemies = []
const petals = []
const drops = []

const Enemy = require("./public/enemies/enemy.js")
const Petal = require("./public/petals/petal.js")

wss.on('connection', (ws) => {
    let playerId

    function createDrop(enemydrops, rarity, x, y) {
        let dropgroup = {}
        dropgroup.drops = []
        enemydrops.forEach((enemydrop) => {
            let drop = {}
            drop.petal = enemydrop
            drop.id = Math.random().toString(36).substring(2, 12)
            drop.rarity = rarity
            dropgroup.drops.push(drop)
        })
        dropgroup.x = x
        dropgroup.y = y
        drops.push(dropgroup)
        console.log(drops)
    }

    ws.on('message', (message) => {
        const originaldata = JSON.parse(message)
        const data = originaldata.data

        switch (originaldata.type) {
            case 'update':
                const index = players.findIndex(t => t.id === data.id)
                if (index !== -1) {
                    players[index] = data
                }
                petals.forEach(petal => petal.update(players, enemies))
                enemies.forEach(enemy => {
                    const index = enemies.findIndex(t => t.id === enemy.id)
                    if (enemy.update(players, petals) <= 0) {
                        petals.forEach(petal => petal.collidingwith.splice(petal.collidingwith.findIndex(t => t.id === enemy.id), 1))
                        enemies.splice(index, 1)
                        createDrop(enemy.drops, enemy.rarity, enemy.x, enemy.y)
                    }
                })
                broadcast({ type: 'update', players, id: playerId })
                broadcast({ type: 'enemies', enemies })
                broadcast({ type: 'petals', petals })
                broadcast({ type: 'drops', drops })
                break
            case 'addPlayer':
                players.push(data)
                playerId = data.id
                break
            case 'addPetal':
                const petal = new Petal(data.name, data.rarity, data.index, data.listlength, data.playerid)
                petals.push(petal)
                broadcast({ type: 'petals', petals: petals })
                break
            default:
                console.log('Received unsupported message type:', data.type)
        }
    })

    ws.on('close', () => {
        if (playerId) {
            const petalsToRemove = []
            petals.forEach((petal, index) => {
                if (petal.playerid === playerId) {
                    petalsToRemove.push(index)
                }
            })

            petalsToRemove.reverse().forEach((index) => {
                petals.splice(index, 1)
            })
        }
        players.splice(players.findIndex(t => t.id === playerId), 1)
    })

    function broadcast(data) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(CircularJSON.stringify(data))
            }
        })
    }
})

function createEnemies() {
    if (enemies.length < 100) {
        const enemy = new Enemy("rock", "common")
        enemies.push(enemy)
        setTimeout(createEnemies, 1000)
    }
}

createEnemies()
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

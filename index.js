const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const CircularJSON = require('circular-json');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
            if (err) {
                throw err;
            }
            res.setHeader('Content-Type', 'text/html');
            res.end(content);
        });
    } else {
        const filePath = path.join(__dirname, 'public', req.url);
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
            } else {
                const ext = path.extname(filePath);
                let contentType = 'text/html';
                switch (ext) {
                    case '.js':
                        contentType = 'application/javascript';
                        break;
                    case '.css':
                        contentType = 'text/css';
                        break;
                    case '.png':
                        contentType = 'image/png';
                        break;
                    case '.svg':
                        contentType = 'image/svg+xml';
                        break;
                }
                res.setHeader('Content-Type', contentType);
                res.end(content);
            }
        });
    }
});
const wss = new WebSocket.Server({ server });

const players = []
const enemies = [];
const petals = [];

const Enemy = require("./public/enemies/enemy.js");
const Petal = require("./public/petals/petal.js");

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const originaldata = JSON.parse(message);
        const data = originaldata.data

        switch (originaldata.type) {
            case 'update':
                const index = players.findIndex(t => t.id === data.id);
                if (index !== -1) {
                    players[index] = data;
                }
                petals.forEach(petal => petal.update(players, enemies))
                enemies.forEach(enemy => enemy.update(players, petals))
                broadcast({ type: 'update', players });
                broadcast({ type: 'enemies', enemies });
                broadcast({ type: 'petals', petals });
                break;
            case 'addPlayer':
                players.push(data)
                break;
            case 'removePlayer':
                //fill this out
                break;
            case 'addPetal':
                const petal = new Petal(data.name, data.rarity, data.index, data.listlength, data.playerid)
                petals.push(petal);
                broadcast({ type: 'petals', petals: petals });
                break;
            case 'removePetalsWithId':
                petals.forEach(petal => {
                    if (petal.playerid === data) {
                        petals.splice(petals.indexOf(petal), 1);
                    }
                })
                broadcast({ type: 'petals', petals: petals });
                break;
            case 'disconnect':
                delete players[ws.id];
                petals.forEach(petal => {
                    if (petal.playerid == ws.id) {
                        petals.splice(petals.indexOf(petal), 1);
                    }
                })
                broadcast({ type: 'update', data: players });
                break;
            default:
                console.log('Received unsupported message type:', data.type);
        }
    });

    function broadcast(data) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(CircularJSON.stringify(data));
            }
        });
    }
});

function createEnemies() {
    if (enemies.length < 100) {
        const enemy = new Enemy("rock", "common");
        enemies.push(enemy);
        setTimeout(createEnemies, 1000)
    }
}

createEnemies()
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

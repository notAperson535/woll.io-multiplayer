const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = 3000;

app.use(express.static(__dirname + '/public'));

const players = {}
const enemies = [];
const petals = [];

const Enemy = require("./public/enemies/enemy.js");
const Petal = require("./public/petals/petal.js");

const enemy = new Enemy("rock", "common");
enemies.push(enemy);

io.on('connection', (socket) => {
    socket.on('update', (player, petal) => {
        players[socket.id] = player;
        io.emit('update', { players });
        io.emit('enemies', enemies);
        petals.forEach(petal => {
            petal.update(players)
        })
        enemies.forEach(enemy => {
            enemy.update()
        })
        io.emit('petals', petals);
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('update', { players });
    });

    socket.on('addPetal', (petalData) => {
        const petal = new Petal(petalData.name, petalData.rarity, petalData.index, petalData.listlength, petalData.player)
        petals.push(petal);
        io.emit('petals', petals);
    });

    socket.on('removePetal', (petal) => {
        const index = petals.indexOf(petal);
        if (index > -1) {
            petals.splice(index, 1);
        }
        io.emit('petals', petals);
    });
});

http.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
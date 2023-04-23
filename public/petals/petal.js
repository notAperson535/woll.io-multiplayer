const petallist = require("./petallist.js")
const { Image } = require('canvas');

class Petal {
    constructor(name, rarity, spriteIndex, listLength, playerid) {
        this.x = 0
        this.y = 0

        let damagemultiplier, healthmultiplier;
        switch (rarity) {
            case "divine":
                healthmultiplier = 1000;
                damagemultiplier = 16;
                break;
            case "supreme":
                healthmultiplier = 200;
                damagemultiplier = 12;
                break;
            case "mythic":
                healthmultiplier = 40;
                damagemultiplier = 8;
                break;
            case "legendary":
                healthmultiplier = 20;
                damagemultiplier = 5;
                break;
            case "epic":
                healthmultiplier = 8;
                damagemultiplier = 3;
                break;
            case "rare":
                healthmultiplier = 4;
                damagemultiplier = 2;
                break;
            case "uncommon":
                healthmultiplier = 2;
                damagemultiplier = 1.5;
                break;
            case "common":
                healthmultiplier = 1;
                damagemultiplier = 1;
                break;
            default:
                healthmultiplier = 1;
                damagemultiplier = 1;
        }

        this.petalInfo = petallist.find(t => t.name === name);
        this.petalHealth = this.petalInfo.basehealth * healthmultiplier
        this.petalDamage = this.petalInfo.basedamage * damagemultiplier

        this.width = 20
        this.height = 20

        this.img = this.petalInfo.img
        this.rotation = 0

        this.petalRadius = 50

        this.rotation = 0
        this.angle = 0;
        this.petalspeed = 0.07;

        this.spriteIndex = spriteIndex;
        this.listLength = listLength;

        this.playerid = playerid
    }

    draw(ctx) {
        let sprite = new Image()
        sprite.src = this.img
        ctx.save()
        // ctx.rotate(this.rotation)
        ctx.translate(-camera.x, -camera.y)
        ctx.drawImage(sprite, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height)
        ctx.restore()
        this.angle += this.petalspeed;
        let x = this.player.x + Math.cos(this.angle + 2 * Math.PI * this.spriteIndex / this.listLength) * this.petalRadius;
        let y = this.player.y + Math.sin(this.angle + 2 * Math.PI * this.spriteIndex / this.listLength) * this.petalRadius;
        this.x = x
        this.y = y
        this.rotation = this.angle * 180 / Math.PI
    }

    update(players) {
        // let player = players[this.playerid]
        // this.angle += this.petalspeed;
        // let x = player.x + Math.cos(this.angle + 2 * Math.PI * this.spriteIndex / this.listLength) * this.petalRadius;
        // let y = player.y + Math.sin(this.angle + 2 * Math.PI * this.spriteIndex / this.listLength) * this.petalRadius;
        // this.x = x
        // this.y = y
        // this.rotation = this.angle * 180 / Math.PI
    }
}

module.exports = Petal
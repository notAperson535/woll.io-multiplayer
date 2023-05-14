const petallist = require("./petallist.js")

function isColliding(first, second) {
    if (first.x - first.width / 2 < second.x + second.width / 2 && first.x + first.width / 2 > second.x - second.width / 2 &&
        first.y - first.height / 2 < second.y + second.height / 2 && first.y + first.height / 2 > second.y - second.height / 2) {
        return true;
    } else {
        return false;
    }
}

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

        // this.health = this.petalInfo.basehealth * healthmultiplier
        this.health = 0
        // this.damage = this.petalInfo.basedamage * damagemultiplier
        this.damage = 0
        this.damagemultiplier = damagemultiplier
        this.healthmultiplier = healthmultiplier

        this.width = 20
        this.height = 20

        this.img = this.petalInfo.img
        this.rotation = 0

        this.rotation = 0
        this.angle = 0;
        this.petalspeed = 0.07;

        this.spriteIndex = spriteIndex;
        this.listLength = listLength;

        this.playerid = playerid
        this.id = Math.random().toString(36).substring(2, 12)

        this.collidingwith = []
        this.isloading = false
    }

    update(players, enemies) {
        if (this.health > 0) {
            enemies.forEach(enemy => {
                const index = this.collidingwith.findIndex(t => t.id === enemy.id);
                if (isColliding(this, enemy)) {
                    if (index == -1) {
                        this.health -= enemy.damage
                        this.collidingwith.push(enemy)
                    }
                } else {
                    if (index !== -1) {
                        this.collidingwith.splice(index, 1)
                    }
                }
            });
        }

        let player = players.find(t => t.id === this.playerid)
        this.angle += this.petalspeed;
        let x = player.x + Math.cos(this.angle + 2 * Math.PI * this.spriteIndex / this.listLength) * player.petalRadius;
        let y = player.y + Math.sin(this.angle + 2 * Math.PI * this.spriteIndex / this.listLength) * player.petalRadius;
        this.x = x
        this.y = y
        this.rotation = this.angle * 180 / Math.PI
        if (this.health <= 0) {
            if (this.isloading == false) {
                this.isloading = true
                this.damage = 0
                setTimeout(() => {
                    this.health = this.petalInfo.basehealth * this.healthmultiplier
                    this.damage = this.petalInfo.basedamage * this.damagemultiplier
                }, this.petalInfo.reloadtime * 1000)
            }
        } else {
            this.isloading = false
        }
    }
}

module.exports = Petal
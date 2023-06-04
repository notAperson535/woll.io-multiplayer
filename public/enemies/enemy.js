const enemylist = require("./enemylist.js")

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function isColliding(first, second) {
    if (first.x - first.width / 2 < second.x + second.width / 2 && first.x + first.width / 2 > second.x - second.width / 2 &&
        first.y - first.height / 2 < second.y + second.height / 2 && first.y + first.height / 2 > second.y - second.height / 2) {
        return true;
    } else {
        return false;
    }
}

let wallthickness = 5
let playingwidth = 20
let playingheight = 10

class Enemy {
    constructor(name, rarity) {

        let damagemultiplier, healthmultiplier, sizemultiplier, raritynum;
        switch (rarity) {
            case "divine":
                healthmultiplier = 1000
                damagemultiplier = 16
                sizemultiplier = 12
                raritynum = 7
                break;
            case "supreme":
                healthmultiplier = 200
                damagemultiplier = 12
                sizemultiplier = 8
                raritynum = 6
                break;
            case "mythic":
                healthmultiplier = 40
                damagemultiplier = 8
                sizemultiplier = 5
                raritynum = 5
                break;
            case "legendary":
                healthmultiplier = 20
                damagemultiplier = 5
                sizemultiplier = 3.5
                raritynum = 4
                break;
            case "epic":
                healthmultiplier = 8
                damagemultiplier = 3
                sizemultiplier = 2.5
                raritynum = 3
                break;
            case "rare":
                healthmultiplier = 4
                damagemultiplier = 2
                sizemultiplier = 2
                raritynum = 2
                break;
            case "uncommon":
                healthmultiplier = 2
                damagemultiplier = 1.5
                sizemultiplier = 1.5
                raritynum = 1
                break;
            case "common":
                healthmultiplier = 1
                damagemultiplier = 1
                sizemultiplier = 1
                raritynum = 1
                break;
            default:
                healthmultiplier = 1
                damagemultiplier = 1
                sizemultiplier = 1
        }

        this.enemyInfo = enemylist.find(t => t.name === name);
        this.health = this.enemyInfo.basehealth * healthmultiplier
        this.damage = this.enemyInfo.basedamage * damagemultiplier

        this.healthBarWidthMultiplier = 100 / this.health
        this.healthBarWidthMultiplier *= sizemultiplier

        this.speed = this.enemyInfo.speed;

        this.enemyWidth = this.enemyInfo.width * sizemultiplier
        this.enemyHeight = this.enemyInfo.height * sizemultiplier
        this.width = this.enemyWidth;
        this.height = this.enemyHeight;

        if (raritynum <= 2) {
            this.x = wallthickness * 512 - 256 + this.width / 2 + rand(0, playingwidth / 3 * 512 - this.width / 2);
        } else if (raritynum <= 5) {
            this.x = wallthickness * 512 - 256 + this.width / 2 + rand(playingwidth / 3 * 512, playingwidth * 2 / 3 * 512 - this.width / 2);
        } else if (raritynum <= 7) {
            this.x = wallthickness * 512 - 256 + this.width / 2 + rand(playingwidth * 2 / 3 * 512, playingwidth * 512 - this.width / 2);
        }
        this.y = wallthickness * 512 - 256 + this.height / 2 + rand(0, playingheight * 512 - this.height / 2)

        this.img = this.enemyInfo.img
        this.rotation = 0

        this.damagemultiplier = damagemultiplier
        this.healthmultiplier = healthmultiplier

        this.id = Math.random().toString(36).substring(2, 12)

        this.collidingwith = []

        this.rarity = rarity
        this.drops = this.enemyInfo.drops
    }

    update(players, petals) {
        if (this.health > 1) {
            players.forEach(player => {
                const index = this.collidingwith.findIndex(t => t.id === player.id);
                if (isColliding(this, player)) {
                    if (index == -1) {
                        this.health -= player.damage
                        this.collidingwith.push(player)
                    }
                } else {
                    if (index !== -1) {
                        this.collidingwith.splice(index, 1)
                    }
                }
            });
            petals.forEach(petal => {
                const index = this.collidingwith.findIndex(t => t.id === petal.id);
                if (isColliding(this, petal)) {
                    if (index == -1) {
                        this.health -= petal.damage
                        this.collidingwith.push(petal)
                    }
                } else {
                    if (index !== -1) {
                        this.collidingwith.splice(index, 1)
                    }
                }
            });
        }
        return this.health
    }
}

module.exports = Enemy
const enemylist = require("./enemylist.js")

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
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
        this.enemyHealth = this.enemyInfo.basehealth * healthmultiplier
        this.enemyDamage = this.enemyInfo.basedamage * damagemultiplier

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
    }

    update() {
        // Update enemy position
    }
}

module.exports = Enemy
const enemylist = require("./enemylist.js")

class Enemy {
    constructor(name, rarity) {
        this.x = 100;
        this.y = 100;

        let damagemultiplier, healthmultiplier, sizemultiplier;
        switch (rarity) {
            case "divine":
                healthmultiplier = 1000
                damagemultiplier = 16
                sizemultiplier = 12
                break;
            case "supreme":
                healthmultiplier = 200
                damagemultiplier = 12
                sizemultiplier = 8
                break;
            case "mythic":
                healthmultiplier = 40
                damagemultiplier = 8
                sizemultiplier = 5
                break;
            case "legendary":
                healthmultiplier = 20
                damagemultiplier = 5
                sizemultiplier = 3.5
                break;
            case "epic":
                healthmultiplier = 8
                damagemultiplier = 3
                sizemultiplier = 2.5
                break;
            case "rare":
                healthmultiplier = 4
                damagemultiplier = 2
                sizemultiplier = 2
                break;
            case "uncommon":
                healthmultiplier = 2
                damagemultiplier = 1.5
                sizemultiplier = 1.5
                break;
            case "common":
                healthmultiplier = 1
                damagemultiplier = 1
                sizemultiplier = 1
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

        this.img = this.enemyInfo.img
        this.rotation = 0
    }

    update() {
        // Update enemy position
    }
}

module.exports = Enemy
const petallist = require("./petallist.js")

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

        this.rotation = 0
        this.angle = 0;
        this.petalspeed = 0.07;

        this.spriteIndex = spriteIndex;
        this.listLength = listLength;

        this.playerid = playerid
    }
}

module.exports = Petal
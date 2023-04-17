module.exports = [
    {
        name: "rock",
        img: "/sprites/enemies/rock.svg",
        width: 88,
        height: 74,
        basehealth: 100,
        basedamage: 10,
        attacktype: "none",
        speed: 0,
        drops: [
            "heavy",
            "rock",
        ]
    },
    {
        name: "bee",
        img: "/sprites/enemies/bee.svg",
        width: 80,
        height: 47.5,
        basehealth: 50,
        basedamage: 35,
        attacktype: "onhit",
        speed: 2.5,
        drops: [
            "stinger",
        ]
    },
    {
        name: "hornet",
        img: "/sprites/enemies/hornet.svg",
        width: 138,
        height: 60,
        basehealth: 70,
        basedamage: 15,
        attacktype: "range",
        speed: 1.75,
        drops: [
            "missile"
        ]
    },
    {
        name: "ladybug",
        img: "sprites/enemies/ladybug.svg",
        width: 66,
        height: 50,
        basehealth: 80,
        basedamage: 15,
        attacktype: "onhit",
        speed: 1.9,
    },
    {
        name: "soldierant",
        img: "sprites/enemies/soldierant.svg",
        width: 81,
        height: 50,
        basehealth: 30,
        basedamage: 15,
        attacktype: "range",
        speed: 1.8,
    },
    {
        name: "workerant",
        img: "sprites/enemies/workerant.svg",
        width: 81,
        height: 50,
        basehealth: 35,
        basedamage: 10,
        attacktype: "onhit",
        speed: 1.9,
    },
    {
        name: "babyant",
        img: "sprites/enemies/babyant.svg",
        width: 57,
        height: 50,
        basehealth: 20,
        basedamage: 5,
        attacktype: "onhit",
        speed: 1,
    },
    {
        name: "queenant",
        img: "sprites/enemies/queenant.svg",
        width: 236,
        height: 150,
        basehealth: 300,
        basedamage: 40,
        attacktype: "range",
        speed: 1.7,
    },
    {
        name: "antegg",
        img: "sprites/enemies/antegg.svg",
        width: 60,
        height: 69,
        basehealth: 25,
        basedamage: 5,
        attacktype: "none",
        speed: 0,
    },
    {
        name: "spider",
        img: "sprites/enemies/spider.svg",
        width: 75,
        height: 105,
        basehealth: 40,
        basedamage: 15,
        speed: 1.8,
        attacktype: "range",
        //ranged attack should slow ppl
    },
    {
        name: "fly",
        img: "sprites/enemies/fly.svg",
        width: 45,
        height: 48,
        basehealth: 30,
        basedamage: 20,
        speed: 3.5,
        attacktype: "onhit"
    }

]
// updated hornet/queen/spider textures
// added ant egg texture (just make it replace itself with a baby ant after some time, queen lays it)
// idk how hard it is but make baby ants grow into both worker and soldier ants
// add an attribute for mob aggro (hostile/neutral/passive)
// in general give more aggro mobs better drops
import { wallthickness, playingwidth, playingheight, camera } from "./app.js"

let sidelength = 512

export function drawBackground(ctx, canvaswidth, canvasheight, player) {
    function drawTexture(x, y, imgsrc) {
        if (x + sidelength / 2 >= player.x - canvaswidth / 2 && x - sidelength / 2 <= player.x + canvaswidth / 2 || y + sidelength / 2 >= player.y - canvasheight / 2 && y - sidelength / 2 <= player.y + canvasheight / 2) {
            let sprite = new Image()
            sprite.src = imgsrc
            ctx.save()
            ctx.translate(-camera.x, -camera.y)
            ctx.drawImage(sprite, x - sidelength / 2, y - sidelength / 2, sidelength, sidelength)
            ctx.restore()
        }
    }

    for (var i = 0; i < wallthickness + playingheight + wallthickness; i++) {
        for (var j = 0; j < wallthickness + playingwidth + wallthickness; j++) {
            drawTexture(j * 512, i * 512, "/sprites/textures/wall.svg", true)
        }
    }
    for (var i = wallthickness; i < wallthickness + playingheight; i++) {
        for (var j = 0; j < wallthickness; j++) {
            drawTexture(i * 512, j * 512, "/sprites/textures/wall.svg", true)
        }
        for (var j = wallthickness; j < playingwidth + wallthickness; j++) {
            drawTexture(i * 512, j * 512, "/sprites/textures/grass.svg", false)
        }
        for (var j = wallthickness + playingwidth; j < wallthickness + wallthickness + playingwidth; j++) {
            drawTexture(i * 512, j * 512, "/sprites/textures/wall.svg", true)
        }
    }
}
import { wallthickness, playingwidth, playingheight, camera } from "./app.js"

let sidelength = 512

export function drawBackground(ctx, canvaswidth, canvasheight, dpi, player) {
    function drawTexture(x, y, imgsrc) {
        if (x + sidelength / 2 >= player.x - canvaswidth / 2 / dpi && x - sidelength / 2 <= player.x + canvaswidth / 2 / dpi || y + sidelength / 2 >= player.y - canvasheight / 2 / dpi && y - sidelength / 2 <= player.y + canvasheight / 2 / dpi) {
            let sprite = new Image()
            sprite.src = imgsrc
            ctx.save()
            ctx.translate(-camera.x, -camera.y)
            ctx.drawImage(sprite, x - sidelength / 2, y - sidelength / 2, sidelength, sidelength)
            ctx.restore()
        }
    }

    for (var i = 0; i < wallthickness; i++) {
        for (var j = 0; j < wallthickness + playingheight + wallthickness; j++) {
            drawTexture(i * sidelength, j * sidelength, "/sprites/textures/wall.svg", true)
        }
    }

    for (var i = wallthickness; i < wallthickness + playingwidth; i++) {
        for (var j = 0; j < wallthickness; j++) {
            drawTexture(i * sidelength, j * sidelength, "/sprites/textures/wall.svg", true)
        }
        for (var j = wallthickness; j < playingheight + wallthickness; j++) {
            drawTexture(i * sidelength, j * sidelength, "/sprites/textures/grass.svg", false)
        }
        for (var j = wallthickness + playingheight; j < wallthickness + wallthickness + playingwidth; j++) {
            drawTexture(i * sidelength, j * sidelength, "/sprites/textures/wall.svg", true)
        }
    }

    for (var i = wallthickness + playingwidth; i < wallthickness + playingwidth + wallthickness; i++) {
        for (var j = 0; j < wallthickness + playingheight + wallthickness; j++) {
            drawTexture(i * sidelength, j * sidelength, "/sprites/textures/wall.svg", true)
        }
    }
}
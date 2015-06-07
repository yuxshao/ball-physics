var game = new (function () {
  this.tileLength = 32;
  this.renderer = new PIXI.CanvasRenderer(640, 480);
  this.stage = new PIXI.Container(0x000000);
  this.map = new Map(40, 40, this.tileLength);
  this.players = [new Ball(this.tileLength/2, 50, 50)];
});

var body = $("body");
var input = {x: 0, y: 0};

body.keyup(function (event) {
  switch (event.keyCode) {
    case 37: ++input.x; break;
    case 38: ++input.y; break;
    case 39: --input.x; break;
    case 40: --input.y; break;
  }
});
body.keypress(function (event) {
  switch (event.keyCode) {
    case 37: --input.x; break;
    case 38: --input.y; break;
    case 39: ++input.x; break;
    case 40: ++input.y; break;
  }
  input.x = Math.max(Math.min(input.x, 1), -1);
  input.y = Math.max(Math.min(input.y, 1), -1);
});

document.body.appendChild(game.renderer.view);

var point = new PIXI.Graphics();
point.beginFill(0x00FF00, 1);
point.drawCircle(0, 0, 3);
point.position = {x: -10, y: 10};

var mapGraphic = new MapGraphic(game.renderer, game.map);

var rT = new PIXI.RenderTexture(game.renderer, 64, 64);
var rS = new PIXI.Sprite(rT);
var block = new PIXI.Graphics();
block.beginFill(0xFF0000);
block.drawRect(50, 50, 10, 10);
rT.render(block);
game.stage.addChild(rS);

game.stage.addChild(mapGraphic.sprite);
game.stage.addChild(game.players[0].graphic);
game.stage.addChild(point);

// renderer.view.addEventListener('click', function (event) {
//  var globalCoords = {x: event.pageX - relativeToBall.position.x, y: event.pageY - relativeToBall.position.y};
  
//  var tileX = Math.floor(globalCoords.x/tileLength), tileY = Math.floor(globalCoords.y/tileLength);
//  setTile(tileX, tileY, (tiles[tileX][tileY]+1)%3);
//});

animate();

function animate() {
  requestAnimationFrame(animate);
  game.players[0].setInput(input);
  game.players[0].collisions(game.map);
  game.players[0].move();

  game.renderer.render(game.stage);
}

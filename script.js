var game = new (function () {
  this.tileLength = 32;
  this.renderer = new PIXI.CanvasRenderer(640, 480);
  this.stage = new PIXI.Container(0x000000);
  this.map = new Map(40, 40, this.tileLength);
  this.map.makeGraphic(this.renderer);
  this.players = [new Ball(this.tileLength/2, 200, 200, new ArrowKeyInput()),
    new Ball(this.tileLength/2, 200, 100, {x: 0, y: 0})];
});

document.body.appendChild(game.renderer.view);

game.stage.addChild(game.map.graphic.sprite);
for (var i = 0; i < game.players.length; ++i) {
  game.stage.addChild(game.players[i].graphic);
}

// renderer.view.addEventListener('click', function (event) {
//  var globalCoords = {x: event.pageX - relativeToBall.position.x, y: event.pageY - relativeToBall.position.y};
  
//  var tileX = Math.floor(globalCoords.x/tileLength), tileY = Math.floor(globalCoords.y/tileLength);
//  setTile(tileX, tileY, (tiles[tileX][tileY]+1)%3);
//});

animate();

function animate() {
  requestAnimationFrame(animate);
  for (var i = 0; i < game.players.length; ++i) {
    game.players[i].takeInput();
    game.players[i].collisions(game.map, game.players);
    game.players[i].move();
  }

  game.renderer.render(game.stage);
}

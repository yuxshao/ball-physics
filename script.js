var dimensions = {x: 40, y: 40};
var winSize = {x: 640, y: 480};
var dimInit = dimensions;
tiles = [];

var vel = {x: 0, y: 0}, accel = {x:0, y: 0};
var input = {x: 0, y: 0};
var maxAccel = 0.04;
var terminalVel = 4;
var bounciness = 0.5;
var tileLength = 32;
var body = $("body");

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

var renderer = new PIXI.CanvasRenderer(winSize.x, winSize.y);
document.body.appendChild(renderer.view);

var stage = new PIXI.Container(0x000000);

var relativeToBall = new PIXI.Container();
stage.addChild(relativeToBall);

var ball = new PIXI.Graphics();
ball.lineStyle(0);
ball.beginFill(0xFF0000, 1);
ball.drawCircle(0, 0, tileLength/2);
ball.position.x = winSize.x/2;
ball.position.y = winSize.y/2;

var point = new PIXI.Graphics();
point.beginFill(0x00FF00, 1);
point.drawCircle(0, 0, 3);
point.position = {x: -10, y: 10};

var tileTexture = new PIXI.RenderTexture(renderer, dimensions.x*tileLength, dimensions.y*tileLength);
var tileSprite = new PIXI.Sprite(tileTexture);

relativeToBall.addChild(tileSprite);
relativeToBall.addChild(ball);
relativeToBall.addChild(point);

dimX = dimensions.x;
while (dimX--) {
  dimY = dimensions.y;
  tiles[dimX] = [];
  while(dimY--) {
    tiles[dimX][dimY] = 0;
    var block = new PIXI.Graphics();
    block.lineStyle(1);
    block.beginFill(0x000345, 1);
    block.drawRect(dimX*tileLength, dimY*tileLength, tileLength, tileLength);
    tileTexture.render(block, false);
  }
}

renderer.view.addEventListener('click', function (event) {
  var globalCoords = {x: event.pageX - relativeToBall.position.x, y: event.pageY - relativeToBall.position.y};
  
  var tileX = Math.floor(globalCoords.x/tileLength), tileY = Math.floor(globalCoords.y/tileLength);
  setTile(tileX, tileY, (tiles[tileX][tileY]+1)%3);
});

var setTile = function (x, y, n) {
  tiles[x][y] = n;
  var block = new PIXI.Graphics();
  block.lineStyle(1);
  var color;
  switch (tiles[x][y]) {
    case 0: color = 0x000345; break;
    case 1: color = 0x3955F8; break;
    case 2: color = 0x57BD35; break;
  }
  block.beginFill(color);
  block.drawRect(x*tileLength, y*tileLength, tileLength, tileLength);
  tileTexture.render(block);
}

animate();

function animate() {
  requestAnimationFrame(animate);

  accel.x = maxAccel*(input.x - vel.x/terminalVel);
  accel.y = maxAccel*(input.y - vel.y/terminalVel);
  vel.x += accel.x; vel.y += accel.y;
  ball.position.x += vel.x;
  ball.position.y += vel.y;
  for (var blockX = 0; blockX < dimensions.x; blockX += 1) {
    for (var blockY = 0; blockY < dimensions.y; blockY += 1) {
      if (!tiles[blockX][blockY]) continue;
      collision = collisionPoint({x: ball.position.x, y: ball.position.y, radius: tileLength/2}, 
          {x: blockX*tileLength, y: blockY*tileLength, width: tileLength, height: tileLength});
      if (collision) {
        switch (tiles[blockX][blockY]) {
          case 1:
            ball.position.x -= vel.x; ball.position.y -= vel.y;
            point.position = collision;
            var dx = collision.x - ball.position.x, dy = collision.y - ball.position.y;
            dist = Math.sqrt(distanceSq(collision, ball));
            var dvx = -dx*(vel.x*dx + vel.y*dy)/(dx*dx + dy*dy)*(1+bounciness);
                dvy = -dy*(vel.x*dx + vel.y*dy)/(dx*dx + dy*dy)*(1+bounciness);
            vel.x += dvx; vel.y += dvy;
            ball.position.x += vel.x; ball.position.y += vel.y;
            break;
          case 2:
            setTile(blockX, blockY, 0);
            var v = Math.sqrt(vel.x*vel.x + vel.y*vel.y);
            var rx = vel.x/v, ry = vel.y/v;
            vel.x = rx*8, vel.y = ry*8;
            break;
        }
      }
    }
  }
  relativeToBall.position.x = -ball.position.x+winSize.x/2; relativeToBall.position.y = -ball.position.y+winSize.y/2;
  renderer.render(stage);
}

function collisionPoint(c, r) {
  // if c on top of r, touching a part of the line segment before the corner
  if ((c.y+c.radius > r.y && c.y-c.radius < r.y+r.height && r.x < c.x && c.x < r.x+r.width))
    return {x: c.x, y: Math.max(r.y, Math.min(c.y, r.y+r.height))};
  if ((c.x+c.radius > r.x && c.x-c.radius < r.x+r.width && r.y < c.y && c.y < r.y+r.height))
    return {x: Math.max(r.x, Math.min(c.x, r.x+r.width)), y: c.y};
  for (var i = 0; i <= 1; ++i)
    for (var j = 0; j <= 1; ++j)
      if (distanceSq({x: c.x, y: c.y}, {x: r.x+i*r.width, y: r.y+j*r.height})
          < c.radius*c.radius)
        return {x: r.x+i*r.width, y: r.y + j*r.height};
  return null;
}

function distanceSq(a, b) {
  return (b.y - a.y)*(b.y-a.y) + (b.x - a.x)*(b.x - a.x);
}

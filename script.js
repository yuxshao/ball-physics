var dimensions = {x: 20, y: 15};
var dimInit = dimensions;
tiles = [];
dimX = dimensions.x;
while (dimX--) {
  dimY = dimensions.y;
  tiles[dimX] = [];
  while(dimY--) {
    tiles[dimX][dimY] = 0;
  }
}

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

var renderer = new PIXI.autoDetectRenderer(dimensions.x*tileLength, dimensions.y*tileLength);
document.body.appendChild(renderer.view);

var stage = new PIXI.Container();
var tileTexture = new PIXI.RenderTexture(dimensions.x*tileLength, dimensions.y*tileLength);
var tileSprite = new PIXI.Sprite(tileTexture);
stage.addChild(tileSprite);

renderer.view.addEventListener('click', function (event) {
  var tileX = Math.floor(event.pageX/tileLength), tileY = Math.floor(event.pageY/tileLength);
  tiles[tileX][tileY] = !tiles[tileX][tileY];
  var block = new PIXI.Graphics();
  block.beginFill(0x3955F8, 1);
  block.drawRect(0, 0, tileLength, tileLength);
  block.position.x = tileX*tileLength;
  block.position.y = tileY*tileLength;
  tileTexture.render(block, false);
});

var ball = new PIXI.Graphics();
ball.beginFill(0xFF0000, 1);
ball.drawCircle(0, 0, tileLength/2);
ball.position.x = 400;
ball.position.y = 300;
stage.addChild(ball);

var box = new PIXI.Graphics();
box.beginFill(0x0000FF, 1);
box.drawRect(0, 0, tileLength, tileLength);
box.position.x = 300;
box.position.y = 300;
stage.addChild(box);

var point = new PIXI.Graphics();
point.beginFill(0x00FF00, 1);
point.drawCircle(0, 0, 3);
stage.addChild(point);
point.position = {x: 10, y: 10};

animate();

function animate() {
  requestAnimationFrame(animate);

  accel.x = maxAccel*(input.x - vel.x/terminalVel);
  accel.y = maxAccel*(input.y - vel.y/terminalVel);
  vel.x += accel.x; vel.y += accel.y;
  ball.position.x += vel.x;
  ball.position.y += vel.y;
  collision = collisionPoint({x: ball.position.x, y: ball.position.y, radius: tileLength/2}, 
      {x: box.position.x, y: box.position.y, width: tileLength, height: tileLength});
  if (collision) {
    ball.position.x -= vel.x; ball.position.y -= vel.y;
    point.position = collision;
    var dx = collision.x - ball.position.x, dy = collision.y - ball.position.y;
    dist = Math.sqrt(distanceSq(collision, ball.position));
    var dvx = -dx*(vel.x*dx + vel.y*dy)/(dx*dx + dy*dy)*(1+bounciness);
        dvy = -dy*(vel.x*dx + vel.y*dy)/(dx*dx + dy*dy)*(1+bounciness);
    vel.x += dvx; vel.y += dvy;
    ball.position.x += vel.x; ball.position.y += vel.y;
  }

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

function Ball(r, x, y) {
  this.vel = {x: 0, y: 0};
  this.input = {x: 0, y: 0};
  this.accel = {x: 0, y: 0};
  this.maxAccel = 0.04;
  this.termVel = 4;
  this.bounciness = 0.2;
  this.radius = r;

  this.graphic = new PIXI.Graphics();
  this.graphic.lineStyle(0);
  this.graphic.beginFill(0xFF0000, 1);
  this.graphic.drawCircle(0, 0, this.radius);
  this.graphic.position.x = x;
  this.graphic.position.y = y;
};

Ball.prototype.setInput = function (input) {
  this.input = input;
  this.accel.x = this.maxAccel*(this.input.x - this.vel.x/this.termVel);
  this.accel.y = this.maxAccel*(this.input.y - this.vel.y/this.termVel);
  this.vel.x += this.accel.x; this.vel.y += this.accel.y;
}

Ball.prototype.collisions = function (map) {
  var tilePos = {x: Math.floor(this.graphic.position.x/map.tileLength), y: Math.floor(this.graphic.position.y/map.tileLength)};
  this.graphic.position.x += this.vel.x; this.graphic.position.y += this.vel.y;
  for (var x = Math.max(0, tilePos.x-1); x <= Math.min(map.dim.x-1, tilePos.x+1); ++x) {
    for (var y = Math.max(0, tilePos.y-1); y <= Math.min(map.dim.y-1, tilePos.y+1); ++y) {
      if (!map.tiles[x][y]) continue;
      collision = collisionPoint({x: this.graphic.position.x, y: this.graphic.position.y, radius: map.tileLength/2}, 
          {x: x*map.tileLength, y: y*map.tileLength, width: map.tileLength, height: map.tileLength});
      if (collision) {
        switch (map.tiles[x][y]) {
          case 1:
            this.graphic.position.x -= this.vel.x; this.graphic.position.y -= this.vel.y;
            point.position = collision;
            var dx = collision.x - this.graphic.position.x, dy = collision.y - this.graphic.position.y;
            dist = Math.sqrt(distanceSq(collision, this.graphic.position));
            var dvx = -dx*(this.vel.x*dx + this.vel.y*dy)/(dx*dx + dy*dy)*(1+this.bounciness);
                dvy = -dy*(this.vel.x*dx + this.vel.y*dy)/(dx*dx + dy*dy)*(1+this.bounciness);
            this.vel.x += dvx; this.vel.y += dvy;
            this.graphic.position.x += this.vel.x; this.graphic.position.y += this.vel.y;
            break;
          case 2:
            setTile(x, y, 0);
            var v = Math.sqrt(this.vel.x*this.vel.x + this.vel.y*this.vel.y);
            var rx = this.vel.x/v, ry = this.vel.y/v;
            this.vel.x = rx*8, this.vel.y = ry*8;
            break;
        }
      }
    }
  }
}

 Ball.prototype.move = function () {
  this.graphic.position.x += this.vel.x;
  this.graphic.position.y += this.vel.y;
}

function collisionPoint(c, r) {
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

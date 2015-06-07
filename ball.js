function Ball(r, x, y, input) {
  this.vel = {x: 0, y: 0};
  this.input = input;
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

Ball.prototype.takeInput = function () {
  this.accel.x = this.maxAccel*(this.input.x - this.vel.x/this.termVel);
  this.accel.y = this.maxAccel*(this.input.y - this.vel.y/this.termVel);
  this.vel.x += this.accel.x; this.vel.y += this.accel.y;
}

Ball.prototype.collisions = function (map, balls) {
  this.tileCollisions(map);
  this.ballCollisions(map, balls);
}

Ball.prototype.ballCollisions = function (map, balls) {
  this.graphic.position.x += this.vel.x; this.graphic.position.y += this.vel.y;
  for (var i = 0; i < balls.length; ++i) {
    var b = balls[i];
    var dv = {x: b.vel.x - this.vel.x, y: b.vel.y - this.vel.y};
    var dx = b.graphic.position.x - this.graphic.position.x, dy = b.graphic.position.y - this.graphic.position.y;
    var d = Math.sqrt(distanceSq(this.graphic.position, b.graphic.position));
    if (d < this.radius + b.radius && b != this) {
      this.graphic.position.x -= this.vel.x; this.graphic.position.y -= this.vel.y;
      dx = b.graphic.position.x - this.graphic.position.x, dy = b.graphic.position.y - this.graphic.position.y;
      d = Math.sqrt(distanceSq(this.graphic.position, b.graphic.position));
      this.graphic.position.x += dx*(1-(this.radius+b.radius)/d);
      this.graphic.position.y += dy*(1-(this.radius+b.radius)/d);
      var mass = Math.min(this.radius*this.radius, b.radius*b.radius);
      var moment = {x: mass*(dv.x*dx*dx + dv.y*dx*dy)/(dx*dx + dy*dy), y: mass*(dv.x*dx*dy + dv.y*dy*dy)/(dx*dx+dy*dy)};
      this.vel.x += moment.x/(this.radius*this.radius);
      this.vel.y += moment.y/(this.radius*this.radius);
      b.vel.x -= moment.x/(b.radius*b.radius);
      b.vel.y -= moment.y/(b.radius*b.radius);
      b.tileCollisions(map);
      this.ballCollisions(map, balls);
    }
  }
}

Ball.prototype.tileCollisions = function (map) {
  var tilePos =
    {x: Math.floor((this.graphic.position.x-this.radius)/map.tileLength), y: Math.floor((this.graphic.position.y-this.radius)/map.tileLength), X: Math.ceil((this.graphic.position.x+this.radius)/map.tileLength), Y: Math.ceil((this.graphic.position.y+this.radius)/map.tileLength)};
  this.graphic.position.x += this.vel.x; this.graphic.position.y += this.vel.y;
  for (var x = Math.max(0, tilePos.x); x <= Math.min(map.dim.x-1, tilePos.X); ++x) {
    for (var y = Math.max(0, tilePos.y); y <= Math.min(map.dim.y-1, tilePos.Y); ++y) {
      if (!map.tiles[x][y]) continue;
      collision = collisionPoint({x: this.graphic.position.x, y: this.graphic.position.y, radius: this.radius}, 
          {x: x*map.tileLength, y: y*map.tileLength, width: map.tileLength, height: map.tileLength});
      if (collision) {
        switch (map.tiles[x][y]) {
          case 1:
            var dx = collision.x - this.graphic.position.x, dy = collision.y - this.graphic.position.y;
            var d = Math.sqrt(dx*dx + dy*dy);
            this.graphic.position.x += dx*(1 - this.radius/d);
            this.graphic.position.y += dy*(1 - this.radius/d);
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

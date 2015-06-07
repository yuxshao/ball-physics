function Map(w, h, tileLength) {
  this.tiles = [];
  this.tileLength = tileLength;
  this.dim = {x: w, y: h};

  while (w--) {
    h = this.dim.y;
    this.tiles[w] = [];
    while(h--) {
      this.tiles[w][h] = 0;
    }
  }
  this.tiles[10][10] = 1;
  this.tiles[10][11] = 1;
  this.tiles[11][12] = 1;
}

function MapGraphic(renderer, map) {
  this.texture = new PIXI.RenderTexture(renderer, map.dim.x*map.tileLength, map.dim.y*map.tileLength);
  this.sprite = new PIXI.Sprite(this.texture);
  for (var x = 0; x < map.dim.x; ++x) {
    for (var y = 0; y < map.dim.y; ++y) {
      var block = new PIXI.Graphics();
      block.lineStyle(1);
      var color;
      switch (map.tiles[x][y]) {
        case 0: color = 0x000345; break;
        case 1: color = 0x3955F8; break;
        case 2: color = 0x57BD35; break;
      }
      block.beginFill(color);
      block.drawRect(x*map.tileLength, y*map.tileLength, map.tileLength, map.tileLength);
      this.texture.render(block);
    }
  }
  this.sprite.position = {x: 0, y: 0};
}

MapGraphic.prototype.setTile = function (x, y, n) {
  var block = new PIXI.Graphics();
  block.lineStyle(1);
  var color;
  switch (this.map.tiles[x][y]) {
    case 0: color = 0x000345; break;
    case 1: color = 0x3955F8; break;
    case 2: color = 0x57BD35; break;
  }
  block.beginFill(color);
  block.drawRect(x*this.map.tileLength, y*this.map.tileLength, this.map.tileLength, this.map.tileLength);
  this.texture.render(block);
}

Map.prototype.makeGraphic = function (renderer) {
  this.graphic = new MapGraphic(renderer, this);
}

Map.prototype.setTile = function (x, y, n) {
  this.tiles[x][y] = n;
  if (this.graphic) this.graphic.setTile(x, y, n);
}

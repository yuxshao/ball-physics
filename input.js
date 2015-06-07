function ArrowKeyInput() {
  this.x = 0;
  this.y = 0;
  var body = $("body");
  var self = this;
  body.keyup(function (event) {
    switch (event.keyCode) {
      case 37: ++self.x; break;
      case 38: ++self.y; break;
      case 39: --self.x; break;
      case 40: --self.y; break;
    }
  });
  body.keypress(function (event) {
    switch (event.keyCode) {
      case 37: --self.x; break;
      case 38: --self.y; break;
      case 39: ++self.x; break;
      case 40: ++self.y; break;
    }
    self.x = Math.max(Math.min(self.x, 1), -1);
    self.y = Math.max(Math.min(self.y, 1), -1);
  });
}


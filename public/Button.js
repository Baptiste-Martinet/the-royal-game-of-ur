class Button {
  constructor(_text, _callback, _pos, _size, _textColor, _color, _hoverColor, _textHoverColor, _strokeSize, _strokeColor, _strokeHoverColor) {
    this.text = _text;
    this.callback = _callback;
    this.pos = _pos;
    this.size = _size;
    this.textColor = _textColor;
    this.color = _color;
    this.hoverColor = _hoverColor;
    this.textHoverColor = _textHoverColor;
    this.strokeSize = _strokeSize;
    this.strokeColor = _strokeColor;
    this.strokeHoverColor = _strokeHoverColor;

    this.isDisplayed = true;
    this.isClicked = false;
    this.isEnabled = true;
  }

  setPosition(_x, _y) {
    this.pos.x = _x;
    this.pos.y = _y;
  }

  setSize(_x, _y) {
    this.size.x = _x;
    this.size.y = _y;
  }

  show() {
    this.isDisplayed = true;
  }

  hide() {
    this.isDisplayed = false;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  callTheCallbackFunction() {
    if (this.isClicked) {
      console.log(ERROR_MSG, 'Stop spamming my dude');
      return;
    }
    this.isClicked = true;

    let tmpStrokeHoverColor = color(this.strokeHoverColor);
    let tmpStrokeColor = color(this.strokeColor);

    this.strokeHoverColor = color(255);
    this.strokeColor = color(255);

    setTimeout(() => {
      this.strokeHoverColor = tmpStrokeHoverColor;
      this.strokeColor = tmpStrokeColor;
      this.isClicked = false;
    }, 200);
    this.callback();
  }
}
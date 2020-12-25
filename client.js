class Player {
  constructor (_color) {
    this.pseudo = 'baptiste';
    this.color = _color; //0=white, 1=black
    this.nbPieces = 7;
    this.score = 0;
  }
}

class Vec2d {
  constructor (_x, _y) {
    this.x = _x;
    this.y = _y;
  }
}

class Cell {
  constructor (_pos) {
    /* GAME */
    this.isOccupied = false;
    this.pos = _pos;

    /* UI */
    this.isHovered = false;
  }
}

class ColorTheme {
  constructor (_background, _grid, _cells, _diceTriangles, _diceCircles, _hoveredCells, _pieceWhite, _pieceBlack, _cellCornerRadius, _diceTriangleStorkes, _diceTriangleStrokesSize) {
    this.background = _background;
    this.grid = _grid;
    this.cells = _cells;
    this.diceTriangles = _diceTriangles;
    this.diceCircles = _diceCircles;
    this.hoveredCells = _hoveredCells;
    this.pieceColors = [_pieceWhite, _pieceBlack];
    this.cellCornerRadius = _cellCornerRadius;
    this.diceTriangleStrokes = _diceTriangleStorkes;
    this.diceTriangleStrokesSize = _diceTriangleStrokesSize;
  }
}

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

var CELL_SIZE = 80;
const WHITE = 0;
const BLACK = 1;

const ME = 0;
const HIM = 1;

const WAITING = 'waiting';
const DRAWING_DICE = 'drawing dice';
const MOVING = 'moving';

const ERROR_MSG = 'ERROR :';
const INFO_MSG = 'INFO: ';

var whosturn = -1;
var players = [new Player(0), new Player(1)];
var board = new Array(14);
var theme = null;

/* game variables */
var topLeft = null;
var diceValues = [0, 0, 0, 0];
var totalDicesValue = -1;
var playerState = WAITING;

/* UI varaibles */
var otherPointerImg;
var buttons;
/* utils functions */

function drawPiece(pos, color)
{
  let p5PieceColor = theme.pieceColors[color];

  stroke(red(p5PieceColor), green(p5PieceColor), green(p5PieceColor), 180);
  strokeWeight(6);
  fill(p5PieceColor);
  circle(pos.x + CELL_SIZE / 2, pos.y + CELL_SIZE / 2, CELL_SIZE * 0.7);
}

function drawCell(cell)
{
  stroke(theme.grid);
  strokeWeight(2);
  fill(theme.cells);
  square(cell.pos.x, cell.pos.y, CELL_SIZE, CELL_SIZE * (theme.cellCornerRadius / 80));
}

function displayBoard()
{
  for (let i = 0; i < 14; ++i) {
    drawCell(board[i][WHITE]);
    drawCell(board[i][BLACK]);
  }
}

function displayPieces()
{
  for (let i = 0; i < 14; ++i) {
    if (board[i][WHITE].isOccupied)
      drawPiece(board[i][WHITE].pos, WHITE);
    if (board[i][BLACK].isOccupied)
      drawPiece(board[i][BLACK].pos, BLACK);
  }
}

function displayHoveredCells()
{
  for (let i = 0; i < 14; ++i) {
    if (board[i][players[ME].color].isHovered) {
      noStroke();
      fill(theme.hoveredCells);
      square(board[i][players[ME].color].pos.x, board[i][players[ME].color].pos.y, CELL_SIZE, CELL_SIZE * (theme.cellCornerRadius / 80));
    }
  }
}

function drawNbPieces(player)
{
  let pos = new Vec2d(topLeft.x + (CELL_SIZE * 4), topLeft.y + (CELL_SIZE * (player.color == WHITE ? 2 : 0)));

  drawPiece(pos, player.color);
  fill(255);
  noStroke();
  textSize(CELL_SIZE * 0.4);
  textAlign(CENTER, CENTER);
  text('7', pos.x + CELL_SIZE / 2, pos.y + CELL_SIZE / 2);
}

function displayNbPieces()
{
  drawNbPieces(players[ME]);
  drawNbPieces(players[HIM]);
}

function drawTriangle(bottomLeftCoords, size)
{
  stroke(theme.diceTriangleStrokes);
  strokeWeight(theme.diceTriangleStrokesSize);
  fill(theme.diceTriangles);
  triangle(bottomLeftCoords.x, bottomLeftCoords.y, bottomLeftCoords.x + (size / 2), bottomLeftCoords.y - (size * 0.9), bottomLeftCoords.x + size, bottomLeftCoords.y);
}

function displayDicesTriangles()
{
  let bottomLeft = new Vec2d(topLeft.x + (CELL_SIZE * 1.3), topLeft.y + (CELL_SIZE * 3.7));
  let triangleSize = CELL_SIZE * 0.6;

  for (let i = 0; i < 4; ++i) {
    drawTriangle(bottomLeft, triangleSize);

    if (diceValues[i] == 1) {
      fill(theme.diceCircles);
      noStroke();
      circle(bottomLeft.x + triangleSize / 2, bottomLeft.y - triangleSize * 0.35, triangleSize * 0.3);
    }
    bottomLeft.x += triangleSize + 8;
  }
}

function drawButton(button)
{
  /* rect */
  strokeWeight(button.strokeSize);
  stroke(button.isHovered ? button.strokeHoverColor : button.strokeColor);
  fill(button.isHovered ? button.hoverColor : button.color);
  rect(button.pos.x, button.pos.y, button.size.x, button.size.y, 4);

  /* text */
  textAlign(CENTER, CENTER);
  textSize(CELL_SIZE * 0.3);
  textStyle(BOLD);
  fill(button.isHovered ? button.textHoverColor : button.textColor);
  noStroke();
  text(button.text, button.pos.x + button.size.x / 2, button.pos.y + button.size.y / 2);

  /* enable/disable */
  if (!button.isEnabled) {
    strokeWeight(button.strokeSize);
    stroke(0, 200);
    fill(0, 200);
    rect(button.pos.x, button.pos.y, button.size.x, button.size.y, 4);
  }
}

function displayButtons()
{
  for (let i = 0; i < 1; ++i) {
    if (!buttons[i].isDisplayed)
      continue;
    drawButton(buttons[i]);
  }
}

function drawMousePointer()
{
  let pointerSize = CELL_SIZE * 0.12;
  image(otherPointerImg, mouseX, mouseY - 60, pointerSize, pointerSize * 1.6);
  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  textSize(10);
  textStyle(BOLD)
  text(players[HIM].pseudo, mouseX + 15, mouseY - 60 + 15);
}

function setCellsPos()
{
  CELL_SIZE = width / 16;

  topLeft = new Vec2d(width / 2 - (CELL_SIZE * 4), height / 2 - (CELL_SIZE * 1.5));
  let currentPos = new Vec2d(3, 0);

  /* update buttons */
  buttons[0].setPosition(topLeft.x, topLeft.y + (CELL_SIZE * 3.2));
  buttons[0].setSize(CELL_SIZE * 1.2, CELL_SIZE * 0.5);

  for (let i = 0; i < 14; ++i) {
    board[i][BLACK].pos.x = topLeft.x + CELL_SIZE * currentPos.x;
    board[i][BLACK].pos.y = topLeft.y + CELL_SIZE * currentPos.y;
    board[i][WHITE].pos.x = topLeft.x + CELL_SIZE * currentPos.x;
    board[i][WHITE].pos.y = topLeft.y + CELL_SIZE * (currentPos.y + (i < 4 || i > 11 ? 2 : 0));
    if (i == 3) {
      currentPos.y++;
    } else if (i == 11) {
      currentPos.y--;
    } else if (i < 4 || i > 11) {
      currentPos.x--;
    } else {
      currentPos.x++;
    }
  }
}

function setPlayerState(state)
{
  playerState = state;

  if (playerState == DRAWING_DICE) {
  } else if (state == MOVING) {
  } else {
  }
}

function buttonPressed()
{
  if (playerState != DRAWING_DICE) {
    console.log(ERROR_MSG, 'State doesnt match:', playerState)
    return;
  }

  totalDicesValue = 0;
  for (let i = 0; i < 4; ++i) {
    diceValues[i] = Math.floor(Math.random() * 2);
    totalDicesValue += diceValues[i];
  }
  console.log(INFO_MSG, 'totalDicesValue: ', totalDicesValue);
  setPlayerState(MOVING);
}

function newPieceButtonClicked(color)
{
  if (color != players[0].color) {
    console.log(ERROR_MSG, 'You can not interact with this button');
    return;
  }
  if (playerState != MOVING) {
    console.log(ERROR_MSG, 'State not matching:', playerState);
    return;
  }
  if (board[totalDicesValue - 1][color].isOccupied == true) {
    console.log(ERROR_MSG, 'Can not place piece here:', 'Cell is already occupied');
    return;
  }
  console.log(INFO_MSG, 'Creating new piece.');
  board[totalDicesValue - 1][color].isOccupied = true;
  setPlayerState(WAITING);
}

function movePiece(idx, who)
{
  if (playerState != MOVING) {
    console.log(ERROR_MSG, 'State not matching:', playerState);
    return;
  }
  if (idx + totalDicesValue > 14) {
    console.log(ERROR_MSG, 'Can not move outside the board');
    return;
  }
  if (board[idx][who].isOccupied == false) {
    console.log(ERROR_MSG, 'Cell is empty');
    return;
  }
  if (board[idx + totalDicesValue][who].isOccupied == true) {
    console.log(ERROR_MSG, 'Can not move here:', 'Cell is already occupied');
    return;
  }
  board[idx][who].isOccupied = false;

  if (idx + totalDicesValue == 14) {
    players[who].score++;
  } else {
    board[idx + totalDicesValue][who].isOccupied = true;
  }

  setPlayerState(WAITING);
}

/* p5 functions */

function preload()
{
  otherPointerImg = loadImage('images/cursor_pointer.png',
    () => { otherPointerImg.filter(INVERT); },
    () => { console.log('Carrefull: there was an error loading an image.')}
  );

  for (let i = 0; i < 14; ++i) {
    board[i] = [new Cell(new Vec2d(0, 0)), new Cell(new Vec2d(0, 0))]; //white cell & black cell
  }

  buttons = new Array(1);
  buttons[0] = new Button(
    'Roll', /* text */
    buttonPressed, /* callback */
    new Vec2d(0, 0), /* pos */
    new Vec2d(CELL_SIZE * 1.2, CELL_SIZE * 0.5), /* size */
    color(255), /* text color */
    color(0, 0), /* color */
    color(59, 196, 96), /* hover color */
    color(255), /* text hover color */
    3, /* stroke size */
    color(59, 196, 96), /* stroke color */
    color(59, 196, 96) /* stroke hover color */
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  theme = new ColorTheme(
    color(17, 17, 17), /* background color */
    color(156, 43, 255), /* grid color */
    color(0 , 0), /* cells color */
    color(0, 0), /* dice triangles color */
    color(255), /* dice circles color */
    color(70, 100), /* hovered cell color */
    color(201, 0, 0), /* white piece color */
    color(0, 182, 201), /*black piece color */
    15, /* cell corner radius */
    color(255), /* dice triangle stroke color */
    2, /* dice triangle stroke size */
  );

  setCellsPos(); //setting up the tiles positions for black and white

  /* socket */
  setPlayerState(DRAWING_DICE);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setCellsPos();
}

function draw() {
  /*COMPUTE */
  
  /* DRAW */
  background(theme.background);
  displayBoard();
  displayPieces();
  displayHoveredCells();
  displayNbPieces();
  displayDicesTriangles();
  displayButtons();

  /* test */
  //drawMousePointer();

  /* DEBUG */
  /*fill(255, 0, 0);
  noStroke();
  ellipse(width / 2, height / 2, 30);*/
}

function isMouseInBound(pos, sizeX, sizeY)
{
  if (pos.x < mouseX && mouseX < pos.x + sizeX
    && pos.y < mouseY && mouseY < pos.y + sizeY) {
      return true;
    }
  return false;
}

function mouseMoved() {
  for (let i = 0; i < 14; ++i) {
    if (isMouseInBound(board[i][players[ME].color].pos, CELL_SIZE, CELL_SIZE)) {
      if (board[i][players[ME].color].isHovered == false) {
        board[i][players[ME].color].isHovered = true;
        break;
      }
    } else if (board[i][players[ME].color].isHovered == true) {
      board[i][players[ME].color].isHovered = false;
    }
  }

  for (let i = 0; i < 1; ++i) {
    if (buttons[i].isDisplayed && isMouseInBound(buttons[i].pos, buttons[i].size.x, buttons[i].size.y)) {
      if (!buttons[i].isHovered)
        buttons[i].isHovered = true;
    } else if (buttons[i].isHovered) {
        buttons[i].isHovered = false;
    }
  }
  return false;
}

function mousePressed()
{
  /* button blue */
  if (isMouseInBound(new Vec2d(topLeft.x + (CELL_SIZE * 4), topLeft.y), CELL_SIZE, CELL_SIZE)) {
    newPieceButtonClicked(1);
  }
  /* button red */
  if (isMouseInBound(new Vec2d(topLeft.x + (CELL_SIZE * 4), topLeft.y + (CELL_SIZE * 2)), CELL_SIZE, CELL_SIZE)) {
    newPieceButtonClicked(0);
  }

  /* manage click on pieces */
  for (let i = 0; i < 14; ++i) {
    if (isMouseInBound(board[i][players[ME].color].pos, CELL_SIZE, CELL_SIZE)) {
      movePiece(i, players[ME].color);
      break;
    }
  }

  /* manage click on buttons */
  for (let i = 0; i < 1; ++i) {
    if (buttons[i].isDisplayed && isMouseInBound(buttons[i].pos, buttons[i].size.x, buttons[i].size.y)) {
      buttons[i].callTheCallbackFunction();
      break;
    }
  }
}
class Player {
  constructor (_color) {
    this.pseudo = 'baptiste';
    this.color = _color; //0=white, 1=black
    this.nbPieces = 7;
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

const CELL_SIZE = 80;
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
var button;
var otherPointerImg;

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
  square(cell.pos.x, cell.pos.y, CELL_SIZE, theme.cellCornerRadius);
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
      square(board[i][players[ME].color].pos.x, board[i][players[ME].color].pos.y, CELL_SIZE, theme.cellCornerRadius);
    }
  }
}

function drawNbPieces(player)
{
  let pos = new Vec2d(topLeft.x + (CELL_SIZE * 4), topLeft.y + (CELL_SIZE * (player.color == WHITE ? 2 : 0)));

  drawPiece(pos, player.color);
  fill(255);
  noStroke();
  textSize(32);
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
  let bottomLeft = new Vec2d(topLeft.x + (CELL_SIZE * 1.6), topLeft.y + (CELL_SIZE * 3.7));
  let triangleSize = CELL_SIZE * 0.6;

  for (let i = 0; i < 4; ++i) {
    drawTriangle(bottomLeft, triangleSize);

    if (diceValues[i] == 1) {
      fill(theme.diceCircles);
      noStroke();
      circle(bottomLeft.x + triangleSize / 2, bottomLeft.y - triangleSize * 0.35, triangleSize * 0.3);
    }
    bottomLeft.x += triangleSize + 6;
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
  topLeft = new Vec2d(width / 2 - (CELL_SIZE * 4), height / 2 - (CELL_SIZE * 1.5));
  let currentPos = new Vec2d(3, 0);

  button.position(topLeft.x, topLeft.y + (CELL_SIZE * 3.2));

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
    button.show();
  } else if (state == MOVING) {
  } else {
    button.hide();
  }
}

function buttonPressed()
{
  //button.elt.textContent = 'Skip turn';

  if (playerState != DRAWING_DICE) {
    console.log(ERROR_MSG, 'State doesnt match:', playerState)
    return;
  }

  playerState = MOVING;

  totalDicesValue = 0;
  for (let i = 0; i < 4; ++i) {
    diceValues[i] = Math.floor(Math.random() * 2);
    totalDicesValue += diceValues[i];
  }
  console.log(INFO_MSG, 'totalDicesValue: ', totalDicesValue);
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
  board[totalDicesValue - 1][color].isOccupied = true;
  playerState = WAITING;
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
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  button = createButton('Roll dices');
  button.position(0, 0);
  button.size(CELL_SIZE * 1.5, CELL_SIZE * 0.5);
  button.mousePressed(buttonPressed);
  button.hide();

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

  /* test */
  //drawMousePointer();

  /* DEBUG */
  /*fill(255, 0, 0);
  noStroke();
  ellipse(width / 2, height / 2, 30);*/
}

function mouseMoved() {
  for (let i = 0; i < 14; ++i) {
    if (board[i][players[ME].color].pos.x < mouseX && mouseX < board[i][players[ME].color].pos.x + CELL_SIZE
        && board[i][players[ME].color].pos.y < mouseY && mouseY < board[i][players[ME].color].pos.y + CELL_SIZE) {
      if (board[i][players[ME].color].isHovered == false)
        board[i][players[ME].color].isHovered = true;
    } else if (board[i][players[ME].color].isHovered == true) {
      board[i][players[ME].color].isHovered = false;
    }
  }
  return false;
}

function isMouseInBound(pos, size)
{
  if (pos.x < mouseX && mouseX < pos.x + size.x
    && pos.y < mouseY && mouseY < pos.y + size.y) {
      return true;
    }
  return false;
}

function mousePressed()
{
  /* button blue */
  if (isMouseInBound(new Vec2d(topLeft.x + (CELL_SIZE * 4), topLeft.y), new Vec2d(CELL_SIZE, CELL_SIZE))) {
    newPieceButtonClicked(1);
  }
  /* button red */
  if (isMouseInBound(new Vec2d(topLeft.x + (CELL_SIZE * 4), topLeft.y + (CELL_SIZE * 2)), new Vec2d(CELL_SIZE, CELL_SIZE))) {
    newPieceButtonClicked(0);
  }

  /* manage click on pieces */
  for (let i = 0; i < 14; ++i) {
    //todo yes
  }
}
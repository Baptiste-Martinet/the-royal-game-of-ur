class Player {
  constructor () {
    this.name = 'baptiste';
    this.color = 0; //0=white, 1=black
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

const CELL_SIZE = 80;
const WHITE = 0;
const BLACK = 1;

const ME = 0;
const HIM = 1;

var players = [new Player, new Player];
var board = new Array(14);

/* utils functions */

function drawCell(cell)
{
  stroke(0);
  strokeWeight(2);
  fill(255);
  square(cell.pos.x, cell.pos.y, CELL_SIZE);
}

function displayBoard()
{
  for (let i = 0; i < 14; ++i) {
    drawCell(board[i][WHITE]);
    drawCell(board[i][BLACK]);
  }
}

function displayHoveredCells()
{
  for (let i = 0; i < 14; ++i) {
    if (board[i][players[ME].color].isHovered) {
      fill(255, 0, 0);
      square(board[i][players[ME].color].pos.x, board[i][players[ME].color].pos.y, CELL_SIZE);
    }
  }
}

function setCellsPos()
{
  let topLeft = new Vec2d(width / 2 - (CELL_SIZE * 4), height / 2 - (CELL_SIZE * 1.5));
  let currentPos = new Vec2d(3, 0);

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

/* p5 functions */

function setup() {
  createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < 14; ++i) {
    board[i] = [new Cell(new Vec2d(0, 0)), new Cell(new Vec2d(0, 0))]; //white cell & black cell
  }
  setCellsPos(); //setting up the tiles positions for black and white
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setCellsPos();
}

function draw() {
  /*COMPUTE */
  
  /* DRAW */
  background(240);
  displayBoard();
  displayHoveredCells();

  /* DEBUG */
  fill(255, 0, 0);
  noStroke();
  ellipse(width / 2, height / 2, 30);
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
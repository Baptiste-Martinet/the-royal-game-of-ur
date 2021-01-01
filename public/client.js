class Vec2d {
  constructor (_x, _y) {
    this.x = _x;
    this.y = _y;
  }
}

class Player {
  constructor (_color) {
    this.pseudo = 'baptiste';
    this.color = _color; //0=white, 1=black
    this.nbPieces = 7;
    this.score = 0;
    this.mousePos = new Vec2d(-100, -100);
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
var theme;

/* game variables */
var topLeft;
var diceValues = [0, 0, 0, 0];
var totalDicesValue = -1;
var playerState = WAITING;

/* UI variables */
var canvas;
var otherPointerImg;
var buttons;
const NB_BUTTONS = 1;

var spanUrl;
var spanError;

/* web socket */
var socket;

/* utils functions */

function drawPiece(pos, color)
{
  let p5PieceColor = theme.pieceColors[color];

  stroke(red(p5PieceColor), green(p5PieceColor), green(p5PieceColor), 180);
  strokeWeight(CELL_SIZE * 0.075);
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
  text(player.nbPieces, pos.x + CELL_SIZE / 2, pos.y + CELL_SIZE / 2);
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
  for (let i = 0; i < NB_BUTTONS; ++i) {
    if (!buttons[i].isDisplayed)
      continue;
    drawButton(buttons[i]);
  }
}

function drawMousePointer(name, pos)
{
  let pointerSize = CELL_SIZE * 0.09;

  image(otherPointerImg, pos.x, pos.y, pointerSize, pointerSize * 1.6);
  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  textSize(pointerSize);
  textStyle(BOLD);
  text(name, pos.x + pointerSize * 1.6, pos.y + pointerSize * 1.6);
}

function setCellsPos()
{
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

function manageResponsive()
{
  CELL_SIZE = width / 16; //Global variable storing the size of a Cell
  topLeft = new Vec2d(width / 2 - (CELL_SIZE * 4), height / 2 - (CELL_SIZE * 1.5)); //Topleft coords of the board

  /* update buttons */
  buttons[0].setPosition(topLeft.x, topLeft.y + (CELL_SIZE * 3.2));
  buttons[0].setSize(CELL_SIZE * 1.2, CELL_SIZE * 0.5);

  /* update cell positions */
  setCellsPos();
}

function setPlayerState(state)
{
  playerState = state;

  if (playerState == DRAWING_DICE) {
    diceValues.fill(0);
    totalDicesValue = -1;
    buttons[0].enable();
  } else if (state == MOVING) {
    buttons[0].disable();
  } else {
    diceValues.fill(0);
    totalDicesValue = -1;
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

  /* network */
  socket.emit('sendDiceValues', diceValues, totalDicesValue);

  /* player state */
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
  if (players[ME].nbPieces <= 0) {
    console.log(ERROR_MSG, 'No more pieces');
    return;
  }
  console.log(INFO_MSG, 'Creating new piece.');
  board[totalDicesValue - 1][color].isOccupied = true;
  players[ME].nbPieces--;

  /* network */
  socket.emit('sendBoardMoves', [{color: players[ME].color, idx: totalDicesValue - 1, isOccupied: true}]);
  socket.emit('sendNbPieces', players[ME].nbPieces);
  socket.emit('nextTurn');

  /* player state */
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

  buttons = new Array(NB_BUTTONS);
  buttons[0] = new Button(
    'Roll', /* text */
    buttonPressed, /* callback */
    new Vec2d(0, 0), /* pos */
    new Vec2d(CELL_SIZE * 1.2, CELL_SIZE * 0.5), /* size */
    color(255), /* text color */
    color(0, 0), /* color */
    color(59, 196, 96), /* hover color */
    color(255), /* text hover color */
    2.4, /* stroke size */
    color(59, 196, 96), /* stroke color */
    color(59, 196, 96) /* stroke hover color */
  );
  buttons[0].disable();
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);

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

  manageResponsive();

  spanUrl = createSpan('☝ SHARE THIS URL WITH A FRIEND <span style="cursor: pointer;" onclick="copyURLToClipBoard()">📋</span>');
  spanUrl.position(150, 20);
  spanUrl.style('color', 'black');
  spanUrl.style('font-family', 'monospace');
  spanUrl.style('font-weight', 'bold');
  spanUrl.style('font-size', '1vw');
  spanUrl.style('background-color', 'white');
  spanUrl.style('padding', '10px');
  spanUrl.style('border-radius', '15px');
  spanUrl.style('user-select', 'none');
  spanUrl.hide();

  spanError = createSpan('🖧 Could not find the room you are looking for');
  spanError.position(0, 0);
  spanError.style('top:50%;left:50%;transform: translate(-50%, -50%)');
  spanError.style('color', 'white');
  spanError.style('background-color', '#ff6161');
  spanError.style('padding', '1vw');
  spanError.style('border-radius', '1vw');
  spanError.style('font-weight', 'bold');
  spanError.style('font-size', '1.8vw');
  spanError.style('font-family', 'monospace');
  spanError.style('user-select', 'none');
  spanError.hide();

  /* socket */
  socket = io.connect();
  console.log('Connected');

  socket.on('connect', function() {
    console.log('Socket status', socket.connected);

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has('roomId')) {
      /* JOIN ROOM */
      const roomId = urlParams.get('roomId');
      console.log('Got from URL:', roomId);
      socket.emit('joinRoom', roomId);
    } else {
      /* CREATE ROOM */
      socket.emit('createRoom');
    }

    /* socket events */

    socket.on('joinedRoom', (roomId) => {
      window.location.href = window.location.href + "?roomId=" + roomId;
    });

    socket.on('eventMouseMoved', (mX, mY, cellSize) => {
      players[HIM].mousePos.x = topLeft.x + (mX * (CELL_SIZE / cellSize));
      players[HIM].mousePos.y = topLeft.y + (mY * (CELL_SIZE / cellSize));
    });

    socket.on('joinSuccess', (nbPlayers) => {
      if (nbPlayers == 1) {
        spanUrl.show();
      } else if (nbPlayers == 2) {
        players[ME].color = 1;
        players[HIM].color = 0;
      }
    });

    socket.on('joinError', () => {
      canvas.hide();
      spanError.show();
    });

    socket.on('newUser', () => {
      setTimeout(() => {
        spanUrl.hide();
      }, 2000);
    });

    /* GAME NETWORK */

    socket.on('setPlayerState', (state) => {
      setPlayerState(state);
    });

    socket.on('receiveDiceValues', (_diceValues, _totalDicesValue) => {
      diceValues = _diceValues;
      totalDicesValue = _totalDicesValue;
    });

    socket.on('receiveBoardMoves', (moves) => {
      let nbMoves = moves.length;

      for (let i = 0; i < nbMoves; ++i) {
        board[moves[i].idx][moves[i].color].isOccupied = moves[i].isOccupied;
      }
    });

    socket.on('receiveNbPieces', (nbPieces) => {
      players[HIM].nbPieces = nbPieces;
    });
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  manageResponsive();
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
  drawMousePointer('Player2', players[HIM].mousePos);

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

  for (let i = 0; i < NB_BUTTONS; ++i) {
    if (buttons[i].isDisplayed && isMouseInBound(buttons[i].pos, buttons[i].size.x, buttons[i].size.y)) {
      if (!buttons[i].isHovered)
        buttons[i].isHovered = true;
    } else if (buttons[i].isHovered) {
        buttons[i].isHovered = false;
    }
  }

  /* socket interaction */
  if (socket && socket.connected)
    socket.emit('sendMouseMoved', mouseX - topLeft.x, mouseY - topLeft.y, CELL_SIZE);
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
  for (let i = 0; i < NB_BUTTONS; ++i) {
    if (buttons[i].isDisplayed && buttons[i].isEnabled && isMouseInBound(buttons[i].pos, buttons[i].size.x, buttons[i].size.y)) {
      buttons[i].callTheCallbackFunction();
      break;
    }
  }
}

/* not p5 */

function copyURLToClipBoard()
{
  let dummy = document.createElement('input');
  let text = window.location.href;
  
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand('copy');
  document.body.removeChild(dummy);

  console.log('URL copied to the ClipBoard:', text);
}
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
  if (cell.isDoubled) {
    let doubledPos = new Vec2d(cell.pos.x + CELL_SIZE * 0.85, cell.pos.y + CELL_SIZE * 0.85);
    fill(255);
    noStroke();
    circle(doubledPos.x, doubledPos.y, CELL_SIZE * 0.1);
  }
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
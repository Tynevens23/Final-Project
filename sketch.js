var gameScreen = 0;

var gravity = 0.3;
var airfriction = 0.00001;
var friction = 0.1;

var score = 0;
var maxHealth = 100;
var health = 100;
var healthDecrease = 1;
var healthBarWidth = 60;

var ballX, ballY;
var ballSpeedVert = 0;
var ballSpeedHorizon = 0;
var ballSize = 20;
var ballColor;

var racketColor;
var racketWidth = 150;
var racketHeight = 10;

var wallSpeed = 5;
var wallInterval = 1000;
var lastAddTime = 0;
var minGapHeight = 200;
var maxGapHeight = 300;
var wallWidth = 80;
var wallColors;
var walls = [];

var img1;
var img2;
var img3;
var gif_loadImg, gif_createImg;

function preload() {
  gif_loadImg = loadImage("snowy.gif");
  gif_createImg = createImage("snowy.gif");
  img1 = loadImage("gift.png");
  img2 = loadImage("happy santa.png");
}


function setup() {
  createCanvas(800, 600);
  image(gif_loadImg, 0 ,0);
  ballX=width/4;
  ballY=height/5;
  smooth();

  ballColor = color(0);
  racketColor = color(0);
  wallColors = color(44, 62, 80)
}

function draw() {
  if (gameScreen == 0) { 
    initScreen();
  } else if (gameScreen == 1) { 
    gameplayScreen();
  } else if (gameScreen == 2) { 
    gameOverScreen();
  }
}

function initScreen() {
  background(236, 240, 241, 0);
  textAlign(CENTER);
  fill(250, 0, 0);
  textSize(60);
  text("Flappy Christmas", width/2, height/2);
  textSize(35); 
  text("Click to start", width/2, height-30);
}
function gameplayScreen() {
  //background(0);
  imageMode(CORNER);
  image(gif_loadImg, 0, 0);
  drawRacket();
  watchRacketBounce();
  drawBall();
  applyGravity();
  applyHorizontalSpeed();
  keepInScreen();
  drawHealthBar();
  printScore();
  wallAdder();
  wallHandler();
  noCursor();
}
function gameOverScreen() {
  background(236, 240, 241);
  textAlign(CENTER);
  fill(236, 0, 0);
  textSize(95);
  text("Your Score", width/2, height/2 - 120);
  textSize(130);
  text(score, width/2, height/2);
  textSize(45);
  text("Click to Restart", width/2, height-30);
}



function mousePressed() {
  if (gameScreen==0) { 
    startGame();
  }
  if (gameScreen==2) {
    restart();
  }
}



function startGame() {
  gameScreen=1;
}
function gameOver() {
  gameScreen=2;
}

function restart() {
  score = 0;
  health = maxHealth;
  ballX=width/4;
  ballY=height/5;
  lastAddTime = 0;
  walls = [];
  gameScreen = 1;
}

function drawBall() {
  fill(250,0,0);
  imageMode(CENTER);
  image(img1, ballX, ballY);
 
}
function drawRacket() {
  fill(250,0,0);
  rectMode(CENTER);
  image(img2, mouseX, mouseY, racketWidth);
}

function wallAdder() {
  if (millis()-lastAddTime > wallInterval) {
    var randHeight = round(random(minGapHeight, maxGapHeight));
    var randY = round(random(0, height-randHeight));
    var randWall = [width, randY, wallWidth, randHeight, 0]; 
    walls.push(randWall);
    lastAddTime = millis();
  }
}
function wallHandler() {
  for (var i = 0; i < walls.length; i++) {
    wallRemover(i);
    wallMover(i);
    wallDrawer(i);
    watchWallCollision(i);
  }
}
function wallDrawer(index) {
  var wall = walls[index];
  var gapWallX = wall[0];
  var gapWallY = wall[1];
  var gapWallWidth = wall[2];
  var gapWallHeight = wall[3];
  rectMode(CORNER);
  noStroke();
  strokeCap(ROUND);
  fill(250,0,0);
  rect(gapWallX, 0, gapWallWidth, gapWallY, 0, 0, 15, 15);
  rect(gapWallX, gapWallY+gapWallHeight, gapWallWidth, height-(gapWallY+gapWallHeight), 15, 15, 0, 0);
}
function wallMover(index) {
  var wall = walls[index];
  wall[0] -= wallSpeed;
}
function wallRemover(index) {
  var wall = walls[index];
  if (wall[0]+wall[2] <= 0) {
    walls.splice(index, 1);
  }
}

function watchWallCollision(index) {
  var wall = walls[index];
  // get gap wall settings 
  var gapWallX = wall[0];
  var gapWallY = wall[1];
  var gapWallWidth = wall[2];
  var gapWallHeight = wall[3];
  var wallScored = wall[4];
  var wallTopX = gapWallX;
  var wallTopY = 0;
  var wallTopWidth = gapWallWidth;
  var wallTopHeight = gapWallY;
  var wallBottomX = gapWallX;
  var wallBottomY = gapWallY+gapWallHeight;
  var wallBottomWidth = gapWallWidth;
  var wallBottomHeight = height-(gapWallY+gapWallHeight);

  if (
    (ballX+(ballSize/2)>wallTopX) &&
    (ballX-(ballSize/2)<wallTopX+wallTopWidth) &&
    (ballY+(ballSize/2)>wallTopY) &&
    (ballY-(ballSize/2)<wallTopY+wallTopHeight)
    ) {
    decreaseHealth();
  }
  if (
    (ballX+(ballSize/2)>wallBottomX) &&
    (ballX-(ballSize/2)<wallBottomX+wallBottomWidth) &&
    (ballY+(ballSize/2)>wallBottomY) &&
    (ballY-(ballSize/2)<wallBottomY+wallBottomHeight)
    ) {
    decreaseHealth();
  }

  if (ballX > gapWallX+(gapWallWidth/2) && wallScored==0) {
    wallScored=1;
    wall[4]=1;
    addScore();
  }
}

function drawHealthBar() {
  noStroke();
  fill(189, 195, 199);
  rectMode(CORNER);
  rect(ballX-(healthBarWidth/2), ballY - 30, healthBarWidth, 5);
  if (health > 60) {
    fill(46, 204, 113);
  } else if (health > 30) {
    fill(230, 126, 34);
  } else {
    fill(231, 76, 60);
  }
  rectMode(CORNER);
  rect(ballX-(healthBarWidth/2), ballY - 30, healthBarWidth*(health/maxHealth), 5);
}
function decreaseHealth() {
  health -= healthDecrease;
  if (health <= 0) {
    gameOver();
  }
}
function addScore() {
  score++;
}
function printScore() {
  textAlign(CENTER);
  fill(0);
  textSize(30); 
  text(score, height/2, 50);
}

function watchRacketBounce() {
  var overhead = mouseY - pmouseY;
  if ((ballX+(ballSize/2) > mouseX-(racketWidth/2)) && (ballX-(ballSize/2) < mouseX+(racketWidth/2))) {
    if (dist(ballX, ballY, ballX, mouseY)<=(ballSize/2)+abs(overhead)) {
      makeBounceBottom(mouseY);
      ballSpeedHorizon = (ballX - mouseX)/10;
      if (overhead<0) {
        ballY+=(overhead/2);
        ballSpeedVert+=(overhead/2);
      }
    }
  }
}
function applyGravity() {
  ballSpeedVert += gravity;
  ballY += ballSpeedVert;
  ballSpeedVert -= (ballSpeedVert * airfriction);
}
function applyHorizontalSpeed() {
  ballX += ballSpeedHorizon;
  ballSpeedHorizon -= (ballSpeedHorizon * airfriction);
}
function makeBounceBottom(surface) {
  ballY = surface-(ballSize/2);
  ballSpeedVert*=-1;
  ballSpeedVert -= (ballSpeedVert * friction);
}
function makeBounceTop(surface) {
  ballY = surface+(ballSize/2);
  ballSpeedVert*=-1;
  ballSpeedVert -= (ballSpeedVert * friction);
}
function makeBounceLeft(surface) {
  ballX = surface+(ballSize/2);
  ballSpeedHorizon*=-1;
  ballSpeedHorizon -= (ballSpeedHorizon * friction);
}
function makeBounceRight(surface) {
  ballX = surface-(ballSize/2);
  ballSpeedHorizon*=-1;
  ballSpeedHorizon -= (ballSpeedHorizon * friction);
}
function keepInScreen() {
  if (ballY+(ballSize/2) > height) { 
    makeBounceBottom(height);
  }
  if (ballY-(ballSize/2) < 0) {
    makeBounceTop(0);
  }
  if (ballX-(ballSize/2) < 0) {
    makeBounceLeft(0);
  }
  if (ballX+(ballSize/2) > width) {
    makeBounceRight(width);
  }
}
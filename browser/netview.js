// ============= DISPLAY AND GRAPHICS FUNCTIONS ==================
var PIXEL_RATIO = (function () {
    var ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
})();


var createHiDPICanvas = function(w, h, ratio) {
    if (!ratio) { ratio = PIXEL_RATIO; }
    var can = document.getElementById("myCanvas");
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    return can;
}

function updateHiDPICanvas (can, w, h){
  var ratio = PIXEL_RATIO;
  can.width = w * ratio;
  can.height = h * ratio;
  can.style.width = w + "px";
  can.style.height = h + "px";
  can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
}

// ================== VARIABLE SETUP =====================

var canvas = createHiDPICanvas(window.innerWidth, window.innerHeight);

var ctx = canvas.getContext("2d");

var width = window.innerWidth;
var height = window.innerHeight;
var cX = window.innerWidth/2;
var cY = window.innerHeight/2;
var millis = 0;

var msgReceived = "Connecting to server...";
var json_data = "json not loaded...";
var json_loaded = false;


// ================== SETUP AND MANAGEMENT FUNCTIONS ====================
function startApp(){
  setInterval(physics,10);
  window.requestAnimationFrame(frame());
}

function resize(){
  width = window.innerWidth;
  height = window.innerHeight;
  cX = window.innerWidth/2;
  cY = window.innerHeight/2;
  updateHiDPICanvas(canvas, width, height);
}

// ================== DRAW FUNCTIONS ==========================
function drawText(textToDraw, posX, posY){
  var textWidth = ctx.measureText(textToDraw).width*3;
  ctx.fillStyle = "white";
  ctx.fillRect(posX-(textWidth+4)/2, posY-35/2, textWidth+4, 35);
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText(textToDraw, posX-textWidth/2, posY+10);
}

function drawCircle(posX, posY, radius, color){
  ctx.beginPath();
  ctx.arc(posX, posY, radius, 0, Math.PI*2, false);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawLine(x1, y1, x2, y2, width){
  ctx.lineWidth=width;
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
}

// ============= Loading Screen ==============
class Sparkle{
  constructor(radius, magnitude, direction, changeInMagnitude){
      this.radius = radius;
      this.magnitude = magnitude;
      this.direction = direction;
      this.changeInMagnitude = changeInMagnitude;
  }
  draw(timeRef){
    var m = this.changeInMagnitude * Math.sin(timeRef-this.direction) + this.magnitude;

    ctx.strokeStyle = "black";
    drawLine(cX + Math.cos(this.direction) * m, cY+80 + Math.sin(this.direction) * m, cX, cY+80, 5);
    drawCircle(cX + Math.cos(this.direction) * m,
               cY+80 + Math.sin(this.direction) * m,
               this.radius,
               "white");

  }
}

var sparkles = [];
const nSparkles = 10;
var numberOfDots = 0;
var timelog = 0;

function drawLoadingScreen(){
  for(i=0; i<nSparkles; i++){
    dir = Math.PI * 2 * (i/nSparkles);
    if(sparkles.length != nSparkles){
      sparkles[i] = new Sparkle(15, 120, dir, 30);
    }else{
      sparkles[i].draw(millis/500);
    }
  }

  if(millis-timelog>300){
    timelog = millis;
    numberOfDots+=1;
    if(numberOfDots >= 4){numberOfDots=0;}

    // try to Connecting
    connectToServer();
  }
  var textToAdd = ".".repeat(numberOfDots)+" ".repeat(3-numberOfDots);
  drawText("Connecting to server "+textToAdd, cX, cY-200);
  drawCircle(cX, cY+80, 60, "white");
}

// ==================== Drawing the network =================
class Pos{
  constructor(tX, tY){
    this.tX = tX;
    this.tY = tY;
    this.cX = 0;
    this.cY = 0;
  }
  setTargetPos(tX, tY){
    this.tX = tX;
    this.tY = tY;
  }
  setCurrentPos(cX, cY){
    this.cX = cX;
    this.cY = cY;
  }
  animatePos(speed){
      cX += (tX-cX) * speed;
      cY += (tY-cY) * speed;
  }
}

class Website{
  constructor(name, targetPos, startingPos, links){

  }
  animate(){

  }
  draw(){

  }
}

var size = 0;
var timeLog = 0;
function drawNet(){
  if(millis-timeLog>10){
    timeLog = millis;
    size += (width/1.5-size)*0.1;
  }
  if(size<width/1.6){
    drawCircle(cX, cY+80, 60+size, "white");
  }else{
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    // Draw the network
    for(i=0; i<10; i++){
      var site = json_data.links[i];
      drawText(site[0], Math.random()*width, Math.random()*height);
    }

  }
}

// ================== UPDATING FUNCTIONS =====================
function physics(){
  millis+=10; // keep track of time
}



function frame(){
  // setup canvas
  ctx.save();
  ctx.clearRect(0,0,width,height);

  // draw background
  ctx.fillStyle = "lightblue";
  ctx.fillRect(0, 0, width, height);


  if(json_loaded == false || millis < 2000){
    drawLoadingScreen();
  }else{
    drawNet();
  }
  // prepare for next frame
  ctx.restore();
  window.requestAnimationFrame(frame);
}


// ================== SERVER FUNCTIONS ================================
var socket = null;
function connectToServer(){
  socket = new WebSocket('ws://localhost:4357');

  // Connection opened
  socket.addEventListener('open', function (event) {
      socket.send('datarequest');
  });

  // Listen for messages
  socket.addEventListener('message', function (event) {
      msgReceived = 'Data received from server...';
      json_data = JSON.parse(event.data);
      json_loaded = true;
  });
}

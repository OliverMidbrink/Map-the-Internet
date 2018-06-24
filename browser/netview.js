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

function drawLoadingScreen(){
  drawCircle(cX, cY, 100, "white");
  drawText(millis, cX, cY-200);


}

class sparkle{
  constructor(direction, radius, velocity){
    
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
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);


  if(json_loaded == false || millis<15000){
    drawLoadingScreen();
  }
  // prepare for next frame
  ctx.restore();
  window.requestAnimationFrame(frame);
}


// ================== SERVER FUNCTIONS ================================

var socket = new WebSocket('ws://localhost:4357');

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
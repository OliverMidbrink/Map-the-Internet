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


createHiDPICanvas = function(w, h, ratio) {
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
  ratio = PIXEL_RATIO;
  can.width = w * ratio;
  can.height = h * ratio;
  can.style.width = w + "px";
  can.style.height = h + "px";
  can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
}


var canvas = createHiDPICanvas(window.innerWidth, window.innerHeight);

var ctx = canvas.getContext("2d");


var width = window.innerWidth;
var height = window.innerHeight;
var cX = window.innerWidth/2;
var cY = window.innerHeight/2;
var msgReceived = "Connecting to server...";

function startApp(){
  setInterval(physics,10); // run physics at 100 hertz
  window.requestAnimationFrame(frame());
}

function physics(){
  millis+=10; // keep track of time
}

function resize(){
  width = window.innerWidth;
  height = window.innerHeight;
  cX = window.innerWidth/2;
  cY = window.innerHeight/2;
  updateHiDPICanvas(canvas, width, height);
}


function frame(){
  // setup canvas
  ctx.save();
  ctx.clearRect(0,0,width,height);

  // draw background
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  ctx.beginPath();
  ctx.arc(cX, cY, 100, 0, Math.PI*2, false);
  ctx.closePath();
  ctx.fillStyle = "white";
  ctx.fill();

  var textWidth = ctx.measureText(msgReceived).width*3;
  ctx.fillStyle = "white";
  ctx.fillRect(cX-textWidth/2-2, cY-227, textWidth+4, 35);
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText(msgReceived, cX-textWidth/2, cY-200);

  // prepare for next frame
  ctx.restore();
  window.requestAnimationFrame(frame);
}


// ================================ SERVER SIDE ================================

var socket = new WebSocket('ws://localhost:4357');

// Connection opened
socket.addEventListener('open', function (event) {
    socket.send('datarequest');
});

// Listen for messages
socket.addEventListener('message', function (event) {
    msgReceived = 'Message from server "' + event.data + '"';
});

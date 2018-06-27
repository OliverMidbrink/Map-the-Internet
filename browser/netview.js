// ============= DISPLAY AND GRAPHICS FUNCTIONS ==================
var PIXEL_RATIO = (function() {
  var ctx = document.createElement('canvas').getContext('2d'),
    dpr = window.devicePixelRatio || 1,
    bsr = ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio || 1;

  return dpr / bsr;
})();


var createHiDPICanvas = function(w, h, ratio) {
  if (!ratio) {
    ratio = PIXEL_RATIO;
  }

  var can = document.getElementById('myCanvas');
  can.width = w * ratio;
  can.height = h * ratio;
  can.style.width = w + 'px';
  can.style.height = h + 'px';
  can.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
  return can;
};

function updateHiDPICanvas(can, w, h) {
  var ratio = PIXEL_RATIO;
  can.width = w * ratio;
  can.height = h * ratio;
  can.style.width = w + 'px';
  can.style.height = h + 'px';
  can.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
}

// ================== VARIABLE SETUP =====================

var canvas = createHiDPICanvas(window.innerWidth, window.innerHeight);

var ctx = canvas.getContext('2d');

var width = window.innerWidth;
var height = window.innerHeight;
var cX = window.innerWidth / 2;
var cY = window.innerHeight / 2;
var millis = 0;
var cornerDebug = 'Corner Debug';
bgColor = window.getComputedStyle(document.body, null).getPropertyValue('background-color');

var msgReceived = 'Connecting to server...';
var jsonData = 'json not loaded...';
var jsonLoaded = false;

var transX = 0;
var transY = 0;
var targetTransX = 0;
var targetTransY = 0;
var scale = 1;
var millis = 0;
var currentScale = scale;

var timeWhenPressed = 0;
var mouseX = 0;
var mouseY = 0;
var mousePressed = false;

var loadingScreen = 1000;


// ================== SETUP AND MANAGEMENT FUNCTIONS ====================
function startApp() {
  setInterval(physics, 10);
  window.requestAnimationFrame(frame());
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  cX = window.innerWidth / 2;
  cY = window.innerHeight / 2;
  updateHiDPICanvas(canvas, width, height);
}

// ================== DRAW FUNCTIONS ==========================
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}

function drawText(textToDraw, posX, posY) {
  ctx.font = '30px Arial';
  var textWidth = ctx.measureText(textToDraw).width;
  ctx.fillStyle = 'white';
  ctx.fillRect(posX - (textWidth + 4) / 2, posY - 35 / 2, textWidth + 4, 35);
  ctx.fillStyle = 'black';
  ctx.fillText(textToDraw, posX - textWidth / 2, posY + 10);
}

function drawTextWithoutBackground(textToDraw, posX, posY) {
  ctx.font = '15px Arial';
  var textWidth = ctx.measureText(textToDraw).width;
  ctx.fillStyle = 'black';
  ctx.fillText(textToDraw, posX - textWidth / 2, posY + 10);
}

function drawCircle(posX, posY, radius, color) {
  ctx.beginPath();
  ctx.arc(posX, posY, radius, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawLine(x1, y1, x2, y2, width) {
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
// ============= Debugging ===================




// ============= Loading Screen ==============
class Sparkle {
  constructor(radius, magnitude, direction, changeInMagnitude, magnitudeOffset) {
    this.radius = radius;
    this.magnitude = magnitude;
    this.direction = direction;
    this.changeInMagnitude = changeInMagnitude;
    this.magnitudeOffset = magnitudeOffset;
  }

  draw(timeRef) {
    var m = this.changeInMagnitude * Math.sin(timeRef - this.magnitudeOffset) + this.magnitude;

    ctx.strokeStyle = 'black';
    drawLine(cX + Math.cos(this.direction) * m,
      cY + 80 + Math.sin(this.direction) * m, cX, cY + 80, 5);

    drawCircle(cX + Math.cos(this.direction) * m,
      cY + 80 + Math.sin(this.direction) * m, this.radius, 'white');
  }
}

var sparkles = [];
const nSparkles = 10;
var numberOfDots = 0;
var timelog = 0;
var loadingColor = 'lightblue';

function drawLoadingScreen() {
  ctx.fillStyle = loadingColor;
  ctx.fillRect(0, 0, width, height);

  for (i = 0; i < nSparkles; i++) {
    dir = Math.PI * 2 * (i / nSparkles);
    if (sparkles.length != nSparkles) {
      sparkles[i] = new Sparkle(15, 135, dir, 50,
        Math.random() * Math.PI * 0);

      //sparkles[i] = new Sparkle(15, 120, dir, 30, dir);
    } else {
      sparkles[i].draw(millis / 500);
    }
  }

  if (millis - timelog > 300) {
    timelog = millis;
    numberOfDots += 1;
    if (numberOfDots >= 4) {
      numberOfDots = 0;
    }

    // try to Connecting
    connectToServer();
  }

  var textToAdd = '.'.repeat(numberOfDots) + ' '.repeat(3 - numberOfDots);
  drawText('Connecting to server ' + textToAdd, cX, cY - 200);
  drawCircle(cX, cY + 80, 30, 'white');
}

// ==================== Drawing the network =================
class Pos {
  constructor(x, y) {
    this.tX = x;
    this.tY = y;
    this.x = x;
    this.y = y;
  }

  setTargetPos(tX, tY) {
    this.tX = tX;
    this.tY = tY;
  }

  setCurrentPos(x, y) {
    this.x = x;
    this.y = y;
  }

  animatePos(speed) {
    this.x += (this.tX - this.x) * speed;
    this.y += (this.tY - this.y) * speed;
  }

}

class Link {
  constructor(originID, destinationID, strength) {
    this.originID = originID;
    this.destinationID = destinationID;
    this.strength = strength;
  }

  draw() {
    var site1 = websites[this.originID];
    var site2 = websites[this.destinationID];
    var dX = site1.pos.x - site2.pos.x;
    var dY = site1.pos.y - site2.pos.y;
    var dir = Math.atan2(dY, dX);

    ctx.strokeStyle = colors[this.originID];
    drawLine(site1.pos.x, site1.pos.y, site2.pos.x, site2.pos.y, this.strength);
    drawLine(site2.pos.x, site2.pos.y, site2.pos.x - 5, site2.pos.y - 5, 1);
    drawLine(site2.pos.x, site2.pos.y, site2.pos.x - 5, site2.pos.y + 5, 1);
  }

}


class Website {
  constructor(name, size, pos, links, id) {
    this.id = id;
    this.name = name;
    this.size = size;
    this.pos = pos;
    this.links = links;
  }

  animate() {
    this.pos.animatePos(0.1);
  }

  draw() {
    if (scale > 0.5) {
      drawTextWithoutBackground(this.name, this.pos.x, this.pos.y - this.size - 30);
    }

    //drawLine(this.pos.x, this.pos.y, this.pos.x, this.pos.y - 80, 5);
    drawCircle(this.pos.x, this.pos.y, this.size, 'black');
  }

  overlaps(otherSite) {
    var distToOtherSite = Math.hypot(otherSite.pos.tX - this.pos.tX,
        otherSite.pos.tY - this.pos.tY) -
      this.size - otherSite.size;
    if (distToOtherSite < 500) {
      return true;
    }

    return false;
  }

}

var size = 0;
var timeLog = 0;
var firstTime = true;
var websites = [];
var links = [];
var generated = false;
var colors = [];

function drawNet() {
  var collisionsFound = 0;

  if (millis - timeLog > 10) {
    timeLog = millis;
    size += (width / 1.5 - size) * 0.1;
  }

  if (size < width / 1.6) {
    ctx.fillStyle = loadingColor;
    ctx.fillRect(0, 0, width, height);
    drawCircle(cX, cY + 80, 60 + size, bgColor);
  } else {

    // Draw the network
    if (firstTime) {
      firstTime = false;
      for (i = 0; i < 200; i++) {
        var siteName = jsonData.websites[i][0];
        var siteSize = Math.pow(jsonData.websites[i][1], 0.5) * 2;
        var position = new Pos(Math.random() * width, Math.random() * height);
        position.setCurrentPos(cX, cY);
        var siteLinks = [];
        websites.push(new Website(siteName, siteSize, position, siteLinks, i));
        colors.push(getRandomColor());
      }

      if (links.length == 0) {
        for (i = 0; i < jsonData.links.length; i++) {
          var link = jsonData.links[i];
          var originID = -1;
          var destinationID = -1;

          for (j = 0; j < websites.length; j++) {
            var name = websites[j].name;

            // Check if origin exists
            if (link[0] == name) {
              originID = j;
            }

            // Check if destination exists
            if (link[1] == name) {
              destinationID = j;
            }
          }

          if (originID != -1 && destinationID != -1) {
            //alert(link[0] + ' ' + link[1] + ' ' + link[2]);
            var strength = Math.pow(link[2], 0.8) * 0.2;
            links.push(new Link(originID, destinationID, strength));
          }
        }
      }
    } else {
      for (i = 0; i < links.length; i++) {
        links[i].draw();
      }

      for (i = 0; i < websites.length; i++) {
        if (generated) { websites[i].draw(); }

        if (generated == false) {
          for (j = 0; j < i; j++) {
            otherSite = websites[j];
            thisSite = websites[i];

            if (thisSite.overlaps(otherSite)) {
              collisionsFound += 1;
              var offsetX = (thisSite.pos.tX - otherSite.pos.tX) * (Math.random() + 0.5) * 2;
              var offsetY = (thisSite.pos.tY - otherSite.pos.tY) * (Math.random() + 0.5) * 2;
              thisSite.pos.setTargetPos(thisSite.pos.tX + offsetX, thisSite.pos.tY + offsetY);
              thisSite.pos.setCurrentPos(cX, cY);
            }
          }
        }

        if (millis > (loadingScreen + 1000) && collisionsFound == 0 && generated == false) {
          generated = true;
          //alert('Generated!');
        }

      }
    }

    //drawText('collisionsFound: ' + collisionsFound, cX, cY);
  }
}

// ================== UPDATING FUNCTIONS =====================
function physics() {
  millis += 10; // keep track of time

  currentScale += (scale - currentScale) / 10;
  transX += (targetTransX - transX) / 10;
  transY += (targetTransY - transY) / 10;

  for (i = 0; i < websites.length; i++) {
    if (generated) {
      websites[i].animate();
    }
  }
}

function frame() {
  // setup canvas
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.translate(transX, transY);
  ctx.scale(currentScale, currentScale);


  if (jsonLoaded == false || millis < loadingScreen) {
    drawLoadingScreen();
  } else {
    drawNet();
  }

  // prepare for next frames
  ctx.restore();
  window.requestAnimationFrame(frame);
}

// ============== Mouse functions ==============================
canvas.onclick = function(event) {
  return false;
};

document.onmousedown = function (event) {
  mousePressed = true;
  timeWhenPressed = millis;
  return false;
};

document.onmouseup = function (event) {
  mousePressed = false;
  timePressed = millis - timeWhenPressed;
  return false;
};


document.onmousemove = function (event) {
  if (mousePressed && mouseX != 0 && mouseY != 0) {
    var co = 1;
    if (jsonLoaded == false || millis < loadingScreen) {
      co = 0;
    }

    targetTransX += (event.clientX - mouseX) * co;
    targetTransY += (event.clientY - mouseY) * co;

    transX = targetTransX;
    transY = targetTransY;
  }

  mouseX = event.clientX;
  mouseY = event.clientY;
};

canvas.onmousewheel = function(event) {
  event.preventDefault();

  var coefficient = 1 + event.wheelDelta / 2400;
  if (jsonLoaded == false || millis < loadingScreen) {
    coefficient = 1;
  }
  /*var disX = transX-canvas.width/2;
  var disY = transY-canvas.height/2;
  transX=disX*coefficient+canvas.width/2;
  transY=disY*coefficient+canvas.height/2;*/
  var disX = targetTransX - canvas.width / 2;
  var disY = targetTransY - canvas.height / 2;

  var relX = mouseX - targetTransX;
  var relY = mouseY - targetTransY;


  relX *= coefficient;
  relY *= coefficient;
  targetTransX -= (coefficient - 1) * relX;
  targetTransY -= (coefficient - 1) * relY;

  //transX-=(coefficient-1)*relX;
  //transY-=(coefficient-1)*relY;

  scale *= coefficient;
  targetScale *= coefficient;
};

canvas.onmouseout = function (event) {
  mouseX = 0;
  mouseY = 0;
};

// ================== SERVER FUNCTIONS ================================
var socket = null;

function connectToServer() {
  socket = new WebSocket('ws://localhost:4357');

  // Connection opened
  socket.addEventListener('open', function(event) {
    socket.send('datarequest');
  });

  // Listen for messages
  socket.addEventListener('message', function(event) {
    msgReceived = 'Data received from server...';
    jsonData = JSON.parse(event.data);
    jsonLoaded = true;
  });
}

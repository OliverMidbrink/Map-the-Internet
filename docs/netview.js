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


var linkColors = ['#144b85', '#096cc3', '#3179b5', '#3392c7', '#3fabd9', '#35aec8']
            //      '#3D9970', '#2ECC40', '#01FF70',
            //      '#FF851B', '#FF4136', '#85144b',
            //      '#B10DC9', '#00919f', '#700000']

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
var timeWhenGenerated = 0;

var siteHoveringID = -1;
var lastHoverID = -1;
var sitesConnectedToHover = [];
var transformedMouseX = (mouseX - transX) / scale;
var transformedMouseY = (mouseY - transY) / scale;

var isTouch = false;

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
// ================== Handy Subrutines ========================
/*  OLD COLOR FUNCTION
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}
*/

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return linkColors[Math.floor(Math.random() * linkColors.length)];
}


function getDist(x1, y1, x2, y2) {
  var dX = x1 - x2;
  var dY = y1 - y2;
  return Math.sqrt(dX * dX + dY * dY);
}

// ================== DRAW FUNCTIONS ==========================
function drawTextToWidth(textToDraw, posX, posY, width, color) {
  ctx.font = '30px Arial';
  var initialTextWidth = ctx.measureText(textToDraw).width;

  var newFontSize = width / initialTextWidth * 30;
  if (newFontSize > width) {newFontSize = width;}

  ctx.font = newFontSize + 'px Arial';
  var newTextWidth = ctx.measureText(textToDraw).width;

  ctx.fillStyle = color;
  ctx.fillText(textToDraw, posX - newTextWidth / 2, posY + newFontSize / 3.5);
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
  ctx.font = '25px Arial';
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

    ctx.strokeStyle = linkColor;
    drawLine(cX + Math.cos(this.direction) * m,
      cY + 80 + Math.sin(this.direction) * m, cX, cY + 80, 5);

    drawCircle(cX + Math.cos(this.direction) * m,
      cY + 80 + Math.sin(this.direction) * m, this.radius, circleColor);
  }
}

var sparkles = [];
const nSparkles = 10;
var numberOfDots = 0;
var timelog = 0;
var loadingColor = 'rgb(140, 197, 249)';
var linkColor = 'black';
var circleColor = 'white';

function drawLoadingScreen() {
  ctx.fillStyle = loadingColor;
  ctx.fillRect(0, 0, width, height);

  for (i = 0; i < nSparkles; i++) {
    dir = Math.PI * 2 * (i / nSparkles);
    if (sparkles.length != nSparkles) {
      sparkles[i] = new Sparkle(15, 135, dir, 50,
        Math.random() * Math.PI * 0.2);

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
    loadJsonData();
  }

  var textToAdd = '.'.repeat(numberOfDots) + ' '.repeat(3 - numberOfDots);
  drawText('Connecting to server ' + textToAdd, cX, cY - 200);
  drawCircle(cX, cY + 80, 30, circleColor);
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
    this.currentStrength = 0;
    this.state = 'normal';
    this.shouldDraw = true;
  }

  animateStrength() {
    switch (this.state) {
      case 'normal':
        this.shouldDraw = true;
        if (Math.abs(this.strength - this.currentStrength) > 0.01) {
          this.currentStrength += (this.strength - this.currentStrength) / 8;
        }
        break;
      case 'amplified':
        this.shouldDraw = true;
        this.currentStrength += (Math.min(this.strength * this.strength * this.strength, 400) / 5 + 5 - this.currentStrength) / 8;
        break;
      case 'hidden':
        this.currentStrength += (0.001 - this.currentStrength) / 12;
        this.shouldDraw = true;
        break;
    }
  }

  draw() {
    if (siteHoveringID != -1) {
      if (siteHoveringID == this.originID || siteHoveringID == this.destinationID) {
        this.state = 'amplified';
      } else {
        this.state = 'hidden';
      }

    } else{
      this.state = 'normal';
    }

    var site1 = websites[this.originID];
    var site2 = websites[this.destinationID];

    if(this.shouldDraw) {
      ctx.strokeStyle = colors[this.originID];
      drawLine(site1.pos.x, site1.pos.y, site2.pos.x, site2.pos.y, this.currentStrength);
      //drawLine(site2.pos.x, site2.pos.y, site2.pos.x - 5, site2.pos.y - 5, 1);
      //drawLine(site2.pos.x, site2.pos.y, site2.pos.x - 5, site2.pos.y + 5, 1);
    }
  }

}


class Website {
  constructor(name, size, pos, links, id) {
    this.visible = true;
    this.id = id;
    this.name = name;
    this.size = size;
    this.currentSize = size;
    this.assignableSize = size;
    this.pos = pos;
    this.assignablePos = new Pos(pos.x, pos.y);
    this.links = links;
  }

  animate() {
    this.pos.animatePos(0.1);
  }

  animateSize(){
    if (this.visible) {
      this.currentSize += (this.size - this.currentSize) / 8;
    }else {
      this.currentSize += (0 - this.currentSize) / 8;
    }
  }

  draw() {
    if (sitesConnectedToHover.indexOf(this.id) > -1 || siteHoveringID == this.id) { // if sites is connected to hover
      this.visible = true;
    } else if (sitesConnectedToHover.length != 0){
      this.visible = false;
    } else {
      this.visible = true;
    }

    drawCircle(this.pos.x, this.pos.y, this.currentSize, 'black');
    ctx.font = '30px Arial';
    var textWidthOutside = ctx.measureText(this.name).width;

    if (scale > (10 / this.size) && millis - timeWhenGenerated > 800) {
      var textCo = 25;
      if (this.size * 1.8 > textWidthOutside) {
        drawTextToWidth(this.name,
                       this.pos.x,
                       this.pos.y,
                       this.currentSize * 1.8,
                       'white');
      } else if (this.visible) {
        drawTextWithoutBackground(this.name,
                                  this.pos.x,
                                  this.pos.y - this.currentSize * 1.05 - 30);
      }
    }
    //drawLine(this.pos.x, this.pos.y, this.pos.x, this.pos.y - 80, 5);

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


var size = 0;
var timeLog = 0;
var firstTime = true;
var websites = [];
var links = [];
var generated = false;
var colors = [];
var isSearching = false;



function drawGUI() {
  // Search bar
}

function generateNetwork() {
  var collisionsFound = 10;

  while (collisionsFound > 0) {
    collisionsFound = 0;
    for (i = 0; i < websites.length; i++) {
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
    //drawText('Tasks remaining: ' + collisionsFound, cX, cY);
  }
}



function drawNet() {
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
        var siteSize = Math.pow(jsonData.websites[i][1], 0.5) * 6;
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
            var strength = Math.pow(link[2], 0.8) * 0.2;
            var shouldPush = true;

            //alert(link[0] + ' ' + link[1] + ' ' + link[2]);
            for (var k = 0; k < links.length; k++) {
              var dID = links[k].destinationID;
              var oID = links[k].originID;
              if (dID == originID && oID == destinationID) {
                // These two connection overlap, combine them
                links[k].strength = (links[k].strength + strength) / 2 + 2;
                shouldPush = false;
              }
            }

            if (shouldPush) {
              links.push(new Link(originID, destinationID, strength));
            }
          }
        }
      }
    } else { // If this is not the first iteration of drawNet do the following:
      for (i = 0; i < links.length; i++) {
        links[i].draw();
      }

      if (generated) {
        for (i = 0; i < websites.length; i++) {
          websites[i].draw();
        }
      } else {
        generateNetwork();
        generated = true;
        timeWhenGenerated = millis;
      }
    }
  }
}

// ================== UPDATING FUNCTIONS =====================
function checkIfHoveringOverSite() {
  siteHoveringID = -1;
  for (var i = 0; i < websites.length; i++) {
    site = websites[i];
    transformedMouseX = (mouseX - transX) / scale;
    transformedMouseY = (mouseY - transY) / scale;
    if (getDist(site.pos.x, site.pos.y, transformedMouseX, transformedMouseY) < site.size) {
      siteHoveringID = i;
    }
  }

  if(siteHoveringID != -1 && sitesConnectedToHover.length == 0 && lastHoverID == -1) { //hovering over new site
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if (link.originID == siteHoveringID) {
        sitesConnectedToHover.push(link.destinationID);
      }
      if (link.destinationID == siteHoveringID) {
        sitesConnectedToHover.push(link.originID);
      }
    }

    if (sitesConnectedToHover == 0) { // Hovered sites is not connected to any of displayed sites
      sitesConnectedToHover.push(-1);
    }
    lastHoverID = siteHoveringID;
  }

  if (siteHoveringID == -1) { //not hovering over site so clear connected sites list
    sitesConnectedToHover = [];
    lastHoverID = -1;
  }
}


function physics() {
  millis += 10; // keep track of time

  if (millis - timeWhenGenerated < 800 && millis - timeWhenGenerated > 0 && generated) {
    scale = 0.1;
    targetTransX = cX * 0.9;
    targetTransY = cY * 0.9;
    currentScale += (scale - currentScale) / 15;
    transX += (targetTransX - transX) / 15;
    transY += (targetTransY - transY) / 15;
  }
  else {
    currentScale += (scale - currentScale) / 2;
    transX += (targetTransX - transX) / 2;
    transY += (targetTransY - transY) / 2;
  }

  for (i = 0; i < websites.length; i++) {
    websites[i].animateSize();
    if (generated && millis - timeWhenGenerated > 700) {
      websites[i].animate();
    }
  }

  for (i = 0; i < links.length; i++) {
    links[i].animateStrength();
  }
}


function touchDisclaimer() {
  drawCircle(cX, cY, 4000, "lightblue");
  drawText("This web application", cX, cY - 90);
  drawText("is currently not supported", cX, cY - 45);
  drawText("on touchscreen devices.", cX, cY);
  drawText("Please visit this site on", cX, cY + 45);
  drawText("a laptop or desktop computer", cX, cY + 90);
}

function frame() {
  if("ontouchstart" in document.documentElement) {
    touchDisclaimer();
  } else {
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
    drawGUI();
    window.requestAnimationFrame(frame);
  }
}


function inRect(x, y, rX, rY, rW, rH) {
  if (x > rX && x < rX + rW && y > rY && y < rY + rH) {
    return true;
  }
  return false;
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
  checkIfHoveringOverSite();

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
  checkIfHoveringOverSite();

  event.preventDefault();

  var coefficient = 1 + event.wheelDelta / 2400;
  if (jsonLoaded == false || millis < loadingScreen) {
    coefficient = 1;
  }
  /*var disX = transX-canvas.width/2;
  var disY = transY-canvas.height/2;
  transX=disX*coefficient+canvas.width/2;
  transY=disY*coefficient+canvas.height/2;*/
  var disX = targetTransX - cX;
  var disY = targetTransY - cY;

  var relX = mouseX - targetTransX;
  var relY = mouseY - targetTransY;


  relX *= coefficient;
  relY *= coefficient;
  targetTransX -= (coefficient - 1) * relX;
  targetTransY -= (coefficient - 1) * relY;

  //transX-=(coefficient-1)*relX;
  //transY-=(coefficient-1)*relY;

  scale *= coefficient;
};

canvas.onmouseout = function (event) {
  mouseX = 0;
  mouseY = 0;
};

// ================== SERVER FUNCTIONS ================================
var socket = null;

function loadJsonData() {
  jsonData = JSON.parse(data);
  jsonLoaded = true;
}

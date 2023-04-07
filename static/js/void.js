
function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

function mapRange(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function distance(dot1, dot2) {
    var _a = [dot1[0], dot1[1], dot2[0], dot2[1]],
        x1 = _a[0],
        y1 = _a[1],
        x2 = _a[2],
        y2 = _a[3];
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function limitToCircle(x, y, a, b, r) {
    var dist = distance([x, y], [a, b]);
    if (dist <= r) {
        return [x, y];
    } else {
        x = x - a;
        y = y - b;
        var radians = Math.atan2(y, x);
        return [Math.cos(radians) * r + a, Math.sin(radians) * r + b];
    }
}

function isInEllipse(mouseX, mouseY, ellipseX, ellipseY, ellipseW, ellipseH) {
    var dx = mouseX - ellipseX;
    var dy = mouseY - ellipseY;
    return ((dx * dx) / (ellipseW * ellipseW) + (dy * dy) / (ellipseH * ellipseH) <= 1);
}
var IS_HIGH_RES = window.matchMedia("\n      (-webkit-min-device-pixel-ratio: 2),\n      (min--moz-device-pixel-ratio: 2),\n      (-moz-min-device-pixel-ratio: 2),\n      (-o-min-device-pixel-ratio: 2/1),\n      (min-device-pixel-ratio: 2),\n      (min-resolution: 192dpi),\n      (min-resolution: 2dppx)\n    ");
var IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var IS_HIGH_RES_AND_MOBILE = (IS_HIGH_RES.matches && IS_MOBILE);
var Star =  (function() {
    function Star(container) {
        var size = container[0],
            depth = container[1];
        this.FORWARD_SPEED = 500;
        this.SIDEWAYS_SPEED = 100;
        if (IS_HIGH_RES_AND_MOBILE) {
            this.FORWARD_SPEED *= 2;
            this.SIDEWAYS_SPEED *= 2;
        }
        this.container = container;
        this.x = randRange(-size, size);
        this.y = randRange(-size, size);
        this.z = randRange(0, depth);

        this.px = this.x;
        this.py = this.y;
        this.pz = this.z;

        this.color = "rgb(".concat(randRange(110, 200), ",").concat(randRange(110, 240), ",").concat(randRange(230, 255), ")");
    }
    Star.prototype.resetX = function() {
        var _a = this.container,
            size = _a[0],
            _ = _a[1];
        this.x = randRange(-size, size);
        this.px = this.x;
    };
    Star.prototype.resetY = function() {
        var _a = this.container,
            size = _a[0],
            _ = _a[1];
        this.y = randRange(-size, size);
        this.py = this.y;
    };
    Star.prototype.resetZ = function() {
        var _a = this.container,
            _ = _a[0],
            depth = _a[1];
        this.z = randRange(0, depth);
        this.pz = this.z;
    };
    Star.prototype.update = function(deltaTime, container, xSpeed, zSpeed) {
        this.container = container;
        var size = container[0],
            depth = container[1];
        var sizeAndAQuarter = size + size / 4;
        var depthMinusAQuarter = depth - depth / 4;
        var defaultSpeed = this.FORWARD_SPEED;
        var defaultSideSpeed = this.SIDEWAYS_SPEED;
        if (zSpeed > 0) {
            var slowBy = mapRange(this.z, 0, depth, 1, 0.01);
            defaultSpeed *= slowBy;
        } else if (zSpeed < 0) {
            var slowBy = mapRange(this.z, 0, depth, 1, 0.1);
            defaultSpeed *= slowBy;
        }
        if (Math.abs(xSpeed) > 0) {
            var slowBy = mapRange(this.z, 0, size, 0.3, 0.4);
            defaultSideSpeed *= slowBy;
        }

        let movementFuzz = Math.sin(deltaTime) * randRange(-50, 50);
        this.y -= movementFuzz;
        // move forward, obvi
        this.z -= (defaultSpeed * zSpeed * deltaTime);
        // and sideways
        this.x -= defaultSideSpeed * xSpeed * deltaTime;
        // keep within bounds on z axis
        var fuzzyDepth = randRange(depth, depthMinusAQuarter);
        // keep within bounds on x axis
        var fuzzySize = randRange(size, sizeAndAQuarter);
        if (this.z < 1) { // z negative
            this.z = fuzzyDepth;
            this.pz = this.z;
            this.resetX();
            this.resetY();
        } else if (this.z > depth) { 
            this.z = 0;
            this.pz = this.z;
            this.resetX();
            this.resetY();
        } else if (this.x < -fuzzySize) { 
            this.x = size;
            this.px = this.x;
            this.resetY();
            this.resetZ();
        } else if (this.x > fuzzySize) { 
            this.x = -size;
            this.px = this.x;
            this.resetY();
            this.resetZ();
        } else if (this.y < -fuzzySize) { 
            this.y = size;
            this.py = this.y;
            this.resetX();
            this.resetZ();
        } else if (this.y > fuzzySize) { 
            this.y = -size;
            this.py = this.y;
            this.resetX();
            this.resetZ();
        }
    };
    Star.prototype.draw = function(context, container, screen, mouseX, mouseY) {
        var width = screen[0],
            height = screen[1];
        var size = container[0],
            depth = container[1];
        var sx = mapRange(this.x / this.z, 0, 1, 0, width);
        var sy = mapRange(this.y / this.z, 0, 1, 0, height);
        var px = mapRange(this.px / this.pz, 0, 1, 0, width);
        var py = mapRange(this.py / this.pz, 0, 1, 0, height);
        var maxRadius = (IS_HIGH_RES.matches && IS_MOBILE) ? 4 : 2;
        var radius = Math.min(Math.abs(mapRange(this.z, 0, depth, maxRadius, 0.01)), maxRadius);

        context.beginPath();
        context.arc(sx, sy, radius, 0, 2 * Math.PI);
        context.fillStyle = this.color;
        context.fill();
        this.px = this.x;
        this.py = this.y;
        this.pz = this.z;
 
        context.beginPath();
        context.moveTo(px, py);
        context.lineTo(sx, sy);
        context.lineWidth = radius;
        context.strokeStyle = this.color;
        context.stroke();
        
    };
    return Star;
}());
var getPointerInput = function(callback, element, delay) {
    if (element === void 0) { element = document; }
    if (delay === void 0) { delay = 600; }
    
    callback = callback || (function(pointer) {
        console.error("PointerInput is missing a callback as the first argument");
    });
    var pointer = {
        x: false,
        y: false,
        hasMoved: false,
        isMoving: false,
        wasMoving: false
    };
    var timer = false; 
    var animFrame = false; 
   
    var handlePointer = function(event) {
        
        if (animFrame) {
            animFrame = window.cancelAnimationFrame(animFrame);
        }
        
        animFrame = window.requestAnimationFrame(function() {
            var _a, _b;
            var x, y;
           
            if (event.touches) {
                _a = [event.touches[0].clientX, event.touches[0].clientY], x = _a[0], y = _a[1];
            } else {
                _b = [event.clientX, event.clientY], x = _b[0], y = _b[1];
            }
            pointer.x = x;
            pointer.y = y;
            
            if (!pointer.hasMoved) {
                pointer.hasMoved = true;
            }
           
            pointer.wasMoving = pointer.isMoving;
            pointer.isMoving = true;
            
            callback(pointer);
           
            if (timer) {
                timer = clearTimeout(timer);
            }
            
            timer = setTimeout(function() {
               
                pointer.wasMoving = pointer.isMoving;
                pointer.isMoving = false;
                
                callback(pointer);
            }, delay);
        });
    };

    element.addEventListener('touchstart', function(e) { return handlePointer(e); }, true);
    element.addEventListener('touchmove', function(e) { return handlePointer(e); }, true);
    element.addEventListener('mousemove', function(e) { return handlePointer(e); }, true);
    return false;
};
var StarField = (function() {
    function StarField(howManyStars, canvas, depth, UIFadeDelay) {
        var _this = this;
        if (depth === void 0) { depth = 2; }
        if (UIFadeDelay === void 0) { UIFadeDelay = 1; }
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.resizeTimer = false;
        this.isResizing = false;
        this.wasResizing = false;
        this.containerDepth = depth;
        this.setCanvasSize();
        this.howManyStars = howManyStars;
        this.stars = new Array(howManyStars);
        this.populateStarField();
        this.prevTime = 0;
        this.deltaTime = 0.1;
        this.xSpeed = 0;
        this.zSpeed = 1;
        this.mouseX = 0;
        this.mouseY = (canvas.offsetHeight * 0.25) - 66;
        this.UIFadeDelay = UIFadeDelay;
        
        var handlePointer = function(pointer) {
            var _a = _this.screen,
                width = _a[0],
                height = _a[1];
            _this.mouseX = pointer.x - width / 2;
            _this.mouseY = pointer.y - height / 2;
            _this.mouseMoved = pointer.hasMoved;
            _this.mouseMoving = pointer.isMoving;
            _this.zSpeed = mapRange(pointer.y, 0, height, 12, -4);
            _this.xSpeed = mapRange(pointer.x, 0, width, -10, 10);
            if (Math.abs(_this.xSpeed) > 2) {
                _this.zSpeed /= (Math.abs(_this.xSpeed) / 2);
            }
            if (_this.mouseY > 0) {
                _this.zSpeed /= 2;
            }
        };
        
        getPointerInput(handlePointer);
        this.mouseMoved = false;
        this.mouseMoving = false;
        this.mouseControlAlpha = 0.1;
        this.showMouseControls = true;
        this.pauseAnimation = false;
        
        this.render();
        window.addEventListener('resize', function() { return _this.handleResize(); }, true);
        
        window.addEventListener("beforeunload", function() { return _this.rePopulateStarField(); });
       
    }
   
    StarField.prototype.startRenderLoop = function() {
        var _this = this;
        var renderLoop = function(timestamp) {
            timestamp *= 0.001; 
            _this.deltaTime = timestamp - _this.prevTime;
            _this.prevTime = timestamp;
            if (!_this.pauseAnimation) {
                _this.clearCanvas();
                _this.render();
            }
            window.requestAnimationFrame(renderLoop);
        };
        window.requestAnimationFrame(renderLoop);
    };
    StarField.prototype.pause = function() {
        this.pauseAnimation = true;
    };
    StarField.prototype.play = function() {
        this.pauseAnimation = false;
    };
    StarField.prototype.setCanvasSize = function() {
       
        this.canvas.width = this.canvas.parentElement.offsetWidth;
        this.canvas.height = this.canvas.parentElement.offsetHeight;
        var width = canvas.offsetWidth,
            height = canvas.offsetHeight,
            size = Math.max(width, height),
            depth = size * this.containerDepth,
            screen = [width, height],
            container = [size, depth];
        
        this.container = container;
        this.screen = screen;
       
        this.context.translate(width / 2, height / 2);
    };
    StarField.prototype.populateStarField = function() {
        
        for (var i = 0; i < this.stars.length; i++) {
            this.stars[i] = new Star(this.container);
        }
    };
    StarField.prototype.emptyStarField = function() {
        this.stars = new Array(this.howManyStars);
    };
    StarField.prototype.rePopulateStarField = function() {
        this.emptyStarField();
        this.populateStarField();
        return null;
    };
    StarField.prototype.clearCanvas = function() {
        var _a = this.container,
            size = _a[0],
            depth = _a[1];
        this.context.clearRect(-size / 2, -size / 2, size, size);
    };
    StarField.prototype.drawMouseControl = function() {
        var context = this.context;
        var _a = this.screen,
            width = _a[0],
            height = _a[1];
        var ellipseX = 0,
            ellipseY = height * 0.25;
        var ellipseW = 50,
            ellipseH = 21;
        ellipseH *= mapRange(this.mouseY, -height / 2 + ellipseY, height / 2 + ellipseY, 0.8, 1.2);
        var pointIsInEllipse = isInEllipse(this.mouseX, this.mouseY, ellipseX, ellipseY, ellipseW, ellipseH);
        if (pointIsInEllipse) {
            this.xSpeed = 0;
            this.zSpeed = 0;
        }
    };
    StarField.prototype.render = function() {
        if (this.showMouseControls) {
            if (!this.mouseMoved || this.mouseMoving) {
                
                this.mouseControlAlpha = 0.3;
                this.drawMouseControl();
            } else {
               
                this.mouseControlAlpha -= (0.25 * this.deltaTime) / this.UIFadeDelay;
                this.drawMouseControl();
            }
        }
        
        for (var i = 0; i < this.stars.length; i++) {
            if (!this.pauseAnimation) {
                this.stars[i].update(this.deltaTime, this.container, this.xSpeed, this.zSpeed);
            }
            this.stars[i].draw(this.context, this.container, this.screen, this.mouseX, this.mouseY);
        }
    };
    StarField.prototype.rePopOnResizeStop = function() {
        if (this.isResizing && !this.wasResizing) {
            
        }
        if (!this.isResizing && this.wasResizing) {
            
            this.rePopulateStarField();
        }
    };
    StarField.prototype.handleResize = function() {
        var _this = this;
        this.pause();
        
        if (this.resizeTimer) {
            this.resizeTimer = clearTimeout(this.resizeTimer);
        }
        this.wasResizing = this.isResizing;
        if (!this.isResizing) {
            this.isResizing = true;
        }
        this.rePopOnResizeStop();
        if (this.pauseAnimation) {
            window.requestAnimationFrame(function() {
                _this.setCanvasSize();
                _this.render();
            });
        }
        this.resizeTimer = setTimeout(function() {
            _this.wasResizing = _this.isResizing;
            _this.isResizing = false;
            _this.rePopOnResizeStop();
            _this.setCanvasSize();
            _this.play();
        }, 200);
    };
    StarField.prototype.handleOrientation = function(event) {
       
    };
    return StarField;
}());

function setup() {
    var canvas = document.getElementById('canvas');
    var starCount = 1000;
    if (IS_MOBILE)
        starCount = 500;
    var starfield = new StarField(starCount, canvas);
    starfield.startRenderLoop();

}
window.onload = setup();

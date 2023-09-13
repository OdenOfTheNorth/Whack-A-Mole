var InputManager = pc.createScript('inputManager');
InputManager.attributes.add('gameLogicsEntity', {type: 'entity', default: null, title: 'Game Logics Entity'});
InputManager.attributes.add('cameraEntity', {type: 'entity', default: null, title: 'Camera Entity'});

// initialize code called once per entity
InputManager.prototype.initialize = function() {
    this.gameLogics = this.gameLogicsEntity.script.gameLogics;
    
    this._mouseWasPressedThisFrame = false;
    this.mouseWasPressedThisFrame = false;

    this._spaceWasPressedThisFrame = false;
    this.spaceWasPressedThisFrame = false;

    this._wasMouseDown = false;
    this._isMouseDown = false;
    this._mousePos = null;
    this._mouseDownTimer = 0.0;

    this.isMouseDown = false;
    this.isMousePressed = false;
    this.mousePos = null;
    /*start*/
    if(this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStartEndCancel, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this);
        this.app.touch.on(pc.EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this);

        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);

        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
        this.app.touch.on(pc.EVENT_TOUCHCANCEL, this.onTouchCancel, this);

        this.on('destroy', function() {
            this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStartEndCancel, this);
            this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this);
            this.app.touch.off(pc.EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this);
            this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);

            this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
            this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
            this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchEnd, this);
            this.app.touch.off(pc.EVENT_TOUCHCANCEL, this.onTouchCancel, this);
        });
    } else /*end*/{
        
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);

        this.on('destroy', function() {
            this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
            this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
            this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);

        }, this);
    }
};


InputManager.prototype.onTouchStart = function (event) {
    // For the demo, we only work with the first registered touch
    if (event.touches.length === 1) {
        //this.changeMaterial(this.redMaterial);
        //this.updateFromScreen(event.touches[0]);
    }
    this._mouseDownTimer = 0.0;

    this._mouseWasPressedThisFrame = true;

    // Needs to be called to remove 300ms delay and stop 
    // browsers consuming the event for something else
    // such as zooming in
    event.event.preventDefault();
};


InputManager.prototype.onTouchMove = function (event) {
    // Use only the first touch screen x y position to move the entity
    //this.updateFromScreen(event.touches[0]);
    
    if(event){
        //this._mousePos.x = event.touches[0].x;
        //this._mousePos.y = event.touches[0].y;
    }

    var touches = event.touches;
    this._mousePos = new pc.Vec2(touches[0].x, touches[0].y);

    
    event.event.preventDefault();
};


InputManager.prototype.onTouchEnd = function (event) {
    // Change the material only if the last touch has ended
    if (event.touches.length === 0) {
        //this.changeMaterial(this.greenMaterial);
    }

    this._isMousePressed = true;

    /*if(this._mouseDownTimer < 0.5){
        this._isMousePressed = true;
    }*/
    
    event.event.preventDefault();
};


InputManager.prototype.onTouchCancel = function (event) {
    // Change the material only if the last touch has ended
    if (event.touches.length === 0) {
        //this.changeMaterial(this.greenMaterial);
    }
    
    event.event.preventDefault();
};

InputManager.prototype.onTouchStartEndCancel = function (event) {
    var touches = event.touches;    
    if(!this.gameLogics.isCursorInScreen){
        this._mouseDownTimer = 1000;
        this._isMouseDown = false;
        this._wasMouseDown = false;
        this.mousePos = null;
    }
    else if (touches.length == 1) {
        this._mouseDownTimer = 0.0;
        this._isMouseDown = true;
        this._mousePos = new pc.Vec2(touches[0].x, touches[0].y);
    
    } else if(touches.length == 0) {
        this._mousePos = null;
        this._isMouseDown = false;
    } else {
        //Hack when using multiple fingers
        this._isMouseDown = false;
        this._wasMouseDown = false;
        this._mousePos = null;
    }
};

InputManager.prototype.onMouseMove = function (event) {
    if(this._mousePos) {// && event.button === pc.MOUSEBUTTON_LEFT
        this._mousePos.x = event.x;
        this._mousePos.y = event.y;
    } else {
        this._mousePos = new pc.Vec2(event.x, event.y);
    }
};

InputManager.prototype.onMouseDown = function (event) {
    if (event.button === pc.MOUSEBUTTON_LEFT && this.gameLogics.isCursorInScreen) {
        this._mouseDownTimer = 0.0;
        this._isMouseDown = true;
        
        this._mouseWasPressedThisFrame = true;
    }
};

InputManager.prototype.onMouseUp = function (event) {
    if (event.button === pc.MOUSEBUTTON_LEFT && this.gameLogics.isCursorInScreen) {
        this._isMouseDown = false;
        if(this._mouseDownTimer < 0.5){
            this._isMousePressed = true;
        }
    }
};

// update code called every frame
InputManager.prototype.update = function(dt) {

    this.mouseWasPressedThisFrame = this._mouseWasPressedThisFrame;
    this.isMouseDown = this._isMouseDown;
    this.isMousePressed = this._isMousePressed;//!this.isMouseDown && this._wasMouseDown && this._mouseDownTimer < 0.5;
    //this._wasMouseDown = this.isMouseDown;
    this._isMousePressed = false;
    this._mouseWasPressedThisFrame = false;

    if(this._mousePos != null)
        this.mousePos = this._mousePos.clone();
    
    //Hack to keep mousepos for 1 frame on phone-touch release 
    if(this._mousePos == null && !this.isMousePressed)
        this.mousePos = null;//*/
    
    this._mouseDownTimer += dt;

    if(this.app.keyboard.wasPressed(pc.KEY_SPACE)){
        this._spaceWasPressedThisFrame = true;
    }
 
    this.spaceWasPressedThisFrame = this._spaceWasPressedThisFrame;
    this._spaceWasPressedThisFrame = false;
};
var PixClicker = pc.createScript('pixClicker');

var popUpTextType = {PointsToAdd: 0, CurrentCombo: 1, CurrentPoints: 2}; 
var onClikedType = {Nothing: 0, PopUpText: 1, Particals: 2, PopUpTextAndParticals: 3}; 

//pressedWrongAsset SkullAsset goldenAsset heighLightAsset

PixClicker.attributes.add('toShow', {
    type: 'number',
    enum: Object.entries(popUpTextType).map(kvp => {var e = {}; e[kvp[0]] = kvp[1]; return e;}),
    default: 1
});

PixClicker.attributes.add('onCliked', {
    type: 'number',
    enum: Object.entries(onClikedType).map(kvp => {var e = {}; e[kvp[0]] = kvp[1]; return e;}),
    default: 1
});

PixClicker.attributes.add('maxPoints', {
    type: 'number',
    default: 3,
});

PixClicker.attributes.add ("reactionManagerEntity",{
    type: "entity",
    default: 0
});

PixClicker.attributes.add ("inputManagerEntity",{
    type: "entity",
    default: 0
});

PixClicker.attributes.add ("gameUtilitiesEntity",{
    type: "entity",
    default: 0
});

PixClicker.attributes.add ("pixGridEntity",{
    type: "entity",
    default: 0
});

PixClicker.attributes.add ("cameraEntity",{
    type: "entity",
    default: 0
});


PixClicker.attributes.add('pickAreaScale', {
    type: 'number',
    title: 'Pick Area Scale',
    description: '1 is more accurate but worse performance. 0.01 is best performance but least accurate. 0.25 is the default.',
    default: 0.25,
    min: 0.01,
    max: 1
});

PixClicker.attributes.add('layerNames', {
    type: 'string',
    title: 'Layers Names',
    array: true,
    description: 'Layer names from which objects will be picked from.',
    default: ['World']
});

PixClicker.attributes.add('camera', {type: 'entity', default: null, title: 'Camera Entity'});

// initialize code called once per entity
PixClicker.prototype.initialize = function() {

    this.gameUtilities = this.gameUtilitiesEntity.script.gameUtilities;
    this.inputManager = this.inputManagerEntity.script.inputManager;
    this.reactionGrid = this.pixGridEntity.script.reactionGrid;
    this.manager = this.reactionManagerEntity.script.reactionManager;
    
    this.currentIndex = 0;

    //Create a frame buffer picker with a scaled resolution
    var canvas = this.app.graphicsDevice.canvas;
    var canvasWidth = parseInt(canvas.clientWidth, 10);
    var canvasHeight = parseInt(canvas.clientHeight, 10);
    //this.camera = this.camera.camera;

    this.picker = new pc.Picker(this.app, canvasWidth * this.pickAreaScale, canvasHeight * this.pickAreaScale);
    this.layers = [];
    for (var i = 0; i < this.layerNames.length; ++i) {
        var layer = this.app.scene.layers.getLayerByName(this.layerNames[i]);
        if (layer) {
            this.layers.push(layer);
        }
    }
};

PixClicker.prototype.update = function(dt) {
    
    if(!this.manager.isPlaying){
        return;
    }
    
    var isMousePressed = this.inputManager.mouseWasPressedThisFrame;//isMousePressed
    var isMouseDown = this.inputManager.isMouseDown;
    var mousePos = this.inputManager.mousePos;
    
    //Check if click on PIX
    if(isMousePressed && mousePos) {

        var pickedEntity = this.getPixEntityAtMousePos();

        if(pickedEntity == null)
            return;

        if(!pickedEntity.enabled)
            return;

        var pickedScript = pickedEntity.script.pixTile;

        if(pickedScript == null)
            return;

        if(pickedScript.pixWasCliked)
            return;

        this.manager.clickedPix(pickedEntity);
    }
};

PixClicker.prototype.getPointsToAdd = function(script) {
    var pointsToAdd = 0;

    if(script == null){
        console.log("pixScript is null");
        return;
    }

    var timeDiff = script.maxStayTime / this.maxPoints;
    var currentTime = script.getCurrentTime();

    for(var i = 0; i < this.maxPoints; i++){
        var timeDiffrence = timeDiff * i;
        if(currentTime > timeDiffrence){
            pointsToAdd++;
        }
    }

    return pointsToAdd;
};

PixClicker.prototype.getEntityAtScreenPos = function (screenPos, entityScriptName) {
    
    var canvas = this.app.graphicsDevice.canvas;
    var canvasWidth = parseInt(canvas.clientWidth, 10);
    var canvasHeight = parseInt(canvas.clientHeight, 10);

    var camera = this.camera.camera;
    var scene = this.app.scene;
    var picker = this.picker;

    picker.resize(canvasWidth * this.pickAreaScale, canvasHeight * this.pickAreaScale);
    picker.prepare(camera, scene, this.layers);

    // Map the mouse coordinates into picker coordinates and
    // query the selection
    var x = Math.floor(screenPos.x * (picker.width / canvasWidth));
    var y = picker.height - Math.floor(screenPos.y * (picker.height / canvasHeight));
    var selected = picker.getSelection({
        x: x,
        y: y
    });

    console.log(selected.length);

    var entity = null;

    if (selected.length > 0 && selected[0] && selected[0].node) {
        // Get the graph node used by the selected mesh instance
        entity = selected[0].node;
        console.log("in if statment");
        // Bubble up the hierarchy until we find an actual Entity
        // that has the name we are looking for
        while (entity !== null && (!(entity instanceof pc.Entity) || !entity.script || !entity.script[entityScriptName])) { 
            entity = entity.parent;
            console.log("in while loop");
        }

        if (entity) {
            return entity;
        }
    }

    console.log(entity);

    return entity;
};

PixClicker.prototype.getLinePlaneIntersection = function(p0, p1, co, cn) {
    var epsilon = 1e-6;
    
    var u = new pc.Vec3().sub2(p1, p0);
    var dot = cn.dot(u);

    //if (dot != 0) {
    if (Math.abs(dot) > epsilon) {
        var w = new pc.Vec3().sub2(p0, co);
        var fac = -cn.dot(w)/dot;
        u.mulScalar(fac);
        return new pc.Vec3().add2(p0, u);
    }

    return null;
};

PixClicker.prototype.getPixEntityAtMousePos = function() {
    var mousePos = this.inputManager.mousePos;
    var posOnPlane = this.calculateScreenPosOnOrigoPlane(mousePos);
    if(posOnPlane) {
        var pixCord = this.reactionGrid.getPixCordFromPosition(posOnPlane);
        return this.reactionGrid.getPix(pixCord);
    }
    else
        return null;
    /*var mousePos = this.inputManager.mousePos;
    var pickedEntity = this.gameUtilities.getEntityAtScreenPos(mousePos, "pixScript");
    return pickedEntity;*/
};

PixClicker.prototype.calculateScreenPosOnPlane = function(screenPos, planePos, planeNorm) {
    var from = this.camera.camera.screenToWorld(screenPos.x, screenPos.y, this.camera.camera.nearClip);
    var to = this.camera.camera.screenToWorld(screenPos.x, screenPos.y, this.camera.camera.farClip);
    return this.getLinePlaneIntersection(from, to, planePos, planeNorm);
    //var posOnPlane = this.getLinePlaneIntersection(from, to, planePos, planeNorm);
    //return posOnPlane;
};

PixClicker.prototype.calculateScreenPosOnOrigoPlane = function(screenPos) {
    return this.calculateScreenPosOnPlane(screenPos, new pc.Vec3(0, 0.4, 0), new pc.Vec3(0, 1, 0));
};
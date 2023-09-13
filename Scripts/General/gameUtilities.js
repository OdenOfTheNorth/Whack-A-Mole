var GameUtilities = pc.createScript('gameUtilities');

GameUtilities.attributes.add('pickAreaScale', {
    type: 'number',
    title: 'Pick Area Scale',
    description: '1 is more accurate but worse performance. 0.01 is best performance but least accurate. 0.25 is the default.',
    default: 0.25,
    min: 0.01,
    max: 1
});

GameUtilities.attributes.add('layerNames', {
    type: 'string',
    title: 'Layers Names',
    array: true,
    description: 'Layer names from which objects will be picked from.',
    default: ['World']
});

GameUtilities.attributes.add('camera', {type: 'entity', default: null, title: 'Camera Entity'});

// initialize code called once per entity
GameUtilities.prototype.initialize = function() {

    // Create a frame buffer picker with a scaled resolution
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

GameUtilities.prototype.getEntityAtScreenPos = function (screenPos, entityScriptName) {
    
    var canvas = this.app.graphicsDevice.canvas;
    var canvasWidth = parseInt(canvas.clientWidth, 10);
    var canvasHeight = parseInt(canvas.clientHeight, 10);

    var camera = this.camera.camera;
    var scene = this.app.scene;
    var picker = this.picker;

    //console.log(camera);

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

    var temp = 0;

    if (selected.length > 0 && selected[0] && selected[0].node) {//&& selected[0] && selected[0].node
        // Get the graph node used by the selected mesh instance
        var entity = selected[0].node;
        //console.log(entity);
        // Bubble up the hierarchy until we find an actual Entity
        // that has the name we are looking for
        while (entity !== null && (!(entity instanceof pc.Entity) || !entity.script || !entity.script[entityScriptName])) { 
            entity = entity.parent;
            console.log(entity.script[entityScriptName]);
            temp++;
        }

        if (entity) {
            //console.log("entity selected.length = " + selected.length + " temp " + temp);
            return entity;
        }
    }

    //console.log("selected.length = " + selected.length + " temp " + temp);

    return null;
};

GameUtilities.prototype.getLinePlaneIntersection = function(p0, p1, co, cn) {
    var epsilon = 1e-6;
    
    var u = new pc.Vec3().sub2(p1, p0);
    var dot = cn.dot(u);

    
    if (Math.abs(dot) > epsilon) {
        var w = new pc.Vec3().sub2(p0, co);
        var fac = -cn.dot(w)/dot;
        u.mulScalar(fac);
        return new pc.Vec3().add2(p0, u);
    }

    return null;
};

GameUtilities.prototype.calculateScreenPosOnPlane = function(screenPos, planePos, planeNorm) {
    var from = this.camera.camera.screenToWorld(screenPos.x, screenPos.y, this.camera.camera.nearClip);
    var to = this.camera.camera.screenToWorld(screenPos.x, screenPos.y, this.camera.camera.farClip);

    var posOnPlane = this.getLinePlaneIntersection(from, to, planePos, planeNorm);

    return posOnPlane;

};


GameUtilities.prototype.calculateScreenPosOnOrigoPlane = function(screenPos) {
    return this.calculateScreenPosOnPlane(screenPos, new pc.Vec3(0, 0, 0), new pc.Vec3(0, 1, 0));
};

var HitMarker = pc.createScript('hitMarker');

// initialize code called once per entity
HitMarker.prototype.initialize = function() {
    this.spawnedTime = 0;
};

// update code called every frame
HitMarker.prototype.update = function(dt) {

};

// swap method called for script hot-reloading
// inherit your script state here
// HitMarker.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/
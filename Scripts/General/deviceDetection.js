var DeviceDetection = pc.createScript('deviceDetection');

DeviceDetection.attributes.add('desktopUI', {
    type: 'entity',
    default: null,
    title: 'Desktop UI',
});


DeviceDetection.attributes.add('portraitUI', {
    type: 'entity',
    default: null,
    title: 'Portrait UI',
});

DeviceDetection.attributes.add('cameraEntity', {
    type: 'entity',
    default: null,
});

DeviceDetection.attributes.add('portraitOrthoHeight', {
    type: 'number',
    default: 15
});

DeviceDetection.attributes.add('desktopOrthoHeight', {
    type: 'number',
    default: 9
});

// initialize code called once per entity
DeviceDetection.prototype.initialize = function() {
    
};

DeviceDetection.prototype.onWindowResize = function() {
    // console.log("window width: " + window.innerWidth + ": " + this.widthThreshold);    
    
    var w = window.innerWidth;
	var h = window.innerHeight;
	//console.log(w + " : " + h);

	if(w > h){
		//console.log("Desktop mode");
        this.desktopUI.enabled = true;
        this.portraitUI.enabled = false;
        //this.cameraEntity.camera.orthoHeight = this.desktopOrthoHeight;
	}
	else{
		//console.log("Mobile portrait mode");
        this.desktopUI.enabled = false;
        this.portraitUI.enabled = true;
        //this.cameraEntity.camera.orthoHeight = this.portraitOrthoHeight;
	}
};


// update code called every frame
DeviceDetection.prototype.update = function(dt) {
    this.onWindowResize();
};

// swap method called for script hot-reloading
// inherit your script state here
// DeviceDetection.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/
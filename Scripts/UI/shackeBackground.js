var ShackeBackground = pc.createScript('shackeBackground');

// initialize code called once per entity
ShackeBackground.prototype.initialize = function() {

    this.sBackground = false;
    this.duration = 2;
    this.offset = 0.1;
    this.currentTime = 0;
    this.lerpTimer = 0;
    this.origin = this.entity.getPosition();
};

// update code called every frame
ShackeBackground.prototype.update = function(dt) {

    //this.shackeBackground = true;

    if(this.sBackground){

        this.currentTime += dt * 10;
        
        if(this.currentTime >= this.duration){
            this.sBackground = false;
            this.currentTime = 0;
            return;
        }

        var position = this.entity.getPosition();

        position.x = Math.sin(this.currentTime * 3) * 0.2; 
        position.z = Math.cos(this.currentTime) * 0.1; 

        this.entity.setPosition(position);
    }else{
        this.lerpTimer += dt;
        this.lerpTimer = Clamp(this.lerpTimer, 0, 1);
        var position = this.entity.getPosition();
        position.x = Lerp(position.x, this.origin.x, this.lerpTimer);
        position.z = Lerp(position.z, this.origin.z, this.lerpTimer);
        this.entity.setPosition(position);
    }
};

ShackeBackground.prototype.startScreenShake = function(dt) {
    this.sBackground = true;
};
var ParticalScript = pc.createScript('particalScript');

ParticalScript.attributes.add('spriteEntity',   {   type: 'entity'});

ParticalScript.prototype.initialize = function() {
    this.currentLifeTime = 0;
    this.lifeTime = 0;
};

ParticalScript.prototype.update = function(dt) {

    this.currentLifeTime += dt;

    if(this.currentLifeTime >= this.lifeTime){
        this.endParticalSystem();
    }
};

ParticalScript.prototype.endParticalSystem = function() {
    //console.log("entity name = " + this.entity.name);
    this.entity.enabled = false;
};

ParticalScript.prototype.startPlaying = function(lifeTime) {
    this.entity.particlesystem.reset();
    this.entity.particlesystem.play();

    if(this.spriteEntity){
        this.spriteEntity.enabled = true;
        //this.spriteEntity.sprite.play('Clip'); 
        var spriteComp = this.spriteEntity.sprite;
        if(spriteComp)
            spriteComp.play('Clip'); 
        else
            console.log("did not find sprite comp");
    }
    this.lifeTime = this.entity.particlesystem.lifetime;
    this.currentLifeTime = 0;

    //console.log("startPlaying");
};

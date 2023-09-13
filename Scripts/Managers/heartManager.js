var HeartManager = pc.createScript('heartManager');

HeartManager.attributes.add('reactionManagerEntity', {
    type: 'entity',
    default: null, 
});

HeartManager.attributes.add('heartEntity', {
    type: 'entity',
    default: null, 
});

HeartManager.prototype.initialize = function() {
    console.log("heartManager")
    this.shakeHearts = false;
    this.oldHealth = 0;

    this.oldLength = 0;
    this.t = 0;
    this.value = 0;

    this.reactionManager = this.reactionManagerEntity.script.reactionManager;
    this.hearts = [];

    this.pos = this.entity.getPosition();

    for(var i = 0; i < this.reactionManager.maxLives; i++){
        var clone = this.heartEntity.clone();
        this.entity.addChild(clone);
        this.hearts.push(clone);
    }
};

// update code called every frame
HeartManager.prototype.update = function(dt) {
    
    if(this.shakeHearts){
        this.t += dt;
        this.value += dt * 100;

        var x = this.pos.x + (Math.sin(this.value) * 0.01);
        var y = this.pos.y + (Math.cos(this.value) * 0.01);

        this.entity.setPosition(new pc.Vec3( x, y, 0));

        if(this.t >= 0.2){
            this.shakeHearts = false;
            this.t = 0;
            this.value = 0;
        }

    }else{
        this.entity.setPosition(this.pos);
    }

    var currentHealth = 0;
    var i = 0;

    for(i = 0; i < this.reactionManager.maxLives; i++){
        this.hearts[i].enabled = false;
    }
    
    for(i = 0; i < this.reactionManager.lives; i++){
        if (i >= this.reactionManager.maxLives)
            continue;
        this.hearts[i].enabled = true;
        currentHealth++;
    }

    if(this.oldHealth != currentHealth){
        this.shakeHearts = true;
        this.oldHealth = currentHealth;
    }
};

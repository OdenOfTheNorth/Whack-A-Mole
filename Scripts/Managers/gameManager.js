var GameManager = pc.createScript('gameManager');

GameManager.attributes.add('reactionManagerEntity', {
    type : "entity",
    default: null
});

// initialize code called once per entity
GameManager.prototype.initialize = function() {
    this.reactionManager = this.reactionManagerEntity.script.reactionManager;
    this.timer = 0;
    this.doOnce = true;
};

// update code called every frame
GameManager.prototype.update = function(dt) {
    this.timer += dt;

    if(this.doOnce){//this.timer >= 4 &&
        //this.reactionManager.startGame();
        this.reactionManager.startCountDown();
        this.doOnce = false;
    }
};
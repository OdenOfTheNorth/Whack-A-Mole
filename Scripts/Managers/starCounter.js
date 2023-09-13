var StarCounter = pc.createScript('starCounter');

// initialize code called once per entity
StarCounter.prototype.initialize = function() {
    console.log("starCounter");
    this.showStars(0);
};

// update code called every frame
StarCounter.prototype.update = function(dt) {

};

StarCounter.prototype.showStars = function(amount) {
    var length = this.entity.children.length;

    for(var i = 0; i < length; i++){
        
        var entity = this.entity.children[i];

        if(!entity){
            continue;
        }

        if(i < amount){
            entity.element.opacity = 1.0;
        }else{
            entity.element.opacity = 0.5;
        }        
    }
};
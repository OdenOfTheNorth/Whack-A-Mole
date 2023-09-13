var CircularProgressBar = pc.createScript('circularProgressBar');
CircularProgressBar.attributes.add('loadingEntity', {type: 'entity'});
CircularProgressBar.attributes.add('progressEntity', {type: 'entity'});
CircularProgressBar.attributes.add('doneEntity', {type: 'entity'});

CircularProgressBar.prototype.initialize = function() {
    this.t = 0;
    //this.progress = 0;
    this.setProgress(0);
};

CircularProgressBar.prototype.update = function(dt) {
    this.t += dt;
    var value = Math.abs(Math.sin(this.t));
    this.setProgress(value);
    //console.log("value = " + value + " t = " + Math.ceil(this.t));
};


// Set progress - value is between 0 and 1
CircularProgressBar.prototype.setProgress = function (value) {

    //console.log("value = " + value);

    value = pc.math.clamp(value, 0, 1);
    if(value != this.progress) {
        console.log("progress = " + this.progress);

        var material = this.material;
        if(!material) {
            if(this.progressEntity.element){
                material = this.progressEntity.children[1].element.materialAsset;
                console.log("element");
            }else{
                material = this.progressEntity.render.meshInstances[0].material.clone();
                console.log("renderer");
            }
            
            this.material = material;

            if(this.progressEntity.element){
                this.progressEntity.children[1].element.materialAsset = material;
            }else{
                this.progressEntity.render.meshInstances[0].material = material;
            }

            //this.progressEntity.render.meshInstances[0].material = material;
        }
        material.setParameter('uProgress', Math.max(value, 1.0/360.0));
        this.progress = value;
        if(this.progress >= 1.0) {
            this.loadingEntity.enabled = false;
            this.progressEntity.enabled = false;
            this.doneEntity.enabled = true;
        } else if(this.progress < 1.0 && this.doneEntity.enabled) {
            this.loadingEntity.enabled = true;
            this.progressEntity.enabled = true;
            this.doneEntity.enabled = false;
        }
    }
};

// Set progress - value is between 0 and 1
CircularProgressBar.prototype.getProgress = function () {
    if(this.progress)
        return this.progress;
    else
        return 0.0;
};
    
var ChangeText = pc.createScript('changeText');

ChangeText.attributes.add('sizeIncrease', {
    type: 'number',
    default: 1.3
});

ChangeText.attributes.add('speed', {
    type: 'number',
    default: 5
});

ChangeText.attributes.add('increase', {
    type: 'boolean',
    default: true
});


ChangeText.attributes.add('scriptEntity', {
    type: 'entity',
    description: 'The entity we want to call a script on'
});
ChangeText.attributes.add('scriptName', {type: 'string', description: "The name of the script", default: "reactionManager"});

ChangeText.attributes.add('functionName', {type: 'string', description: "The name of the function", default: "get"});

// initialize code called once per entity
ChangeText.prototype.initialize = function() {
    this.originalSize = this.entity.element.fontSize;
    this.lerpTime = 0;
    this.entity.element.text = this.scriptEntity.script.get(this.scriptName)[this.functionName]();
};

// update code called every frame
ChangeText.prototype.update = function(dt) {
    var string = this.scriptEntity.script.get(this.scriptName)[this.functionName]();

    if(this.increase){
        if(this.entity.element.text != string){
            this.updateText = true;
            this.entity.element.text = string;
            this.lerpTime = 0;
        }

        if(this.updateText){
            this.lerpTime += dt * this.speed;
            this.entity.element.fontSize = Lerp(this.originalSize, this.sizeIncrease * this.originalSize, this.lerpTime);

            if(this.lerpTime >= 1){
                this.entity.element.text = string;
                this.lerpTime = 0;
                this.entity.element.fontSize = this.originalSize;
                this.updateText = false;
            }
        }
    }else{
        if(this.entity.element.text != string){
            this.updateText = true;
            this.entity.element.text = string;
            this.lerpTime = 1;
        }

        if(this.updateText){
            this.lerpTime -= dt * this.speed;
            this.entity.element.fontSize = Lerp(this.sizeIncrease * this.originalSize, this.originalSize, this.lerpTime);

            if(this.lerpTime <= 0){//this.entity.element.fontSize <= this.sizeIncrease * this.originalSize
                this.entity.element.text = string;
                this.lerpTime = 0;
                //this.lerpTime = Math.max(0, Math.min(this.lerpTime, 1));
                this.lerpTime = Clamp(this.lerpTime, 0, 1);
                this.entity.element.fontSize = this.originalSize;
                this.updateText = false;
            }
        }
    }
};
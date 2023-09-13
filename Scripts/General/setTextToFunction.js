var SetTexToToFunction = pc.createScript('setTextToFunction');

SetTexToToFunction.attributes.add('scriptEntity', {
    type: 'entity',
    description: 'The entity we want to call a script on'
});
SetTexToToFunction.attributes.add('scriptName', {type: 'string', description: "The name of the script", default: "Reaction"});

SetTexToToFunction.attributes.add('functionName', {type: 'string', description: "The name of the function", default: "Get"});

// initialize code called once per entity
SetTexToToFunction.prototype.initialize = function() {
    if(this.scriptEntity == null){
        this.scriptEntity = this.entity.children[0];
    }
};


// update code called every frame
SetTexToToFunction.prototype.update = function(dt) {
    this.entity.element.text = this.scriptEntity.script.get(this.scriptName)[this.functionName]();
};

var CallScriptFunctionOnbuttonPress = pc.createScript('callScriptFunctionOnbuttonPress');
CallScriptFunctionOnbuttonPress.attributes.add('scriptEntity', {
    type: 'entity',
    description: 'The entity we want to call a script on'
});
CallScriptFunctionOnbuttonPress.attributes.add('scriptName', {type: 'string', description: "The name of the script", default: "gameInterface"});
CallScriptFunctionOnbuttonPress.attributes.add('functionName', {type: 'string', description: "The name of the function", default: "printLol"});
CallScriptFunctionOnbuttonPress.attributes.add('parameters', {type: 'string', description: "parameters to the function", array: true,  default: []});

// initialize code called once per entity
CallScriptFunctionOnbuttonPress.prototype.initialize = function() {
    //console.log(this.parameters);
    this.entity.button.on('click', function(event) {
    this.scriptEntity.script.get(this.scriptName)[this.functionName](this.parameters); 
    }, this);
};

// update code called every frame
CallScriptFunctionOnbuttonPress.prototype.update = function(dt) {
    
};
var ToggleEntityEnableOnbuttonPush = pc.createScript('toggleEntityEnableOnbuttonPush');

//ToggleEntityEnableOnbuttonPush.attributes.add('scriptName', {type: 'string', description: "The name of the script", default: "gameInterface"});

ToggleEntityEnableOnbuttonPush.attributes.add('entityToEnable', {type: "entity", description: "entity to enable", default: null});


// initialize code called once per entity
ToggleEntityEnableOnbuttonPush.prototype.initialize = function() {
    this.entity.button.on('click', function(event) {
        this.entityToEnable.enabled = !this.entityToEnable.enabled;
    }, this);
};

// update code called every frame
ToggleEntityEnableOnbuttonPush.prototype.update = function(dt) {
    
};
var PlaySoundOnenterButton = pc.createScript('playSoundOnenterButton');

PlaySoundOnenterButton.attributes.add('soundName', {type: 'string', default: ""});

// initialize code called once per entity
PlaySoundOnenterButton.prototype.initialize = function() {
    this.entity.button.on('mouseenter', function(event) {
        this.playSound();
    }, this);
};

PlaySoundOnenterButton.prototype.playSound = function() {
    console.log("play Sound " + this.soundName);
    this.entity.sound.play(this.soundName);
};

// update code called every frame
PlaySoundOnenterButton.prototype.update = function(dt) {

};
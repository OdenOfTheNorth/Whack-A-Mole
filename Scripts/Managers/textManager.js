var TextManager = pc.createScript('textManager');

TextManager.attributes.add('reactionTextEntity',{
    type: 'entity',
    default: null
});

TextManager.attributes.add('comboCounterEntity',{
    type: 'entity',
    default: null
});

var textType = { Combo: 0, ShockeWave: 1, Golden: 2, Red: 3};

TextManager.prototype.initialize = function() {
    this.settings = this.entity.script.textSettings;
    this.manager = this.entity.script.reactionManager;
    this.originalTimerSize = this.settings.timerEntity.element.fontSize;
    this.originalCountDownSize = this.settings.startCountDownEntity.element.fontSize;

    this.lerpTime = 0;
    this.lerpCountDown = 0;
    this.startLerpTime = false;
    this.oldText = "";

    this.decrease = true;

    this.tmer = [];

    this.manager.on('addComboToScore', function(event) {
        this.comboCounterEntity.enabled = false;
    }, this);
};

TextManager.prototype.update = function(dt) {    
    this.handleTimer(dt);
    this.handleCountDown(dt);   
};

TextManager.prototype.handleTimer = function(dt) {
    var time = this.manager.getTime();
    
    if(time <= 5 || time == 10 || time == 20 || time == 30){
        this.lerpTime -= dt * 5;    

        if(this.settings.timerEntity.element.text != time){
            this.lerpTime = 1;
        }
        
        this.lerpTime = Clamp(this.lerpTime, 0, 1);
        var scale = Lerp( 1, 1.5, this.lerpTime);
        this.settings.timerEntity.setLocalScale(scale, scale, scale);
        this.settings.timerEntity.element.opacity = Lerp( 0.6, 1, this.lerpTime);
    }else{
        this.settings.timerEntity.setLocalScale(1, 1, 1);
        this.settings.timerEntity.element.opacity = 1;
    }

    this.settings.timerEntity.element.text = time;
};

TextManager.prototype.handleCountDown = function(dt) {
    
    var countDown = this.manager.getCurrentStartTime();
    this.lerpCountDown -= dt * 1;    

    if(this.settings.startCountDownEntity.element.text != countDown){
        this.lerpCountDown = 1;
    }
    
    this.lerpCountDown = Clamp(this.lerpCountDown, 0, 1);

    this.settings.startCountDownEntity.element.fontSize = Lerp(this.originalCountDownSize, this.settings.timerIncrease * this.originalCountDownSize, this.lerpCountDown);
    this.settings.startCountDownEntity.element.opacity = Lerp( 0.6, 1, this.lerpCountDown);
    this.settings.startCountDownEntity.element.text = countDown;
};

TextManager.prototype.comboText = function(index) {
    this.reactionTextEntity.script.moveText.startTransition(this.settings.comboString[index]);
};

TextManager.prototype.shockWaveText = function() {
    var index = Math.round(Math.random(0, this.settings.shockWaveString.length - 1));
    this.reactionTextEntity.script.moveText.startTransition(this.settings.shockWaveString[index]);//"Stunning, Nicely done"
};

TextManager.prototype.goldenText = function() {
    var index = Math.round(Math.random(0, this.settings.goldString.length - 1));
    this.reactionTextEntity.script.moveText.startTransition(this.settings.goldString[index]);//"Goldrush, Legendary"
};

TextManager.prototype.redText = function() {
    var index = Math.round(Math.random(0, this.settings.bombString.length - 1));
    this.reactionTextEntity.script.moveText.startTransition(this.settings.bombString[index]);//"Miss, Ouch"
};
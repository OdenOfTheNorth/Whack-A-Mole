var MoveText = pc.createScript('moveText');

var SharpTrasitionOpacity = {
	Increase: 0,
	Stay: 1,
	Decrease: 2,
};

var SharpTrasitionMovement = {
	Increase: 0,
	Stay: 1,
	Decrease: 2,
};

const EaseFunctionType = {
    Linear: 0,
	EaseInQuad: 1,
	EaseOutQuad: 2,
	EaseInOutQuad: 3,
	EaseInCubic: 4,
	EaseOutCubic: 5,
	EaseInOutCubic: 6,
	EaseInQuart: 7,
	EaseOutQuart: 8,
	EaseInOutQuart: 9,
	EaseInQuint: 10,
	EaseOutQuint: 11,
	EaseInOutQuint: 12,
	EaseInSine: 13,
	EaseOutSine: 14,
	EaseInOutSine: 15,
	EaseInExpo: 16,
	EaseOutExpo: 17,
	EaseInOutExpo: 18,
	EaseInCirc: 19,
	EaseOutCirc: 20,
	EaseInOutCirc: 21,
	EaseInBack: 22,
	EaseOutBack: 23,
	EaseInOutBack: 24,
	EaseInElastic: 25,
	EaseOutElastic: 26,
	EaseInOutElastic: 27,
	EaseInBounce: 28,
	EaseOutBounce: 29,
	EaseInOutBounce: 30,
};

MoveText.attributes.add('scriptEntity', {
    type: 'entity',
    description: 'The entity we want to call a script on'
});

MoveText.attributes.add('scriptName', {type: 'string', description: "The name of the script", default: "reactionManager"});

MoveText.attributes.add('functionName', {type: 'string', description: "The name of the function", default: "get"});

MoveText.attributes.add('jumpEase', {
    type: 'number',
    enum: Object.entries(EaseFunctionType).map(kvp => {var e = {}; e[kvp[0]] = kvp[1]; return e;}),
    default: 0,
    title: "Jump Ease Func"
});

MoveText.attributes.add('leftEntity', {
    type: 'entity',
    default: null
});

MoveText.attributes.add('rightEntity', {
    type: 'entity',
    default: null
});

MoveText.attributes.add('maxTransitionTime', {
    type: 'number',
    default: 0
});

MoveText.attributes.add('maxPeakTime', {
    type: 'number',
    default: 0
});

// initialize code called once per entity
MoveText.prototype.initialize = function() {
	console.log("moveText");
    this.moveText = false;

	this.opacity = 0;
	this.transision = 0;
	//this.opacityState = SharpTrasitionOpacity.Increase;
	this.moveState = SharpTrasitionMovement.Increase;
    
	this.upDownTime = 0;
	this.peakTime = 0;

	this.maxUpDownTime = 0.3;
	
	this.currentPeakTime = 0;
	//this.maxPeakTime = 2.0;

	this.left = this.leftEntity.getPosition();
    this.right = this.rightEntity.getPosition();

	this.oldText = "";
	this.currentText = "";
	this.textToDisplay = "";
	this.nextToDisplay = [];
};

MoveText.prototype.startTransition = function(text) {
	this.currentText = text;
	this.transision = 0;
	this.opacity = 0;
	this.moveText = true;
	this.moveState = SharpTrasitionMovement.Increase;
};

MoveText.prototype.update = function(dt) {

	this.left = this.leftEntity.getPosition();
    this.right = this.rightEntity.getPosition();

    if(this.moveText){//

		console.log("moveText");

		switch(this.moveState){
			case SharpTrasitionMovement.Increase:
				this.transision += dt / this.maxTransitionTime;
				this.opacity += (dt / this.maxTransitionTime) * 2;

				if(this.transision >= 0.5){
					this.moveState = SharpTrasitionMovement.Stay;
				}
			break;			
			case SharpTrasitionMovement.Stay:
				this.transision = 0.5;
				this.currentPeakTime += dt;
				this.opacity = 1;
				
				if(this.currentPeakTime >= this.maxPeakTime){
					this.moveState = SharpTrasitionMovement.Decrease;
					this.currentPeakTime = 0;
				}
			break;			
			case SharpTrasitionMovement.Decrease:
				this.transision += dt / this.maxTransitionTime;
				this.opacity -= (dt / this.maxTransitionTime) * 2;

				if(this.transision >= 1){
					this.moveState = SharpTrasitionMovement.Increase;
					this.transision = 0;
					this.moveText = false;
				}
			break;
			default:
			break;
		}
        
		this.opacity = Clamp(this.opacity, 0, 1);
		this.transision = Clamp(this.transision, 0, 1);
    }	

	//var x = Lerp(this.left.x, this.right.x, this.transision);
    //var y = Lerp(this.left.y, this.right.y, this.transision);
    //var z = Lerp(this.left.z, this.right.z, this.transision);

    this.entity.setPosition(LerpVector3(this.left, this.right, this.transision));
	//this.entity.setPosition(x,y,z);
	this.entity.element.opacity = this.opacity;
	this.entity.element.text = this.currentText;
};


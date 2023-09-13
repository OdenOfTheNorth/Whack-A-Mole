var PixTile = pc.createScript('pixTile');


var colorMode = {Default: 0, HighLight: 1, PressedWrong: 2, Skull: 3, Golden: 4, ShockWave: 5, Health: 6, EMP: 7, SwitchState: 8};
var defaultColor = {White: 0, Red: 1, Empty: 2};
//var missedPixType = {Ignore: 0, MinusScore: 1, ResetCombo: 2, MinusScoreAndResetCombo: 3};
/*
    Lose inspiration for effects
    https://store.steampowered.com/app/960170/DJMAX_RESPECT_V/
    https://store.steampowered.com/app/531510/Just_Shapes__Beats/
    https://store.steampowered.com/app/1926210/EZ2ON_REBOOT__R__PRESTIGE_PASS/
    https://store.steampowered.com/app/980610/Quaver/
*/

PixTile.attributes.add('playSpawnSound', {
    type: 'boolean',
    default: false,
});

PixTile.attributes.add('defaultOutlineColor', {
    type: 'number',
    enum: Object.entries(defaultColor).map(kvp => {var e = {}; e[kvp[0]] = kvp[1]; return e;}),
    default: 1,
});

PixTile.attributes.add('switchAmount', {
    type: 'number',
    default: 3,
});

PixTile.attributes.add('switchPercentUpTime', {
    type: 'number',
    default: [0.2, 0.2, 0.60],
    array: true
});

PixTile.attributes.add('effectSize', {
    type: 'number',
    default: 1.5,
});

PixTile.attributes.add('speed', {
    type: 'number',
    default: 3,
});

PixTile.attributes.add('outLineTime', {
    type: 'number',
    default: 1.2,
});

PixTile.attributes.add('outlineEntity', {
    type: 'entity',
    default: null
});

PixTile.attributes.add('mainHexEntity', {
    type: 'entity',
    default: null
});

PixTile.attributes.add('effectHexEntity', {
    type: 'entity',
    default: null
});

PixTile.attributes.add('skullEntity', {
    type: 'entity',
    default: null
});

PixTile.attributes.add('empEntity', {
    type: 'entity',
    default: null
});

PixTile.attributes.add('shockWaveEntity', {
    type: 'entity',
    default: null
});

PixTile.attributes.add('heigheLightEntity', {
    type: 'entity',
    default: null
});

PixTile.attributes.add('blackMaterialAsset', {
    type: 'asset',
    default: null
});

PixTile.attributes.add('goldenMaterialAsset', {
    type: 'asset',
    default: null
});

PixTile.attributes.add('wrongMaterialAsset', {
    type: 'asset',
    default: null
});

PixTile.attributes.add('rightMaterialAsset', {
    type: 'asset',
    default: null
});

PixTile.attributes.add('whiteMaterialAsset', {
    type: 'asset',
    default: null
});

PixTile.attributes.add('shockWaveMaterialAsset', {
    type: 'asset',
    default: null
});

PixTile.attributes.add('healthMaterialAsset', {
    type: 'asset',
    default: null
});

PixTile.attributes.add('empMaterialAsset', {
    type: 'asset',
    default: null
});

PixTile.attributes.add('higeLightEntitys', {
    type: 'entity',
    array: true
});

PixTile.attributes.add('redEntitys', {
    type: 'entity',
    array: true
});

PixTile.attributes.add('goldEntitys', {
    type: 'entity',
    array: true
});

PixTile.attributes.add('opacityShaderAsset', {type: 'asset', default: null});

PixTile.attributes.add('particalSpawnGoldenClone', {    type: 'entity',    default: null});

//PixTile.attributes.add('particalSpawnGoldenClone', {type: 'entity', default: null});

PixTile.prototype.initialize = function() {

    this.currentType = colorMode.Default;
    this.currentSwitchType = colorMode.HighLight;

    this.renderEntity = null;
    this.shaderScript = null;

    this.pixWasMissed = false;
    this.pixWasCliked = false;
    this.startHigeLight = false;
    this.playerEMPed = false;

    this.maxPoints = 3;
    this.currentTime = 0;
    this.maxStayTime = 0;
    this.clikedTime = 0;
    this.timer =  5;
    this.t = 0;
    this.lastChangeTime = 0;

    this.switchPercentUpTimeIndex = 0;

    this.setAll();
};

PixTile.prototype.setAll = function() {
    //-------------------Set all assets to freealt change them-------------------
    this.whiteMaterial  = this.whiteMaterialAsset.resource;//.clone();
    this.wrongMaterial  =  this.wrongMaterialAsset.resource;//.clone();
    this.rightMaterial  =  this.rightMaterialAsset.resource;//.clone();
    this.goldenMaterial =  this.goldenMaterialAsset.resource;//.clone();
    this.blackMaterial  =  this.blackMaterialAsset.resource;//.clone();
    this.shockWaveMaterial  =  this.shockWaveMaterialAsset.resource;//.clone();
    this.healthMaterial  =  this.healthMaterialAsset.resource;//.clone();
    //this.empMaterial = this.empMaterialAsset.resource;
    this.opacityShader  = this.opacityShaderAsset;//.clone();
    console.log("setAll");
};

PixTile.prototype.update = function(dt) {
    
    this.t += dt;

    if(this.canBeClicked()){

        this.currentTime -= dt;

        if(this.currentType != colorMode.Skull && this.currentType != colorMode.EMP && this.currentType != colorMode.ShockWave){
            this.scaleMainHex(this.getCurrentTimePercent());
        }else{
            this.scaleMainHex(0.8);
        }   

        this.handleSwitchState();

        // set to value under 0 for some coyote time on click
        if(this.currentTime <= -0.2){
            if(this.currentType == colorMode.HighLight){
                this.pixWasMissed = true;  
                this.setType(colorMode.PressedWrong);
                this.pixCliked();
            }else{
                this.setType(colorMode.Default);
                this.currentTime = this.maxStayTime;   
                //set entitys enable state
                //---------------------------------
                this.mainHexEntity.enabled = false;
                this.effectHexEntity.enabled = false; 
                this.skullEntity.enabled = false;   
                this.empEntity.enabled = false;    
                this.heigheLightEntity.enabled = false;
                this.shockWaveEntity.enabled = false;
                //---------------------------------
                //Particals
                this.entity.particlesystem.reset();
                this.entity.particlesystem.pause();
            }
        }
    } 

    if(this.pixWasCliked){
        
        this.clikedTime += dt * this.speed;
        this.scaleMainEffectHex(this.clikedTime);   

        if(this.clikedTime > this.outLineTime){
            this.clikedTime = 0;
            this.pixWasCliked = false;
            this.setType(colorMode.Default);
            this.mainHexEntity.enabled = false;
            this.effectHexEntity.enabled = false; 
            this.skullEntity.enabled = false;           
        }
    }
};

PixTile.prototype.handleSwitchState = function() {

    if(this.currentType == colorMode.SwitchState && (this.maxStayTime * this.switchPercentUpTime[this.switchPercentUpTimeIndex]) < this.t - this.lastChangeTime){
        switch(this.currentSwitchType){
            case colorMode.HighLight: 
                this.switchPercentUpTimeIndex = 1;
                this.currentSwitchType = colorMode.Golden;
                this.lastChangeTime = this.t;
                this.setMaterials();
            break;
            case colorMode.Golden: 
                this.switchPercentUpTimeIndex = 2;
                this.currentSwitchType = colorMode.Skull;
                this.lastChangeTime = this.t;
                this.setMaterials();
            break;
            default:
                this.switchPercentUpTimeIndex = 0;
                this.currentSwitchType = colorMode.HighLight;
                this.lastChangeTime = this.t;
                this.setMaterials();
            break;
        }        
    }
};

PixTile.prototype.higeLightType = function(type, maxStayTime) {
    this.startHigeLight = true;
    this.currentType = type;
    this.maxStayTime = maxStayTime;
    this.currentTime = this.maxStayTime;
    this.pixWasCliked = false;
    this.clikedTime = 0;

    var soundToPlay = "";

    this.entity.particlesystem.reset();
    this.entity.particlesystem.pause();

    switch(this.currentType){
        case colorMode.Skull:
            soundToPlay = "SkullEMPSpawn";
            this.skullEntity.enabled = true;
        break;
        case colorMode.EMP:
            soundToPlay = "SkullEMPSpawn";
            this.empEntity.enabled = true;
        break;
        case colorMode.Golden:            
            soundToPlay = "GoldenSpawn";
            this.particalSpawnGoldenClone.enabled = true;
            this.particalSpawnGoldenClone.particlesystem.play();
        break;
        case colorMode.HighLight:            
            //soundToPlay = "HighLightSpawn";
            //this.heigheLightEntity.enabled = true;
        break;
        case colorMode.ShockWave:            
            soundToPlay = "ShockWaveSpawn";
            this.shockWaveEntity.enabled = true;
        break;
        case colorMode.SwitchState:            
            soundToPlay = "ShockWaveSpawn";
            this.currentSwitchType = colorMode.Golden;
            //this.setMaterials();
            this.shockWaveEntity.enabled = true;
        break;
        default:
            //soundToPlay = "HighLightSpawn";
        break;
    }

    if(this.entity.sound && this.playSpawnSound && soundToPlay != ''){
        this.entity.sound.play(soundToPlay);
    }

    this.setMaterials();
};

PixTile.prototype.deHightLight = function() {
    this.currentType = colorMode.Default;
    this.mainHexEntity.enabled = false;
    this.effectHexEntity.enabled = false;  
    this.particalSpawnGoldenClone.enabled = false;
    this.setMaterials();
};

PixTile.prototype.setType = function(type) {
    this.currentType = type;
    this.setMaterials();
    //---------------------------------
    this.mainHexEntity.enabled = false;
    this.effectHexEntity.enabled = false; 
    this.skullEntity.enabled = false;   
    this.empEntity.enabled = false;    
    this.heigheLightEntity.enabled = false;
    this.shockWaveEntity.enabled = false;
    //---------------------------------
    this.clikedTime = 0;
    this.currentTime = this.maxStayTime;
};

PixTile.prototype.canBeClicked = function() {
    return this.currentType != colorMode.Default && this.pixWasCliked == false;// this.startHigeLight;
};

PixTile.prototype.isDefault = function() {
    return this.currentType == colorMode.Default;
};

PixTile.prototype.isHighLight = function() {
    return this.currentType == colorMode.HighLight;
};

PixTile.prototype.getCurrentTime = function() {
    return this.currentTime;
};

PixTile.prototype.getCurrentTimePercent = function() {
    return this.currentTime / this.maxStayTime;
};

PixTile.prototype.getCurrentTimeDubblePercent = function() {
    return this.currentTime / (this.maxStayTime / 2);
};

PixTile.prototype.pixCliked = function(pitchValue, type) {

    if(this.pixWasCliked){
        this.currentType = colorMode.PressedWrong;
        console.log("pix was already clicked");
    }

    var soundToPlay = '';

    switch(this.currentType){
        case colorMode.Default:
            this.currentType = colorMode.PressedWrong;
            soundToPlay = 'PressedWrong';
        break;
        case colorMode.HighLight:
            this.currentType = colorMode.HighLight;
            //soundToPlay = 'HighLight';

            switch(type){
                case type == 1:
                    soundToPlay = 'HighLight1';
                break;
                case type == 2:
                    soundToPlay = 'HighLight2';
                break;
                default:
                    soundToPlay = 'HighLight3';
                break;
            }

        break;
        case colorMode.Skull:
            this.currentType = colorMode.Skull;
            soundToPlay = 'SkullCliked';
        break;
        case colorMode.Golden:
            this.currentType = colorMode.Golden;
            soundToPlay = 'GoldenClicked';
        break;
        case colorMode.ShockWave:
            this.currentType = colorMode.ShockWave;
            soundToPlay = 'ShockWaveClicked';
        break;
        case colorMode.PressedWrong:
            this.currentType = colorMode.PressedWrong;
            soundToPlay = 'PressedWrong';
        break;
        case colorMode.EMP:
            this.currentType = colorMode.EMP;
            console.log("Pressed EMP");
            this.playerEMPed = true;  
            soundToPlay = 'EMPClicked';
        break;
        case colorMode.SwitchState:
            switch(this.currentSwitchType){
                case colorMode.HighLight: 
                    this.currentType = colorMode.HighLight;
                    soundToPlay = 'HighLight1';
                break;
                case colorMode.Golden: 
                    this.currentType = colorMode.Golden;
                    soundToPlay = 'GoldenClicked';
                break;
                case colorMode.Skull: 
                    this.currentType = colorMode.Skull;
                    soundToPlay = 'SkullCliked';
                break;
            }
        break;
        default:
            this.currentType = colorMode.Default;
            soundToPlay = 'Default';
        break;
    }

    this.particalSpawnGoldenClone.enabled = false;   

    if(this.entity.sound && pitchValue != null && this.currentType == colorMode.HighLight){
        this.entity.sound.slot(soundToPlay).pitch = pitchValue; 
    }

    this.entity.sound.play(soundToPlay);

    this.pixWasCliked = true;
    this.clikedTime = 0;

    this.setMaterials();
};


PixTile.prototype.resetEMP = function() {
    this.playerEMPed = false;
};


PixTile.prototype.scaleMainHex = function(currentTime) {
    var scale = Math.sin(currentTime);
    scale = Clamp(scale, 0, 1);
    this.mainHexEntity.setLocalScale(scale, 1, scale);
    
    this.mainHexEntity.enabled = true;
    this.effectHexEntity.enabled = false;
};

PixTile.prototype.scaleMainEffectHex = function(currentTime) {
    var scale = (Math.sin(currentTime) * this.effectSize);//1 - Math.abs 
    scale = Clamp(scale, 0 , this.effectSize);
    this.effectHexEntity.setLocalScale(scale, 0.1, scale);
    this.setOpacity(currentTime);
    this.mainHexEntity.enabled = false;
    this.effectHexEntity.enabled = true;
};

PixTile.prototype.setOpacity = function(currentTime) {
    var effectHexRenders        = this.effectHexEntity.findComponents('render');
    var effectHexMechInstance   = effectHexRenders[0].meshInstances[0];
};


PixTile.prototype.setMaterials = function() {

    for(var i = 0; i < this.entity.children.length; i++){
        if(!this.entity.children[i].particlesystem)
            this.entity.children[i].enabled = true;
    }

    var i = 0;
    for(i = 0; i < this.higeLightEntitys.length; i++){
        this.higeLightEntitys[i].enabled = false;
    }

    for(i = 0; i < this.redEntitys.length; i++){
        this.redEntitys[i].enabled = false;
    }

    for(i = 0; i < this.goldEntitys.length; i++){
        this.goldEntitys[i].enabled = false;
    }

    switch(this.currentType){
        case colorMode.Default:
            if(this.defaultOutlineColor == (defaultColor.White || defaultColor.Red))
                for(i = 0; i < this.entity.children.length; i++){
                    this.entity.children[i].enabled = false;
                }
        break;
        case colorMode.HighLight:

            for(i = 0; i < this.higeLightEntitys.length; i++){
                this.higeLightEntitys[i].enabled = true;
            }
        break;
        case colorMode.PressedWrong:
            for(i = 0; i < this.redEntitys.length; i++){
                this.redEntitys[i].enabled = true;
            }
        break;
        case colorMode.Skull:
            for(i = 0; i < this.redEntitys.length; i++){
                this.redEntitys[i].enabled = true;
            }
        break;
        case colorMode.Golden:
            for(i = 0; i < this.goldEntitys.length; i++){
                this.goldEntitys[i].enabled = true;
            }
        break;
        case colorMode.ShockWave:
        break;
        case colorMode.Health:
        break;    
        case colorMode.EMP:
            for(i = 0; i < this.redEntitys.length; i++){
                this.redEntitys[i].enabled = true;
            }
            console.log("setMaterials EMP");  
        break;    
        case colorMode.SwitchState:
            switch(this.currentSwitchType){
                case colorMode.HighLight:
                    for(i = 0; i < this.higeLightEntitys.length; i++){
                        this.higeLightEntitys[i].enabled = true;
                    }
                break;
                case colorMode.Skull:
                    for(i = 0; i < this.redEntitys.length; i++){
                        this.redEntitys[i].enabled = true;
                    }
                break;
                case colorMode.Golden:
                    for(i = 0; i < this.goldEntitys.length; i++){
                        this.goldEntitys[i].enabled = true;
                    }
                break;
                default:
                    console.log("setMaterials SwitchState default");
                break;
            }
        break;                  
        default:
            console.log("setMaterials default");
            switch(this.defaultOutlineColor){
                case defaultColor.White:
                    outLineMechInstance.material    =  this.whiteMaterial;//resource.clone()
                    mainHexMechInstance.material    =  this.rightMaterial;//resource.clone()
                    effectHexMechInstance.material  =  this.rightMaterial;//resource.clone()
                break;
                case defaultColor.Red:
                    outLineMechInstance.material    =  this.wrongMaterial;
                    mainHexMechInstance.material    =  this.rightMaterial;
                    effectHexMechInstance.material  =  this.rightMaterial;
                break;
                case defaultColor.Empty:                    
                    for(i = 0; i < this.entity.children.length; i++){
                        this.entity.children[i].enabled = false;
                    }
                break;
            }
        break;
    }
};

PixTile.prototype.setOutlineEntity = function(entity) {
    this.outlineEntity = entity;
};
PixTile.prototype.setDurationHexEntity = function(entity) {
    this.mainHexEntity = entity;
};
PixTile.prototype.setClikedEffectEntity = function(entity) {
    this.effectHexEntity = entity;
};
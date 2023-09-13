var missedPixType = {Ignore: 0, MinusScore: 1, ResetCombo: 2, MinusScoreAndResetCombo: 3};
var onClikedType = {Nothing: 0, PopUpText: 1, Particals: 2, PopUpTextAndParticals: 3}; 

var ReactionManager = pc.createScript('reactionManager');

ReactionManager.attributes.add('reactionTextEntity', {
    type: 'entity',
    default: null
});

ReactionManager.attributes.add('seed', {
    type: 'number',
    default: 13698642
});

ReactionManager.attributes.add('maxLives', {
    type: 'number',
    default: 5
});

ReactionManager.attributes.add('useUltimateBar', {
    type: 'boolean',
    default: false
});

ReactionManager.attributes.add('chargeToLose', {
    type: 'number',
    default: 10
});

ReactionManager.attributes.add('maxUltimateCharge', {
    type: 'number',
    default: 0
});

ReactionManager.attributes.add('EMPDuration', {
    type: 'number',
    default: 2
});

ReactionManager.attributes.add('EMPIntensity', {
    type: 'number',
    default: 0.01
});

ReactionManager.attributes.add('maxPoints', {
    type: 'number',
    default: 3,
});

ReactionManager.attributes.add('toDoMissedPix', {
    type: 'number',
    enum: Object.entries(missedPixType).map(kvp => {var e = {}; e[kvp[0]] = kvp[1]; return e;}),
    default: 1,
});

ReactionManager.attributes.add('onCliked', {
    type: 'number',
    enum: Object.entries(onClikedType).map(kvp => {var e = {}; e[kvp[0]] = kvp[1]; return e;}),
    default: 1
});

ReactionManager.attributes.add('startUpTime', {
    type: 'number',
    default: 1
});

ReactionManager.attributes.add('spawnTime', {
    type: 'number',
    default: 1
});

ReactionManager.attributes.add('deSpawnTime', {
    type: 'number',
    default: 1
});

ReactionManager.attributes.add('skullSpawnTime', {
    type: 'number',
    default: 4
});
/*
ReactionManager.attributes.add ("videoSetUpEntity",{
    type: "entity",
    default: 0
});*/

ReactionManager.attributes.add('spriteEntity', { type: 'entity' });

ReactionManager.attributes.add('onFireBarEntity', {
    type: 'entity',
    default: null, 
    title: 'Progress Bar'
});

ReactionManager.attributes.add('onFireBar5SecEntity', {
    type: 'entity',
    default: null, 
    title: 'Progress Bar 5 sec'
});

ReactionManager.attributes.add('comboMeterEntity', {
    type: 'entity',
    title: 'combo Meter Entity',
    array: true
});

ReactionManager.attributes.add('starCounterEntity', {
    type: 'entity',
    default: null, 
    title: 'Star Bar'
});
/*
ReactionManager.attributes.add('startCountDownTimerEntity', {
    type: 'entity',
    default: null, 
    title: 'start Count Down Timer Entity'
});*/

ReactionManager.attributes.add('hitEntity', {
    type: 'entity',
    default: null
});

ReactionManager.attributes.add('hitAmount', {
    type: 'number',
    default: 10
});

ReactionManager.attributes.add('markerUpTime', {
    type: 'number',
    default: 0.2
});

ReactionManager.attributes.add('markerSpeed', {
    type: 'number',
    default: 1
});

ReactionManager.attributes.add('maxMissAmount', {
    type: 'number',
    default: 3
});

ReactionManager.attributes.add('backgroundEntity', {
    type: 'entity',
    default: null, 
    title: 'start Count Down Timer Entity'
});

ReactionManager.attributes.add ("cameraEntity",{
    type: "entity",
    default: 0
});

ReactionManager.attributes.add ("inputManagerEntity",{
    type: "entity",
    default: null
});

//---------------------countDownSound------------------------
ReactionManager.prototype.resetMissedCountArray = function() {
    this.missedCountArray = [];

    for(var i = 0; i < this.maxMissAmount; i++){
        this.missedCountArray.push(true);    
    }
};

ReactionManager.prototype.initialize = function() {

    this.greenSpawned = 0;
    this.redSpawned = 0;

    this.inputManager = this.inputManagerEntity.script.inputManager;

    this.textManager = this.entity.script.textManager;

    this.clickedGoldenThisFrame = false;
    this.clickedBombOrEMPThisFrame = false;
    this.clickedShockWaveThisFrame = false;

    this.lives = this.maxLives;
    //----------------------------------------------------------------------
    this.clickAssets = this.entity.script.clickAssets;
    //----------------------------------------------------------------------
    this.shouldSpawnGoldenHexNextPossibleFrame = false;
    this.shouldSpawnSwitchNextFrame = false;
    this.shouldSpawnSkullOrEMPNextPossibleFrame = false;
    this.shouldSpawnComboMilestoneEffect = false;
    
    this.onFireMeter = 0;
    this.maxOnFireMeter = 0;
    this.queue = [];
    this.queueTimes = [];
    this.time = 0;
    
    //Start Assigning settings from diffrent scripts 

    //-----------------------------------------------------------------------
    this.screenUIManager = this.entity.script.screenUIManager;
    this.screenUIManager.startGameUI();
    //------------------------------------------------------------------------
    this.oldNumber = 0;
    this.currentMiss = this.maxMissAmount;
    this.resetMissedCountArray();    
    //----------------------Partical Settings-------------
    this.particalsSettings          = this.entity.script.particalsSettings;
    //---------------------------------------------------------------------------
    this.currentMultiplierIndex = -1;
    this.createUIHits();
    this.createParticalHits();
    this.pixHieLighted = 0;
    //----------------------GridSettings-----------------------------------------
    this.gridSettings   = this.entity.script.gridSettings;
    this.endRingSize    = this.gridSettings.endRingSize;
    this.startRingSize  = this.gridSettings.startRingSize;
    this.maxTime        = this.gridSettings.maxTime;
    //----------------------ArraySettings----------------------------------------
    this.arraySettings          = this.entity.script.arraySettings;
    this.hexSpawnTimes          = this.arraySettings.hexSpawnTimes;
    this.deSpawnTime            = this.arraySettings.hexSpawnTimes[this.arraySettings.hexSpawnTimes.length - 1];
    //----------------------ComboMultiplierSettings-------------------------------
    this.amountMultiplier = [];
    this.multiplierMilestone = [];
    //-------------------- comboMultiplierSettings ------------------------------
    this.comboMultiplierSettings    = this.entity.script.comboMultiplierSettings;    
    this.difficultiesPhases         = this.comboMultiplierSettings.difficultiesPhases;
    var length                      = this.comboMultiplierSettings.multiplierMilestone.length;    
    this.amountMultiplier           = this.comboMultiplierSettings.amountMultiplier;
    this.multiplierMilestone        = this.comboMultiplierSettings.multiplierMilestone;
    this.string                     = this.comboMultiplierSettings.string;
    //---------------------GoldenHex---------------------------------------------
    this.maxSpecialHexSpawnAmount = length;
    this.specialHexIndex = 0;

    this.specialHexSpawnAmount = 0; 
    this.oldMultiplayIndex = 0;    
    //---------------------Grid--------------------------------------------------    
    this.reactionGrid = this.arraySettings.reactionGridEntity.script.reactionGrid;
    this.reactionGrid.nrOfRings = this.startRingSize; 
    this.reactionGrid.currentNumberOfRings = this.startRingSize;   
    this.reactionGrid.maxNrOfRings = this.endRingSize;   
    this.reactionGrid.setSeed(this.seed); 
    
    //---------------------Phases------------------------------------------------
    this.timeBetweenPhases = this.maxTime / this.difficultiesPhases;

    this.currentTimePhase = 0;
    this.currentPhase = 1;
    this.spawnHexagons = true;

    //---------------------higeLight Varibals------------------------------------
    this.higeLightTimer = 0;
    this.hightLightArray = [];
    this.hightLightIndex = 0;

    this.currentStartUpTime = this.startUpTime;
    this.allPix = [];
    //---------------------Gameplay----------------------------------------------
    this.combo = 0;
    this.maxCombo = 0;
    
    this.score = 0;
    this.ultimateCharge = 0;

    this.multiplier = 1;
    this.isPlaying = false;
    this.inCountDown = false;

    this.currentSpawnTime = this.spawnTime;
    this.currentDeSpawnTime = 0;

    if(this.spawnContinually){
        this.arraySettings.spawnArrayDelay = this.spawnTime / 10;
    }

    this.currentArrayTime = this.arraySettings.spawnArrayDelay;
    this.currentTimer = this.maxTime;
    this.hightLightOrder = false;

    this.currentSkullTimer = this.skullSpawnTime;
    this.currentSwitchTimer = 0;

    this.originalHighLightPixDelay = this.arraySettings.highLightPixDelay;
    this.originalDeSpawnTime = this.deSpawnTime;

    this.createHitArrays();
};

ReactionManager.prototype.update = function(dt) {
    this.deltaTime = dt;
    this.updateStartCoundDown(dt);
    this.updateHex(dt);    
    this.updateMarkers();
    this.updateTimers(dt);
    this.checkPixForEMP();

    if(this.inputManager.spaceWasPressedThisFrame){
        this.useUltimate();
    }
};

ReactionManager.prototype.updateStartCoundDown = function(dt) {
    
    if(!this.inCountDown){
        return;
    }    

    if(!this.entity.sound.slot('startCountDownSound').isPlaying){
        this.entity.sound.play('startCountDownSound');
    }        

    this.currentStartUpTime -= dt;

    if(this.currentStartUpTime <= 0)    {    
        this.screenUIManager.inGameUI(); 
        this.multiplier = 0;
        this.combo = 0;
        this.isPlaying = true;
        this.inCountDown = false;
    }else{
        //this.screenUIManager.startGameUI();startCountDownGameUI
        this.screenUIManager.startCountDownGameUI();    
    }
};

ReactionManager.prototype.updateHex = function(dt) {
    
    if(!this.isPlaying){
        return;
    }
    
    for(var i = 0; i < this.comboMeterEntity.length; i++)
        this.comboMeterEntity[i].script.progressBar.setTargetValue(this.getComboSliderPercent());

    this.allPix = this.reactionGrid.getAllPixAsArray();
    this.time += dt;
    
    this.currentTimePhase += dt;

    this.updatePhases();

    this.higeLightTimer -= dt;


    if(this.spawnHexagons){
        this.highLightOrder();
    }
    
    this.currentTimer -= dt;

    var roundNumber = Math.floor(this.currentTimer);

    if(roundNumber / 5 == 1 ){
        this.entity.sound.play('countDownSound');
    }  

    // take the current time minus the despawn time to figure out if it's under 0
    if(this.currentTimer - this.deSpawnTime < 0){/* && !this.gameIsOver)*/

        this.spawnHexagons = false;
        var hexLeft = false;

        for(var i = 0; i < this.allPix.length; i++){
            if(this.allPix[i].script.pixTile.canBeClicked()){
                hexLeft = true;
            }
        }

        if(!hexLeft){
            this.gameOver();
        }
        return;
    }
    
    this.updateMissedPix();
};

ReactionManager.prototype.updatePhases = function() {
    
    if(this.currentTimePhase > this.timeBetweenPhases && this.currentPhase <= this.difficultiesPhases){
        this.currentPhase++;
        this.currentTimePhase = 0;

        this.shouldSpawnSwitchNextFrame = true;
        
        this.reactionGrid.currentNumberOfRings++;
        this.reactionGrid.currentNumberOfRings = Clamp(this.reactionGrid.currentNumberOfRings, this.startRingSize, this.endRingSize);
        this.reactionGrid.increaseGridSize();      

        var string = "Phase_" + this.currentPhase;
        this.entity.sound.play(string);

        //decrease spawn time by a small amount every new phase
        if(this.arraySettings.shouldDeacreaseTime){
            this.arraySettings.highLightPixDelay -= this.arraySettings.decreaseDelay;
            this.arraySettings.highLightPixDelay = Clamp(this.arraySettings.highLightPixDelay, 0, this.arraySettings.highLightPixDelay + this.arraySettings.decreaseDelay);
            this.deSpawnTime = this.hexSpawnTimes[this.difficultiesPhases - this.currentPhase];            
        }     
        if(!this.useUltimateBar)
            this.shouldSpawnShockWaveNextFrame = true;
    }
};

//----------------Spawn Skull-----------------------    
ReactionManager.prototype.updateTimers = function(dt) {
    
    this.currentSkullTimer -= dt;
    this.currentSwitchTimer -= dt;
    if(this.currentSkullTimer <= 0){
        this.shouldSpawnSkullOrEMPNextPossibleFrame = true;
        return;
    } 

    if(this.currentSwitchTimer <= 0){
        this.shouldSpawnSwitchNextFrame = true;
        return;
    } 
};

//----------------Spawn Golden Hex if failed in addPoints ---------------------
ReactionManager.prototype.spawnGolden = function() {
    
    if(!this.shouldSpawnGoldenHexNextPossibleFrame)
        return;

    var index = 85;
    var entity = this.reactionGrid.getRandomHex(index);
    
    while(ArrayContains(entity , this.hightLightArray)){
        index += this.hightLightArray.length;
        entity = this.reactionGrid.getRandomHex(index);
    }

    if(entity == null){
        this.shouldSpawnGoldenHexNextPossibleFrame = true;
        return;
    }            

    entity.enabled = true;

    var reactionScript = entity.script.pixTile;
    reactionScript.higeLightType( colorMode.Golden, this.deSpawnTime);
    //this.clickedPix(entity);
    //this.increaseDecreaseFireMeter(10, "Max");
    this.specialHexSpawnAmount++;
    this.specialHexIndex++;
    this.shouldSpawnGoldenHexNextPossibleFrame = false;
};

ReactionManager.prototype.highLightOrder = function() {
    ///return if over max on screen
    if(this.getAllHeigeLightedPixOnScreen().length >= this.arraySettings.maxOnScreen)      
        return;

    //-------------------- Normal high light -------------------
    if(this.hightLightArray == null || this.hightLightArray.length == 0){
        this.hightLightArray = [];
        this.hightLightArray = this.createNewPath();
        return;
    }        

    if(this.higeLightTimer <= 0){        
        this.higeLightTimer = this.arraySettings.highLightPixDelay;
        var pixEntity = this.hightLightArray[this.hightLightIndex];

        if(pixEntity == null){
            this.hightLightArray = [];
            return;
        }

        var reactionScript = pixEntity.script.pixTile;

        if(reactionScript == null)
            return;
        
        if(!reactionScript.isDefault())
        {
            this.hightLightArray = [];
            this.hightLightArray = this.createNewPath();
            return;
        }
        
        //What hex to spawn
        if(this.shouldSpawnSkullOrEMPNextPossibleFrame){            
            var index = CreateRandomNumber(0, this.hightLightArray.length, this.hightLightArray.length * 0.967 * this.seed);
            
            if(index % 2 == 0){
                reactionScript.higeLightType( colorMode.EMP, this.deSpawnTime);
            }else{
                reactionScript.higeLightType( colorMode.Skull, this.deSpawnTime);
            }
            this.redSpawned++;
            this.shouldSpawnSkullOrEMPNextPossibleFrame = false;
            this.currentSkullTimer = this.skullSpawnTime;

        } else if(this.shouldSpawnSwitchNextFrame){
            reactionScript.higeLightType( colorMode.SwitchState, this.deSpawnTime);
            this.shouldSpawnSwitchNextFrame = false;
            this.currentSwitchTimer = 4.5;
        } else {
            reactionScript.higeLightType( colorMode.HighLight, this.deSpawnTime);
            this.greenSpawned++;
        }

        this.pixHieLighted++;
        this.hightLightIndex++;
    }

    //Reset Array and spawn index
    if(this.hightLightIndex >= this.hightLightArray.length){
        this.hightLightIndex = 0;
        this.hightLightArray = [];
        this.hightLightArray = this.createNewPath();        
    }

    
    this.spawnGolden();
};

ReactionManager.prototype.reset = function() {

    this.entity.sound.play('clickedSound');
    this.entity.sound.play('backgroundSound');
    this.lives = this.maxLives;
    
    this.reactionGrid.setSeed(this.seed); 
    this.shouldSpawnGoldenHexNextPossibleFrame = false;
    this.shouldSpawnShockWaveNextFrame = false;

    this.currentStartUpTime = this.startUpTime;
    this.screenUIManager.startCountDownGameUI();    
    //------------------ reset Combo ----------------------------
    this.resetCombo();
    this.maxCombo = 0;
    //------------------- on fire meter -------------------------
    this.onFireMeter = 0; 
    this.maxOnFireMeter = 0;
    //------------------- reset array ---------------------------
    this.queue = [];
    this.queueTimes = [];

    this.resetMultiplier();    

    this.score = 0;
    this.ultimateCharge = 0;
    this.isPlaying = false;
    this.currentSkullTimer = this.skullSpawnTime;
    
    if(this.reactionGrid){
        this.reactionGrid.resetAll();
    }        
    
    if(this.spawnContinually){
        this.arraySettings.spawnArrayDelay = this.spawnTime / 10;
    }

    this.currentTimer = this.maxTime + 1;
    this.currentDeSpawnTime = 0;
    this.spawnHexagons = true;

    this.currentSpawnTime = this.spawnTime;
    this.currentArrayTime = this.arraySettings.spawnArrayDelay;

    this.reactionGrid.currentNumberOfRings = this.startRingSize;
    this.currentPhase = 1;
    this.currentTimePhase = 0;
    
    this.reactionGrid.resetGrid();
    
    this.hightLightArray = this.reactionGrid.createRandomOrderNew(this.arraySettings.arrayLength[ this.arraySettings.arrayLength.length - this.currentPhase], this.arraySettings.arrayLength[ this.arraySettings.arrayLength.length - this.currentPhase] + 15);
    this.arraySettings.highLightPixDelay = this.originalHighLightPixDelay;
    this.deSpawnTime = this.originalDeSpawnTime;

    this.specialHexIndex = 0;

    this.specialHexSpawnAmount = 0; 
    this.oldMultiplayIndex = 0;

    this.startCountDown();
};

ReactionManager.prototype.clickedPix = function(pickedEntity) {
    
    var pickedScript = pickedEntity.script.pixTile;
    var livesToAdd = 0;
    var pointsToAdd = 0;
    var type = null;

    switch(pickedScript.currentType){
        case colorMode.Default:
            livesToAdd = -1;
            pointsToAdd = -1;
            type = colorMode.PressedWrong;

            this.clickedDefault();
        break;
        case colorMode.EMP:
            livesToAdd = -1; 
            pointsToAdd = -1;
            type = pickedScript.currentType; 

            this.clickedEMP();
        break;  
        case colorMode.Skull:
            livesToAdd = -1;
            pointsToAdd = -10;
            type = pickedScript.currentType;

            this.clickedSkull();
        break;
        case colorMode.HighLight:
            type = pickedScript.currentType;
            pointsToAdd = this.getPointsToAdd(pickedScript);
            console.log("pointsToAdd", pointsToAdd);
            this.clickedNeuteralOrPositiveTile()            
        break;
        case colorMode.Golden:   
            type = pickedScript.currentType;             
            pointsToAdd = 10;

            this.clickedNeuteralOrPositiveTile()     
            this.clickedGolden();
        break;      
        case colorMode.ShockWave:
            type = pickedScript.currentType;
            this.clickedNeuteralOrPositiveTile()   
            this.clickAll();
            this.clickedShockWave();
        break;
        case colorMode.SwitchState:

            switch(pickedScript.currentSwitchType){
                case colorMode.Skull:
                    livesToAdd = -1;
                    pointsToAdd = -10;
                    type = pickedScript.currentType;

                    this.clickedSkull();
                break;
                case colorMode.HighLight:
                    type = colorMode.HighLight;
                    pointsToAdd = this.getPointsToAdd(pickedScript);

                    this.clickedNeuteralOrPositiveTile();     
                break;
                case colorMode.Golden:   
                    type = colorMode.Golden;             
                    pointsToAdd = 10;
                    this.clickedNeuteralOrPositiveTile();
                    this.clickedGolden();
                break;    
            }


            this.increaseCombo();
            this.updateMissedCount(true);
            this.increaseDecreaseFireMeter(1);     
            pointsToAdd = this.getPointsToAdd(pickedScript);
        break;

        default:
        break;
    }
      

    this.addOrSubLives(livesToAdd != 0 && livesToAdd != null ? livesToAdd : 0);       

    pickedScript.pixCliked(this.getPitch(), pointsToAdd);
    this.addScore(pointsToAdd);
    this.addToUltimateCharge(pointsToAdd);

    //------------------spawn on click--------------
    switch(this.onCliked){
        case onClikedType.PopUpText:
            this.spawnHitImageAtPos(pickedEntity.getPosition(), pointsToAdd, type);  
        break;
        case onClikedType.Particals:
            this.spawnParticalAtPos(pickedEntity.getPosition(), type);
        break; 
        case onClikedType.PopUpTextAndParticals:
            this.spawnHitImageAtPos(pickedEntity.getPosition(), pointsToAdd, type);  
            this.spawnParticalAtPos(pickedEntity.getPosition(), type);
        break; 
        default:
        break;
    }     
};

ReactionManager.prototype.clickedEMP = function() {
    this.ultimateCharge -= this.chargeToLose;
    this.cameraEntity.script.glitch.startGlitchDuration(0.7, 0.3);
    this.addComboToScore();
    this.clickedNegativeTile();  
    this.shakeScreen();
    this.clickedBombOrEMP();
}

ReactionManager.prototype.clickedSkull = function() {
    this.ultimateCharge -= this.chargeToLose;            
    this.cameraEntity.script.glitch.startGlitch();
    this.addComboToScore();
    this.resetCombo();
    this.updateMissedCount(false);
    this.increaseDecreaseFireMeter(-10);
    this.shakeScreen();
    this.clickedBombOrEMP();
}

ReactionManager.prototype.clickedDefault = function() {
    this.ultimateCharge -= this.chargeToLose;            
    this.cameraEntity.script.glitch.startGlitch();
    this.addComboToScore();
    this.clickedNegativeTile(); 
    this.shakeScreen();
}

ReactionManager.prototype.clickedNeuteralOrPositiveTile = function() {
    this.increaseCombo();
    this.updateMissedCount(true);
    this.increaseDecreaseFireMeter(1);   
}

ReactionManager.prototype.clickedNegativeTile = function() {
    this.addComboToScore();
    this.resetCombo(); 
    this.updateMissedCount(false);   
}



ReactionManager.prototype.addScore = function(toAdd) {

    if(!this.isPlaying){
        return;
    }      

    for(var i = 0; i < this.multiplierMilestone.length; i++){
        if(this.multiplierMilestone[i] <= this.combo){
            this.multiplier = this.amountMultiplier[Clamp(i, 0, this.amountMultiplier.length)];
            this.currentMultiplierIndex = i;   
            
            if(this.oldMultiplayIndex < this.currentMultiplierIndex){
                this.entity.sound.play('comboSound');
            }           
        }
    }

    var isOverMultiplier = this.oldMultiplayIndex < this.currentMultiplierIndex;
    var isUnderMaxAmount = this.specialHexSpawnAmount < this.maxSpecialHexSpawnAmount;
    var hasNotSpawnedAtIndex = this.specialHexIndex < this.currentMultiplierIndex;

    if(isOverMultiplier && isUnderMaxAmount && hasNotSpawnedAtIndex){
        this.shouldSpawnGoldenHexNextPossibleFrame = true;
        var stringIndex = Clamp(this.currentMultiplierIndex, 0, this.string.length - 1);
        this.textManager.comboText(stringIndex);
        this.shouldSpawnComboMilestoneEffect = true;
    }

    this.oldMultiplayIndex = this.currentMultiplierIndex;

    this.score += toAdd; 
};

ReactionManager.prototype.addToUltimateCharge = function(toAdd){
    this.ultimateCharge += toAdd;
};

ReactionManager.prototype.updateMarkers = function() {   
    var i = 0;

    for(i = 0; i < this.highLightHitEntitys_1.length; i++){
        if(this.highLightHitEntitys_1[i].enabled){
            this.updateMarkersArrayIndex(this.highLightHitEntitys_1, i)    
        }

        if(this.highLightHitEntitys_2[i].enabled){
            this.updateMarkersArrayIndex(this.highLightHitEntitys_2, i)    
        }

        if(this.highLightHitEntitys_3[i].enabled){
            this.updateMarkersArrayIndex(this.highLightHitEntitys_3, i)    
        }
    }

    this.updateMarkersArray(this.goldenHitEntitys);
    this.updateMarkersArray(this.empHitEntitys);
    this.updateMarkersArray(this.skullHitEntitys);
    this.updateMarkersArray(this.pressedWrongHitEntitys);
};

//created function to avoid long repeditive code
ReactionManager.prototype.updateMarkersArray = function(arr) {
    for(i = 0; i < arr.length; i++){
        this.updateMarkersArrayIndex(arr, i)
    }
}

ReactionManager.prototype.updateMarkersArrayIndex = function(arr, index) {
    arr[index].script.hitMarker.spawnedTime -= this.deltaTime;
    if(arr[index].script.hitMarker.spawnedTime <= 0){
        arr[index].script.hitMarker.spawnedTime = this.markerUpTime;
        arr[index].enabled = false;
    }
}

//-----------------------------HitMarker------------------------------------------
ReactionManager.prototype.spawnHitMarkerAtPos = function(position, points, color) {

    if(this.hitTextEntityArray.length == 0){
        console.log("hit Entity Length is = " + this.hitTextEntityArray.length);
        return false;
    }

    var index = "no index";

    for(var i = 1; i < this.hitTextEntityArray.length; i++){

        if(this.hitTextEntityArray[i] == null)
            continue; 

        if(this.hitTextEntityArray[i].enabled)
            continue;        

        index = i;

        this.hitTextEntityArray[i].setPosition(position);
        this.hitTextEntityArray[i].enabled = true;
        this.hitTextEntityArray[i].element._type = pc.ELEMENTTYPE_TEXT;//_type
        this.hitTextEntityArray[i].element.text = points;
        //this.hitTextEntityArray[i].element.color = color;
        return;
    }

    console.log("index = " + index);
};

ReactionManager.prototype.createHitArrays = function() {
   
    this.highLightHitEntitys_1 = [];
    this.highLightHitEntitys_2 = [];
    this.highLightHitEntitys_3 = [];

    this.pressedWrongHitEntitys = [];
    this.empHitEntitys = [];
    this.skullHitEntitys = [];
    this.goldenHitEntitys = [];

    //create an array of all the diffent effects so as not to spawn anything during runtime
    for(var i = 0; i < this.hitAmount; i++){
        this.cloneEntityToArray(this.clickAssets.highLightHitEntity[0], this.highLightHitEntitys_1)
        this.cloneEntityToArray(this.clickAssets.highLightHitEntity[1], this.highLightHitEntitys_2)
        this.cloneEntityToArray(this.clickAssets.highLightHitEntity[2], this.highLightHitEntitys_3)
        
        this.cloneEntityToArray(this.clickAssets.pressedWrongHitEntity, this.pressedWrongHitEntitys)
        this.cloneEntityToArray(this.clickAssets.empHitEntity, this.empHitEntitys)
        this.cloneEntityToArray(this.clickAssets.skullHitEntity, this.skullHitEntitys)
        this.cloneEntityToArray(this.clickAssets.goldenHitEntity, this.goldenHitEntitys)
    }
};

ReactionManager.prototype.cloneEntityToArray = function(entityToClone, targetArray) {
    const clone = entityToClone.clone();
    this.entity.addChild(clone);
    targetArray.push(clone);
    clone.enabled = false;
}

ReactionManager.prototype.spawnHitImageAtPos = function(position, pointsToAdd, type) {

    var arr = [];
    
    switch(type){
        case colorMode.HighLight: 
            switch(pointsToAdd){
                case 1:
                    arr = this.highLightHitEntitys_1;
                break;
                case 2:
                    arr = this.highLightHitEntitys_2;
                break;
                case 3:
                    arr = this.highLightHitEntitys_3;
                break;
            }
        break;
        case colorMode.Golden: 
            arr = this.goldenHitEntitys;
        break;
        case colorMode.EMP: 
            arr = this.empHitEntitys;
        break;
        case colorMode.Skull: 
            arr = this.skullHitEntitys;
        break;
        case colorMode.PressedWrong: 
            arr = this.pressedWrongHitEntitys;
        break;
        default:
            console.log("spawnHitImageAtPos default");
        break;
    }


    for(var i = 0; i < arr.length; i++){
        if(arr[i].enabled == true){
            continue;
        }
                
        arr[i].setPosition(position);
        arr[i].enabled = true;   
        return;
    }

    console.log("All effects in array in use");
};

ReactionManager.prototype.createUIHits = function() {
    
    this.hitTextEntityArray = [];

    for(var i = 0; i < this.hitAmount; i++){
        var clone = this.hitEntity.clone();
        clone.enabled = false;
        clone.name = clone.name + "_" + i;
        this.entity.addChild(clone);
        this.hitTextEntityArray.push(clone);
    }

    console.log("hitTextEntityArray = " + this.hitTextEntityArray.length);
};

//-----------------------------HitPartical------------------------------------------
ReactionManager.prototype.spawnParticalAtPos = function(position, type) {

    if(this.hitParticalEntityArray.length == 0){
        //console.log("hit Entity Length is = " + this.hitParticalEntityArray.length);
        return false;
    }

    switch(type){
        case colorMode.HighLight:
            for(i = 0; i < this.particalsSettings.particalSpawnLength; i++){

                if(this.hitParticalEntityArray[i] == null || this.hitParticalEntityArray[i].enabled){
                    continue; 
                }           
                
                this.hitParticalEntityArray[i].setPosition(position.add(pc.Vec3.UP));
                this.hitParticalEntityArray[i].enabled = true;
                
                particalScript = this.hitParticalEntityArray[i].script.particalScript;
                particalScript.startPlaying(this.particalsSettings.lifeTime);
                
                //plat sprite on combomileSotne
                if(this.shouldSpawnComboMilestoneEffect){
                    this.spriteEntity.enabled = true;
                    this.spriteEntity.sprite.play('Clip'); 
                    this.spriteEntity.setPosition(position);
                    this.shouldSpawnComboMilestoneEffect = false;
                }

                return;
            }
        break;
        case colorMode.Golden:
            for(i = 0; i < this.particalsSettings.particalSpawnLength; i++){

                if(this.hitParticalGoldenArray[i] == null || this.hitParticalGoldenArray[i].enabled){
                    continue; 
                }                            
                
                this.hitParticalGoldenArray[i].setPosition(position.add(pc.Vec3.UP));
                this.hitParticalGoldenArray[i].enabled = true;
                
                particalScript = this.hitParticalGoldenArray[i].script.particalScript;
                particalScript.startPlaying(this.particalsSettings.lifeTime);

                //plat sprite on combomileSotne
                if(this.shouldSpawnComboMilestoneEffect){
                    this.spriteEntity.enabled = true;
                    this.spriteEntity.sprite.play('Clip'); 
                    this.spriteEntity.setPosition(position);
                    this.shouldSpawnComboMilestoneEffect = false;
                }
                
                return;
            }
        break;
        case colorMode.ShockWave:
            for(i = 0; i < this.particalsSettings.particalSpawnLength; i++){

                if(this.hitParticalShockWaveArray[i] == null || this.hitParticalShockWaveArray[i].enabled){
                    continue; 
                }                          
                
                this.hitParticalShockWaveArray[i].setPosition(position.add(pc.Vec3.UP));
                this.hitParticalShockWaveArray[i].enabled = true;
                
                particalScript = this.hitParticalShockWaveArray[i].script.particalScript;
                particalScript.startPlaying(this.particalsSettings.lifeTime);
                
                //plat sprite on combomileSotne
                if(this.shouldSpawnComboMilestoneEffect){
                    this.spriteEntity.enabled = true;
                    this.spriteEntity.sprite.play('Clip'); 
                    this.spriteEntity.setPosition(position);
                    this.shouldSpawnComboMilestoneEffect = false;
                }

                return;
            }
        break;
        default:
            for(i = 0; i < this.particalsSettings.particalSpawnLength; i++){
                
                if(this.hitParticalWrongArray[i] == null || this.hitParticalWrongArray[i].enabled){
                    continue; 
                }                          
                
                this.hitParticalWrongArray[i].setPosition(position.add(pc.Vec3.UP));
                this.hitParticalWrongArray[i].enabled = true;
                
                particalScript = this.hitParticalWrongArray[i].script.particalScript;
                particalScript.startPlaying(this.particalsSettings.lifeTime);
                
                //plat sprite on combomileSotne
                if(this.shouldSpawnComboMilestoneEffect){
                    this.spriteEntity.enabled = true;
                    this.spriteEntity.sprite.play('Clip'); 
                    this.spriteEntity.setPosition(position);
                    this.shouldSpawnComboMilestoneEffect = false;
                }

                return;
            }
        break;
    }

    return false;
};

ReactionManager.prototype.createParticalHits = function() {
    
    //create partical entitys at start off game 

    this.hitParticalEntityArray = [];
    this.hitParticalGoldenArray = [];
    this.hitParticalWrongArray = [];
    this.hitParticalShockWaveArray = [];

    for(var i = 0; i < this.particalsSettings.particalSpawnLength; i++){
        //Normal heigh light partical
        var particalClone = this.particalsSettings.particalEntity.clone();
        particalClone.enabled = false;
        particalClone.name = particalClone.name + "_" + i;
        this.entity.addChild(particalClone);
        this.hitParticalEntityArray.push(particalClone);
        //Golden Partical
        var goldenClone = this.particalsSettings.particalGoldenEntity.clone();
        goldenClone.enabled = false;
        goldenClone.name = goldenClone.name + "_" + i;
        this.entity.addChild(goldenClone);
        this.hitParticalGoldenArray.push(goldenClone);
        //Bomb PressedWrong EMP Partical
        var wrongClone = this.particalsSettings.particalWrongEntity.clone();
        wrongClone.enabled = false;
        wrongClone.name = wrongClone.name + "_" + i;
        this.entity.addChild(wrongClone);
        this.hitParticalWrongArray.push(wrongClone);
    }

    var shockWaveClone = this.particalsSettings.particalShockWaveEntity.clone();
    shockWaveClone.enabled = false;
    shockWaveClone.name = shockWaveClone.name + "_" + 1;
    this.entity.addChild(shockWaveClone);
    this.hitParticalShockWaveArray.push(shockWaveClone);

    this.particalSpawnGoldenClone = this.particalsSettings.particalSpawnGoldenEntity.clone();
    this.particalSpawnGoldenClone.enabled = false;
    this.entity.addChild(this.particalSpawnGoldenClone);
};

ReactionManager.prototype.updateMissedPix = function() {
    
    var reactionEntity = null;
    var pixTile = null;
    var i = 0;


    switch(this.toDoMissedPix){
        case missedPixType.Ignore:
            for(i = 0; i < this.allPix.length; i++){
                reactionEntity = this.allPix[i];
                pixTile = reactionEntity.script.pixTile;
                if(pixTile.pixWasMissed){
                    pixTile.pixWasMissed = false;
                    this.increaseDecreaseFireMeter(-1);
                    this.cameraEntity.script.glitch.startGlitch();
                }
            }
        break; 
        case missedPixType.MinusScore:
            for(i = 0; i < this.allPix.length; i++){
                reactionEntity = this.allPix[i];
                pixTile = reactionEntity.script.pixTile;
                if(pixTile.pixWasMissed){
                    this.missedPix();
                    pixTile.pixWasMissed = false;
                    this.increaseDecreaseFireMeter(-1);
                    this.addOrSubLives(-1);
                    this.cameraEntity.script.glitch.startGlitch();
                    this.addOrSubLives(-1);
                }
            }
        break;
        case missedPixType.ResetCombo:
            for(i = 0; i < this.allPix.length; i++){
                reactionEntity = this.allPix[i];
                pixTile = reactionEntity.script.pixTile;
                if(pixTile.pixWasMissed){
                    //this.currentMiss -= 1;
                    this.updateMissedCount(false);
                    pixTile.pixWasMissed = false;
                    this.increaseDecreaseFireMeter(-1);
                    this.addOrSubLives(-1);
                    this.cameraEntity.script.glitch.startGlitch();
                    this.addOrSubLives(-1);
                    this.addComboToScore();   
                    this.resetCombo(); 
                }
            }
        break;
        case missedPixType.MinusScoreAndResetCombo:
                
            for(i = 0; i < this.allPix.length; i++){
                reactionEntity = this.allPix[i];
                pixTile = reactionEntity.script.pixTile;
                if(pixTile.pixWasMissed){
                    this.missedPix();
                    //this.currentMiss -= 1;
                    this.updateMissedCount(false);
                    pixTile.pixWasMissed = false;
                    this.increaseDecreaseFireMeter(-1);
                    this.addOrSubLives(-1);                        
                    this.addComboToScore();             
                    /*if(pixTile.youAreHacked){
                        this.cameraEntity.script.glitch.startGlitchDuration(this.hackDuration, this.hackIntensity);
                    }else{
                        this.addOrSubLives(-1);
                    }*/
                }
            }
        break;
    }

    if(!ArrayContains(true, this.missedCountArray))    {
        //this.currentMiss = this.maxMissAmount;        
        this.shakeScreen();
        this.resetMissedCountArray();        
    }
};

ReactionManager.prototype.shakeScreen = function() {
    this.backgroundEntity.script.shackeBackground.startScreenShake();
};

//updateMissedCount
ReactionManager.prototype.updateMissedCount = function(value) {
    
    var length = this.missedCountArray.length - 1;

    for(var i = 1; i < this.maxMissAmount; i++){
        var indexToReplace = i - 1;
        //console.log(indexToReplace);
        this.missedCountArray[indexToReplace] = this.missedCountArray[i];
    }

    this.missedCountArray[length] = value;
    //console.log(this.missedCountArray);

    this.addToQueue(value);
};

ReactionManager.prototype.addToQueue = function(value) {

    var queueValues = [];
    var queueTimes = [];

    for(var y = 0; y < this.queueTimes.length; y++){

        if((this.time - this.queueTimes[y]) < 5){
            queueTimes.push(this.queueTimes[y]);
            queueValues.push(this.queue[y]);
        }       
    }

    this.queueTimes = queueTimes;
    this.queue = queueValues;

    var diffTime = (this.time - this.queueTimes[0]);

    if(diffTime > 5){  
        for(var i = 1; i < this.queueTimes.length; i++){
            this.queueTimes[i - 1] = this.queueTimes[i];   
            this.queue[i - 1] = this.queue[i];   
        }
        this.queue[this.queueTimes.length] = value;
        this.queueTimes[this.queueTimes.length] = this.time;

    }else{
        this.queue.push(value);
        this.queueTimes.push(this.time);
    }

    var indexDivider = this.queueTimes.length;
    
    for(var j = 0; j < this.queueTimes.length; j++){
        if(!this.queue[j]){
            indexDivider--;
        }   
    }

    this.onFireBar5SecEntity.script.progressBar.setTargetValue( indexDivider / this.queueTimes.length);
};

ReactionManager.prototype.missedPix = function() {

    this.ultimateCharge -= this.chargeToLose;
    this.ultimateCharge = Clamp(this.ultimateCharge, 0 ,this.maxUltimateCharge);

    this.score -= 1;
    this.score = Clamp(this.score, 0, this.score + 1);
};

ReactionManager.prototype.addComboToScore = function() {
    this.score += this.multiplier * this.combo;
    this.resetCombo();
};


ReactionManager.prototype.arraylength = function() {
    return this.hightLightArray.length;
};


ReactionManager.prototype.createNewPath = function() {
    if(this.arraySettings.useNearestNeigbor)
        return this.reactionGrid.createRandomOrderNew(this.arraySettings.arrayLength[ this.arraySettings.arrayLength.length - this.currentPhase]);//this.arraySettings.arrayLength[ this.arraySettings.arrayLength.length - this.currentPhase] + 34
    else
        return this.reactionGrid.createRandomOrder(this.arraySettings.arrayLength[ this.arraySettings.arrayLength.length - this.currentPhase]);
};

ReactionManager.prototype.getTotalScore = function() {
    return parseInt(this.score);
};

ReactionManager.prototype.getTime = function() {
    return Clamp(parseInt(this.currentTimer), 0, this.maxTime);
};

ReactionManager.prototype.getCurrentStartTime = function() {
    //return parseInt(this.currentStartUpTime);
    //return Math.round(this.currentStartUpTime);
    return Math.ceil(this.currentStartUpTime);
};

ReactionManager.prototype.increaseCombo = function() {
    this.combo++;

    if(this.combo > this.maxCombo){
        this.maxCombo = this.combo;
    }
};

ReactionManager.prototype.getMaxCombo = function() {
    return this.maxCombo;
};

ReactionManager.prototype.resetCombo = function() {
    this.combo = 0;

    //if(this.entity.sound){
        this.entity.sound.play('lostComboSound');
    //}
};

ReactionManager.prototype.clickedShockWave = function() {
    this.clickedShockWaveThisFrame = true;
    //this.reactionTextEntity.script.moveText.startTransition("Stunning, Nicely done");
    this.textManager.shockWaveText();
};
ReactionManager.prototype.clickedBombOrEMP = function() {
    this.clickedBombOrEMPThisFrame = true;
    //this.reactionTextEntity.script.moveText.startTransition("Miss, Ouch");
    this.textManager.redText();
};
ReactionManager.prototype.clickedGolden = function() {
    this.clickedGoldenThisFrame = true;
    //this.reactionTextEntity.script.moveText.startTransition("Goldrush, Legendary");
    this.textManager.goldenText();
};

ReactionManager.prototype.getCombo = function() {
    return this.combo;
};

ReactionManager.prototype.getComboString = function() {
    if(this.combo <= 0)
        return "";

    return "COMBO " + this.combo;
};

ReactionManager.prototype.getMultiplier = function() {
    return this.multiplier;
};

ReactionManager.prototype.getMultiplierString = function() {
    
    if(this.multiplier == 0 || this.multiplier == 1){
        return "";
    }        
    //var string = ["\nGODSPEED !", "\nSTELLAR!", "\nALPHA!", "\nMOON!", "\nWagmi!"];
    //var stringIndex = Clamp(this.currentMultiplierIndex, 0, this.string.length - 1);
    return "X " + this.multiplier;
};

ReactionManager.prototype.getReactionString = function() {
    
    if(this.clickedGoldenThisFrame){
        this.clickedGoldenThisFrame = false;
        return "Goldrush, Legendary";
    }
    if(this.clickedBombOrEMPThisFrame){
        this.clickedBombOrEMPThisFrame = false;
        return "Miss, Ouch";
    }
    if(this.clickedShockWaveThisFrame){
        this.clickedShockWaveThisFrame = false;
        return "Stunning, Nicely done";
    }

    if(this.multiplier == 0 || this.multiplier == 1 || this.string == null){
        return "";
    }        

    //console.log("string = " + this.string);
    var stringIndex = Clamp(this.currentMultiplierIndex, 0, this.string.length - 1);
    return this.string[stringIndex];
};

ReactionManager.prototype.resetMultiplier = function() {
    this.multiplier = 1;
};

ReactionManager.prototype.resetScore = function() {
    this.score = 0;
    this.ultimateCharge = 0;
};

ReactionManager.prototype.getAllHeigeLightedPixOnScreen = function() {
    
    this.allPix = this.reactionGrid.getAllPixAsArray();
    var arr = [];

    if(this.allPix.length == 0){
        console.log("early return because array langth is 0");
        return arr;
    }    
    
    for(var i = 0; i < this.allPix.length; i++){
        if(!this.allPix[i].script.pixTile){
            continue;
        }

        if(!this.allPix[i].script.pixTile.canBeClicked()){
            continue;
        }

        arr.push(this.allPix[i]);
    }
    return arr;
};

ReactionManager.prototype.clickAll = function() {
    
    var arr = this.getAllHeigeLightedPixOnScreen();
    
    for(var i = 0; i < arr.length; i++){
        
        var pixTile = arr[i].script.pixTile;

        if(pixTile.isHighLight()){
            
            this.increaseCombo();
            
            var pointsToAdd = this.getPointsToAdd(pixTile);
            this.addScore(pointsToAdd);
            console.log("pointsToAdd = " + pointsToAdd);
            var assets = this.getAsset(pointsToAdd, pixTile.currentType);
            this.spawnHitImageAtPos(arr[i].getPosition(), assets);
            
            pixTile.pixCliked(this.getPitch(), pointsToAdd);
        }
    }
    
    return arr;
};

ReactionManager.prototype.gameOver = function() {
    
    //if(this.entity.sound){
        this.entity.sound.stop('backgroundSound');
    //}
    
    //this.cameraEntity.script.glitch.startGlitchDuration(0, 0);
    var glitchEffect = this.cameraEntity.script.glitch;
    if(glitchEffect){
        glitchEffect.startGlitchDuration(0, 0);
    }

    var percent = (this.onFireMeter / this.maxOnFireMeter);
    var index = Math.floor(percent * 5);
    this.starCounterEntity.script.starCounter.showStars(index);

    console.log("index = " + index);

    //this.onFireMeter = 0;
    //this.maxOnFireMeter = 0;

    this.addComboToScore();
    this.resetCombo();
    
    this.resetMultiplier();
    this.screenUIManager.gameOverUi();
    this.isPlaying = false;
    //this.gameIsOver = true;
};


ReactionManager.prototype.increaseDecreaseFireMeter = function(toAdd, type) {
    
    if(type == "Max" && toAdd > 0){      
        this.maxOnFireMeter += toAdd;        
    }else{
        //console.log("before onFireMeter = " + this.onFireMeter);
        this.onFireMeter += toAdd;
        //console.log("after onFireMeter = " + this.onFireMeter);
    }

    this.onFireMeter = Clamp(this.onFireMeter, 0, this.maxOnFireMeter);

    var value = this.onFireMeter / this.maxOnFireMeter;
    this.onFireBarEntity.script.progressBar.setTargetValue(value);
    
    /*console.log("value = " + value);
    console.log("onFireMeter = " + this.onFireMeter);
    console.log("maxOnFireMeter = " + this.maxOnFireMeter);
    console.log("toAdd = " + toAdd);*/
};

ReactionManager.prototype.getPitch = function() {
    
    var minValue = 1;
    var maxValue = 2;

    var minStep = this.multiplierMilestone[this.currentMultiplierIndex];
    var maxStep = this.multiplierMilestone[(this.currentMultiplierIndex + 1) % this.multiplierMilestone.length ];

    var stepBetween = (maxStep - minStep);
    var currentStep = maxStep - this.combo;
    var stepDiff = (maxValue - minValue) / stepBetween;     
    var pitch = (maxValue - (currentStep * stepDiff));
    pitch = Math.max(minValue, Math.min(pitch, maxValue));
    return pitch;
};

ReactionManager.prototype.getFireMeterString = function() {
    return this.onFireMeter;
};

ReactionManager.prototype.getMaxFireMeterString = function() {
    return this.maxOnFireMeter;
};

ReactionManager.prototype.getUltimatePercentString = function() {
    return Math.floor ( Clamp(this.ultimateCharge, 0, this.maxUltimateCharge) * (1 / 3)) + "%";
};


ReactionManager.prototype.getComboSliderPercent = function() {
    
    if(this.useUltimateBar){ 

        //console.log("ultimateCharge = " + this.ultimateCharge);
        //console.log("maxUltimateCharge = " + this.maxUltimateCharge);

        this.ultimateCharge = Clamp(this.ultimateCharge, 0, this.maxUltimateCharge);

        return this.ultimateCharge / this.maxUltimateCharge;

        var length = 3;
        var percent = 0;
        var milestone = this.maxUltimateCharge / 3;

        var currentValue = this.ultimateCharge / this.maxUltimateCharge;
        currentValue = Clamp(currentValue, 0, 1);

        for(var i = 1; i < length + 1; i++){
            console.log();
            if(this.ultimateCharge >= milestone * i){
                percent++;
            }
        }

        var value = percent == 0 ? 0 : (1 / 3) * percent;
        //console.log("percentValue = " + percent);
        //console.log("value = " + value);
        //console.log("currentValue = " + currentValue);
        return value; //this.ultimateCharge / this.maxUltimateCharge;
    }    
    
    /*var combo_onFireMeter = this.combo + this.onFireMeter;
    var max_Combo_Milestone_maxOnFireMeter = this.multiplierMilestone[this.multiplierMilestone.length - 1] + this.maxOnFireMeter * 0.7;
    var comboPercent = combo_onFireMeter / max_Combo_Milestone_maxOnFireMeter;// + this.maxOnFireMeter;
    return comboPercent;*/
};

ReactionManager.prototype.startGame = function() {
    this.isPlaying = true;
};

ReactionManager.prototype.addOrSubLives = function(value) {
    this.lives += value;
    this.lives = Clamp(this.lives, 0 , this.maxLives);
    
    //console.log("lives = " + this.lives);
    if(this.lives <= 0){
        this.gameOver();
    }
};

ReactionManager.prototype.pressedWrongTestCall = function(value) {
    console.log("pressedWrongTestCall = ");
};

ReactionManager.prototype.startCountDown = function() {
    this.inCountDown = true;
    //this.isPlaying = true;
};


ReactionManager.prototype.increaseEMPDuration = function() {
    this.empDuration += 0.5;
    this.empDuration = Clamp(this.empDuration, 0, 1000);
    this.cameraEntity.script.glitch.startGlitchDuration(this.empDuration, this.empIntensity);
};

ReactionManager.prototype.decreaseEMPDuration = function() {
    this.empDuration -= 0.5;
    this.empDuration = Clamp(this.empDuration, 0, 1000);
    this.cameraEntity.script.glitch.startGlitchDuration(this.empDuration, this.empIntensity);
};

ReactionManager.prototype.increaseEMPIntensity = function() {
    this.empIntensity += 0.005;
    this.empIntensity = Clamp(this.empIntensity, 0, 1);
    this.cameraEntity.script.glitch.startGlitchDuration(this.empDuration, this.empIntensity);
};

ReactionManager.prototype.decreaseEMPIntensity = function() {
    this.empIntensity -= 0.005;
    this.empIntensity = Clamp(this.empIntensity, 0, 1);
    this.cameraEntity.script.glitch.startGlitchDuration(this.empDuration, this.empIntensity);
};

ReactionManager.prototype.getEMPDuration = function() {
    return this.empDuration;
};

ReactionManager.prototype.getEMPIntensity = function() {
    return this.empIntensity;
};

ReactionManager.prototype.useUltimate = function() {
    
    if(this.ultimateCharge >= this.maxUltimateCharge / 3){
        this.clickAll();
        this.ultimateCharge -= this.maxUltimateCharge / 3;
    }
};


ReactionManager.prototype.checkPixForEMP = function() {

    if(this.allPix.length == 0 || !this.isPlaying){
        return;
    }

    for(var i = 0; i < this.allPix.length; i++){
        if(this.allPix[i] == null)
            continue;
        if(this.allPix[i].script.pixTile == null)
            continue;

        if(this.allPix[i].script.pixTile.playerEMP){
            this.cameraEntity.script.glitch.startGlitchDuration(this.empDuration, this.empIntensity);
            this.allPix[i].script.pixTile.resetEMP();   
        }
     
    }    
};

ReactionManager.prototype.getPointsToAdd = function(script) {
    var pointsToAdd = 0;

    if(script == null){
        console.log("pixScript is null");
        return;
    }    

    var timeDiff = script.maxStayTime / this.maxPoints;
    var currentTime = script.getCurrentTime();

    for(var i = 0; i < this.maxPoints; i++){
        var timeDiffrence = timeDiff * i;
        if(currentTime > timeDiffrence){
            pointsToAdd++;
        }
    }

    return pointsToAdd;
};

ReactionManager.prototype.getAsset = function(pointsToAdd, type) {
    var asset = null;

    //pressedWrongAsset SkullAsset goldenAsset highLightAsset
    switch(type){
        case colorMode.HighLight:
            var index = pointsToAdd - 1;
            if(this.clickAssets.highLightAsset[index]){
                asset = this.clickAssets.highLightAsset[index];    
                //console.log("HighLight Asset");
            }else{
                asset = null;
                //console.log("Asset is null");
            }            
        break;
        case colorMode.Golden:
            asset = this.clickAssets.goldenAsset;
            //console.log("Golden Asset");
        break;
        case colorMode.Skull:
            asset = this.clickAssets.skullAsset;
            //console.log("skull Asset");
        break;
        case colorMode.EMP:
            asset = this.clickAssets.empAsset;
            //console.log("hacked Asset");
        break;
        case colorMode.PressedWrong:
            asset = this.clickAssets.pressedWrongAsset;
            //console.log("PressedWrong Asset");
        break;
    }

    return asset;
};

//pressedWrongAsset skullAsset goldenAsset highLightAsset

//Sound Stuff
//---------------------------------------------------------------
ReactionManager.prototype.muteAllSound = function() {
    this.sounds = this.app.root.find(node => {
        return node.sound;
    });

    for(var i = 0; i < this.sounds.length; i++){
        if(this.sounds.volume >= 0){
           this.sounds.volume = 0; 
        }       
    }
};

ReactionManager.prototype.changeMasterVolume = function(volume) {
    this.moveables = this.app.root.find(node => {
        return node.sound;
    });

    for(var i = 0; i < this.sounds.length; i++){
        this.sounds.volume = volume;     
    }
};
//---------------------------------------------------------------
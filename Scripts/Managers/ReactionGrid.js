/*
    *pusle effect after higelight all Pix. 
    *Increase Pix amount.
    *dercease Time.
    *chenge to green on correct pick, red on incorrect pick.
    *sinWave pulse 
*/ 
var ReactionGrid = pc.createScript('reactionGrid');

ReactionGrid.attributes.add('nrOfRings', {
    type: 'number',
    default: 15, 
});

ReactionGrid.attributes.add('maxNrOfRings', {
    type: 'number',
    default: 3, 
});


ReactionGrid.attributes.add('pixRendererEntity', {
    type: 'entity',
    default: null, 
    title: 'pix Renderer Entity PC'
});

ReactionGrid.attributes.add('pixRendererEntityPhone', {
    type: 'entity',
    default: null, 
    title: 'pix Renderer Entity Phone'
});


var gridTypeEnum = { 'Flat': 1,'Pointy': 2 };

ReactionGrid.attributes.add('gridType', {
    type: 'number',
    enum: Object.entries(gridTypeEnum).map(kvp => {var e = {}; e[kvp[0]] = kvp[1]; return e;}),
    default: 1
});

ReactionGrid.attributes.add('pixSpacingX', {
    type: 'number',
    title: 'Pix Spacing X',
    description: 'The space between the PIX centres.',
    default: 1.1,
    min: 0.1,
    max: 5
});

ReactionGrid.attributes.add('pixSpacingY', {
    type: 'number',
    title: 'Pix Spacing Y',
    description: 'The space between the PIX centres.',
    default: 1.1,
    min: 0.1,
    max: 5
});

ReactionGrid.attributes.add('phonePixSpacingX', {
    type: 'number',
    title: 'Pix Spacing X phone',
    description: 'The space between the PIX centres on phone.',
    default: 1.1,
    min: 0.1,
    max: 5
});

ReactionGrid.attributes.add('phonePixSpacingY', {
    type: 'number',
    title: 'Pix Spacing Y phone',
    description: 'The space between the PIX centres on phone.',
    default: 1.1,
    min: 0.1,
    max: 5
});

// initialize code called once per entity
ReactionGrid.prototype.initialize = function() {
    this.setUp();
};

ReactionGrid.prototype.setUp = function() {
    
    this.currentNumberOfRings = 1;

    this.sizeTimer = 2;
    this.size = 1;
    this.originalNumberOfRings = this.nrOfRings;

    
    this.debug = false;

    //Cheat for mobil and pc to fix background
    //if (this.app.touch) {
    var w = window.innerWidth;
	var h = window.innerHeight;

    if(w < h){
        this.currentPixSpacingX = this.phonePixSpacingX;
        this.currentPixSpacingY = this.phonePixSpacingY;      
        this.pixEntityProto =  this.pixRendererEntityPhone;
        console.log("Phone Mode");
    }else{
        this.currentPixSpacingX = this.pixSpacingX;
        this.currentPixSpacingY = this.pixSpacingY;
        this.pixEntityProto =  this.pixRendererEntity;
        console.log("PC Mode");
    }
    /*
    this.currentPixSpacingX = this.pixSpacingX;
    this.currentPixSpacingY = this.pixSpacingY;
    this.pixEntityProto =  this.pixRendererEntity;*/

    this.oldPixSpacingX = this.currentPixSpacingX;
    this.oldPixSpacingY = this.currentPixSpacingY;
    
    this.updateArray = false;
    this.hasBeen = [];

    this.hightLightOrder = false;

    this.hightLightArray = [];
    this.oldLightArray = [];
    this.currentIndex = 0;
    this.indexArray = 0;
    this.pulse = false;
    this.currentPulse = true;
    this.pulseAmount = 0;
    this.pulseTimer = 0;

    switch(this.gridType){
        case gridTypeEnum.Pointy:
            this.layout_type = layout_pointy;
        break;
        case gridTypeEnum.Flat:
            this.layout_type = layout_flat;
        break;
        default:
            this.layout_type = layout_flat;
        break;
    }

    this.layout = new Layout(this.layout_type, new Point(this.currentPixSpacingX, this.currentPixSpacingY), new Point(0, 0));

    this.pixTable = new Map();
    
    this.spawnHexagons();
    this.increaseGridSize();
};

ReactionGrid.prototype.update = function(dt) {

    if (this.app.touch) {
        this.currentPixSpacingX = this.phonePixSpacingX;
        this.currentPixSpacingY = this.phonePixSpacingY;      
        this.pixEntityProto =  this.pixRendererEntityPhone;
    }else{
        this.currentPixSpacingX = this.pixSpacingX;
        this.currentPixSpacingY = this.pixSpacingY;
        this.pixEntityProto =  this.pixRendererEntity;
    }

    this.reSizeSpacing();

    this.oldPixSpacingX = this.currentPixSpacingX;
    this.oldPixSpacingY = this.currentPixSpacingY;
    
};

ReactionGrid.prototype.getPixCordFromPosition = function(pos) {
    var layout = this.layout;
    var pixCord = hex_round(pixel_to_hex(layout, new Point(pos.x, pos.z)));
    return pixCord;
};

ReactionGrid.prototype.getPositionFromPixCord = function(pixCord) {
    var layout = this.layout;
    var hexPoint = hex_to_pixel(layout, pixCord);

    return new pc.Vec3(hexPoint.x, 0.0, hexPoint.y);
};

ReactionGrid.prototype.hasPix = function(pixCord) {
    return this.pixTable.has(hex_to_string(pixCord));
};

ReactionGrid.prototype.getCurrentPix = function() {
    var currentPix = this.hightLightArray[this.currentIndex];
    //console.log(this.currentIndex);
    this.currentIndex++;
    return currentPix;
};

ReactionGrid.prototype.selectPix = function(pickedEntity) {
    var reactionScript = pickedEntity.script.pixTile;
    reactionScript.pixCliked();
};

ReactionGrid.prototype.finishedMemory = function() {
    console.log("finishedMemory");
    this.hightLightOrder = true;
    this.indexArray = 0;
    this.createNewArray();
    this.updateArray = true;
};

ReactionGrid.prototype.getPix = function(pixCord) {
    return this.pixTable.get(hex_to_string(pixCord));
};

ReactionGrid.prototype.getAllPixAsArray = function() {
    
    var keys = Array.from(this.pixTable.keys()); 
    var length = keys.length;
    var missedEntitys = [];

    for(var i = 0; i < length; i++){
        var coord = string_to_hex(keys[i]);
        var entity = this.getPix(coord);
        if(entity != null){
            missedEntitys.push(entity);
        }        
    }

    return missedEntitys;
};

ReactionGrid.prototype.setPix = function(pixCord, pix) {
    var key = hex_to_string(pixCord);

    var name = pix.name + "_q_" + pixCord.q +"_r_" + pixCord.r +"_s_" + pixCord.s;
    pix.name = name;

    this.pixTable.set(key, pix);
    var pixPos = hex_to_pixel(this.layout, pixCord);
    pix.setPosition(pixPos.x, 0.0, pixPos.y);
};

ReactionGrid.prototype.createPix = function() {
    var pixClone = this.pixEntityProto.clone();
    pixClone.setPosition(new pc.Vec3(0,0,0));
    this.entity.addChild(pixClone);
    pixClone.enabled = true;
    pixClone.script.pixTile.setMaterials();
    
    return pixClone;
};

ReactionGrid.prototype.realignPixSpacing = function() {
    this.layout = new Layout(this.layout_type, new Point(this.currentPixSpacingX, this.currentPixSpacingY), new Point(0, 0));

    this.pixTable.forEach((value, key) => {
        this.setPix(string_to_hex(key), value);
    });
   
    this.oldPixSpacing = this.pixSpacing;
};

ReactionGrid.prototype.resetGrid = function() {

    this.pixTable.forEach((value, key) => {
        value.destroy();
    });

    this.pixTable.clear();
    this.pixTable = new Map();
    this.nrOfRings = this.originalNumberOfRings;
    this.spawnHexagons();   
    this.increaseGridSize();
    this.oldPixSpacing = this.pixSpacing;
};

ReactionGrid.prototype.arrayContains = function(array, value) {
    
    var contains = false;
     
    if(array.length < 0 || array == null){
        return contains;
    }

    for(var i = 0; i < array.length; i++){  
        if(array[i] == value){
            contains = true;
        }
    }

    return contains;
};

ReactionGrid.prototype.spawnHexagons = function() {

    if(this.app.touch) {
        this.currentPixSpacingX = this.phonePixSpacingX;
        this.currentPixSpacingY = this.phonePixSpacingY;      
        this.pixEntityProto =  this.pixRendererEntityPhone;
    }else{
        this.currentPixSpacingX = this.pixSpacingX;
        this.currentPixSpacingY = this.pixSpacingY;
        this.pixEntityProto =  this.pixRendererEntity;
    }

    var isRValid = null;
    var isQValid = null;
    var isSValid = null;
    var pixCord = null;
    var clone = null;

    for(var r = -this.maxNrOfRings; r <= this.maxNrOfRings; r++){
        for(var q = -this.maxNrOfRings; q <= this.maxNrOfRings; q++){
            for(var s = -this.maxNrOfRings; s <= this.maxNrOfRings; s++){

                if(r + q + s != 0){
                    continue;
                }

                pixCord = new Hex(r, q, s);
                
                if(this.getPix(pixCord) == null){
                    clone = this.createPix();
                    this.setPix(pixCord, clone);
                    clone.enabled = false;
                }
                
                isRValid = this.currentNumberOfRings < r && -this.currentNumberOfRings > r;
                isQValid = this.currentNumberOfRings < q && -this.currentNumberOfRings > q;
                isSValid = this.currentNumberOfRings < s && -this.currentNumberOfRings > s;

                if(isRValid || isQValid || isSValid){
                    this.getPix(pixCord).enabled = true;
                }                
                else{
                    this.getPix(pixCord).enabled = false;
                }           
            }
        }
    }
};

ReactionGrid.prototype.increaseGridSize = function() {

    for(var r = -this.currentNumberOfRings; r <= this.currentNumberOfRings; r++){
        for(var q = -this.currentNumberOfRings; q <= this.currentNumberOfRings; q++){
            for(var s = -this.currentNumberOfRings; s <= this.currentNumberOfRings; s++){
                var isValidHexCord = r + q + s == 0;

                if(!isValidHexCord){
                    continue;
                }

                var pixCord = new Hex(r, q, s);

                if(this.getPix(pixCord) == null){
                    var clone = this.createPix();
                    this.setPix(pixCord, clone);
                    console.log("increaseGridSize create new pix");
                }else{
                    console.log("increaseGridSize enabled existing");
                    var hex = this.getPix(pixCord);
                    hex.enabled = true;
                }
            }
        }
    }
};

ReactionGrid.prototype.createPixAtCord = function(cord) {
    var level = 6;
    var tierType = pixTierEnum.Legendary;
    var clone = this.createPix(tierType, level);
    this.setPix(cord, clone);
};

ReactionGrid.prototype.loopIndex = function(index, array) {
    index = parseInt((index + 1) % array.length);
    if(this.debug){ console.log(index); }
    return index;
};

ReactionGrid.prototype.resetArray = function() {
    this.pixTable.forEach((value, key) => {
        var higeLightEntity = value.script.pixTile;
        higeLightEntity.deHightLight();
    });
};

ReactionGrid.prototype.hightLightAll = function() {
    this.pixTable.forEach((value, key) => {
        var higeLightEntity = value.script.pixTile;
        higeLightEntity.hightLight();
    });
};

ReactionGrid.prototype.resetAll = function() {
    this.resetArray(this.hightLightArray);
    this.indexArray = 0;
    this.updateArray = true;
};

ReactionGrid.prototype.reSizeSpacing = function() {
    if(this.oldPixSpacingX != this.currentPixSpacingX || this.oldPixSpacingY != this.currentPixSpacingY) {
        this.realignPixSpacing();
    }
};

ReactionGrid.prototype.createNewArray = function() {
    //this.hightLightArray = this.createRandomOrder(this.originalArrayLength);
    if(this.debug){ console.log("new array"); }
    if(this.debug){ console.log(this.hightLightArray); } 
    return this.hightLightArray;
};

ReactionGrid.prototype.hightLightPixInArray = function(deSpawnTime, hightLightOrder) {
    
    console.log("hightLightPixInArray");

    if(this.hightLightArray.length <= 0 && this.hightLightArray.length < this.indexArray){
        return;
    }        

    if(this.hightLightArray[this.indexArray] == "undefined"){
        return;
    }        

    var pix = this.hightLightArray[this.indexArray];
    var reactionScript = pix.script.pixTile;
  
    if(!reactionScript.canBeClicked()){
        reactionScript.higeLightType(colorMode.HigheLight, deSpawnTime); 
    }

    this.indexArray++;

    //ToDo make this better. use weapon way if possible (currentWeaponIndex = (currentWeaponIndex + 1) % WeaponDatas.Length;)
    if(this.indexArray >= this.hightLightArray.length){
        this.indexArray = 0;
        hightLightOrder = false;
    }   

    return hightLightOrder;  
};

ReactionGrid.prototype.createRandomOrder = function(length) {

    console.log("createRandomOrder");

    if(this.pixTable == null){
        console.log("pixTable is null");
        return;
    }
    var keys = Array.from(this.pixTable.keys()); 

    if(length > keys.length){
        console.log("length is larger than array, decrease arrayLength");
        length = keys.length;
        //return;
    }   

    var clickOrder = [];
    var numberOrder = [];
    numberOrder = this.createNonRepetingRandomNumbersArray(numberOrder, length);

    for(var i = 0; i < length; i++){  
        var index = numberOrder[i];
        var pixCord = keys[index];

        console.log("pix cord = " + pixCord);
        var entity = this.pixTable.get(pixCord);

        if(!entity){
            console.log("did not get entity from pixTable" );
            continue;
        }
        clickOrder.push(entity);
    }

    return clickOrder;
};

ReactionGrid.prototype.createNonRepetingRandomNumbersArray = function(array, arrayLength) {
    var index;
    var keys = Array.from(this.pixTable.keys());

    if(keys < arrayLength){
        return "length is larger than array";
    }
    
    for(var i = 0; i < arrayLength; i++){  
        index = CreateRandomNumber(0, keys.length - 1, this.seed);

        while(this.arrayContains(array, index) ){//&& this.arrayContains(this.oldLightArray, index)
            this.seed *= 3;
            index = CreateRandomNumber(0, keys.length - 1, this.seed);
        }

        array.push(index);     
    }

    this.oldLightArray = array;

    return array;
};

ReactionGrid.prototype.getRandomHex = function() {

    console.log("getRandomHex");  
    
    var keys = Array.from(this.pixTable.keys());

    var validHex = [];

    for (var i = 0; i < keys.length; i++){

        var entity = this.pixTable.get(keys[i]);

        if(entity == null){
            continue;
        }

        if(!entity.enabled){
            continue;
        }

        var reactionScript =  entity.script.pixTile;

        if(reactionScript.isDefault()){
            validHex.push(entity);
        }        
    }

    var keyIndex = CreateRandomNumber(0, validHex.length, this.seed);
    this.seed *= 2;
    //console.log("keyIndex = " + keyIndex);
    return validHex[keyIndex];
};

ReactionGrid.prototype.createRandomOrderNew = function(length){

    var keys = Array.from(this.pixTable.keys());
    var index = CreateRandomNumber(0, keys.length, this.seed);
    this.seed *= 2;
    var currentCoord = keys[index];
    var oldIndex;
    var path = [];

    for(var i = 0; i < length; i++){   

        if(path.length >= length) {
            console.log("path.length is larger than length");
            return path;
        }

        var directions = [];
        directions = this.getHexNeighbors(currentCoord);//Get Valid directions

        if(directions.length == 0){
            this.hasBeen = [];
            return path;
        }            

        var randomDir = CreateRandomNumber(0, directions.length, this.seed);
        this.seed *= 2;

        var entity = null;

        if(!this.arrayContains(this.hasBeen, directions[randomDir])){

            entity = this.pixTable.get(directions[randomDir]);

            if(entity){
                path.push(entity);
            }
        }else{

            for(var j = 0; j < directions.length; i++){
                randomDir = i;
                if(!this.arrayContains(this.hasBeen, directions[randomDir])){

                    entity = this.pixTable.get(directions[randomDir]);
                    
                    if(entity){
                        var reactionScript = entity.script.pixTile;

                        if(reactionScript && !reactionScript.specialHex)
                            path.push(entity);
                    }
                    break;
                }
            }
        }

        this.hasBeen.push(currentCoord);

        currentCoord = directions[randomDir];
    }
    this.hasBeen = [];

    return path;
};

//------------------ Fix get neibors -----------------------------


ReactionGrid.prototype.setSeed = function(seed) {
    this.seed = seed;
    console.log("seed = " + this.seed);
};

ReactionGrid.prototype.getHexNeighbors = function(currentCoord) {

    var directions = [];

    if(currentCoord != null )
    {

        var qrs = currentCoord.split(",");
        var q = parseInt(qrs[0]);
        var r = parseInt(qrs[1]);
        var s = parseInt(qrs[2]);

        for(var x = -1; x <= 1; x++){
            for(var y = -1; y <= 1; y++){
                for(var z = -1; z <= 1; z++){
                    if(x == 0 && y == 0 && z == 0)
                        continue;         

                    var isValidHexCord = (q + x) + (r + y) + (s + z) == 0;

                    if(isValidHexCord){
                        var coord = new Hex((q + x), (r + y), (s + z));
                        coord = hex_to_string(coord);
                        var entity = this.pixTable.get(coord);
                        
                        if(entity != null && entity.enabled){
                            directions.push(coord);
                        }
                    }
                }
            }
        }
    }

    return directions;
};
  
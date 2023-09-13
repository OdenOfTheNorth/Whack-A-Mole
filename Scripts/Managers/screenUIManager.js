var ScreenUIManager = pc.createScript('screenUIManager');

ScreenUIManager.attributes.add('gameOverUIArray', {
    type: 'entity',
    array: true,
    description: 'GameOverMenu'
});
ScreenUIManager.attributes.add('inGameUIArray', {
    type: 'entity',
    array: true,
    description: 'InGameMenu'
});
ScreenUIManager.attributes.add('startCountDownGameUIArray', {
    type: 'entity',
    array: true,
    description: 'startGameUI'
});
ScreenUIManager.attributes.add('startGameUIArray', {
    type: 'entity',
    array: true,
    description: 'startGameUI'
});

ScreenUIManager.prototype.startGameUI = function(dt) {
    for(var i = 0; i < this.gameOverUIArray.length; i++){
        if(this.gameOverUIArray[i] != null)
        this.gameOverUIArray[i].enabled = false;
    }

    for(var i = 0; i < this.inGameUIArray.length; i++){
        if(this.inGameUIArray[i] != null)
        this.inGameUIArray[i].enabled = false;
    }

    for(var i = 0; i < this.startCountDownGameUIArray.length; i++){
        if(this.startCountDownGameUIArray[i] != null)
        this.startCountDownGameUIArray[i].enabled = false;
    }

    for(var i = 0; i < this.startGameUIArray.length; i++){
        if(this.startGameUIArray[i] != null)
        this.startGameUIArray[i].enabled = true;
    }
};

ScreenUIManager.prototype.startCountDownGameUI = function(dt) {
    for(var i = 0; i < this.gameOverUIArray.length; i++){
        if(this.gameOverUIArray[i] != null)
        this.gameOverUIArray[i].enabled = false;
    }

    for(var i = 0; i < this.inGameUIArray.length; i++){
        if(this.inGameUIArray[i] != null)
        this.inGameUIArray[i].enabled = false;
    }

    for(var i = 0; i < this.startGameUIArray.length; i++){
        if(this.startGameUIArray[i] != null)
        this.startGameUIArray[i].enabled = false;
    }

    for(var i = 0; i < this.startCountDownGameUIArray.length; i++){
        if(this.startCountDownGameUIArray[i] != null)
        this.startCountDownGameUIArray[i].enabled = true;
    }
};

ScreenUIManager.prototype.gameOverUi = function(dt) {
    
    for(var i = 0; i < this.inGameUIArray.length; i++){
        if(this.inGameUIArray[i] != null)
        this.inGameUIArray[i].enabled = false;
    }

    for(var i = 0; i < this.startCountDownGameUIArray.length; i++){
        if(this.startCountDownGameUIArray[i] != null)
        this.startCountDownGameUIArray[i].enabled = false;
    }

    for(var i = 0; i < this.startGameUIArray.length; i++){
        if(this.startGameUIArray[i] != null)
        this.startGameUIArray[i].enabled = false;
    }

    for(var i = 0; i < this.gameOverUIArray.length; i++){
        if(this.gameOverUIArray[i] != null)
        this.gameOverUIArray[i].enabled = true;
    }
};

ScreenUIManager.prototype.inGameUI = function(dt) {

    for(var i = 0; i < this.startCountDownGameUIArray.length; i++){
        if(this.startCountDownGameUIArray[i] != null)
        this.startCountDownGameUIArray[i].enabled = false;
    }

    for(var i = 0; i < this.gameOverUIArray.length; i++){
        if(this.gameOverUIArray[i] != null)
        this.gameOverUIArray[i].enabled = false;
        
    }

    for(var i = 0; i < this.startGameUIArray.length; i++){
        if(this.startGameUIArray[i] != null)
        this.startGameUIArray[i].enabled = false;
    }

    for(var i = 0; i < this.inGameUIArray.length; i++){
        if(this.inGameUIArray[i] != null)
        this.inGameUIArray[i].enabled = true;
    }
};

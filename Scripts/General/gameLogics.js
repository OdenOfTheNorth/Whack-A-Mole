var GameLogics = pc.createScript('gameLogics');

GameLogics.attributes.add('pixGridEntity', {
    type: 'entity',
    default: null, 
    title: 'Pix Grid Entity'
});

GameLogics.prototype.initialize = function() {
    this.isCursorInScreen = true;
};

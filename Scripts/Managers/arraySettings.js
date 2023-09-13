var ArraySettings = pc.createScript('arraySettings');


ArraySettings.attributes.add('shouldDeacreaseTime', {
    type: 'boolean',
    default: false
});

//time to decrease delay between phases
ArraySettings.attributes.add('decreaseDelay', {
    type: 'number',
    default: 0.1
});

ArraySettings.attributes.add('useNearestNeigbor', {
    type: 'boolean',
    default: false
});

ArraySettings.attributes.add('highLightPixDelay', {
    type: 'number',
    default: 0.1
});

ArraySettings.attributes.add('spawnArrayDelay', {
    type: 'number',
    default: 0.1
});

ArraySettings.attributes.add('reactionGridEntity', {
    type: 'entity',
    default: null, 
    title: 'reaction Grid Entity'
});

ArraySettings.attributes.add('arrayLength', {
    type: 'number',
    default: [5,5,3,3],
    array: true
});

ArraySettings.attributes.add('hexSpawnTimes', {
    type: 'number',
    array: true
});

ArraySettings.attributes.add('maxOnScreen', {
    type: 'number',
});
var TextSettings = pc.createScript('textSettings');

TextSettings.attributes.add('bombString', {
    type: 'string',
    array: true
});

TextSettings.attributes.add('goldString', {
    type: 'string',
    array: true
});

TextSettings.attributes.add('shockWaveString', {
    type: 'string',
    array: true
});

TextSettings.attributes.add('healthString', {
    type: 'string',
    array: true
});

TextSettings.attributes.add('comboString', {
    type: 'string',
    array: true
});

TextSettings.attributes.add('startCountDownEntity', {
    type: 'entity'
});

TextSettings.attributes.add('countDownIncrease', {
    type: 'number'
});

TextSettings.attributes.add('timerEntity', {
    type: 'entity'
});

TextSettings.attributes.add('timerIncrease', {
    type: 'number'
});

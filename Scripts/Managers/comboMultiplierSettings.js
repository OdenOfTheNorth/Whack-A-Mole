var ComboMultiplierSettings = pc.createScript('comboMultiplierSettings');

ComboMultiplierSettings.attributes.add('difficultiesPhases', {
    type: 'number',
    default: 3
});

ComboMultiplierSettings.attributes.add('multiplierMilestone', {
    type: 'number',
    array: true
});

ComboMultiplierSettings.attributes.add('amountMultiplier', {
    type: 'number',
    array: true
});

ComboMultiplierSettings.attributes.add('string', {
    type: 'string',
    array: true
});
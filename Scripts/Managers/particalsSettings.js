var ParticalsSettings = pc.createScript('particalsSettings');

ParticalsSettings.attributes.add('particalEntity', {
    type: 'entity',
    default: null
});

ParticalsSettings.attributes.add('particalGoldenEntity', {
    type: 'entity',
    default: null
});

ParticalsSettings.attributes.add('particalSpawnGoldenEntity', {
    type: 'entity',
    default: null
});

ParticalsSettings.attributes.add('particalWrongEntity', {
    type: 'entity',
    default: null
});

ParticalsSettings.attributes.add('particalShockWaveEntity', {
    type: 'entity',
    default: null
});

ParticalsSettings.attributes.add('particalSpawnLength', {
    type: 'number',
    default: 5
});

ParticalsSettings.attributes.add('lifeTime', {
    type: 'number',
    default: 2
});
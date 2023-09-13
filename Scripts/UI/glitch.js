if (typeof window.Glitch === 'undefined') {
    class GlitchEffect extends pc.PostEffect {
        constructor(graphicsDevice) {
            super(graphicsDevice);

            // Shaders
            var attributes = {
                aPosition: pc.SEMANTIC_POSITION
            };

            var passThroughVert = [
                "attribute vec2 aPosition;",
                "",
                "varying vec2 vUv0;",
                "",
                "void main(void)",
                "{",
                "    gl_Position = vec4(aPosition, 0.0, 1.0);",
                "    vUv0 = (aPosition + 1.0) * 0.5;",
                "}"
            ].join("\n");

            // Pixel shader extracts the brighter areas of an image.
            // This is the first step in applying a bloom postprocess.
            var glitchFrag = [
                "precision " + graphicsDevice.precision + " float;",
                "uniform sampler2D uColorBuffer;",
                "uniform sampler2D iChannel1;",
                "uniform float iTime;",
                "uniform float iGlitchAmount;",
                "uniform bool iGlitchIsActive;",
                "",
                "varying vec2 vUv0;",
                //              maxIterations = 10.0 * AMT
                "   const float maxIterations = 2.0;",
                "",
                "float random2d(vec2 n) {" ,
                "   return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);",
                "}",
                "",
                "float randomRange (in vec2 seed, in float min, in float max) {",
                "   return min + random2d(seed) * (max - min);",
                "}",
                "",
                "float insideRange(float v, float bottom, float top) {",
                "   return (step(bottom, v) - step(top, v));",
                "}",
                "",
                "float AMT = 0.02; //0 - 1 glitch amount",
                "float SPEED = 0.6; //0 - 1 speed",   
                "",    
                "void main() {",            
                "   vec2 uv = vUv0;",
                "   vec3 outCol = texture2D(uColorBuffer, uv).rgb;",
                "   if(!iGlitchIsActive){",
                "       gl_FragColor = vec4(outCol,1.0);",
                "       return;",
                "   }",
                "   float time = floor(iTime * SPEED * 60.0);",
                "   float maxOffset = iGlitchAmount/2.0;",

                "   for(int i = 0; i < int(maxIterations); i++){",
                "       float sliceY = random2d(vec2(time , 2345.0 + float(i)));",
                "       float sliceH = random2d(vec2(time , 9035.0 + float(i))) * 0.25;",
                "       float hOffset = randomRange(vec2(time , 9625.0 + float(i)), -maxOffset, maxOffset);",
                "       vec2 uvOff = uv;",
                "       uvOff.x += hOffset;",
                "       if (insideRange(uv.y, sliceY, fract(sliceY+sliceH)) == 1.0 ){",
                "           outCol = texture2D(uColorBuffer, uvOff).rgb;",
                "       }",
                "   }",
                "   float maxColOffset = iGlitchAmount/6.0;",
                "   float rnd = random2d(vec2(time , 9545.0));",
                "   vec2 colOffset = vec2(randomRange(vec2(time , 9545.0),-maxColOffset,maxColOffset), ",
                "       randomRange(vec2(time , 7205.0),-maxColOffset,maxColOffset));",
                "   if (rnd < 0.33){",
                "       outCol.r = texture2D(uColorBuffer, uv + colOffset).r;",
                "   }else if (rnd < 0.66){",
                "       outCol.g = texture2D(uColorBuffer, uv + colOffset).g;",
                "   } else{",
                "       outCol.b = texture2D(uColorBuffer, uv + colOffset).b;",
                "   }",
                "   gl_FragColor = vec4(outCol,1.0);",
                "}"
            ].join("\n");

            var glitchFrag1 = [
                "precision " + graphicsDevice.precision + " float;",
                "uniform sampler2D uColorBuffer;",
                "uniform sampler2D iChannel1;",
                "uniform float iTime;",
                "uniform float iGlitchAmount;",
                "uniform bool iGlitchIsActive;",
                "",
                "varying vec2 vUv0;",
                //              maxIterations = 10.0 * AMT
                "   const float maxIterations = 2.0;",
                "",
                "float random2d(vec2 n) {" ,
                "   return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);",
                "}",
                "",
                "float randomRange (in vec2 seed, in float min, in float max) {",
                "   return min + random2d(seed) * (max - min);",
                "}",
                "",
                "float insideRange(float v, float bottom, float top) {",
                "   return (step(bottom, v) - step(top, v));",
                "}",
                "",
                "float AMT = 0.02; //0 - 1 glitch amount",
                "float SPEED = 0.6; //0 - 1 speed",   
                "",    
                "void main() {",            
                "   vec2 uv = vUv0;",
                "   vec3 outCol = texture2D(uColorBuffer, uv).rgb;",
                "   if(!iGlitchIsActive){",
                "       gl_FragColor = vec4(outCol,1.0);",
                "       return;",
                "   }",
                "   outCol *= 2.0;",
                "   gl_FragColor = vec4(outCol,1.0);",
                "}"
            ].join("\n");

            // Pixel shader applies a one dimensional gaussian blur filter.
            // This is used twice by the bloom postprocess, first to
            // blur horizontally, and then again to blur vertically.
            
            this.glitchShader = new pc.Shader(graphicsDevice, {
                attributes: attributes,
                vshader: passThroughVert,
                fshader: glitchFrag
            });

            this.time = 0.0;
            this.glitchIsActive = true;
            this.glitchAmount = 0.1;                    
        }

        render(inputTarget, outputTarget, rect) {
            //this._resize(inputTarget);
            var device = this.device;
            var scope = device.scope;

            scope.resolve("uColorBuffer").setValue(inputTarget.colorBuffer);
            scope.resolve("iTime").setValue(this.time);    
            scope.resolve("iGlitchIsActive").setValue(this.glitchIsActive);  
            scope.resolve("iGlitchAmount").setValue(this.glitchAmount);  
            //scope.resolve("iChannel1").setValue(this.map.resource);        
            pc.drawFullscreenQuad(device, outputTarget, this.vertexBuffer,this.glitchShader, rect);
        }
    }
    class Glitch extends pc.ScriptType {

        initialize() {
            this.effect = new GlitchEffect(this.app.graphicsDevice);
            //this.glitchDuration = this.normalGlitchDuration;
            this.glitchAmount = this.normalGlitchAmount;
            //this.effect.glitchAmount = 0.02;   
            this._glitchIsActive = false;
            this.effect.glitchAmount = this.glitchAmount;   
            this.effect.glitchIsActive = this._glitchIsActive;

            var queue = this.entity.camera.postEffects;
        
            queue.addEffect(this.effect);
        
            this.on('attr', function (name, value) {
                this.effect[name] = value;
            }, this);
        
            this.on('state', function (enabled) {
                if (enabled) {
                    queue.addEffect(this.effect);
                } else {
                    queue.removeEffect(this.effect);
                }
            });
        
            this.on('destroy', function () {
                queue.removeEffect(this.effect);
            });
        }

    }

    window.Glitch = Glitch;
}

// ----------------- SCRIPT DEFINITION ------------------ //
pc.registerScript(Glitch,'glitch');

Glitch.attributes.add('normalGlitchDuration', {
    type: 'number',
    default: 0.2
});

Glitch.attributes.add('normalGlitchAmount', {
    type: 'number',
    default: 0.2
});

// update code called every frame
Glitch.prototype.update = function(dt) {

    this.effect.glitchAmount = this.glitchAmount;

    if(this._glitchIsActive){//
        this.effect.glitchIsActive = true;
        this.effect.time += dt;

        if(this.effect.time > this.glitchDuration){
            this.endGlitch();
        }
    }
};

Glitch.prototype.endGlitch = function() {
    console.log("end Glitch");
    this._glitchIsActive = false;
    this.massGlitch = false;
    this.effect.glitchIsActive = false;
    this.effect.time = 0;
    this.waveTimer = 0;
};

Glitch.prototype.startGlitch = function() {
    console.log("startGlitch"); 
    if(!this._glitchIsActive && !this.massGlitch){
        this.glitchDuration = this.normalGlitchDuration;
        this.glitchAmount = this.normalGlitchAmount;
        this._glitchIsActive = true;    
    }    
};

Glitch.prototype.startGlitchDuration = function(dur, intensity) {
    this.glitchDuration = dur;
    this.glitchAmount = intensity;
    this.massGlitch = true;
    this._glitchIsActive = true;     
    console.log("startGlitchDuration"); 
};
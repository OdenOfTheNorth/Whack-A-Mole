function ReflectionVector(dir, n) {
    var d = dir.clone();
    var dDotN = d.dot(n);
    dDotN *= 2;
    n.mulScalar(dDotN);
    var r = d.sub(n);   
    return r;
}

function MixValues(xValue, yValue, aValue){ 
    aValue = Clamp(aValue, 0.0, 1.0);
    return xValue * (1.0 - aValue) + yValue * aValue;
}

function LerpVector3( a, b, t){
    return new pc.Vec3( 
        Lerp(a.x, b.x, t), 
        Lerp(a.y, b.y, t), 
        Lerp(a.z, b.z, t)
    );
}

function Lerp( a, b, t){
    return (1.0 - t) * a + b * t;
}

function GetDistanceSquared(a, b) {
    var dx = b.x - a.x;
	var dy = b.y - a.y;
	var dz = b.z - a.z;
    return  (dx * dx) + 
            (dy * dy) + 
            (dz * dz);
}

function GetLengthSquared(a) {
    return (a.x * a.x) + (a.y * a.y) + (a.z * a.z);
}

function RandomDirection() {
    var degree = CreateRandomNumber(0, 359, pc.time.Timer);
    var x = Math.cos(degree);
    var y = Math.sin(degree);

    var dir = new pc.Vec3(x, y, 0);
    dir.normalize();
    console.log("randomDirection = " + dir);
    return dir;
}

function DoCirclesOverlap(a, b , aR, bR) {
    var d = GetDistanceSquared(a, b);
    return d > (aR + bR) * (aR + bR);
}

function Clamp(value, min, max) {
    value = Math.max(min, Math.min(value, max));
    return value;
}

function ClampVector(vec, a, b) {

    vec.x = Clamp(vec.x, a.x, b.x);
    vec.y = Clamp(vec.y, a.y, b.y);
    vec.z = Clamp(vec.z, a.z, b.z);

    return vec;
}

function ClampVectorMagnetude(vec, mag) {

    var magnetude = vec.clone().length();
    var dir = vec.clone().normalize();

    if(Math.abs(magnetude) > mag){
        vec = dir.mulScalar(mag);
    }

    return vec;
}

function DrawCircle(center, radius, numSegments, color) {
  var points = [];
  var colors = [];

  var step = 2 * Math.PI / numSegments;
  var angle = 0, i;
  for (i = 0; i < numSegments; i++) {
      var sin0 = Math.sin(angle);
      var cos0 = Math.cos(angle);
      angle += step;
      var sin1 = Math.sin(angle);
      var cos1 = Math.cos(angle);

      points.push(new pc.Vec3(center.x - radius * sin0, center.y - radius * cos0, center.z + 2), 
                new pc.Vec3(center.x - radius * sin1, center.y - radius * cos1, center.z + 2));

      colors.push(color, color);
  }

    return [points, colors];

    //this.app.renderLines(points, colors);
}

function CreateDrawList(points) {
    var colors = [];
    var newPos = [];

    for (i = 0; i < points.length; i++) {

        var index = (i + 1) % points.length ;
        var color = pc.Color.BLUE;
        newPos.push(points[i], points[index]);
        colors.push(color, color);
    }

    return [newPos, colors];

    //this.app.renderLines(points, colors);
}

function CreateRandomNumber(min, max, seed) {
    var diff = max - min;

    var random = Math.sin(seed + (23565 * 0.5));
    random = random - Math.floor(random);
    //console.log("random = " + Math.floor(random * diff + min));
    return Math.floor(random * diff + min);//Math.random()
}

function RemoveValueFromArray(value, arr) {
    
    var tempArr = [];
    
    for(var i = 0; i < arr.length; i++){
        if(value == arr[i]){
            continue;
        }

        tempArr.add(arr[i]);
    }

    return tempArr;
}

function ArrayContains(value, arr) {

    var toReturn = false;

    for (i = 0; i < arr.length; i++) {
        if(value == arr[i]){
            toReturn = true;
        }
    }

    return toReturn;
}
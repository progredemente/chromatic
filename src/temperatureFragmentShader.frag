#version 300 es
precision highp float;

uniform sampler2D temperatures;
uniform float radius;

out vec4 fragColor;

vec3 hsl2rgb( in vec3 c ) {
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}
vec3 getColor( in float value ) {
    // float hue = value < 0.125 ? 0.0 : value < 0.875 ? (value - 0.125) * (5.0/6.0) / 0.875 : 5.0 / 6.0;
    // float lightness = value < 0.125 ? value * 4.0 : value < 0.875 ? 0.5 : (value - 0.875) * 4.0 + 0.5;
    float hue = value < 0.125 ? 0.0 : value < 0.875 ? floor((value - 0.125) / 0.015625) * ((5.0/6.0) / 48.0) : 5.0/6.0;
    float lightness = value < 0.125 ? floor(value / 0.015625) * 0.0625 : value < 0.875 ? 0.5 : floor((value - 0.875) / 0.015625) * 0.0625 + 0.5;
    vec3 c = vec3(hue, 1, lightness);
    return hsl2rgb(c);
}

float rand(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
void main() {
    vec2 uv = gl_FragCoord.xy;
    float hue = 0.0;
    float upperSum = 0.0;
    float lowerSum = 0.0;
    float upperSum2 = 0.0;
    float lowerSum2 = 0.0;
    int found = 0;
    ivec2 size = textureSize(temperatures, 0);
    int width = size.x;
    int height = size.y;
    for(int i = 0; i < height; i++){
        vec3 temperaturePoint = texelFetch(temperatures, ivec2(0, i), 0).xyz;
        vec2 point = temperaturePoint.xy;
        float temperature = temperaturePoint.z;
        if(point == uv){
            hue = temperature;
            found = 1;
            break;
        }
        else {
            float dist = distance(point, uv);
            if(dist <= 1.0) {
                dist = 1.0;
            }
            float inverseDist = 1.0 / dist;
            if(dist < radius) {
                upperSum +=  inverseDist * temperature;
                lowerSum += inverseDist;
            }
            upperSum2 +=  inverseDist * temperature;
            lowerSum2 += inverseDist;
        }
    }
    if(found == 0) {
        if(upperSum != 0.0 && lowerSum != 0.0) {
            hue = upperSum / lowerSum;
        }
        else hue = upperSum2 / lowerSum2;
    }
    fragColor = vec4(getColor(hue), 1.0);
}
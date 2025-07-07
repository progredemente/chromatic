import React, { Component } from "react";
import './Map.css';
import vertexShader from './vertexShader.vert';
import temperatureFragmentShader from './temperatureFragmentShader.frag';
import grayFragmentShader from './grayFragmentShader.frag';
import { getFormattedTemperature } from "./utils";
import PhoneMessage from "./PhoneMessage";


const paddingFactor = 0.05;
const phonePosition = [-670209.8185926197, 3962512.285858592]

class Map extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cities: [],
            phone: [0, 0],
            phoneMessageVisible: false
        };
        this.coords = [];
        const canvas = new OffscreenCanvas(1, 1);
        const gl = canvas.getContext('webgl2');
        this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    }

    compile(gl, fshader) {
        // Compile vertex shader
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vertexShader);
        gl.compileShader(vs);

        // Compile fragment shader
        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fshader);
        gl.compileShader(fs);

        // Create and launch the WebGL program
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.useProgram(program);

        // Log errors (optional)
        console.log("vertex shader:", gl.getShaderInfoLog(vs) || "OK");
        console.log("fragment shader:", gl.getShaderInfoLog(fs) || "OK");
        console.log("program:", gl.getProgramInfoLog(program) || "OK");
        return program;
    }

    setTexture(gl, program, textureName, internalFormat, width, height, format, type, data, index, activeTexture){
        const textureLocation = gl.getUniformLocation(program, textureName);
        const texture = gl.createTexture();
        gl.uniform1i(textureLocation, index);
        gl.activeTexture(activeTexture);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const level = 0;
        const border = 0;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, format, type, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        
    }


    buffer(gl, data, attribute, size, type) {
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attribute, size, type, false, 0, 0);
        gl.enableVertexAttribArray(attribute);
    };

    componentDidUpdate({size, temperatureRange, data, temperatureLimits, units}){
        if(
            size[0] !== this.props.size[0] ||
            size[1] !== this.props.size[1] ||
            data !== this.props.data
        ){
            this.componentDidMount();
        }
        else if(
            this.props.temperatureRange[0] !== temperatureRange[0] ||
            this.props.temperatureRange[1] !== temperatureRange[1] ||
            this.props.temperatureLimits[0] !== temperatureLimits[0] ||
            this.props.temperatureLimits[1] !== temperatureLimits[1]
        ){
            this.drawFrame();
        }
    }

    drawFrame(cities, phone){
        const mainImage = this.getTemperatureImage(this.mainAdaptedShape, this.normalizedMainTemperatures);
        mainImage.onload = () => {
            const territoryPromises = [];
            for(let i = 0; i < this.territoriesAdaptedShapes.length; i++){
                const territoryImage = this.getTemperatureImage(this.territoriesAdaptedShapes[i], this.normalizedTerritoriesTemperatures[i], this.pixelRadius);
                territoryPromises.push(new Promise((resolve) => {
                    territoryImage.onload = () => {
                        resolve(territoryImage);
                    }
                }));
            }
            Promise.all(territoryPromises).then((territoryImages) => {

                const ctx = this.canvasRef.getContext("2d");
                ctx.fillStyle = "rgb(0, 107, 183)";
                ctx.fillRect(0, 0, this.props.size[0], this.props.size[1]);
                ctx.drawImage(this.surroundingsImage, 0, 0, this.props.size[0], this.props.size[1]);
    
                ctx.drawImage(mainImage, 0, 0, this.props.size[0], this.props.size[1]);
                
                for(let i = 0; i < territoryImages.length; i++){
                    const territoryImage = territoryImages[i];
                    const lineWidth = 4;
                    ctx.lineWidth = lineWidth;
                    ctx.strokeStyle = "white";
                    ctx.fillRect(...this.territoryFrame[i]);
                    ctx.strokeRect(...this.territoryFrame[i]);
                    ctx.drawImage(territoryImage, 0, 0, this.props.size[0], this.props.size[1]);
                }
                if(this.excludedTerritoriesImage){
                    ctx.drawImage(this.excludedTerritoriesImage, 0, 0, this.props.size[0], this.props.size[1]);
                }
                if(arguments.length > 0){
                    this.setState({cities, phone});
                    this.props.setTemperatureMapLimits([this.minTemp, this.maxTemp]);
                }
            })
        }
    }

    componentDidMount() {
        this.setState({cities: []});
        this.props.setTemperatureMapLimits(undefined);
        const canvasAspectRatio = this.props.size[0] / this.props.size[1];
        const {otherTerritories, main, surroundings, excludedTerritories} = this.props.data;
        const territoriesHorizontalShifts = otherTerritories.map((territory) => {
            return canvasAspectRatio > 1 ? territory.horizontalCanvasShift[0] : territory.verticalCanvasShift[0];
        });
        const territoriesVerticalShifts = otherTerritories.map((territory) => {
            return canvasAspectRatio > 1 ? territory.horizontalCanvasShift[1] : territory.verticalCanvasShift[1];
        });
        const territoriesShiftedTriangles = otherTerritories.map((territory, i) => {
            return territory.triangles.map((point) => {
                return [point[0] + territoriesHorizontalShifts[i], point[1] + territoriesVerticalShifts[i]];
            }
            );
        });
        let offsetWidth = Infinity;
        let offsetHeight = Infinity;
        let maxWidth = -Infinity;
        let maxHeight = -Infinity;
        [...main.triangles, ...territoriesShiftedTriangles.flat()].forEach((point) => {
            offsetWidth = Math.min(offsetWidth, point[0]);
            offsetHeight = Math.min(offsetHeight, point[1]);
            maxWidth = Math.max(maxWidth, point[0]);
            maxHeight = Math.max(maxHeight, point[1]);
        });
        maxWidth = maxWidth - offsetWidth;
        maxHeight = maxHeight - offsetHeight;
        const padding = Math.max(maxWidth, maxHeight) * paddingFactor;
        maxWidth += padding * 2;
        maxHeight += padding * 2;
        const lowerGap = maxHeight * 80 / this.props.size[1];
        maxHeight += lowerGap;

        const originalAspectRatio = maxWidth / maxHeight;
        let adaptedWidth = maxWidth;
        let adaptedHeight = maxHeight;
        let adaptedOffsetWidth = 0;
        let adaptedOffsetHeight = 0;
        if(originalAspectRatio > canvasAspectRatio){
            adaptedHeight = adaptedWidth / canvasAspectRatio;
            adaptedOffsetHeight = (adaptedHeight - maxHeight) / 2;
        }
        else {
            adaptedWidth = adaptedHeight * canvasAspectRatio;
            adaptedOffsetWidth = (adaptedWidth - maxWidth) / 2;
        }

        const finalHorizontalPadding = padding - offsetWidth + adaptedOffsetWidth;
        const finalVerticalPadding = padding - offsetHeight + adaptedOffsetHeight;

        const [mainAdaptedShape, surroundingsAdaptedShape, excludedTerritoriesAdaptedShape, ...territoriesAdaptedShapes] = [
            main.triangles, surroundings, excludedTerritories, ...territoriesShiftedTriangles
        ].map((triangles) => {
            return triangles.map((point) => {
                return [
                    ((2 * (point[0] + finalHorizontalPadding) * this.props.size[0] / adaptedWidth) - this.props.size[0]) / this.props.size[0],
                    ((2 * (point[1] + lowerGap + finalVerticalPadding) * this.props.size[1] / adaptedHeight) - this.props.size[1]) / this.props.size[1]
                ]
            })
        });

        this.mainAdaptedShape = mainAdaptedShape;
        this.territoriesAdaptedShapes = territoriesAdaptedShapes;

        let skip = 1;
        if(main.temperatures.length > this.maxTextureSize){
            skip = Math.ceil(main.temperatures.length / this.maxTextureSize);
        }

        const filteredTemperatures = main.temperatures.filter((_, index) => index % skip === 0);

        const [
            territoriesShiftedTemperatures,
            territoriesShiftedCities
        ] = [
            otherTerritories.map((territory, index) => {
                return territory.temperatures
                    .filter((_, index) => index % skip === 0)
                    .map((point) => {
                        return [
                            point[0] + territoriesHorizontalShifts[index],
                            point[1] + territoriesVerticalShifts[index],
                            point[2]
                        ];
                    });
            }),
            otherTerritories.map((territory, index) => {
                return territory.cities.map((point) => {
                    return [
                        point[0] + territoriesHorizontalShifts[index],
                        point[1] + territoriesVerticalShifts[index],
                        point[2]
                    ];
                })
            })
        ];

        const [
            normalizedMainTemperatures,
            normalizedCities,
            normalizedPhone,
            ...normalizedTerritoriesTemperatures
        ] = [
            filteredTemperatures,
            [...main.cities, ...territoriesShiftedCities.flat()],
            [phonePosition],
            ...territoriesShiftedTemperatures,
        ].map(temperatures => {
            return temperatures.map((point) => {
                return [
                    ((((2 * (point[0] + finalHorizontalPadding) * this.props.size[0] / adaptedWidth) - this.props.size[0]) / this.props.size[0] + 1) / 2) * this.props.size[0],
                    ((((2 * (point[1] + lowerGap + finalVerticalPadding) * this.props.size[1] / adaptedHeight) - this.props.size[1]) / this.props.size[1] + 1) / 2) * this.props.size[1],
                    point[2]
                ]
            });
        });
        this.normalizedMainTemperatures = normalizedMainTemperatures;
        this.normalizedTerritoriesTemperatures = normalizedTerritoriesTemperatures;

        this.pixelRadius = (this.props.data.radius * this.props.size[0] / adaptedWidth) * skip;

        this.territoryFrame = [];
        let territoryPadding = 0;
        for(let i = 0; i < otherTerritories.length; i++){
            let territoryOffsetWidth = Infinity;
            let territoryOffsetHeight = Infinity;
            let territoryMaxWidth = -Infinity;
            let territoryMaxHeight = -Infinity;
            this.territoriesAdaptedShapes[i].forEach((point) => {
                territoryOffsetWidth = Math.min(territoryOffsetWidth, point[0]);
                territoryOffsetHeight = Math.min(territoryOffsetHeight, point[1]);
                territoryMaxWidth = Math.max(territoryMaxWidth, point[0]);
                territoryMaxHeight = Math.max(territoryMaxHeight, point[1]);
            });
            territoryMaxWidth -= territoryOffsetWidth;
            territoryMaxHeight -= territoryOffsetHeight;
            const teritoryOrigin = [
                ((territoryOffsetWidth + 1) / 2) * this.props.size[0],
                (1 - (territoryOffsetHeight + territoryMaxHeight + 1) / 2) * this.props.size[1] 
            ];
            const territorySize = [
                (territoryMaxWidth / 2) * this.props.size[0],
                (territoryMaxHeight / 2) * this.props.size[1],
            ]
            territoryPadding = Math.max(territoryPadding, Math.max(...territorySize) * paddingFactor);
            
            this.territoryFrame.push([
                teritoryOrigin[0],
                teritoryOrigin[1],
                territorySize[0],
                territorySize[1]
            ]);
        }

        for(const frame of this.territoryFrame){
            frame[0] -= territoryPadding;
            frame[1] -= territoryPadding;
            frame[2] += territoryPadding * 2;
            frame[3] += territoryPadding * 2;
        }

        const allTemperatures = new Set([...filteredTemperatures, ...territoriesShiftedTemperatures.flat()].map(point => point[2]));
        this.maxTemp = -Infinity;
        this.minTemp = Infinity;
        allTemperatures.forEach((temperature) => {
            if(temperature > this.maxTemp) this.maxTemp = temperature;
            if(temperature < this.minTemp) this.minTemp = temperature;
        });


        this.surroundingsImage = this.getGrayImage(surroundingsAdaptedShape);
        const surroundingsPromise = new Promise((resolve) => {
            this.surroundingsImage.onload = resolve;
        })
        this.excludedTerritoriesImage = undefined;
        let excludedTerritoriesPromise;
        if(excludedTerritoriesAdaptedShape.length > 0){
            this.excludedTerritoriesImage = this.getGrayImage(excludedTerritoriesAdaptedShape);
            excludedTerritoriesPromise = new Promise((resolve) => {
                this.excludedTerritoriesImage.onload = resolve;
            })
        }
        else {
            excludedTerritoriesPromise = Promise.resolve();
        }
        Promise.all([surroundingsPromise, excludedTerritoriesPromise]).then(() => {
            this.drawFrame(normalizedCities, normalizedPhone[0]);
        })

        this.adaptedWidth = adaptedWidth;
        this.adaptedHeight = adaptedHeight;
        this.finalHorizontalPadding = finalHorizontalPadding;
        this.finalVerticalPadding = finalVerticalPadding;
        this.filteredTemperatures = filteredTemperatures;
    }

    getTemperatureImage(shape, temperatures){
        const canvas = document.createElement("canvas");
        canvas.width = this.props.size[0];
        canvas.height = this.props.size[1];
        const gl = canvas.getContext("webgl2");
        const program = this.compile(gl, temperatureFragmentShader);
        const position = gl.getAttribLocation(program, "position");
        const vertices = new Float32Array(shape.flat());
        this.buffer(gl, vertices, position, 2, gl.FLOAT);
        const normalizedTemperatures = temperatures.map(([x, y, t]) => {
            return [x, y, this.getTransformedTemperature(t)];
        });
        this.setTexture(gl, program, 'temperatures', gl.RGB32F, 1, normalizedTemperatures.length, gl.RGB, gl.FLOAT, new Float32Array(normalizedTemperatures.flat()), 0, gl.TEXTURE0);

        const radiusLocation = gl.getUniformLocation(program, 'radius');
        gl.uniform1f(radiusLocation, this.pixelRadius);


        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(
            gl.TRIANGLES,
            0,
            shape.length
        );
        const img = new Image(this.props.size[0], this.props.size[1]);
        img.src = canvas.toDataURL();
        return img;
    }

    getTransformedTemperature(temperature){
        const min = this.props.temperatureLimits[0] ?? this.minTemp;
        const max = this.props.temperatureLimits[1] ?? this.maxTemp;
        return 1 - (((temperature - min) / (max - min))
            * (this.props.temperatureRange[1] - this.props.temperatureRange[0])
            + this.props.temperatureRange[0]);
    }

    getGrayImage(shape){
        const canvas = document.createElement("canvas");
        canvas.width = this.props.size[0];
        canvas.height = this.props.size[1];
        const gl = canvas.getContext("webgl2");
        const program = this.compile(gl, grayFragmentShader);
        const position = gl.getAttribLocation(program, "position");
        const vertices = new Float32Array(shape.flat());
        this.buffer(gl, vertices, position, 2, gl.FLOAT);
        
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(
            gl.TRIANGLES, // mode
            0, // start
            shape.length // count
        );
        const img = new Image(this.props.size[0], this.props.size[1]);
        img.src = canvas.toDataURL();
        return img;
    }

    click(event){
        const rect = this.canvasRef.getBoundingClientRect();
        const x = (2 * (event.clientX - rect.left) - this.props.size[0] + this.props.size[0]) * this.adaptedWidth / (2 * this.props.size[0]) - this.finalHorizontalPadding;
        //the vertical origin is inversed, therefore -2 and + this.props.size[1]
        const y = (-2 * (event.clientY - rect.top) + this.props.size[1] + this.props.size[1]) * this.adaptedHeight / (2 * this.props.size[1]) - this.finalVerticalPadding;

        let minDistance = Infinity;
        let temperature = null;
        for(let i = 0; i < this.filteredTemperatures.length; i++){
            const point = this.filteredTemperatures[i];
            const distance = Math.pow(point[0] - x, 2) + Math.pow(point[1] - y, 2);
            minDistance = Math.min(minDistance, distance);
            if(distance == minDistance){
                temperature = point[2];
            }
        }
        
        const radius = 6378137;
        const d = Math.PI / 180;

        const lon = x / (radius * d);
        const lat = (2 * Math.atan(Math.exp(y / radius)) - Math.PI / 2) / d;

        this.coords.push([lat, lon, temperature]);
        console.log(this.coords.map(coord => JSON.stringify(coord)).join(",\n"));
    }


    render(){
        return(
            <>
                {
                    this.state.cities.length > 0 &&
                    this.state.cities.map((city, index) => {
                        return (
                            <div
                                key={index}
                                className="city"
                                style={{
                                    left: `${city[0]}px`,
                                    top: `${this.props.size[1] - city[1]}px`,
                                }}
                            >
                                {getFormattedTemperature(city[2], this.props.units)}
                            </div>
                        )
                    })        
                }
                {
                    this.props.easterEgg && this.state.phone[0] !== 0 && this.state.phone[1] !== 0 &&
                    <div
                        className="phone-container"
                        style={{
                            left: `${this.state.phone[0]}px`,
                            top: `${this.props.size[1] - this.state.phone[1]}px`,
                        }}
                    >
                        <div
                            className="phone-bubble"
                            onClick={() => {
                                this.setState({phoneMessageVisible: true});
                            }}
                        >
                            <img src="./phone.svg" draggable="false"/>
                        </div>
                    </div>
                }
                <canvas
                    ref={(canvasRef) => this.canvasRef = canvasRef}
                    width={this.props.size[0]}
                    height={this.props.size[1]}
                    onClick={(event) => this.click(event)}
                ></canvas>
                <PhoneMessage
                    open={this.state.phoneMessageVisible}
                    close={() => {
                        this.setState({phoneMessageVisible: false});
                    }}
                />
            </>
        )
    }
}

export default Map;
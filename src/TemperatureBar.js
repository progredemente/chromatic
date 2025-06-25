import React, { Component } from "react";
import './TemperatureBar.css';
import {Icon} from 'components/Icon'
import TemperatureEditor from "./TemperatureEditor";
import { getFormattedTemperature } from "./utils";

const minDistanceBetweenLimits = 0.2;

class TemperatureBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            grabbingLowerLimit: false,
            grabbingUpperLimit: false,
            grabbingRange: false,
            temperatureRange: props.temperatureRange,
            temperatureEditorVisible: false,
            temperatureEditing: "min"
        };
        this.prevMouseMove = null;
    }
    

    componentDidMount() {
        document.addEventListener('mousedown', this.grab);
        document.addEventListener('mouseup', this.release);
        document.addEventListener('mousemove', this.move);
        document.addEventListener('touchstart', this.grab);
        document.addEventListener('touchend', this.release);
        document.addEventListener('touchmove', this.move);
    }

    componentDidUpdate(prevProps){
        if(this.props.temperatureRange[0] !== prevProps.temperatureRange[0] || this.props.temperatureRange[1] !== prevProps.temperatureRange[1]) {
            this.setState({temperatureRange: this.props.temperatureRange});
        }

    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.grab);
        document.removeEventListener('mouseup', this.release);
        document.removeEventListener('mousemove', this.move);
        document.removeEventListener('touchstart', this.grab);
        document.removeEventListener('touchend', this.release);
        document.removeEventListener('touchmove', this.move);
    }

    getLabelColor(value) {
        const hue = value < 0.125 ? 0.0 : value < 0.875 ? Math.floor((value - 0.125) / 0.015625) * ((5.0/6.0) / 48.0) : 5.0/6.0;
        const lightness = value < 0.125 ? Math.floor(value / 0.015625) * 0.0625 : value < 0.875 ? 0.5 : Math.floor((value - 0.875) / 0.015625) * 0.0625 + 0.5;
        return `hsl(${hue * 360}, 100%, ${lightness * 100}%)`;
    }

    grab = (event) =>{
        switch (event.target) {
            case this.lowerLimitRef:
                this.props.setGrabbing(true);
                this.setState({
                    grabbingLowerLimit: true,
                    grabbingUpperLimit: false,
                    grabbingRange: false
                });
                break;
            case this.upperLimitRef:
                this.props.setGrabbing(true);
                this.setState({
                    grabbingLowerLimit: false,
                    grabbingUpperLimit: true,
                    grabbingRange: false
                });
                break;
            case this.rangeRef:
                this.props.setGrabbing(true);
                this.setState({
                    grabbingLowerLimit: false,
                    grabbingUpperLimit: false,
                    grabbingRange: true
                });
                break;
            default:
                this.props.setGrabbing(false);
                this.setState({
                    grabbingLowerLimit: false,
                    grabbingUpperLimit: false,
                    grabbingRange: false
                });
                break;
        }
    }

    move = (event) => {
        if(this.state.grabbingLowerLimit || this.state.grabbingUpperLimit || this.state.grabbingRange) {
            const percentageMoved =
                event.type === "mousemove" ?
                event.movementX / this.containerRef.offsetWidth :
                this.prevMouseMove ? (event.touches[0].pageX - this.prevMouseMove) / this.containerRef.offsetWidth : 0;
            this.prevMouseMove = event.type === "touchmove" ? event.touches[0].pageX : 0;

            let lowerMovement = this.state.temperatureRange[0];
            let upperMovement = this.state.temperatureRange[1];
            if(this.state.grabbingLowerLimit){
                lowerMovement = Math.max(0, Math.min(this.state.temperatureRange[0] + percentageMoved, 1 - minDistanceBetweenLimits));
                upperMovement = Math.min(1, Math.max(this.state.temperatureRange[1], lowerMovement + minDistanceBetweenLimits));
            }
            else if(this.state.grabbingUpperLimit){
                upperMovement = Math.min(1, Math.max(this.state.temperatureRange[1] + percentageMoved, minDistanceBetweenLimits));
                lowerMovement = Math.max(0, Math.min(this.state.temperatureRange[0],  upperMovement - minDistanceBetweenLimits));
            }
            else if(this.state.grabbingRange){
                const gap = this.state.temperatureRange[1] - this.state.temperatureRange[0];
                lowerMovement = Math.min(1 - gap, Math.max(0, this.state.temperatureRange[0] + percentageMoved));
                upperMovement = Math.min(lowerMovement + gap, 1);
            }
            this.setState({temperatureRange: [lowerMovement, upperMovement]});
        }
    }


    release = () => {
        this.prevMouseMove = null;
        this.props.setGrabbing(false);
        this.setState({
            grabbingLowerLimit: false,
            grabbingUpperLimit: false,
            grabbingRange: false
        });
        this.props.setTemperatureRange(this.state.temperatureRange);
    }

    render() {
        const min = this.props.temperatureLimits[0] ?? this.props.temperatureMapLimits?.[0];
        const max = this.props.temperatureLimits[1] ?? this.props.temperatureMapLimits?.[1];
        return (
            <div
                className="temperature-bar-container"
                ref={(ref) => this.containerRef = ref}
            >
                <div
                    className="temperature-range"
                    style={{
                        "--position": `${this.state.temperatureRange[0] * 100}%`,
                        "--temperature-background-color": this.getLabelColor(1 - (this.state.temperatureRange[1] + this.state.temperatureRange[0]) / 2),
                        "--width": `${(this.state.temperatureRange[1] - this.state.temperatureRange[0]) * 100}%`
                    }}
                    ref={(ref) => this.rangeRef = ref}
                >
                </div>
                <div
                    className="temperature-limit"
                    style={{
                        "--position": `${this.state.temperatureRange[0] * 100}%`,
                        "--temperature-background-color": this.getLabelColor(1 - this.state.temperatureRange[0]),
                        "--before-text": "'⇤'"
                    }}
                    ref={(ref) => this.lowerLimitRef = ref}
                >
                    <div className="temperature-editor">
                        <span className="temperature-label">
                            {getFormattedTemperature(min, this.props.units)}
                        </span>
                        <span className="temperature-edit-button" onClick={() => {
                            this.setState({
                                temperatureEditorVisible: true,
                                temperatureEditing: "min"
                            });
                        }}><Icon icon="✍" /></span>
                    </div>
                </div>
                <div
                    className="temperature-limit"
                    style={{
                        "--position": `${this.state.temperatureRange[1] * 100}%`,
                        "--temperature-background-color": this.getLabelColor(1 - this.state.temperatureRange[1]),
                        "--before-text": "'⇥'"
                    }}
                    ref={(ref) => this.upperLimitRef = ref}
                >
                    <div className="temperature-editor">
                        <span className="temperature-label">
                            {getFormattedTemperature(max, this.props.units)}
                        </span>
                        <span className="temperature-edit-button" onClick={() => {
                            this.setState({
                                temperatureEditorVisible: true,
                                temperatureEditing: "max"
                            });

                        }}><Icon icon="✍" /></span>
                    </div>
                </div>
                <div
                    className="temperature-bar"
                    style={{
                        "--before-width": `${this.state.temperatureRange[0] * 100}%`,
                        "--after-width": `${(1 - this.state.temperatureRange[1]) * 100}%`
                    }}
                >
                </div>
                <TemperatureEditor
                    open={this.state.temperatureEditorVisible}
                    close={() => {
                        this.setState({temperatureEditorVisible: false})
                    }}
                    values={[
                        this.props.temperatureLimits[0] ?? this.props.temperatureMapLimits?.[0],
                        this.props.temperatureLimits[1] ?? this.props.temperatureMapLimits?.[1]
                    ]}
                    editing={this.state.temperatureEditing}
                    changeMaxTemperature={this.props.changeMaxTemperature}
                    changeMinTemperature={this.props.changeMinTemperature}
                    units={this.props.units}
                />
            </div>
        )
    }
}

export default TemperatureBar;
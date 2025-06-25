import React, { Component } from "react";
import './TemperatureEditor.css';
import { withTranslation } from "react-i18next";
import { celsiusToFarenheit, fahrenheitToCelsius, getFormattedTemperature, getUnitsSymbol } from "./utils";

class _TemperatureEditor extends Component {

    constructor(props) {
        super(props);
        let value = this.props.values[+(this.props.editing === "max")];
        if(this.props.units === "f") value = Math.round(celsiusToFarenheit(value) * 10) / 10;
        this.state = {
            value,
            error: null
        }
    }

    componentDidMount(){
        this.toggle();
    }
    
    componentDidUpdate({open}) {
        if(open !== this.props.open){
            this.toggle();
            let value = this.props.values[+(this.props.editing === "max")];
            if(this.props.units === "f") value = Math.round(celsiusToFarenheit(value) * 10) / 10;
            this.setState({value, error: null})
        }
    }

    toggle() {
        if(this.props.open){
            this.dialogRef.showModal();
        }
        else {
            this.dialogRef.close();
        }
    }

    changeTemperature = () => {
        let value = this.state.value !== null || this.state.value !== "" ? +this.state.value : null;
        if(this.props.units === "f" && value) {
            value = fahrenheitToCelsius(value)
        }
        if(this.props.editing === "min"){
            if(value > this.props.values[1] || value === null){
                this.setState({error: ["minError", {max: getFormattedTemperature(this.props.values[1], this.props.units)}]});
            }
            else{
                this.props.changeMinTemperature(value);
                this.props.close();
            }
        }
        else{
            if(value < this.props.values[0] || value === null){
                this.setState({error: ["maxError", {min: getFormattedTemperature(this.props.values[0], this.props.units)}]});
            }
            else {

                this.props.changeMaxTemperature(value);
                this.props.close();
            }
        }
    }

    render() {
        const title =  this.props.t(this.props.editing === "min" ? "editingMinTemp" : "editingMaxTemp");
        return (
            <dialog ref={(ref) => {this.dialogRef = ref}}>
                <div className="dialog-header">
                    <div>
                        {title}
                    </div>
                    <div onClick={this.props.close} className="close-button"></div>
                </div>
                <div className="temperature-editor-body">
                    <input type="number" value={this.state.value} onChange={(event) => {
                        this.setState({value: event.target.value})
                    }}/>{getUnitsSymbol(this.props.units)}
                </div>
                <div className="temperature-editor-footer">
                    {
                        this.state.error &&
                        <div className="temperature-editor-error">{this.props.t(...this.state.error)}</div>
                    }
                    <div className="temperature-editor-buttons">
                        <div onClick={this.changeTemperature}>
                            {this.props.t("accept")}
                        </div>
                    </div>
                </div>
            </dialog>
        )
    }
}

const TemperatureEditor = withTranslation()(_TemperatureEditor);
export default TemperatureEditor;
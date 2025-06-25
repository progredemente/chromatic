import React, { Component } from "react";
import './Config.css';
import Flag from "./Flag";
import { withTranslation } from "react-i18next";

class _Config extends Component {

    constructor(props) {
        super(props);

        this.languages = this.props.i18n.languages.map(langCode => {
            return [langCode, this.props.t(`languages.${langCode}`)]
        }).sort((a, b) => {
            return a[1] < b[1] ? - 1 : 1;
        })
    }

    componentDidMount(){
        this.toggle();
    }
    
    componentDidUpdate({open}) {
        if(open !== this.props.open){
            this.toggle();
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

    getFlag(lang) {
        return lang === 'en' ? 'gb' : lang;
    }

    render() {
        return (
            <dialog ref={(ref) => {this.dialogRef = ref}}>
                <div className="dialog-header">
                    <div>
                        {this.props.t("config")}
                    </div>
                    <div onClick={this.props.close} className="close-button"></div>
                </div>
                <section className="config-section">
                    {this.props.t("units")}
                    <div className="unit-list">
                        <div
                            className={this.props.units === "c" ? "selected" : ""}
                            onClick={() => {
                                this.props.setUnits("c");
                            }}
                        >
                            Celsius (°C)
                        </div>
                        <div
                            className={this.props.units === "f" ? "selected" : ""}
                            onClick={() => {
                                this.props.setUnits("f");
                            }}
                        >
                            Fahrenheit (°F)
                        </div>
                    </div>
                </section>
                <section className="config-section">
                    {this.props.t("language")}
                    <div className="language-list">
                        {
                            this.languages.map((lang) => {
                                return (
                                    <div
                                        className={lang[0] === this.props.i18n.language ? "selected" : ""}
                                        onClick={() => {
                                            this.props.i18n.changeLanguage(lang[0])
                                        }}
                                    >
                                        <Flag zoom={.5} country={this.getFlag(lang[0])} /> {lang[1]}
                                    </div>
                                )
                            })
                        }
                    </div>
                </section>
            </dialog>
        )
    }
}

const Config = withTranslation()(_Config);
export default Config;
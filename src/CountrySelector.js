import React, { Component } from "react";
import './CountrySelector.css';
import Flag from "./Flag";
import { withTranslation } from "react-i18next";

class _CountrySelector extends Component {

    constructor(props) {
        super(props);
        this.state = {
            countries: this.props.i18n.getResourceBundle(props.i18n.language).countries
        }
    }

    componentDidMount(){
        this.toggle();
        this.props.i18n.on("languageChanged", () => {
            this.setState({
                countries: this.props.i18n.getResourceBundle(this.props.i18n.language).countries
            })
        })
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

    render() {
        return (
            <dialog ref={(ref) => {this.dialogRef = ref}}>
                <div className="dialog-header">
                    <div>
                        {this.props.t("chooseCountry")}
                    </div>
                    <div onClick={this.props.close} className="close-button"></div>
                </div>
                <div className="countries">
                    {
                        Object.entries(this.state.countries).sort((a, b) => {
                            return a[1] < b[1] ? - 1 : 1;
                        }).map((country) => {
                            return (
                                <div
                                    key={country[0]}
                                    className={this.props.selectedCountry === country[0] ? "selected-country" : ""}
                                    onClick={() => this.props.selectCountry(country[0])}
                                >
                                    <Flag
                                        country={country[0]}
                                        zoom={2}
                                    />
                                    <div className="country-name">
                                        {country[1]}
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </dialog>
        )
    }
}

const CountrySelector = withTranslation()(_CountrySelector);
export default CountrySelector;
import React, { Component } from "react";
import './CountryStatus.css';
import Flag from "./Flag";
import { withTranslation } from "react-i18next";

class _CountryStatus extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div
                className="country-status"
                onClick={this.props.onClick}
            >
                <Flag country={this.props.countryCode} />
                <div>
                    {this.props.t(`countries.${this.props.countryCode}`)}
                </div>
                <div className="change-country-button">

                    {this.props.t("changeCountry")}
                </div>
            </div>
        )
    }
}

const CountryStatus = withTranslation()(_CountryStatus)
export default CountryStatus;
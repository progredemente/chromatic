import React, { Component } from "react";
import './Flag.css';

class Flag extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <span
                className="flag"
                style={{
                    "--zoom": this.props.zoom || 1
                }}
            >
                <img src={`${process.env.RESOURCES_URL}/flags/${this.props.country}.svg`} />
            </span>
        )
    }
}

export default Flag;
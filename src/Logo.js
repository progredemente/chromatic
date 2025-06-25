import React, { Component } from "react";
import { withTranslation } from "react-i18next";

class _Logo extends Component {
    render() {
        return (
            <svg
                className='logo'
                width={250}
                height={100}
                viewBox='0 0 420 170'
            >
                <defs>
                <pattern
                    id="fire"
                    patternUnits="userSpaceOnUse"
                    width="100"
                    height="700"
                    patternTransform="scale(.12)"
                >
                    <g>
                        <rect width="100" height="700" style={{fill: "#f2de00"}}/>
                        <path
                            d="M 2.8690239e-6,7.0186115e-6 H 99.999997 L 99.999994,337.50002 H -2.3957047e-6 Z"
                            style={{
                                fill: "#2e2e2e",
                                stroke: "none"
                            }}
                        />
                        <path
                            d="m 99.999996,262.50002 c -24.999999,-1e-5 -2e-6,-75 -49.999999,-100 -12.5,74.99999 -49.9999993957047,50 -49.9999993957047,100 v 75.00001 H 99.999996 Z"
                            style={{
                                fill: "#f20000",
                                stroke: "none"
                            }}
                        />
                        <path
                            d="m 99.999996,312.50003 c 0,-25 -49.999999,-50.00001 -49.999999,-75.00001 -49.9999993957047,25 0,50.00001 -49.999999014235,75.00001 l -1.6e-6,25 H 99.999996 Z"
                            style={{
                                fill: "#f29100",
                                stroke: "none"
                            }}
                        />
                        <path
                            d="M -3.614235e-6,337.50003 C 24.999997,312.50002 49.999997,325.00002 49.999997,287.50003 c 25,0 25,50 49.999996,50 l 10e-7,12.49999 H -2.3957047e-6 Z"
                            style={{
                                fill: "#f2de00",
                                stroke: "none"
                            }}
                        />
                    </g>
                </pattern>
                </defs>
                <text
                    x="50%"
                    y="43%"
                    fontSize={72}
                    fontWeight={"bold"}
                    style={{
                        stroke: 'black',
                        strokeWidth: 20,
                        fill: 'url(#fire)',
                        paintOrder: 'stroke markers fill'
                    }}
                    textAnchor='middle'
                >
                    {this.props.t("logo1")}
                </text>
                <text
                    x="50%"
                    y="92%"
                    fontSize={72}
                    fontWeight={"bold"}
                    style={{
                        stroke: 'black',
                        strokeWidth: 20,
                        fill: 'url(#fire)',
                        paintOrder: 'stroke markers fill'
                    }}
                    textAnchor='middle'
                >
                    {this.props.t("logo2")}
                </text>
            </svg>
        )
    }
}

const Logo = withTranslation()(_Logo)

export default Logo;
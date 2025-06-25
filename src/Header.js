import React, { Component } from "react";
import './Header.css';
import Logo from "./Logo";
import { withTranslation } from "react-i18next";
import { Icon } from 'components/Icon'
import Config from "./Config";
import About from "./About";

class _Header extends Component {

    constructor(props) {
        super(props);
        this.state = {
            minimized: false,
            configVisible: false,
            aboutVisible: false
        };
    }

    render() {
        return (
            <div
                className={`header${this.state.minimized ? ' minimized' : ''}`}
            >
                {
                    !this.state.minimized &&
                    <>
                        <div className="close-button" onClick={() => this.setState({minimized: true})}></div>
                        <Logo />
                        <div className="subtitle">
                            {this.props.t("subtitle")}
                        </div>
                        <div className="signature">
                            {this.props.t("by")} <a href="/" target="_blank">progredemente</a>
                        </div>
                        <div className="header-menu">
                            <div
                                onClick={() => {
                                    this.setState({configVisible: true})
                                }}
                            >
                                <Icon icon="⚙" />
                            </div>
                            <div
                                onClick={() => {
                                    this.setState({aboutVisible: true})
                                }}
                            >
                                <Icon icon="🛈" />
                            </div>
                        </div>
                    </>
                }
                {
                    this.state.minimized &&
                    <img
                        onClick={() => this.setState({minimized: false})}
                        src={`${process.env.RESOURCES_URL}/calor.png`}
                    />
                }
                <Config
                    open={this.state.configVisible}
                    close={() => {
                        this.setState({configVisible: false})
                    }}
                    units={this.props.units}
                    setUnits={this.props.setUnits}
                />
                <About
                    open={this.state.aboutVisible}
                    close={() => {
                        this.setState({aboutVisible: false})
                    }}
                />
            </div>
        )
    }
}

const Header = withTranslation()(_Header);

export default Header;
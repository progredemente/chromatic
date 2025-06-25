import React, { Component } from "react";
import './About.css';
import { withTranslation } from "react-i18next";

class _About extends Component {

    constructor(props) {
        super(props);
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

    render() {
        return (
            <dialog className="about" ref={(ref) => {this.dialogRef = ref}}>
                <div className="dialog-header">
                    <div>
                        {this.props.t("about")}
                    </div>
                    <div onClick={this.props.close} className="close-button"></div>
                </div>
                <p>
                    {this.props.t("about-1")}
                </p>
                <p>
                    {this.props.t("about-2")}
                </p>
                <p className="about-img">
                    <a target="_blank" href="/#/web/post/apocalipsis_climatico">
                        <img src="/img/comic/apocalipsis_climatico.png" />
                    </a>
                </p>
                <p>
                    {this.props.t("about-3")}
                </p>
                <p className="about-video">
                    <iframe
                        width="560"
                        height="315"
                        src="https://www.youtube.com/embed/o30F_NuOA7U"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </p>
                <p>
                    {this.props.t("about-4")} <a href="/calor" target="_blank">¡Calor!</a>
                </p>
                <p>
                    {this.props.t("about-5")}
                </p>
                <p>
                    {this.props.t("about-6")}
                </p>
            </dialog>
        )
    }
}

const About = withTranslation()(_About);
export default About;
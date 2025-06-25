import React, { Component } from "react";
import './PhoneMessage.css';

class PhoneMessage extends Component {

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
            <dialog className="phone-message" ref={(ref) => {this.dialogRef = ref}}>
                <div className="dialog-header">
                    <div>TIENE SEGARRO AMEGO?</div>
                    <div onClick={this.props.close} className="close-button"></div>
                </div>
                <p>¡Enhorabuena! Has descubierto el huevo de Pascua oculto. Contacta conmigo a través de <a target="_blank" href="https://www.instagram.com/progredemente/">Instagram</a>, <a target="_blank" href="https://x.com/progredemente">X</a> o <a target="_blank" href="https://t.me/progredemente">Telegram</a> para hacérmelo saber y, si eres la primera persona en hacerlo, te hago un dibujo.</p>
            </dialog>
        )
    }
}

export default PhoneMessage;
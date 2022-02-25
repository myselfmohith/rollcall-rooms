import React from 'react';
import { AiOutlineClose } from 'react-icons/ai'

export default function Model({ element }) {
    function clickHandle(event) {
        if(!event.target.closest("#model-container")){
            element.props.closeModel();
        }
    }
    return (
        <div onClick={clickHandle} id="model">
            <div id="model-container">
                <div id="model-header">
                    <h3>{element.props.modelTitle}</h3>
                    <span onClick={element.props.closeModel}> <AiOutlineClose /> </span>
                </div>
                {element}
            </div>
        </div>
    )
}

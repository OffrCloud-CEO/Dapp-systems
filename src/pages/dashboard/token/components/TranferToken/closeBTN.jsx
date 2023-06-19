import React, { useRef } from 'react'

const CloseBTN = ({control}) => {
    const btnRef = useRef()

    window.addEventListener("keyup", e=>{
        try {
            const pressedKey = e.code;
            if (pressedKey === "Escape") {
                btnRef.current.click();
            }
        } catch (error) {
            
        }
    })

    return (
        <div className="close" ref={btnRef} onClick={() => control(false)}>x</div>
    )
}

export default CloseBTN
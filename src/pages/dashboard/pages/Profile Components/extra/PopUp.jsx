import React from 'react';

const PopUp = ({func}) => {
    const closeBtnHandler = () =>{
        func(false);
    }
    return (
        <div className="cover">
            <div className="div wide">
                <div className="close" onClick={closeBtnHandler}>x</div>
                <div className="div-carosel c">
                    <div className="con">
                        <br />
                        <img className='ld' src="https://gineousc.sirv.com/Images/icons/animated/1103-confetti-outline.gif" alt="successful" />
                        <div className="title" style={{padding: `.5rem 0`}}>Application Sent</div>
                        <div className="p" style={{opacity: '.7'}}>You've successfully submitted your KYC verification Application, the verification process could take a while to be processed.</div>
                        <br />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PopUp;
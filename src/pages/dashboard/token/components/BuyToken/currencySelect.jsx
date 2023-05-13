import React from 'react';

const CurrencySelect = ({setCurrency, currency}) => {
    return (
        <div className="div-carosel">
            <div className="title">Choose currency</div>
            <div className="r">
                <div onClick={()=>setCurrency(1)} className={`capsule ${currency === 1 && "active"}`}>
                    USDC
                    <img src="https://gineousc.sirv.com/Images/icons/usdc.png" alt="" />
                </div>
                <div onClick={()=>setCurrency(2)} className={`capsule ${currency === 2 && "active"}`}>
                    Ethereum
                    <img src="https://gineousc.sirv.com/Images/icons/eth.png" alt="" />
                </div>
            </div>
        </div>
    )
}

export default CurrencySelect
import React, { useContext } from 'react';
import { buyData } from '../../card/BuyToken';
import { contextData } from '../../../dashboard';

const Confirmation = () => {
  const {tokenBalance} = useContext(contextData)
  const { buyTokenData, errMsg } = useContext(buyData);

  return (
    <div className="div-carosel c">
      {!buyTokenData.failed && <div className="con">
        <br />
        <img className='ld' src="https://gineousc.sirv.com/Images/icons/animated/1103-confetti-outline.gif" alt="successful" />
        <div className="title">Transaction Complete</div>
        <div className="p">You've successfully purchased {Number(buyTokenData.amountOFFR).toLocaleString()} {buyTokenData.symbol} Tokens.</div>
      </div>}
      {buyTokenData.failed && <div className="con">
        <br />
        <img className='ld' src="https://gineousc.sirv.com/Images/icons/animated/1140-error-outline.gif" alt="failed" />
        <div className="title">An Error Occured</div>
        <div className="p">{errMsg}</div>
      </div>}

    </div>
  )
}

export default Confirmation;
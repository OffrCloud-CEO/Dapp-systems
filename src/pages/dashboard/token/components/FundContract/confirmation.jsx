import React, { useContext } from 'react';
import { moneyFormat } from '../../../../../useful/useful_tool';
import { fundContext } from '../../card/FundContract';

const Confirmation = () => {
  const { fundingStatus, fundedAmount, errMsg } = useContext(fundContext);

  return (
    <div className="div-carosel c">
      {fundingStatus && <div className="con">
        <br />
        <img className='ld' src="https://gineousc.sirv.com/Images/icons/animated/1103-confetti-outline.gif" alt="successful" />
        <div className="title">Contract Funded</div>
        <div className="p">You've successfully funded the contract with {moneyFormat(fundedAmount)}.</div>
      </div>}
      {!fundingStatus && <div className="con">
        <br />
        <img className='ld' src="https://gineousc.sirv.com/Images/icons/animated/1140-error-outline.gif" alt="failed" />
        <div className="title">An Error Occured</div>
        <div className="p">{errMsg}</div>
      </div>}
      <br />

    </div>
  )
}

export default Confirmation;
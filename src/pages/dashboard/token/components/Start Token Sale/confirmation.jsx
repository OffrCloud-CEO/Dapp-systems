import React, { useContext, useEffect, useState } from 'react';
import { tokenSaleContext } from '../../card/startTokenSale';

const Confirmation = () => {
  const { transactionStatus, dates } = useContext(tokenSaleContext);
  const [dateText, setDatext] = useState({
    startDate: null,
    endDate: null,
  });

  useEffect(()=>{
    const startDate = new Date(dates.start);
    const endDate = new Date(dates.end);

    setDatext({...dateText, startDate: startDate.toLocaleString(), endDate: endDate.toLocaleString()});
  }, [dates]);

  return (
    <div className="div-carosel c">
      {transactionStatus && <div className="con">
        <img className='ld' src="https://gineousc.sirv.com/Images/icons/animated/1103-confetti-outline.gif" alt="" />
        <div className="title md">Token Sale Has Started</div>
        <div className="c">
          <div className="p impo">You've initiated the Token Sale from <b>{dateText.startDate}</b> to <b>{dateText.endDate}</b></div>
        </div>
      </div>}
      {!transactionStatus && <div className="con">
        <img className='ld' src="https://gineousc.sirv.com/Images/icons/animated/1140-error-outline.gif" alt="" />
        <div className="title">An Error Occured</div>
        <div className="p">This maybe as a result of an Insuffient Balance or User rejected the transaction.</div>
      </div>}
      <br />
    </div>
  )
}

export default Confirmation;
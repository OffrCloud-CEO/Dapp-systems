import React, { useContext } from 'react';
import { divDateContext } from '../../card/DividendsDate';

const Confirmation = () => {
  const { status, errMsg } = useContext(divDateContext);

  return (
    <div className="div-carosel c">
      {status && <div className="con">
        <img className='ld' src="https://gineousc.sirv.com/Images/icons/animated/1103-confetti-outline.gif" alt="" />
        <div className="title">Date Set</div>
        <div className="p">Your stake holders will be informed of the new date for the Dividend Period.</div>
      </div>}
      {!status && <div className="con">
        <img className='ld' src="https://gineousc.sirv.com/Images/icons/animated/1140-error-outline.gif" alt="" />
        <div className="title">An Error Occured</div>
        <div className="p">{errMsg}</div>
      </div>}

    </div>
  )
}

export default Confirmation;
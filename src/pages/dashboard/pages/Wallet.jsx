import React, { useContext, useEffect, useRef, useState } from 'react';
import TransactionHashs from '../components/TransactionHashs';
import TokenSale from '../token/TokenSale';
import { contextData } from '../dashboard';

export const walletData = React.createContext();

const Wallet = () => {
  const { loading } = useContext(contextData);
  const [mini, setMini] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [onSale, setOnSale] = useState(false);
  const [canBuy, setCanBuy] = useState(false);

  const buyRef = useRef();
  const transferRef = useRef();
  return (
    <walletData.Provider value={{ userBalance, setUserBalance, setMini, mini, onSale, setOnSale, setCanBuy }}>
      <div className="dash_section">
        <label>Token Sale</label>
        {loading && <div className="pending">
          <img src="https://gineousc.sirv.com/Images/sp.gif" alt="" />
        </div>}
        <div className="dash-row">
          <div className="div-3">
            <div className="kard">
              <div className="tag">
                Sales Status
                <img src="https://gineousc.sirv.com/Images/icons/on.png" alt="" />
              </div>
              <div className={`value info ${mini !== null ? `${mini.status && canBuy ? "good" : "bad"}` : ``}`}>{mini !== null ? `${mini.status && canBuy ? "Ongoing" : "Not on Sale"}` : `N/A`}</div>
            </div>
            <div className="kard">
              <div className="tag">
                Sale Started
                <img src="https://gineousc.sirv.com/Images/icons/off.png" alt="" />
              </div>
              <div className="value info">{mini !== null ? `${mini.status ? mini.startDate : "N/A"}` : `N/A`}</div>
            </div>
            <div className="kard">
              <div className="tag">
                End Date
                <img src="https://gineousc.sirv.com/Images/icons/off.png" alt="" />
              </div>
              <div className="value info">{mini !== null ? `${mini.status ? mini.endDate : "N/A"}` : `N/A`}</div>
            </div>
          </div>
        </div>
        <div className="grid-system">
          <TokenSale buyRef={buyRef} transferRef={transferRef} />
        </div>
        <TransactionHashs maxL={10} methods={[1]}  />
      </div>
    </walletData.Provider>
  );
}

export default Wallet;
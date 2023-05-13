import React, { useContext, useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast';
import { contextData } from '../../dashboard';
import CloseBTN from '../components/TranferToken/closeBTN';
import Confirmation from '../components/TranferToken/confirmation';
import SetAmount from '../components/TranferToken/SetAmount';
import ToAddress from '../components/TranferToken/ToAddress';
import VerifyTransfer from '../components/TranferToken/VerifyTransfer';

export const transferData = React.createContext();
const TranferTokens = ({setTransfering}) => {

  const { coinBase } = useContext(contextData);
  
  const [pending, setPending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sendAmount, setSendAMount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [symbol, setSymbol] = useState('');
  const [status, setStatus] = useState(false);
  const [oldBalance, setOldBalance] = useState(0);
  const [errMsg, setErrMsg] = useState('');

  const [transData, setTransData] = useState({
    sendAmount,
    toAddress,
    fromAddress: null,
    symbol,
    status,
    oldBalance
  });

  useEffect(()=>{
    setTransData({...transData, sendAmount: sendAmount, toAddress: toAddress, fromAddress: coinBase.coinbase, symbol:symbol, status: status, oldBalance: oldBalance});
  }, [sendAmount, toAddress, coinBase, symbol, status, oldBalance]);

  return (
    <transferData.Provider value={{errMsg, setErrMsg, setSendAMount, setStatus, setCurrentPage, setToAddress, setSymbol, transData, setPending, setOldBalance}}>
      <div className="cover">
        <Toaster
          toastOptions={{
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <div className="div wide">

          {!pending && <CloseBTN control={setTransfering} />}

          {pending && <div className="pending">
            <div className="loadingio-spinner-gear-abqyc1i9wu"><div className="ldio-r68llg26yv">
              <div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            </div></div>
          </div>}

          {!status && <div className="carosel">
            <div className={`cnt ${currentPage === 1 && "active"}`}><div></div></div>
            <div className={`cnt ${currentPage === 2 && "active"}`}><div></div></div>
            <div className={`cnt ${currentPage === 3 && "active"}`}><div></div></div>
            {currentPage === 4 && <div onClick={() => setCurrentPage(4)} className={`cnt ${currentPage === 4 && "active"}`}><div></div></div>} 
          </div>}
          
          <div className="carosel">
            {currentPage === 1 && <SetAmount/>}
            {currentPage === 2 && <ToAddress />}
            {currentPage === 3 && <VerifyTransfer />}
            {currentPage === 4 && <Confirmation />}
          </div>
        </div>
      </div>
    </transferData.Provider>
  )
}

export default TranferTokens
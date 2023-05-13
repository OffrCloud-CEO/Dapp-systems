import React, { useState } from 'react';
import { useContext } from 'react';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { getCryptoPrice, isObjectEmpty } from '../../../../useful/useful_tool';
import { contextData } from '../../dashboard';
import CloseBTN from '../components/BuyToken/closeBTN';
import Confirmation from '../components/BuyToken/confirmation';
import CurrencySelect from '../components/BuyToken/currencySelect';
import PendingTransaction from '../components/BuyToken/pendingTransaction';
import SetAmount from '../components/BuyToken/SetAmount';

export const buyData = React.createContext();

const BuyToken = ({ setBuying }) => {
  const {coinBase, rootData} = useContext(contextData);
  const [pending, setPending] = useState(false);
  const [toUsd, setToUsd] = useState(null);
  const [currency, setCurrency] = useState(0); 
  const [currentPage, setCurrentPage] = useState(0);
  const [buyArr, setBuyArr] = useState({});
  const [approved, setApproved] = useState(false);
  const [buyTokenData, setBuyTokenData] = useState({});
  const [errMsg, setErrMsg] = useState("");

  useEffect(()=>{
    if (!coinBase) {
      setPending(true);
    }else{
      setPending(false);
    }
  }, [coinBase]);

  useEffect(() => {
    if (currency > 0) {
      setCurrentPage(1);
    }

    switch (currency) {
      case 1:
        setToUsd( Number(rootData?.tokenPriceRates) / 1);
        break;
      case 2:
        getCryptoPrice("ethereum").then(price => {
          setToUsd(price * (Number(rootData?.tokenPriceRates) / 1));
        });
        break;
      default:
        break;
    }
  }, [currency]);

  useEffect(() => {
    if (currentPage === 2){
      if (isObjectEmpty(buyArr)) {
        setCurrentPage(1);
      }
    }
    if (currentPage === 3){
      if (!approved) {
        setCurrentPage(2);
      }
    }
  }, [currentPage]);

  return (
    <buyData.Provider value={{ errMsg, setErrMsg, currency, toUsd, buyArr, setBuyArr, setCurrentPage, setBuying, setPending, setApproved, buyTokenData, setBuyTokenData }}>
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
          {currentPage !==2 && !pending && <CloseBTN control={setBuying}/>}
          {pending && <div className="pending">
            <div className="loadingio-spinner-gear-abqyc1i9wu"><div className="ldio-r68llg26yv">
              <div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            </div></div>
          </div>}
          {currentPage !== 3 && !buyTokenData.failed &&<div className="carosel">
            <div className={`cnt ${currentPage === 0 && "active"}`}><div></div></div>
            <div className={`cnt ${currentPage === 1 && "active"}`}><div></div></div>
            <div className={`cnt ${currentPage === 2 && "active"}`}><div></div></div>
          </div>}
          {currentPage === 0 && <CurrencySelect setCurrency={setCurrency} currency={currency} />}
          {currentPage === 1 && currency !==0 && <SetAmount toUsd={toUsd} currency={currency} />}
          {currentPage === 2 && <PendingTransaction />}
          {currentPage === 3 && <Confirmation />}
          <div className="next">
          </div>
        </div>
      </div>
    </buyData.Provider>
  )
}

export default BuyToken;
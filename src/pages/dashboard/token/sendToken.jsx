import React, { useContext, useEffect, useState } from 'react';
import { walletData } from '../pages/Wallet';
import { contextData } from '../dashboard';
import { isObjectEmpty } from '../../../useful/useful_tool';

const SendToken = ({ buyRef, transferRef, salesData }) => {
  const { mini, userBalance, onSale } = useContext(walletData);
  const { adminConnected } = useContext(contextData);
  const [testVal, setTestVal] = useState(0);
  const [salesDate, setSalesDate] = useState({});
  const [canBuy, setCanBuy] = useState(false);

  useEffect(()=>{
    setSalesDate(salesData);
  }, [salesData]);

  useEffect(()=>{
    if (!isObjectEmpty(salesDate)) {
      const today = new Date();
      const startDate = new Date(salesDate.startDate);
      const endDate = new Date(salesDate.endDate);

      setCanBuy((today > startDate) && (startDate < endDate));
    }
  }, [salesDate]);

  useEffect(()=>{ 
    setTestVal((userBalance  / (10**18)));
  }, [userBalance]);


  return (
    <div className="">
      {!adminConnected && canBuy && <div className="flex-form">
        <div className={`sec bt pb ${!onSale && "disable"}`}>
          {mini !== null ? <div className={`btnx ${onSale && "disabled"}`} onClick={() => buyRef?.current.click()}>Buy Token</div> : <img src="https://gineousc.sirv.com/Images/sp.gif" alt="" />}
        </div>
        <div className={`sec bt pb ${testVal === 0 && "disable"}`}>
          {<div className={`btnx ${testVal === 0 && "disabled"}`} onClick={() => transferRef?.current.click()}>Transfer</div>}
        </div>
      </div>}
    </div>
  )
}

export default SendToken;
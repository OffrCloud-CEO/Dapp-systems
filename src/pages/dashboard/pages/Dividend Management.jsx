import { ethers } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import { daysToText, formatNum } from '../../../useful/useful_tool';
import { contextData } from '../dashboard';
import DividendSettings from '../token/card/DividendSettings';
import { toast, Toaster } from 'react-hot-toast';
import FundContract from '../token/card/FundContract';
import TransactionHashs from '../components/TransactionHashs';
import { dividendManagementABI, dividendManagementAddress } from '../../../util/constants/tokenDividendManagement';
import DividendsDate from '../token/card/DividendsDate';

export const dividendContext = React.createContext();
const DividendManagement = () => {
  
  const { dividendDate, rootData, setTransactions, transactions, lastBlockTime, tokenSaleInfo, kycDataList, dividendUsdcBalance, totalSupplyBalance, dividendInitialInfo, dividendSessionData } = useContext(contextData);
  const [startingDividendsPeriod, setStartingDividendsPeriod] = useState(false);
  const [setingDateForDividend, setSetingDateForDividend] = useState(false);
  const [payingDivdends, setPayingDividends] = useState(false);
  const [coin, setCoin] = useState(null);  
  const [saleStatus, setSaleStatus] = useState(false);
  const [lastBlockTimestamp, setLastBlockTimestamp] = useState(0);
  const [futureDate, setFutureDate] = useState("");
  const [tokenPrice, setTokenPrice] = useState(0);
  const [canStart, setCanStart] = useState(true);

  useEffect(()=>{
    setLastBlockTimestamp(lastBlockTime);
  }, [lastBlockTime]);

  useEffect(()=>{
    const today = new Date();

    if (dividendDate !== '') {
      const setDate = new Date(dividendDate);
      setCanStart(today >= setDate);
    }

  }, [dividendDate]);

  function getFutureDate() {
    if (coin?.isDividendPaymentPeriod) {
      const interval = Number(coin?.divIntervalValue) * (86400 * 1000);
      const today = new Date();
      const blockTime = new Date(lastBlockTimestamp);

      const future = new Date(blockTime.getTime() + (interval));
      const difference = Math.floor((today.getTime() - future) / 1000);

      const isFutureDate = (difference / 60) < -1440;

      let formattedDate;

      if (difference < 0) {
        if (isFutureDate) {
          const month = future.toLocaleString('default', { month: 'short' });
          const day = future.getDate();
          const suffix = getDaySuffix(day);
          formattedDate = `${month} ${day}${suffix}`;
        } else {
          const hours = Math.floor((Math.abs(difference) / 60) / 60);
          const minutes = Math.floor(Math.abs(difference) / 60) % 60;

          formattedDate = `${hours}h ${minutes}mins`;
        }
      } else {
        formattedDate = `Now`;
      }

      setFutureDate(formattedDate);
    }
  }
  
  function getDaySuffix(day) {
    if (day === 1 || day === 21 || day === 31) {
      return 'st';
    } else if (day === 2 || day === 22) {
      return 'nd';
    } else if (day === 3 || day === 23) {
      return 'rd';
    } else {
      return 'th';
    }
  }

  useEffect(()=>{
    const { status } = tokenSaleInfo;
    setSaleStatus(status);
  }, [tokenSaleInfo]);

  const fetchCoinInformation = async () => {
    const { isOwner, symbol, cap, tokenPriceRates } = rootData;
    const { status, interval, period, percentValue } = dividendInitialInfo;
    const { paid, total } = dividendSessionData;

    setTokenPrice(tokenPriceRates);

    let obj = {
      kycedUsersList: kycDataList,
      tokenCap: cap,
      totalSupply: totalSupplyBalance,
      divPeriodValue: period,
      divIntervalValue: interval,
      divIntervalCountValue: total,
      divCountValue: paid,
      divPercent: percentValue,
      divCount: paid,
      contractUSDC: dividendUsdcBalance,
      isOwner: isOwner,
      isDividendPaymentPeriod: status,
      symbol: symbol,
    };

    setCoin(obj);
  };

  const endDividendPeriod = async() =>{
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();

      const tokenDividendManagement = new ethers.Contract(dividendManagementAddress, dividendManagementABI, signer);
      const endDividendPaymentPeriodTransaction = await tokenDividendManagement.endDividendPaymentPeriod();

      await endDividendPaymentPeriodTransaction.wait(); 

    } catch (error) {
      console.log(error.reaseon ? error.reaseon : error.message ? error.message : error);
      throw Error(error);
    }
  }

  useEffect(() => {
    getFutureDate();
  }, [lastBlockTimestamp, dividendInitialInfo, coin]);

  const endDividendPeriodWatch = () =>{
    const promise = endDividendPeriod();

    toast.promise(promise,{
      loading: "Ending Dividend Period.",
      success: "✨ Dividend Period is Over.",
      error: "An error occurred"
    });
  }
 

  const btnController = ( e )=>{
    switch (e) {
      case "pay":
        if (String(futureDate).toLowerCase() === 'now') {
          setPayingDividends(true);
        }
        break;
      case "setDate":
        setSetingDateForDividend(true);
        break;
      case "start":
        setStartingDividendsPeriod(true);
        break;
      case "end":
        endDividendPeriodWatch();
        break;
    
      default:
        break;
    }
  }

  useEffect(() => {
    if (rootData !== null) {
      fetchCoinInformation();
    }
  }, [rootData, tokenSaleInfo, kycDataList, dividendUsdcBalance, totalSupplyBalance, dividendInitialInfo, dividendSessionData, ]);

  return (
    <dividendContext.Provider value={{ setSetingDateForDividend, setPayingDividends, startingDividendsPeriod, setStartingDividendsPeriod, coin, setTransactions, transactions }}>
      <div className="dash_section">
        <Toaster
          toastOptions={{
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <label>Dividend Management</label>

        {startingDividendsPeriod && <DividendSettings />}
        {payingDivdends && <FundContract />}
        {setingDateForDividend && <DividendsDate/>}

        <div className="dash-row">
          <div className="div-3">
            <div className='kard'>
              <div className="tag">Token Holders <img src="https://gineousc.sirv.com/Images/icons/icons8-client-64.png" alt="" /></div>
              <div className="value">{coin != null && coin.kycedUsersList !== null && coin.kycedUsersList.length > 0 ? `${coin.kycedUsersList.length > 0 ? coin.kycedUsersList.length : '0.00'}` : `---`}</div>
            </div>
            <div className='kard'>
              <div className="tag">Total Dividend Paid <img src="https://gineousc.sirv.com/Images/icons/icons8-bounced-check-100.png" alt="" /></div>
              <div className="value">
                <div className="hang" data-hang={`${coin != null && coin.isDividendPaymentPeriod ? `of ${coin.divIntervalCountValue > 0 ? coin.divIntervalCountValue : '0'}` : ``}`}>
                  {coin != null && coin.isDividendPaymentPeriod ? `${coin.divCountValue}` : `---`}
                </div>
              </div>
            </div>
            {coin?.divIntervalCountValue > coin?.divCountValue &&<div className='kard'>
              <div className="tag">Next Pay date<img src="https://gineousc.sirv.com/Images/icons/date-to.png" alt="" /></div>
              <div className="value info">
                {coin?.isDividendPaymentPeriod ? futureDate !== '' ? futureDate : "---" : "---"}
              </div>
            </div>}
          </div>

          <div className="div-2">
            <div className='kard'>
              <div className="tag">Dividend Period <img src="https://gineousc.sirv.com/Images/icons/icons8-date-span-100.png" alt="" /></div>
              <div className="value info">{coin != null && coin.divPeriodValue > 0 ? `${coin.divPeriodValue > 0 ? `${daysToText(Number(coin.divPeriodValue))}` : '0.00'}` : `---`}</div>
            </div>
            <div className='kard'>
              <div className="tag">Dividend Intervals<img src="https://gineousc.sirv.com/Images/icons/hourglass-sand-bottom.png" alt="" /></div>
              <div className="value info">{coin != null && coin.divIntervalValue > 0 ? `${coin.divIntervalValue > 0 ? `${daysToText(Number(coin.divIntervalValue))}` : '0.00'}` : `---`}</div>
            </div>
          </div>

          {/* You can use the disable class to disable some buttons */}
          {totalSupplyBalance > 0 && <div className="btnx-row">
            <label>Action Buttons</label>
            <div className="row">
              {coin?.isDividendPaymentPeriod && coin?.divCount !== coin?.divIntervalCountValue && <div className={`btnx ${String(futureDate).toLowerCase() !== 'now' && 'disable toPay'}`} onClick={()=>btnController("pay")}>
                Pay Dividend
              </div>}
              {totalSupplyBalance > 0 && !coin?.isDividendPaymentPeriod && <div className="btnx" onClick={()=>btnController("setDate")}>
                Set Dividend Payment date.
              </div>}
              {!saleStatus && totalSupplyBalance > 0 && !coin?.isDividendPaymentPeriod && canStart && <div className="btnx" onClick={()=>btnController("start")}>
                Start Dividend Period
              </div>}
              {coin?.isDividendPaymentPeriod && coin?.divCount === coin?.divIntervalCountValue && <div className="btnx warn" onClick={()=>btnController("end")}>
                End Dividend Period
              </div>}
            </div>
          </div>}

          {coin != null && !coin.isDividendPaymentPeriod && <div className="action-card">
            <div className="img"><img src="https://img.icons8.com/fluency/96/null/where-to-quest.png" alt="" /></div>
            <div className="txt">
              <span>
              The period for Dividend Payment has not begun yet. To start this period, 
              you must <code>*End the Token Sale*</code> and <code>*sell at least 1 token*</code>. 
              </span>

              <span>The properties of the Dividend Period can only be set once, 
              which is when the period is being started. 
              During this time, you can assign the Dividend Properties such as the <code>`Dividend Period`</code>, 
              <code>`Dividend Interval`</code>, and <code>`Dividend Amount`</code>. Dividend-related activities will resume after Date String.</span>
            </div>
          </div>}

          <div className="div-2">
            <div className="kard exempt">
              <div className="title">Dividend Info</div>
              <div className="r">
                <div className="grided">

                  <div>
                    <span>{coin != null && coin.isDividendPaymentPeriod ? `${coin.divPercent > 0 ? (coin.divPercent/1000) : '0.00'}%` : `---`}</span>
                    <span>Dividend percent</span>
                  </div>
                  <div>
                    <span>{coin != null && coin.isDividendPaymentPeriod ? `${coin.divIntervalCountValue > 0 ? coin.divIntervalCountValue : '0.00'}` : `---`}</span>
                    <span>Total Session</span>
                  </div>
                  <div>
                    <span>{coin != null && coin.isDividendPaymentPeriod ? `$ ${coin.isDividendPaymentPeriod > 0 ? formatNum((ethers.utils.formatEther(coin.totalSupply) * ((coin.divPercent / 1000) / 100)) * (1/tokenPrice)) : '0.00'}` : `---`}</span>
                    <span>Payment Per Session</span>
                  </div>
                </div>
                <div className="grided">
                  <div>
                    <span>{coin != null && coin.isDividendPaymentPeriod ? `$${coin.divPercent > 0 ? formatNum(((((coin.divPercent/1000) * (coin.divIntervalCountValue)) / 100) * ethers.utils.formatEther(coin.totalSupply)) * (1/tokenPrice)) : '0.00'}` : `---`}</span>
                    <span>Payment All Session</span>
                  </div>
                  <div>
                    <span>{coin != null && coin.totalSupply ? `${coin.totalSupply > 0 ? formatNum(coin.totalSupply) : '0.00'}` : `---`}</span>
                    <span>TotalSupply</span>
                  </div>
                  <div>
                    <span>{coin != null && coin.contractUSDC ? `$ ${coin.contractUSDC > 0 ? `${formatNum(coin.contractUSDC)}` : '0.00'}` : `---`}</span>
                    <span>Contract USDC Balance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="info-tab">
            <div className="information">
              <TransactionHashs maxL={10} methods={[3,6,7,8]} />
            </div>
          </div>
        </div>
      </div>
    </dividendContext.Provider>
  )
}

export default DividendManagement;
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useContext } from 'react';
import { formatNum, formatNumFreeStyle, greetUser, isObjectEmpty } from '../../../useful/useful_tool';
import GridCard from '../components/GridCard';
import TransactionHashs from '../components/TransactionHashs';
import { contextData } from '../dashboard';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { rootData, dividendInitialInfo, tokenBalance, dividendSessionData, totalSupplyBalance, coinBase, storeDataUser, tokenSaleInfo, kycData, kycVerified, claimableData } = useContext(contextData);
  const [percent, setPercent] = useState(0);
  const [coinInfo, setCoinInfo] = useState(null);
  const [unclaimedDividends, setUnclaimedDividends] = useState(0);
  const [session, setSessions] = useState(0);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [canBuy, setCanBuy] = useState(false);

  useEffect(() => {
    if (!isObjectEmpty(coinInfo)) {
        const today = new Date();
        const startDate = new Date(coinInfo?.txtStartDate);
        const endDate = new Date(coinInfo?.txtEndDate);

        setCanBuy((today > startDate) && (startDate < endDate));
    }
}, [coinInfo]);

  useEffect(() => {
    if (rootData.name !== null) {
      const { name, symbol, decimals, beneficiaryAddress, contractAdress, cap, tokenPriceRates } = rootData;
      const { status, endDateTxt, startDateTxt } = tokenSaleInfo;
      const { paid, total } = dividendSessionData;
      setSessions(paid);
      setSessionsTotal(total);

      setPercent(dividendInitialInfo?.percentValue);

      const data = {
        name,
        symbol,
        decimals,
        totalSupply: totalSupplyBalance,
        beneficiaryAddress,
        contractAdress,
        myBalance: tokenBalance,
        cap,
        isSaleOpen: status,
        txtEndDate: endDateTxt,
        txtStartDate: startDateTxt,
        isKycVerified: kycVerified,
        isDividendPeriod: dividendInitialInfo.status,
        divIntervalValue: dividendInitialInfo.interval,
        tokenPriceRates: tokenPriceRates,
      }

      setCoinInfo(data);
    }

  }, [rootData, tokenSaleInfo, kycVerified, dividendInitialInfo, dividendSessionData]);


  useEffect(() => {
    const { claimable } = claimableData;
    setUnclaimedDividends(claimable);
  }, [claimableData]);


  return (
    <div className="dash_section">
      <div className="greet">
        <div className="title">{greetUser()} {storeDataUser ? ((`@${storeDataUser.displayname}`)) : "@firstname"}, </div>
        <div className="tags">
          <Link to={"/dashboard/profile"} className="img">
            {storeDataUser && <img src={storeDataUser?.dp} alt="" />}
            {!storeDataUser && <img src="https://gineousc.sirv.com/Images/Infinite.gif" alt="" />}
          </Link>
        </div>
      </div>
      <label>Your Wallet</label>
      <div className="dash-row home">
        <div className="div-3">
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/id-verified.png"} detail={kycData?.status === 0 ? `Pending` : kycData?.status === 1 ? `Verified` : kycData?.status === 2 ? 'Declined' : 'Not Enrolled'} p={`KYC Status`} kyc={kycData?.status >= 0 ? kycData?.status : 2} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/money%20(2).svg"} detail={`${coinInfo ? formatNumFreeStyle((coinInfo.myBalance / (10 ** 18))) : ''} ${coinInfo && coinInfo.symbol}`} p={`Your ${coinInfo?.symbol} Balance`} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/wallet.svg"} type={'address'} detail={coinBase ? coinBase?.coinbase : "0x00"} p={"Wallet Address"} />
        </div>
        {coinInfo?.isSaleOpen && <label>Token Sale Information</label>}
        {coinInfo?.isSaleOpen && <div className="div-3">
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/icons8-land-sales-80.png"} detail={`${coinInfo.totalSupply === coinInfo.cap ? "Sold" ? canBuy : "Not on Sale" : "Ongoing"}`} type={`${coinInfo.totalSupply === coinInfo.cap && canBuy  ? "" : "status"}`} p={"Token Sale Status"} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/on.png"} detail={coinInfo?.txtEndDate} p={"Token Sale Ends"} />
          {kycData?.status === 1 && <GridCard ico={"https://gineousc.sirv.com/Images/icons/icons8-buy-100.png"} animated={"https://gineousc.sirv.com/Images/icons/icons8-shopping-cart.gif"} detail={``} p={``} bType={0} type={`btn`} />}
        </div>}
        {coinInfo && coinInfo?.isDividendPeriod && <label>Dividend Information</label>}
        {coinInfo && coinInfo?.isDividendPeriod && <div className="div-3">
          <div className='kard'>
            <div className="tag">Session(s)<img src="https://gineousc.sirv.com/Images/icons/external-fraction-math-vol-1-outline-outline-black-m-oki-orlando.png" alt="" /></div>
            <div className="value">
              {percent > 0 ? <div className="hang" data-hang={`of ${sessionsTotal}`}>
                {session}
              </div> : "---"}
            </div>
          </div>
          {<GridCard ico={"https://gineousc.sirv.com/Images/icons/icons8-client-64.png"} detail={`${(Number(Number(Number(((coinInfo?.myBalance / (10 ** 18)) * (1 / Number(coinInfo?.tokenPriceRates))) * (percent / 100000))).toFixed(2)) >= 1 ? Number(Number(Number(((coinInfo?.myBalance / (10 ** 18)) * (1 / Number(coinInfo?.tokenPriceRates))) * (percent / 100000))).toFixed(2)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.01')}`} p={`Dividends Per Session`} />}
          {unclaimedDividends > 0 && <GridCard ico={"https://gineousc.sirv.com/Images/icons/money%20(2).svg"} detail={``} bType={1} type={`btn`} p={"Claim your Dividends"} />}
        </div>}
        <label>Coin Information</label>
        <div className="div-3">
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/info.svg"} detail={coinInfo?.name} p={"Token name"} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/coin.svg"} detail={coinInfo?.symbol} p={"Token symbol"} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/coins.svg"} detail={`${coinInfo ? (coinInfo?.totalSupply > 0 ? ((formatNumFreeStyle((coinInfo.totalSupply)))) : '0') : ''}`} p={"Total supply"} />
        </div>
        <div className="div-3">
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/percentage.png"} detail={"5%"} p={"Yield over 12 months"} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/tr.png"} detail={`$ ${Number((1 / Number(coinInfo?.tokenPriceRates))).toLocaleString()}`} p={`Price`} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/analytics.svg"} detail={coinInfo ? formatNumFreeStyle(coinInfo?.cap) : ''} type={'cap'} p={"Max Supply"} />
        </div>
        

        <div className="info-tab">
          <div className="information">
            <TransactionHashs maxL={5} methods={[1, 9, 8, 3]} />
          </div>
        </div>
      </div>

    </div>
  )
}

export default HomePage;
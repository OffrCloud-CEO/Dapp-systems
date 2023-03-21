import { ethers } from 'ethers';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useContext } from 'react';
import { bigNum, formatEth, formatNum, formatNumFreeStyle, greetUser } from '../../../useful/useful_tool';
import { address } from '../../../util/constants/tokenContract';
import { ABI3, address3 } from '../../../util/constants/tokenHandlerContract';
import GridCard from '../components/GridCard';
import { contextData } from '../dashboard';

const HomePage = () => {
  const { contract, coinBase, storeDataUser } = useContext(contextData);
  const [offr, setOffr] = useState(null);
  const [coinInfo, setCoinInfo] = useState(null);
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    if (contract !== null) {
      setOffr(contract[0]);
    }
  }, [contract]);

  function formatDate(date) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    const monthName = months[monthIndex];

    return `${day} ${monthName}, ${year}`;
  }


  const fetchOFFR = async () => {
    if (coinBase) {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = await provider.getSigner();
      const user = await signer.getAddress();

      const tokenHandler = new ethers.Contract(address3, ABI3, signer);

      const name = await offr.name();
      const symbol = await offr.symbol();
      const max = await offr.totalSupply();
      const decimals = await offr.decimals();
      const totalSupply = await offr.totalSupply();
      let cap = await offr.cap();
      cap = bigNum(cap);
      const beneficiaryAddress = await offr._beneficiary();
      const contractAdress = address;
      const myBalance = await offr.balanceOf(coinBase?.coinbase);
      const holderList = await offr.getHolderList();

      // TokenHandler Data
      const isSaleOpen = await tokenHandler.tokensale_open();
      const isHolder = holderList.includes(user);
      const salesEndDate = Number(await tokenHandler.getSaleEndDate());

      const txtEndDate = formatDate(new Date(salesEndDate));

      const isDividendPeriod = await tokenHandler.isDividendPaymentPeriodActive();

      const data = {
        name,
        symbol,
        max,
        decimals,
        totalSupply,
        beneficiaryAddress,
        contractAdress,
        myBalance,
        cap,
        isSaleOpen,
        txtEndDate,
        isHolder,
        isDividendPeriod,
      }
      setCoinInfo(data);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (offr !== null) {
      fetchOFFR();
    }
  }, [offr, coinBase]);



  return (
    <div className="dash_section">
      {loading && <div className="pending">
        <img src="https://gineousc.sirv.com/Images/sp.gif" alt="" />
      </div>}
      <div className="greet">
        <div className="title">{greetUser()} {storeDataUser ? ((storeDataUser?.name).split(" ")[0]) : "@firstname"}, </div>
        <div className="tags">
          <div className="img">
            {storeDataUser && <img src={storeDataUser?.dp} alt="" />}
            {!storeDataUser && <img src="https://gineousc.sirv.com/Images/Infinite.gif" alt="" />}
          </div>
        </div>
      </div>
      <label>Your Wallet</label>
      <div className="dash-row home">
        <div className="div-3">
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/money%20(2).svg"} detail={`${coinInfo ? formatNumFreeStyle((coinInfo?.myBalance / (10 ** 18))) : ''} ${coinInfo && coinInfo.symbol}`} p={`Your ${coinInfo?.symbol} Balance`} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/wallet.svg"} type={'address'} detail={coinBase ? coinBase?.coinbase : "0x00"} p={"Wallet Address"} />
        </div>
        {coinInfo?.isSaleOpen && <label>Token Sale Information</label>}
        {coinInfo?.isSaleOpen &&<div className="div-3">
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/icons8-land-sales-80.png"} detail={`${coinInfo.totalSupply === coinInfo.cap ? "Sold": "Ongoing"}`} type={`${coinInfo.totalSupply === coinInfo.cap ? "" : "status"}`} p={"Token Sale Status"} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/on.png"} detail={coinInfo?.txtEndDate} p={"Token Sale Ends"} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/icons8-buy-100.png"} animated={"https://gineousc.sirv.com/Images/icons/icons8-shopping-cart.gif"} detail={``} p={``} type={`btn`} />
        </div>}
        {coinInfo && coinInfo?.isDividendPeriod && <label>Dividend Information</label>}
        {coinInfo && coinInfo?.isDividendPeriod &&<div className="div-3">
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/icons8-land-sales-80.png"} detail={`${coinInfo?.isHolder && coinInfo?.myBalance > 0 ? "Valid Holder": "Invalid Holder"}`} type={`${coinInfo?.isHolder && coinInfo?.myBalance > 0 ?  "status" : ""}`} p={"Holder Status"} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/on.png"} detail={coinInfo?.txtEndDate} p={"Next Dividend Payment"} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/icons8-client-64.png"} detail={`${(formatNum((coinInfo?.myBalance / (10**18)) * 0.05))} USDC`} p={`Dividend Amount`} />
        </div>}
        <label>Coin Informations</label> 
        <div className="div-3">
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/info.svg"} detail={coinInfo?.name} p={"Token name"} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/coin.svg"} detail={coinInfo?.symbol} p={"Token symbol"} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/analytics.svg"} detail={coinInfo ? formatNumFreeStyle(coinInfo?.cap) : ''} p={"Max Supply"} />
        </div>
        <div className="div-3">
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/dc.png"} detail={coinInfo?.decimals} p={"Decimals"} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/tr.png"} detail={`1 USDC`} p={`Price`} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/coins.svg"} detail={`${coinInfo ? (coinInfo?.totalSupply > 0 ? ((formatNumFreeStyle((coinInfo?.totalSupply)))) : '0') : ''}`} p={"Total supply"} />
        </div>
        <div className="div-2">
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/wallet.svg"} type={'address'} detail={"0x35CB38345f6f6FEfFa5AF922e5B5c08928F29c91"} p={"Beneficiary address"} />
          <GridCard ico={"https://gineousc.sirv.com/Images/icons/wallet.svg"} type={'address'} detail={coinInfo?.contractAdress} p={"Token Contract Address"} />
        </div>
      </div>

    </div>
  )
}

export default HomePage;
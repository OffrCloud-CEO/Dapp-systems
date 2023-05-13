import React, { useContext, useEffect, useState } from 'react';
import { formatNum, formatPercentage, isObjectEmpty } from '../../../useful/useful_tool';
import { contextData } from '../dashboard';
import { walletData } from '../pages/Wallet';
import BuyToken from './card/BuyToken';
import TranferTokens from './card/TranferTokens';
import Clock from './components/BuyToken/clock';
import SendToken from './sendToken';

const TokenSale = ({ buyRef, transferRef }) => {
    const { setMini, setOnSale, setUserBalance, setCanBuy } = useContext(walletData);
    const { rootData, tokenSaleInfo, tokenBalance, totalSupplyBalance, kycVerified } = useContext(contextData);

    const [buying, setBuying] = useState(false);
    const [transfering, setTransfering] = useState(false);

    const [tokenSaleStatus, setTokenSaleStatus] = useState(false);
    const [coinInfo, setCoinInfo] = useState({
        name: null,
        symbol: null,
        decimals: null,
        totalSupply: null,
        beneficiaryAddress: null,
        contractAdress: null,
        myBalance: null,
        cap: null,
        startDate: "",
        endDate: "",
    });

    const [ salesDate, setSalesDate ] = useState({
        startDate: "00-00-0000",
        endDate: "00-00-0000",
    });

    useEffect(() => {
        if (!isObjectEmpty(salesDate)) {
            const today = new Date();
            const startDate = new Date(salesDate.startDate);
            const endDate = new Date(salesDate.endDate);

            setCanBuy((today > startDate) && (startDate < endDate));
        }
    }, [salesDate]);

    useEffect(() => {
        if (coinInfo.name !== null) {
            const { startDateTxt, endDateTxt, status } = tokenSaleInfo;

            setMini({
                startDate: startDateTxt,
                endDate: endDateTxt,
                status: status
            });

            setOnSale(status);

            setTokenSaleStatus(status);

            setSalesDate({
                startDate: startDateTxt,
                endDate: endDateTxt,
            });
        }
    }, [tokenSaleInfo, coinInfo]);

    useEffect(() => {
        setUserBalance(tokenBalance);
    }, [tokenBalance, coinInfo]);

    useEffect(() => {
        if (rootData.cap !== null) {
            const { name, cap, contractAdress, beneficiaryAddress, decimals, symbol, } = rootData;

            const data = {
                name,
                symbol,
                decimals,
                totalSupply: totalSupplyBalance,
                beneficiaryAddress,
                contractAdress,
                myBalance: tokenBalance,
                cap,
            }

            setCoinInfo(data);
        }
    }, [rootData, totalSupplyBalance, tokenBalance]);



    return (
        <>
           {coinInfo !== null &&  <div className="grid-card tk">
                {buying && <BuyToken setBuying={setBuying} />}
                {transfering && <TranferTokens setTransfering={setTransfering} />}
                <div className="sec st">
                    <section>
                        <span>Max Supply</span>
                        <div className="m">{formatNum((coinInfo?.cap / (10**18)))}</div>
                    </section>
                    <section>
                        <span>Total Supply</span>
                        <div className="m">{formatNum((coinInfo?.totalSupply  / (10**18)))}</div>
                    </section>
                </div>

                <div className="rng">
                    <div className="ld" data-hover={`${formatPercentage(((100 / (coinInfo?.cap)) * (coinInfo?.totalSupply)).toFixed(8))}`} style={{ width: `${(100 / (coinInfo?.cap)) * (coinInfo?.totalSupply)}%` }}></div>
                </div>
                <Clock endDate={coinInfo.cap !== null ? `${tokenSaleStatus ? salesDate.endDate : "1999"}` : null} />

                <input style={{ display: "none" }} type="hidden" ref={buyRef} onClick={() => setBuying(true)} />
                <input style={{ display: "none" }} type="hidden" ref={transferRef} onClick={() => setTransfering(true)} />

                {kycVerified && tokenSaleStatus && <SendToken buyRef={buyRef} salesData={salesDate} transferRef={transferRef} />}
            </div>}
        </>
    )
}

export default TokenSale;
import React, { useEffect, useRef } from 'react';
import { useContext } from 'react';
import { useState } from 'react';
import { formatNum, formatNumFreeStyle, moneyFormat } from '../../../../../useful/useful_tool';
import { contextData } from '../../../dashboard';
import { buyData } from '../../card/BuyToken';
import { formatEth } from '../../../../../useful/useful_tool';

const SetAmount = () => {
    const { toUsd, currency,  setBuyArr, setCurrentPage } = useContext(buyData);
    const { coinBase, tokenBalance, totalSupplyBalance, rootData, usdcBalance, ethBalance } = useContext(contextData);
    const [scr, setScr] = useState('0');
    const [offr, setOffr] = useState(0);
    const [bal, setBal] = useState("");
    const [coinInfo, setCoinInfo] = useState(null);

    const btnRef0 = useRef();
    const btnRef01 = useRef();
    const btnRef02 = useRef();
    const btnRef03 = useRef();
    const btnRef04 = useRef();
    const btnRef05 = useRef();
    const btnRef06 = useRef();
    const btnRef07 = useRef();
    const btnRef08 = useRef();
    const btnRef09 = useRef();
    const btnRefBack = useRef();
    const btnRefEnter = useRef();

    const fetchOFFR = () => {
        const remainingToken = rootData.cap - totalSupplyBalance;
        const symbol = rootData.symbol;
        const myBalance = tokenBalance;

        const data = {
            symbol,
            myBalance,
            remainingToken: (remainingToken / (10**18)),
        }
        setCoinInfo(data);
    }

    useEffect(() => {
        if (rootData.cap !== null) {
            fetchOFFR();
        }
    }, [tokenBalance, rootData, totalSupplyBalance]);

    const keyPressHandler = (e) => {
        if (coinInfo !== null) {
            let str = `${scr}${e}`;
            if (str.startsWith("0.")) {
                str = `${scr}${e}`;
            } else if (scr > 0) {
                str = `${scr}${e}`;
            } else {
                str = `${e}`;
            }
    
            let testOffr = Number(str) / Number(toUsd);
            let testParam;
            if (currency === 2) {
                testParam = parseFloat(coinBase.balance) / (10**18);
            }else{
                testParam = parseFloat(bal);
            }
            const testValue = (testOffr <= testParam);
            const testRemain = coinInfo.remainingToken >= testOffr;
    
            
            if(testValue && testRemain){
                setScr(str);
            }
        }
    }

    const backspaceHandler = () => {
        let str = (scr).toString();
        str = str.slice(0, -1);
        if (parseFloat(str) > 0) {
            setScr(parseFloat(str));
        } else {
            setScr(0);
        }
    }

    const setMaxHandler = (e) => {
        if (coinInfo !== null) {
            if (!e) {
                return;
            }
            if (coinInfo.remainingToken < e) {
                return;
            }
            if (bal < e) {
                return;
            }
            const calc = e * (toUsd);
            setScr(Math.floor(calc));
        }
    }

    const proceedHandler = () => {
        const amount = parseFloat(scr);
        const crypto = currency;
        const offrValue = offr;

        
        let testOffr = parseFloat(scr)/(toUsd / 1);
        let testParam;
        if (currency === 2) {
            testParam = parseFloat(coinBase.balance) / (10**18);;
        }else{
            testParam =parseFloat(bal);
        }
        const testValue = testOffr <= testParam;


        if (scr > 0 && testValue) {
            setBuyArr({ amount, crypto, offrValue });
            setScr(0);
            setCurrentPage(2);
        }
    } 

    useEffect(() => {
        if (scr > -1) {
            setOffr(scr/(toUsd / 1));
        }
    }, [scr]);

    useEffect(()=>{
        if (currency === 1) {
            setBal((usdcBalance)); 
        }else{
            setBal(((ethBalance)));
        }
    }, [usdcBalance, ethBalance, currency]);

    const handleKeyPress = (e) => {
        const keyValue = e.key;

        switch (keyValue) {
            case "0":
                btnRef0 && btnRef0.current.click();
                break;
            case "1":
                btnRef01 && btnRef01.current.click();
                break;
            case "2":
                btnRef02 && btnRef02.current.click();
                break;
            case "3":
                btnRef03 && btnRef03.current.click();
                break;
            case "4":
                btnRef04 && btnRef04.current.click();
                break;
            case "5":
                btnRef05 && btnRef05.current.click();
                break;
            case "6":
                btnRef06 && btnRef06.current.click();
                break;
            case "7":
                btnRef07 && btnRef07.current.click();
                break;
            case "8":
                btnRef08 && btnRef08.current.click();
                break;
            case "9":
                btnRef09 && btnRef09.current.click();
                break;
            case "Backspace":
                btnRefBack && btnRefBack.current.click();
                break;
            default:
                break;
        }

    };

    useEffect(() => {
        window.addEventListener('keyup', handleKeyPress);
        return () => {
            window.removeEventListener('keyup', handleKeyPress);
        };
    }, [handleKeyPress]);

    return (
        <div className="div-carosel">
            <div className="calc">
                <div className="tagger">
                    <div className="tag">
                        {<span onClick={() => setMaxHandler(Number(bal))}>
                            {currency === 1 && "USDC"}
                            {currency === 2 && "ETH"}: 
                            {currency === 2 && formatEth(Number(bal).toFixed(8))}
                            {currency === 1 && formatNum(Number(bal))}
                        </span>}
                        {<span onClick={() => setMaxHandler(coinInfo && coinInfo.remainingToken > 0 ? Number(coinInfo.remainingToken) : 0)}>Max: {coinInfo && coinInfo.remainingToken > 0 ? formatNumFreeStyle(coinInfo.remainingToken) : 0}</span>}
                    </div>
                </div>
                {offr !== "0" &&<div className="offr">~ It'll cost you <b>{moneyFormat((offr), 2) === NaN ? `0.00` : moneyFormat((offr), 2)}</b> {`${toUsd && (currency === 1 ? 'USDC' : 'ETH')}`}.</div>}
                <div className="screen">
                    <div className={`num`} data-symbol={` ${coinInfo && coinInfo.symbol}`}><span>{moneyFormat(scr)}</span></div>
                </div>
                <div className="btns">
                    <div ref={btnRef01} onClick={() => keyPressHandler(1)} className="b">1</div>
                    <div ref={btnRef02} onClick={() => keyPressHandler(2)} className="b">2</div>
                    <div ref={btnRef03} onClick={() => keyPressHandler(3)} className="b">3</div>
                    <div ref={btnRef04} onClick={() => keyPressHandler(4)} className="b">4</div>
                    <div ref={btnRef05} onClick={() => keyPressHandler(5)} className="b">5</div>
                    <div ref={btnRef06} onClick={() => keyPressHandler(6)} className="b">6</div>
                    <div ref={btnRef07} onClick={() => keyPressHandler(7)} className="b">7</div>
                    <div ref={btnRef08} onClick={() => keyPressHandler(8)} className="b">8</div>
                    <div ref={btnRef09} onClick={() => keyPressHandler(9)} className="b">9</div>
                    <div ref={btnRefBack} onClick={backspaceHandler} className="bl"><img src="https://gineousc.sirv.com/Images/icons/bks.png" alt="" /></div>
                    <div ref={btnRef0} className="b" onClick={() => keyPressHandler(0)}>0</div>
                    <div ref={btnRefEnter} onClick={proceedHandler} className="bl"><img src="https://gineousc.sirv.com/Images/icons/ch.png" alt="" /></div>
                </div>
            </div>
        </div>
    )
}

export default SetAmount;
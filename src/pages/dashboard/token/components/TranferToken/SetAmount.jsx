import React, { useContext, useEffect, useRef } from 'react';
import { useState } from 'react';
import { formatNum, formatNumFreeStyle, moneyFormat } from '../../../../../useful/useful_tool';
import { contextData } from '../../../dashboard';
import { transferData } from '../../card/TranferTokens';

const SetAmount = () => {
    const { rootData, tokenBalance } = useContext(contextData);
    const {setSendAMount, setSymbol, setCurrentPage, setPending, setOldBalance} = useContext(transferData);

    const [scr, setScr] = useState('0');
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



    const keyPressHandler = (e) => {
        if(coinInfo){
            let str = `${scr}${e}`;
            if (str.startsWith("0.")) {
                str = `${scr}${e}`;
            } else if (scr > 0) {
                str = `${scr}${e}`;
            } else {
                str = `${e}`;
            }

            const tkn = parseFloat(coinInfo.myBalance / (10**18));
            const test = parseFloat(str) < tkn;

            if(test) {
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
        if (e) {
            const tkn = parseFloat(e / (10**18)) - 1;
            setScr(tkn);
        }
    }

    const proceedHandler = () => {
        const amountToSend = scr;
        setSendAMount(amountToSend);
        setSymbol(coinInfo.symbol);
        setCurrentPage(2);
        const bal = (coinInfo?.myBalance / (10**18));
        setOldBalance(bal);
    }


    const fetchOFFR = () => {
        const { symbol } = rootData;

        const data = {
            symbol: String(symbol).trim(),
            myBalance: tokenBalance,
        }
        setCoinInfo(data);
    }

    useEffect(() => {
        if (rootData.symbol !== null) {
            fetchOFFR();
        }
    }, [rootData, tokenBalance]);

    useEffect(() => {
        if(coinInfo){
            setPending(false);
        }else{
            setPending(true);
        }
    }, [coinInfo]);

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
                {coinInfo && <div className="tagger">
                    <div className="tag">
                        {<span onClick={()=>setMaxHandler((coinInfo?.myBalance))}>{coinInfo && formatNum(coinInfo?.myBalance)} {coinInfo && coinInfo?.symbol}</span>}
                    </div>
                </div>}
                <label>Enter Amount</label>
                <div className="screen">
                    <div className={`num`} data-symbol={` ${coinInfo && coinInfo?.symbol}`}><span>{moneyFormat(scr)}</span></div>
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
                    <div onClick={proceedHandler} className="bl"><img src="https://gineousc.sirv.com/Images/icons/ch.png" alt="" /></div>
                </div>
            </div>
        </div>
    )
}

export default SetAmount;
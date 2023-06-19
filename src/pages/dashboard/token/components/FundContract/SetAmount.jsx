import React, { useContext, useEffect, useRef, useState } from 'react';
import { formatNumFreeStyle, moneyFormat} from '../../../../../useful/useful_tool';
import { fundContext } from '../../card/FundContract';

const SetAmount = () => {
    const { setCurrentPage, coin, setAmountToFund, usdcBalance } = useContext(fundContext);
    const [amount, setAmount] = useState("0");
    const [canProceed, setCanProceed] = useState(false);
    const [targetValue, setTargetValue] = useState(0);

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

    useEffect(()=>{
        if (coin !== null) {
            const { divPercent, totalSupply, divCount, divIntervalCountValue } = coin;
            const lastDividendSession = divIntervalCountValue - 1;
            const totalSupplyValue = (totalSupply/(10**18));
            const divdendPerSession = (Number(totalSupplyValue) * ((divPercent / 1000) / 100));
            const targetUSDC = divCount === (lastDividendSession) ? totalSupplyValue + (divdendPerSession) : divdendPerSession;
            setTargetValue(targetUSDC);
        }
    },[coin]);

    useEffect(()=>{
        if (amount === targetValue) {
            setCanProceed(true);
        }else{
            setCanProceed(false);
        }
    }, [amount, targetValue]);


    const keyPressHandler = (e) => {
        let str = `${amount}${e}`;
        if (str.startsWith("0.")) {
            str = `${amount}${e}`;
        } else if (amount > 0) {
            str = `${amount}${e}`;
        } else {
            str = `${e}`;
        }

        setAmount(str);
    }

    const backspaceHandler = () => {
        let str = (amount).toString();
        str = str.slice(0, -1);
        if (parseFloat(str) > 0) {
            setAmount(parseFloat(str));
        } else {
            setAmount(0);
        }
    }

    const setMaxHandler = (e) => {
        if (e) {
            setAmount(Number(e));
        }
    }

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

    const proceedHandler = () => {
        if (canProceed) {
            setCurrentPage(1);
            setAmountToFund(targetValue+0.01);
        }
    }
    
    return (
        <div className="div-carosel">
            <div className="calc">
                <div className="tagger">
                    <div className="tag">
                        {<span onClick={() => setMaxHandler((targetValue))}>Target: {formatNumFreeStyle((targetValue))}</span>}
                        {<span>USDC: {formatNumFreeStyle((usdcBalance))}</span>}
                    </div>
                </div>
                
                <div className="screen">
                    <div className={`num`} data-symbol={` USDC`}><span>{moneyFormat(amount)}</span></div>
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
                    <div className={`${!canProceed && "disable"}`} onClick={proceedHandler}><img src="https://gineousc.sirv.com/Images/icons/ch.png" alt="" /></div>
                </div>
            </div>
            <br />
            <br />
        </div>
    )
}

export default SetAmount;
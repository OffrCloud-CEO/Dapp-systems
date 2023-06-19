import React, { useContext, useEffect, useState } from 'react';
import { dividendPropertiesSettingContext } from '../../card/DividendSettings';

const Setting = () => {
    const { pending, setDivProperties, setCurrentPage } = useContext(dividendPropertiesSettingContext);
    const [dividends, setDividends] = useState(null);
    const [amount, setAmount] = useState(0.25);
    const [canProceed, setCanProceed] = useState(false);

    const [temp, setTemp] = useState({
        period: 6,
        interval: 5
    });

    useEffect(() => {
        if (temp.period === 0) {
            if (temp.interval > 0) {
                setTemp({ ...temp, interval: 0 });
            }
        } else if (temp.period === 1) {
            if (temp.interval > 1) {
                setTemp({ ...temp, interval: 0 });
            }
        } else if (temp.period === 2) {
            if (temp.interval > 3) {
                setTemp({ ...temp, interval: 0 });
            }
        } else if (temp.period === 3) {
            if (temp.interval > 3) {
                setTemp({ ...temp, interval: 0 });
            }
        }else if (temp.period === 6) {
            if (temp.interval < 5) {
                setTemp({ ...temp, interval: 5 });
            }
        }
    }, [temp.period]);

    const genData = () => {
        let obj = {
            period: 0,
            interval: 0
        }

        switch (parseInt(temp.period)) {
            case 0:
                obj.period = 30 * 24 * 60 * 60;
                break;
            case 1:
                obj.period = 90 * 24 * 60 * 60;
                break;
            case 2:
                obj.period = 180 * 24 * 60 * 60;
                break;
            case 3:
                obj.period = 365 * 24 * 60 * 60;
                break;
            case 4:
                obj.period = 545 * 24 * 60 * 60;
                break;
            case 5:
                obj.period = 730 * 24 * 60 * 60;
                break;

            default:
                obj.period = 30 * 60;
                break;
        }
        switch (parseInt(temp.interval)) {
            case 0:
                obj.interval = 7 * 24 * 60 * 60;
                break;
            case 1:
                obj.interval = 30 * 24 * 60 * 60;
                break;
            case 2:
                obj.interval = 60 * 24 * 60 * 60;
                break;
            case 3:
                obj.interval = 90 * 24 * 60 * 60;
                break;
            case 4:
                obj.interval = 180 * 24 * 60 * 60;
                break;

            default:
                obj.interval = 6 * 60;
                break;
        }

        setDividends(obj);
    }

    const updateButtonHandler = () => {
        const { period, interval } = dividends;
        const percent = amount * 1000;
    
        setDivProperties({period, interval, percent});
        setCurrentPage(1);
    }

    useEffect(() => {
        if (amount > 0) {
            setCanProceed(true);
        } else {
            setCanProceed(false);
        }

    }, [temp, amount]);

    useEffect(() => {
        genData();
    }, [temp]);


    return (
        <div className="div-carosel">
            <div className="flex-form">
                <label>Dividend Period</label>
                <div className="inp-box">
                    {temp.period !== null && <select className='inp' defaultValue={temp && temp.period} onChange={(e) => setTemp({ ...temp, period: Number(e.target.value) })}>
                        <option value="0">30 Days ~ (1 Month)</option>
                        <option value="1">90 Days ~ (3 Months)</option>
                        <option value="2">180 Days ~ (6 Months)</option>
                        <option value="3">365 days ~ (1 Year)</option>
                        <option value="4">545 days ~ (1 Year, Six Months)</option>
                        <option value="5">730 days ~ (2 Year)</option>
                        {/* Only for test period */}
                        <option value="6">30 min ~ (Test only)</option>
                    </select>}
                </div>
                <label>Dividend Intervals</label>
                <div className="inp-box">
                    {temp.interval !== null && <select className='inp' defaultValue={temp && temp.interval} onChange={(e) => setTemp({ ...temp, interval: Number(e.target.value) })}>
                        {temp.period !== 6 && <option value="0">7 Days ~ (Weekly)</option>}
                        {temp.period && temp.period !== 6 && temp.period >= 1 && <option value="1">30 Days ~ (Monthly)</option>}
                        {temp.period && temp.period !== 6 && temp.period >= 2 && <option value="2">60 Days ~ (Every 2 Months)</option>}
                        {temp.period && temp.period !== 6 && temp.period >= 2 && <option value="3">90 Days ~ (Every 3 Months)</option>}
                        {temp.period && temp.period !== 6 && temp.period >= 4 && <option value="4">180 Days ~ (Every 6 Months)</option>}
                        {temp.period && temp.period === 6 && <option value="5">6 minute ~ (Every 6 Minute)</option>}
                    </select>}
                </div>
                <label>Dividend Percent</label>
                <div className={`inp-box`}>
                    <input type="number" min={0.25} step={0.25} value={amount} onChange={(e) => setAmount(Number(e.target.value <= 100 ? e.target.value : 1))} name="" placeholder='100%' id="" className="inp" />
                </div>
                <br />
                <div className={`inp-box ${!canProceed && "disable"} ${pending &&  "disable"}`} onClick={updateButtonHandler} >
                    <div className="btnx full">Proceed</div>
                </div>
            </div>
            <br />
        </div>
    )
}

export default Setting;
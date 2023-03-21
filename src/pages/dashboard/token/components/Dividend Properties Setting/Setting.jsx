import { ethers } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { ABI3, address3 } from '../../../../../util/constants/tokenHandlerContract';
import { dividendPropertiesSettingContext } from '../../card/DividendSettings';

const Setting = () => {
    const { setTransactions, transactions, pending, batchNameTxt, setPending, coin, setCurrentPage, setUpdateStatus } = useContext(dividendPropertiesSettingContext);
    const [dividends, setDividends] = useState(null);
    const [amount, setAmount] = useState();
    const [canProceed, setCanProceed] = useState(false);
    const [temp, setTemp] = useState({
        period: null,
        interval: null
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
                obj.period = 1 * 60 * 60;
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
                obj.interval = 5 * 60;
                break;
        }

        setDividends(obj);
    }

    function setPeriodValue(params, _params) {
        let _period = 0;
        let _interval = 0;
        switch (params) {
            case 30:
                _period = 0;
                break;
            case 90:
                _period = 1;
                break;
            case 180:
                _period = 2;
                break;
            case 365:
                _period = 3;
                break;
            case 545:
                _period = 4;
                break;
            case 730:
                _period = 5;
                break;
            

            default:
                _period = 6;
                break;
        }
        switch (_params) {
            case 7:
                _interval = 0;
                break;
            case 30:
                _interval = 1;
                break;
            case 60:
                _interval = 2;
                break;
            case 90:
                _interval = 3;
                break;
            case 180:
                _interval = 4;
                break;

            default:
                _interval = 5;
                break;
        }

        setTemp({
            period: _period, interval:
                _interval
        });
    }

    function setAmountValue(params) {
        setAmount(params);
    }

    const updateDividendPropertiesFunc = async () => {
        setPending(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        /* Creating a new instance of the smart contract. */
        const tokenHandler = new ethers.Contract(address3, ABI3, signer);

        const { period, interval } = dividends;
        const percent = amount * 1000;

        try {
            const transactionDate = new Date();
            const timeStamp = transactionDate.toISOString().slice(0, 19).replace('T', ' ');

            let fromAddress;
            /* Getting the address of the signer. */
            await (signer.getAddress()).then((i) => {
                fromAddress = i;
            });

            // Update the Dividend Data on the Blockchain
            const updateDividendProperties = await tokenHandler.setDividendProperties(period, interval, percent, {
                from: signer.getAddress(),
            });

            // Await approval and excute internal statements
            await updateDividendProperties.wait().then(i => {
                setTransactions([...transactions, { hash: i.transactionHash, type: 4, amount: `${Number(i.gasUsed)}`, from: fromAddress, timestamp: timeStamp, batch: batchNameTxt }]);
                setCurrentPage(1);
                setPending(false);
                setUpdateStatus(true);
            });

        } catch (error) {
            setPending(false);
            setCurrentPage(1);
            setUpdateStatus(false);
            throw Error(`AN Error Occurred: ${error}`);
        }

    }

    const updateButtonHandler = () => {
        const promise = updateDividendPropertiesFunc();
        toast.promise(promise, {
            loading: 'Updating Dividend Properties.',
            success: 'Update Successful',
            error: 'An error occured'
        });
    }

    useEffect(() => {
        if (coin !== null) {
            const { divPeriodValue, divIntervalValue, divPercent } = coin;
            setPeriodValue(divPeriodValue, divIntervalValue);
            setAmountValue(divPercent);
        }
    }, [coin]);

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
                        <option value="6">1 hour ~ (test)</option>
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
                        {temp.period && temp.period === 6 && <option value="5">5 minute ~ (Every 5 Minute)</option>}
                    </select>}
                </div>
                <label>Dividend Percent</label>
                <div className={`inp-box`}>
                    <input type="number" min={1} step={0.25} value={amount} onChange={(e) => setAmount(Number(e.target.value <= 100 ? e.target.value : 1))} name="" placeholder='100%' id="" className="inp" />
                </div>
                <br />
                <div className={`inp-box ${!canProceed && "disable"} ${pending &&  "disable"}`} onClick={updateButtonHandler} >
                    <div className="btnx full">{!pending ? "Update" : "Updating"}</div>
                </div>
            </div>
            <br />
        </div>
    )
}

export default Setting;
import { ethers } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { formatNumFreeStyle, moneyFormat, toEth } from '../../../../../useful/useful_tool';
import { ABI3, address3 } from '../../../../../util/constants/tokenHandlerContract';
import { ABI2, address2 } from '../../../../../util/constants/usdcContract';
import { contextData } from '../../../dashboard';
import { fundContext } from '../../card/FundContract';

const SetAmount = () => {
    const { setPending, setCurrentPage, coin, setFundingStatus, setFundedAmount } = useContext(fundContext);
    const { setTransactions, transactions, batchData } = useContext(contextData);
    const [amount, setAmount] = useState("0");
    const [canProceed, setCanProceed] = useState(false);
    const [targetValue, setTargetValue] = useState(0);

    useEffect(()=>{
        if (coin !== null) {
            const { divPercent, totalSupply, divCount, divIntervalCountValue } = coin;
            const targetUSDC = divCount === (divIntervalCountValue-1) ? totalSupply : totalSupply * (divPercent/100);
            setTargetValue(targetUSDC);
        }
    },[coin]);

    useEffect(()=>{
        if (amount >= targetValue) {
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
            setAmount(Math.floor(e));
        }
    }

    const fundContractFunc = async () => {
        setPending(true);
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();
            /* Creating a new instance of the smart contract. */
            const tokenHandler = new ethers.Contract(address3, ABI3, signer);
            const _usdcInstance = new ethers.Contract(address2, ABI2, signer);

            const transactionDate = new Date();
            const timeStamp = transactionDate.toISOString().slice(0, 19).replace('T', ' ');
            let fromAddress;
            
            await (signer.getAddress()).then((result)=>{
                fromAddress = result;
            });

            const amountToFund = toEth(amount);

            const getUSDCApproval = await _usdcInstance.approve(address3, amountToFund);

            await getUSDCApproval.wait().then(async () => {
                const fundContractTransaction = await tokenHandler.fundContract(amountToFund, {
                    from: signer.getAddress(),
                });

                await fundContractTransaction.wait().then((i) => {
                    setTransactions([...transactions, {hash: i.blockHash, type: 1, amount: amountToFund, from: fromAddress, timestamp: timeStamp, batch: batchData ? batchData.batch_name : "null"}]);
                    setFundingStatus(true);
                    setCurrentPage(1);
                    setFundedAmount(amount);
                });
            });

            setPending(false);
        } catch (error) {
            setPending(false);
            setCurrentPage(1);
            setFundingStatus(false);
            console.log(error);
            throw Error(`An error occurred: ${error}`);
        }
    }

    const proceedHandler = () => {
        if (canProceed) {
            const promise = fundContractFunc();
            toast.promise(promise, {
                loading: 'Funding contract..',
                success: '👍 Contract has been funded',
                error: 'An error occurred'
            });
        }
    }
    
    return (
        <div className="div-carosel">
            <div className="calc">
                <div className="tagger">
                    <div className="tag">
                        {<span onClick={() => setMaxHandler((targetValue))}>Target: {formatNumFreeStyle((targetValue))}</span>}
                    </div>
                </div>
                
                <div className="screen">
                    <div className={`num`} data-symbol={` USDC`}><span>{moneyFormat(amount)}</span></div>
                </div>
                <div className="btns">
                    <div onClick={() => keyPressHandler(1)} className="b">1</div>
                    <div onClick={() => keyPressHandler(2)} className="b">2</div>
                    <div onClick={() => keyPressHandler(3)} className="b">3</div>
                    <div onClick={() => keyPressHandler(4)} className="b">4</div>
                    <div onClick={() => keyPressHandler(5)} className="b">5</div>
                    <div onClick={() => keyPressHandler(6)} className="b">6</div>
                    <div onClick={() => keyPressHandler(7)} className="b">7</div>
                    <div onClick={() => keyPressHandler(8)} className="b">8</div>
                    <div onClick={() => keyPressHandler(9)} className="b">9</div>
                    <div onClick={backspaceHandler} className="bl"><img src="https://gineousc.sirv.com/Images/icons/bks.png" alt="" /></div>
                    <div className="b" onClick={() => keyPressHandler(0)}>0</div>
                    <div className={`${!canProceed && "disable"}`} onClick={proceedHandler}><img src="https://gineousc.sirv.com/Images/icons/ch.png" alt="" /></div>
                </div>
            </div>
            <br />
            <br />
        </div>
    )
}

export default SetAmount;
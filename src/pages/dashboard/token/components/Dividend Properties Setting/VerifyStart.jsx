import React, { useContext } from 'react';
import { dividendPropertiesSettingContext } from '../../card/DividendSettings';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import { dividendManagementABI, dividendManagementAddress } from '../../../../../util/constants/tokenDividendManagement';
import { fireStore } from '../../../../../firebase/sdk';
import { collection, doc, setDoc } from 'firebase/firestore';
import { tokenAddress } from '../../../../../util/constants/tokenContract';

const VerifyStart = () => {
    const { setCurrentPage, divProperties, setPending, setUpdateStatus, setErrMsg } = useContext(dividendPropertiesSettingContext);

    const resetDividendStartDate = async() =>{
        const docRef = collection(fireStore, "DividendStartDate");
        const oldDate = new Date("07/07/1970");
        const updatedInfoObject = {
            dividendDate: `${oldDate.toLocaleDateString()} ${oldDate.toLocaleTimeString()}`
        }
        try {
            await setDoc(doc(docRef, `${tokenAddress}`), updatedInfoObject);
        } catch (error) {
            throw {reaseon: "Something went wrong while updating DividendStartDate!"};
        }
    }

    const approveHandler = async() => {
        setPending(true);
        try{
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();

            const { interval, period, percent } = divProperties;

            const tokenDividendManagemt = new ethers.Contract(dividendManagementAddress, dividendManagementABI, signer);

            const startDividendPaymentPeriod = await tokenDividendManagemt.startDividendPaymentPeriod(period, interval, percent, {
                from: signer.getAddress()
            });

            await startDividendPaymentPeriod.wait();
            await resetDividendStartDate();
            setCurrentPage(2);
            setUpdateStatus(true);
            setPending(false);
        }catch(error){
            setCurrentPage(2);
            setPending(false);
            setUpdateStatus(false);
            setErrMsg(`${error.reaseon ? error.reaseon : 'There is an error with the parameters for Starting the Dividend Period!'}`);
            console.log(error.reaseon ? error.reaseon : error.message);
            throw Error(`${error.reaseon ? error.reaseon : error.message}`);
        }
    }

    const startHandler = () =>{
        const promise = approveHandler();
        toast.promise(promise,{
            loading: "Starting Dividend Period.",
            success: "✨ 2/2 Hurray! It's Dividen Period!",
            error: 'An error occurred'
        })
    }

    return (
        <div className="div-carosel">
            <div className="c">
                <div className="title md">Start Dividend Period</div>
            </div>
            <section className="inf">
                <div>
                    <span>Dividend Period:</span>
                    <span>{divProperties.period / (60*60)} hr</span>
                </div>
                <div>
                    <span>Dividend Interval:</span>
                    <span>{divProperties.interval / (60)} mins</span>
                </div>
                <div>
                    <span>Dividend Percent:</span>
                    <span>{(divProperties.percent/1000) * (divProperties.period / divProperties.interval)}%</span>
                </div>
            </section>
            <div className="c">
                <div className="p impo">
                    The Dividend Period is going to last for <b>{divProperties.period / (60*60)}hr</b>, dividends will be distributed on an
                    interval of <b>{divProperties.interval / (60)}</b> mins where Stake Holders will receive <b>{(divProperties.percent/1000) * (divProperties.period / divProperties.interval)}%</b> of their invested usdc.
                </div>
            </div>
            <div className="r">
                <div onClick={startHandler} className="btnx">Approve</div>
                <div onClick={() => setCurrentPage(0)} className="btnx c">Cancel</div>
            </div>
        </div>
    )
}

export default VerifyStart;
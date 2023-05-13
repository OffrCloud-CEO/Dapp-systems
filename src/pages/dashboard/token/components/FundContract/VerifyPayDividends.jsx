import { ethers } from 'ethers';
import React, { useContext } from 'react';
import { toast } from 'react-hot-toast';
import { formatNum, toEth } from '../../../../../useful/useful_tool';
import { fundContext } from '../../card/FundContract';
import { dividendManagementABI, dividendManagementAddress } from '../../../../../util/constants/tokenDividendManagement';
import { usdcABI, usdcAddress } from '../../../../../util/constants/usdcContract';

const VerifyPayDividends = () => {
    const { setFundingStatus, setCurrentPage, amountToFund, setFundedAmount, setPending, setErrMsg  } = useContext(fundContext);
    const approveHandler = async () => {
        setPending(true);
        try {
            // Request the user's Ethereum accounts
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const user = signer.getAddress();

            const amountToFundValue = toEth(amountToFund);

            const tokenDividendManagemt = new ethers.Contract(dividendManagementAddress, dividendManagementABI, signer);
            const USDCInstance =  new ethers.Contract(usdcAddress, usdcABI, signer);

            const checkStatus = await  tokenDividendManagemt.isDividendPaymentPeriodActive();

            if(checkStatus){
                const approveUsdcTransaction = await USDCInstance.approve(dividendManagementAddress, amountToFundValue);
                await approveUsdcTransaction.wait().then(async()=>{
                    const payDividendTransaction = await tokenDividendManagemt.payDividends();
                    await payDividendTransaction.wait().then(()=>{
                        setFundedAmount(amountToFund);
                        setCurrentPage(2);
                        setPending(false);
                        setFundingStatus(true);
                    });
                });
            }

        } catch (error) {
            setCurrentPage(2);
            setFundingStatus(false);
            setPending(false);
            setErrMsg(`${error.reason}`);
            throw error.reason;
        }
    };


    const startHandler = () =>{
        const promise = approveHandler();
        toast.promise(promise, {
            loading: "Distributing dividends...",
            success: "🎁 Dividends has been distributed.",
            error: "An error occurred",
        })
    }


    return (
        <div className="div-carosel">
            <br />
            <div className="c">
                <div className="title">Pay Dividends</div>
                <div className="p impo">You're about to Distribute <b>${formatNum(amountToFund)}</b> to your Stake Holders in dividends payment </div>
            </div>

            <div className="r">
                <div onClick={startHandler} className="btnx">Approve</div>
                <div onClick={() => setCurrentPage(0)} className="btnx c">Cancel</div>
            </div>
        </div>
    );
}

export default VerifyPayDividends;
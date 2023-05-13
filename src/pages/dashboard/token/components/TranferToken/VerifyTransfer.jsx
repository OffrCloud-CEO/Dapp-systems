import { ethers } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { formatNum, toEth } from '../../../../../useful/useful_tool';
import { tokenABI, tokenAddress } from '../../../../../util/constants/tokenContract';
import { transferData } from '../../card/TranferTokens';

const VerifyTransfer = () => {
    const { transData, setPending, setStatus, setCurrentPage, setErrMsg } = useContext(transferData);
    const [bought, setBought] = useState(false);

    const approveHandler = async () => {
        setPending(true);
        try {
            // Request the user's Ethereum accounts
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            const amountETH = transData.sendAmount;

            // Get the contract signer
            const signer = await provider.getSigner();

            // Connect to the contract
            const OffrToken = new ethers.Contract(tokenAddress, tokenABI, signer);
            const value = toEth(amountETH);

            const approved = await OffrToken.approve(signer.getAddress(), value);

            await approved.wait().then(async () => {
                const to = transData.toAddress;
                const sendTransfer = await OffrToken.transfer(to, value);
                await sendTransfer.wait().then(() => {
                    setBought(true);
                    setStatus(true);
                    setCurrentPage(4);
                    setPending(false);
                });
            });

        } catch (error) {
            setCurrentPage(4);
            setBought(true);
            setStatus(false);
            setPending(false);
            setErrMsg(`${error.reason}`);
            throw error.reason;
        }
    };

    useEffect(() => {
        setStatus(bought);
    }, [bought]);


    const approveHandlerWatch = () =>{
        const promise = approveHandler();
        toast.promise(promise, {
            loading: "Sending Tokens...",
            success: "Tokens sent.",
            error: "An error occurred",
        })
    }


    return (
        <div className="div-carosel">
            <div className="c">
                <div className="title md">Transfer {formatNum(transData.sendAmount)} ({transData.symbol})</div>
                <div className="p">Do you want to send {formatNum(transData.sendAmount)} ({transData.symbol}) to {`${String(transData.toAddress).slice(0, 15)}...`}</div>
            </div>

            <div className="r">
                <div className="btnx" onClick={approveHandlerWatch}>Approve</div>
                <div className="btnx c">Cancel</div>
            </div>
        </div>
    );
}

export default VerifyTransfer;
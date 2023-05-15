import { ethers } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import { dividendManagementABI, dividendManagementAddress } from '../../../../util/constants/tokenDividendManagement';
import { formatNumFreeStyle } from '../../../../useful/useful_tool';
import { toast } from 'react-hot-toast';
import { contextData } from '../../dashboard';

const DividendForm = ({ status, type, defaultValue }) => {
    const [value, setValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [viewingResult, setViewingResult] = useState(false);
    const [wallet_Address, setWallet_Address] = useState('');
    const { coinBase } = useContext(contextData);

    useEffect(()=>{
        if (Number(defaultValue) > 0) {
            setViewingResult(true);
            setValue(Number(defaultValue));
        }

    }, [defaultValue]);

    const claimDividendsHandler = async() =>{
        try {
            setLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();

            const tokenDividendManagement = new ethers.Contract(dividendManagementAddress, dividendManagementABI, signer);
        
            const claimDividendTransaction = await tokenDividendManagement.claimDividend();

            await claimDividendTransaction.wait().then(()=>{
                setLoading(false);
            })
        } catch (error) {
            setLoading(false);
            console.log(error);
            throw Error(error);
        }
    }

    const claimDividendsHandlerWatch = () =>{
        const promise = claimDividendsHandler();
        toast.promise(promise,{
            loading: "Claiming Dividends...",
            success: `✨You've claimed your $${formatNumFreeStyle(value)}`,
            error: "An error Occurred"
        });
    }

    const getAccumulatedBalance = async (wallet) => {
        try {
            setLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();
            const user = await signer.getAddress();
            
            const tokenDividendManagement = new ethers.Contract(dividendManagementAddress, dividendManagementABI, signer);

            const walletToCheck = String(wallet).length > 0 ? wallet : user;
            const valueToDisplay = await tokenDividendManagement.claimableDividendsOf(walletToCheck);

            setValue(formatNumFreeStyle(valueToDisplay));

            setLoading(false);
        } catch (error) {
            setLoading(false);
            throw Error(`This Error Occurred: ${error}`);
        }
        setViewingResult(true);
    }

    const getWithdrawnBalance = async (wallet) => {
        try {
            setLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();
            const user = await signer.getAddress();
            
            const tokenDividendManagement = new ethers.Contract(dividendManagementAddress, dividendManagementABI, signer);

            const walletToCheck = String(wallet).length > 0 ? wallet : user;
            const valueToDisplay = await tokenDividendManagement.claimedDividendsHistoryOf(walletToCheck);

            setValue(formatNumFreeStyle(valueToDisplay));

            setLoading(false);
        } catch (error) {
            setLoading(false);
            throw Error(`This Error Occurred: ${error}`);
        }
        setViewingResult(true);
    }

    const btnxHandler = () =>{
        if (!loading) {
            switch (type) {
                case 1:
                    if (viewingResult) {
                        setViewingResult(false);
                    }else{
                        getAccumulatedBalance(wallet_Address);
                    }
                    break;
                case 2:
                    if (viewingResult) {
                        setViewingResult(false);
                    }else{
                        getWithdrawnBalance(wallet_Address);
                    }
                    break;
            
                default:
                    claimDividendsHandlerWatch();
                    break;
            }
        }
    }

    return (
        <div data-title={`${type === 1 ? "Check Accumulated Dividends": type === 2 ? "Check Claimed Dividends" : "Claim Dividends"}`} className={`form-div ${status ? "" : status === undefined ? "" : "inactive"}`}>
            <div className="form">
                {/* {viewingResult && <div className="value">${Number(value).toLocaleString()}</div>} */}

                {!viewingResult && type > 0 && <input type="text" className="inp" value={wallet_Address} onChange={(e)=>setWallet_Address(e.target.value)} placeholder={`${coinBase?.coinbase}`} /> } 

                <div className="btnx" onClick={btnxHandler}>
                    {loading ? <img src="https://gineousc.sirv.com/Images/Circles-menu-3.gif" alt="laoding" /> 
                    :
                    `${type === 1 ? `${viewingResult ? "new Check" : "Check"}`: type === 2 ? `${viewingResult ? "New Check" : "Check"}` : "Claim now"}`}
                </div>
            </div>
        </div>
    )
}

export default DividendForm;
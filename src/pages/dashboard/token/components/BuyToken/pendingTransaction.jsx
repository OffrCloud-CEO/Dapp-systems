import { ethers } from 'ethers';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { useContext } from 'react';
import { formatNumFreeStyle, moneyFormat, toEth } from '../../../../../useful/useful_tool';
import { usdcABI, usdcAddress } from '../../../../../util/constants/usdcContract';
import { contextData } from '../../../dashboard';
import { buyData } from '../../card/BuyToken';
import { tokenSaleABI, tokenSaleAddress } from '../../../../../util/constants/tokenSaleContract';
import { toast } from 'react-hot-toast';

const PendingTransaction = () => {
    const { buyArr, setCurrentPage, setPending, setBuyTokenData, setApproved, currency, setErrMsg} = useContext(buyData);
    const { rootData, tokenBalance } = useContext(contextData);

    const [coin, setCoin] = useState("");
    const [coinInfo, setCoinInfo] = useState(null);
    const [bought, setBought] = useState(false);
    const [toastErrorTxt, setToastErrorTxt] = useState('An error occurred');


    /**
     * If coinBase is true, then set the coinInfo state to the data object.
     */
    const setDetails = async () => {
            const { name, symbol, totalSupply, decimals, beneficiaryAddress, cap } = rootData;

            const data = {
                name,
                symbol,
                max: cap,
                decimals,
                totalSupply,
                beneficiaryAddress,
                myBalance: tokenBalance,
            }

            setCoinInfo(data);
    }

    useEffect(() => {
        if (rootData.cap !== null) {
            setDetails();
        }
    }, [rootData, tokenBalance]);

    useEffect(() => {
        switch (buyArr.crypto) {
            case 1:
                setCoin("USDC");
                break;
            case 2:
                setCoin("ETH");
                break;

            default:
                break;
        }
    }, [buyArr]);

    
    const handleBuyTokenEth = async () => {
        setPending(true);

        try {
            // Request the user's Ethereum accounts
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            const amountETH = (buyArr.offrValue);
            const amountOFFR = buyArr.amount;

            // Get the contract signer
            const signer = await provider.getSigner();

            // Connect to the contract
            const OffrTokenHandler = new ethers.Contract(tokenSaleAddress, tokenSaleABI, signer);

            const saleOpen = await OffrTokenHandler.tokensale_open();
            const value = toEth(amountETH.toFixed(8));

            if (saleOpen) {
                const BuyTokensTransaction = await OffrTokenHandler.buyTokens(toEth(amountOFFR), { 
                    from: signer.getAddress(), 
                    value: value,
                });

                await BuyTokensTransaction.wait().then(i=>{
                    const bal = formatNumFreeStyle(coinInfo.myBalance/(10**18));
                    const symbol = coinInfo.symbol;
                    setBuyTokenData({amountOFFR, bal, symbol, failed: false});
                    setBought(true);
                });

            }
            // Reset the usdc state to 0
            setPending(false);
            
        } catch (error) {
            const msg = error.reason;
            setPending(false);
            // Handle any errors that may occur when calling the buyTokens method
            setBought(true);
            setBuyTokenData({failed: true});
            setPending(false);
            setToastErrorTxt(msg);
            setErrMsg(msg);
            throw (msg);
        }
    }
    
    
    const handleBuyTokenUSDC = async () => {
        setPending(true);

        try {
            // Request the user's Ethereum accounts
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            const amountUSDC = (buyArr.offrValue);
            const amountOFFR = buyArr.amount;

            // Get the contract signer
            const signer = await provider.getSigner();

            // Connect to the contract
            const OffrToken = new ethers.Contract(tokenSaleAddress, tokenSaleABI, signer);
            const USDCInstance =  new ethers.Contract(usdcAddress, usdcABI, signer);
            
            const saleOpen = await OffrToken.tokensale_open();
            const value = toEth(amountUSDC.toFixed(8));

            if(saleOpen){
                const approveUSDC_Transaction = await USDCInstance.approve(tokenSaleAddress, value);

                await approveUSDC_Transaction.wait().then(async()=>{
                    const BuyTokensTransaction = await OffrToken.buyTokens(value, {
                        from: signer.getAddress(),
                    });


                    await BuyTokensTransaction.wait().then((i)=>{
                        const bal = formatNumFreeStyle(coinInfo.myBalance/(10**18));
                        const symbol = coinInfo.symbol;
                        setBuyTokenData({amountOFFR, bal, symbol, failed: false});
                        setBought(true);
                    });
                });

            }

            
            // Reset the usdc state to 0
            setPending(false);
 
        } catch (error) {
            const msg = error.reason;
            // Handle any errors that may occur when calling the buyTokens method
            setPending(false);
            setBought(true);
            setBuyTokenData({failed: true});
            setPending(false);
            setErrMsg(msg);
            setToastErrorTxt(msg);
            throw (msg);
        }
    }

    useEffect(()=>{
        if(bought){
            setApproved(bought);
            setCurrentPage(3);
        }
    }, [bought]);



    /**
     * If the user has selected a currency, then call the appropriate function to buy the token.
     */
    const approveHandler = () => {
        if (coinInfo !== null) {
            if (currency === 2) {
                const buying = handleBuyTokenEth();
                toast.promise(buying,{
                    loading: `${"Awaiting transaction confirmation."}`,
                    success: "🎁 Purchase Complete",
                    error: toastErrorTxt,
                })
            }else if (currency === 1){
                const buying = handleBuyTokenUSDC();
                toast.promise(buying,{
                    loading: `${"Awaiting transaction confirmation."}`,
                    success: "🎁 Purchase Complete",
                    error: toastErrorTxt,
                });
            }
        }
    }

    return (
        <div className="div-carosel">
            <div className="c">
                <div className="title">~{moneyFormat(buyArr.amount, 1)} ({coinInfo && coinInfo.symbol})</div>
                <div className="p">≈ {moneyFormat(buyArr.offrValue, 1)} {coin}</div>
            </div>

            <div className="r">
                <div onClick={approveHandler} className="btnx">Approve</div>
                <div onClick={() => setCurrentPage(1)} className="btnx c">Cancel</div>
            </div>
        </div>
    )
}

export default PendingTransaction;

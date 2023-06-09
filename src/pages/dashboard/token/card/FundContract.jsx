import React, { useContext, useState } from 'react';
import { Toaster, useToaster } from 'react-hot-toast';
import { dividendContext } from '../../pages/Dividend Management';
import Confirmation from '../components/FundContract/confirmation';
import SetAmount from '../components/FundContract/SetAmount';
import VerifyPayDividends from '../components/FundContract/VerifyPayDividends';
import { contextData } from '../../dashboard';

export const fundContext = React.createContext();
const FundContract = () => {
    const { setPayingDividends, coin } = useContext(dividendContext);
    const { usdcBalance } = useContext(contextData);
    const [pending, setPending] = useState(false);
    const [fundingStatus, setFundingStatus] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [fundedAmount, setFundedAmount] = useState(0);
    const [amountToFund, setAmountToFund] = useState(0);
    const [errMsg, setErrMsg] = useState("");

    const closeBtnHandler = () => {
        setPayingDividends(false);
    }
    
    return (
        <fundContext.Provider value={{ amountToFund, setAmountToFund, errMsg, setErrMsg, usdcBalance, fundedAmount, setFundedAmount, fundingStatus, setPending, setCurrentPage, coin, setFundingStatus }}>
            <div className="cover">
                <Toaster 
                    toastOptions={{
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                    }}
                />
                <div className="div wide">
                    {!pending && <div className="close" onClick={closeBtnHandler}>x</div>}
                    {pending && <div className="pending">
                        <div className="loadingio-spinner-gear-abqyc1i9wu"><div className="ldio-r68llg26yv">
                            <div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                        </div></div>
                    </div>}

                    {currentPage == 0 && <div className="title">Add fund to contract</div>}
                    <div className="carousel">
                        {currentPage == 0 && <SetAmount />}
                        {currentPage == 1 && <VerifyPayDividends />}
                        {currentPage == 2 && <Confirmation />}
                    </div>

                </div>
            </div>
        </fundContext.Provider>
    )
}

export default FundContract;
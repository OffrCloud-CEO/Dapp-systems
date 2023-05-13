import React, { useContext, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { ownerContext } from '../../pages/Owner';
import Confirmation from '../components/Start Token Sale/confirmation';
import SetDate from '../components/Start Token Sale/SetDate';
import VerifyStart from '../components/Start Token Sale/verifyStart';

export const tokenSaleContext = React.createContext();
const StartTokenSale = () => {
    const { setInitiateTokenSale } = useContext(ownerContext);
    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [batchNameTxt, setBatchNameTxt] = useState("");
    const [dates, setDates] = useState(null);
    const [canProceed, setCanProceed] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState(false);
    const [steps, setSteps] = useState({
        _step1: false,
        _step2: false,
        _step3: false,
        _step4: false
    }); 


    useEffect(() => {
        if (dates !== null) {
            setSteps({ ...steps, _step1: true });
            setCanProceed(true);
        } else {
            setSteps({ ...steps, _step1: false });
            setCanProceed(false);
        }
    }, [dates]);


    const closeBtnHandler = () =>{
        setInitiateTokenSale(false);
    }

    return (
        <tokenSaleContext.Provider value={{ setPending, batchNameTxt, setBatchNameTxt, dates, setDates, transactionStatus, setTransactionStatus, setCurrentPage }}>
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
                    {pending && <div className="pending">
                        <div className="loadingio-spinner-gear-abqyc1i9wu"><div className="ldio-r68llg26yv">
                            <div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                        </div></div>
                    </div>}

                    {!pending && <div className="close" onClick={closeBtnHandler}>x</div>}

                    {currentPage == 0 && <div className="title">Token Sale Information</div>}

                    {transactionStatus !== true && <div className="carosel">
                        {<div onClick={() => setCurrentPage(0)} className={`cnt ${currentPage === 0 && "active"} ${steps._step1 && "good"}`}><div></div></div>}
                    </div>}

                    {currentPage == 0 && <SetDate />}
                    {currentPage == 1 && <VerifyStart />}
                    {currentPage == 2 && <Confirmation />}
                    
                    {currentPage < 1 && <div className="next">
                        {!pending && currentPage <= 1 && <div className={`btnx ${currentPage >= 4 && "hide"} ${!canProceed && "hide"}`} onClick={() => setCurrentPage(currentPage + 1)}>
                            <img src="https://gineousc.sirv.com/Images/icons/angle-right.svg" alt="" />
                        </div>}
                    </div>}
                </div>
            </div>
        </tokenSaleContext.Provider>
    )
}

export default StartTokenSale;
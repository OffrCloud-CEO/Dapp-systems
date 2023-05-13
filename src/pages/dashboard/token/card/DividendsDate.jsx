import React, { useContext, useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import CloseBTN from '../components/DividendsDate components/closeBTN';
import Form from '../components/DividendsDate components/Form';
import { dividendContext } from '../../pages/Dividend Management';
import { contextData } from '../../dashboard';
import Confirmation from '../components/DividendsDate components/confirmation';

export const divDateContext = React.createContext();
const DividendsDate = () => {
    const { tokenSaleInfo, dividendDate } = useContext(contextData);
    const { setSetingDateForDividend } = useContext(dividendContext);
    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [errMsg, setErrMsg] = useState("");
    const [endDateTxt, setEndDateTxt] = useState("");
    const [status, setStatus] = useState(false);

    useEffect(() => {
        const { endDateTxt } = tokenSaleInfo;
        setEndDateTxt(endDateTxt);
    }, [tokenSaleInfo]);



    return (
        <divDateContext.Provider value={{ dividendDate, errMsg, setErrMsg, currentPage, setCurrentPage, setPending, endDateTxt, status, setStatus }}>
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
                    {!pending && <CloseBTN control={setSetingDateForDividend} />}
                    {pending && <div className="pending">
                        <div className="loadingio-spinner-gear-abqyc1i9wu"><div className="ldio-r68llg26yv">
                            <div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                        </div></div>
                    </div>}

                    {currentPage === 0 && <div className="title">Set Dividend Payment date.</div>}

                    <div className="carosel">
                        <div className={`cnt ${currentPage === 0 && "active"}`}><div></div></div>
                        <div className={`cnt ${currentPage === 1 && "active"}`}><div></div></div>
                    </div>

                    {currentPage === 0 && <Form />}
                    {currentPage === 1 && <Confirmation />}

                    <br />
                </div>
            </div>
        </divDateContext.Provider>
    )
}

export default DividendsDate
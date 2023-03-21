import React, { useContext, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { contextData } from '../../dashboard';
import { dividendContext } from '../../pages/Dividend Management';
import Confirmation from '../components/Dividend Properties Setting/confirmation';
import Setting from '../components/Dividend Properties Setting/Setting';

export const dividendPropertiesSettingContext = React.createContext();
const DividendSettings = () => {
    const { setDividendProperties, coin, setUpdatedDividendProperties } = useContext(dividendContext);
    const { setTransactions, transactions, batchNameTxt } = useContext(contextData);
    const [pending, setPending] = useState(false);
    const [updateStatus, setUpdateStatus] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    function closeButtonHandler() {
        setDividendProperties(false);
        updateStatus && setUpdatedDividendProperties(true);
    }

    return (
        <dividendPropertiesSettingContext.Provider value={{ pending, currentPage, updateStatus, setTransactions, transactions, batchNameTxt, setPending, coin, setCurrentPage, setUpdateStatus }}>
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
                    {!pending && <div className="close" onClick={closeButtonHandler}>x</div>}
                    {currentPage == 0 && <div className="title">Dividend Properties</div>}
                    <div className="carosel">
                        {currentPage == 0 && <Setting />}
                        {currentPage == 1 && <Confirmation/>}
                    </div>
                </div>
            </div>
        </dividendPropertiesSettingContext.Provider>
    );
}

export default DividendSettings;
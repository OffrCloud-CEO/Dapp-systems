import React, { useContext, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { contextData } from '../../dashboard';
import { dividendContext } from '../../pages/Dividend Management';
import Confirmation from '../components/Dividend Properties Setting/confirmation';
import Setting from '../components/Dividend Properties Setting/Setting';
import VerifyStart from '../components/Dividend Properties Setting/VerifyStart';
import CloseBTN from '../components/Dividend Properties Setting/closeBTN';

export const dividendPropertiesSettingContext = React.createContext();
const DividendSettings = () => {
    const { setStartingDividendsPeriod } = useContext(dividendContext);
    const { rootData } = useContext(contextData);
    const [pending, setPending] = useState(false);
    const [updateStatus, setUpdateStatus] = useState(false);
    const [divProperties, setDivProperties] = useState({
        interval: 0,
        period: 0,
        percent: 0
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [errMsg, setErrMsg] = useState('');

    return (
        <dividendPropertiesSettingContext.Provider value={{ errMsg, setErrMsg, divProperties, setDivProperties, rootData, pending, currentPage, updateStatus, setPending, setCurrentPage, setUpdateStatus }}>
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
                    {!pending && <CloseBTN control={setStartingDividendsPeriod}/>}
                    {currentPage == 0 && <div className="title">Set Dividend Properties</div>}
                    
                    <br />
                    {currentPage == 0 && <Setting />}
                    {currentPage == 1 && <VerifyStart />}
                    {currentPage == 2 && <Confirmation />}
                    <br />
                </div>
            </div>
        </dividendPropertiesSettingContext.Provider>
    );
}

export default DividendSettings;
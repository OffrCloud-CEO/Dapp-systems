import React, { useContext, useEffect, useRef, useState } from 'react';
import { isValidEthAddress, pasteClipboard } from '../../../../../useful/useful_tool';
import { contextData } from '../../../dashboard';
import { transferData } from '../../card/TranferTokens';

const ToAddress = () => {
    const {setToAddress, setCurrentPage} = useContext(transferData);
    const { coinBase } = useContext(contextData);

    const [to, setTo] = useState("");
    const [canProceed, setCanProceed]= useState(false);
    const inputRef = useRef();

    useEffect(()=>{
        if(isValidEthAddress(to) && (to).toLowerCase() !== coinBase.coinbase) {
            setCanProceed(true);
        }else{
            setCanProceed(false);
        }
    }, [to]);

    const proceedHandler = () =>{
        setToAddress(to);
        setCurrentPage(3);
    }

    return (
        <div className="div-carosel">
            <label>Enter Wallet Address</label>
            <div className="flex-form">
                <div className="inp-box">
                    <input type="text" name="address" ref={inputRef} onChange={(e)=>setTo(String(e.target.value).trim())} value={to} placeholder='To: 0x000' className="inp" />
                    {!canProceed && <div className="btnx" onClick={()=>pasteClipboard(setTo)}>paste</div>}
                    {canProceed && <div className="btnx" onClick={proceedHandler}>send</div>}
                </div>
                <br />
            </div>
        </div>
    )
}

export default ToAddress;
import React, { useEffect, useState } from 'react';

const TdType = ({type}) => {
    const [text, setText] = useState('');
    const [classType, setClassType] = useState('');

    useEffect(()=>{
        switch (type) { 
            case 2:
                setText("startSale");
                setClassType('cni');
                break;
            case 1:
                setText("buyTokens");
                setClassType('buy');
                break;
            case 3:
                setText("payDividends");
                setClassType('cni');
                break;
            case 4:
                setText("salesEnded");
                setClassType('err');
                break;
            case 5:
                setText("releaseFund"); 
                setClassType('cni');
                break;
            case 6:
                setText("dividendStart");
                setClassType('cni');
                break;
            case 7:
                setText("dividendEnd");
                setClassType('err');
                break;
            case 8:
                setText("claimDividends");
                setClassType('transfer');
                break;
            case 9:
                setText("KYCed");
                setClassType('approve');
                break;
        
            default:
                setText("Transaction");
                setClassType('approve');
                break;
        }
    }, [type]);
    
  return (
    <td className={`mb`}><div className={`type ${classType}`}>{text}</div></td>
  )
}

export default TdType;
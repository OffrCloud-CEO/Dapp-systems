import React, { useContext, useEffect, useState } from 'react'
import { divDateContext } from '../../card/DividendsDate';
import { fireStore } from '../../../../../firebase/sdk';
import { collection, doc, setDoc } from 'firebase/firestore';
import { tokenAddress } from '../../../../../util/constants/tokenContract';
import { toast } from 'react-hot-toast';

const Form = () => {
    const { endDateTxt, setPending, setErrMsg, setCurrentPage, setStatus, dividendDate } = useContext(divDateContext);
    const [minDate, setMinDate] = useState('');
    const [dateData, setDateData] = useState(dividendDate !== '' ? convertDate(dividendDate) : "yyyy-MM-dd");

    function convertDate(dateTxt) {
        const dateStr = dateTxt.split(' ')[0];
        const [month, day, year] = dateStr.split('/');
        const dateObj = new Date(`${year}-${month}-${day}`);
        const formattedDate = dateObj.toISOString().slice(0, 10);
        return formattedDate;
    }


    useEffect(() => {
        if (endDateTxt !== "") {
            const dateTxt = new Date(endDateTxt);
            dateTxt.setTime(dateTxt.getTime() + (30 * 24 * 60 * 60 * 1000));
            setMinDate(dateTxt);
        }else{
            const dateTxt = new Date();
            setMinDate(dateTxt);
        }


    }, [endDateTxt]);

    const processUpdate = async() =>{
        setPending(true);
        try {
            const inputedDate = new Date(dateData);
            const minimumDate = new Date(minDate);

            if (inputedDate >= minimumDate) {
                const docRef = collection(fireStore, "DividendStartDate");
                const updatedInfoObject = {
                    dividendDate: `${inputedDate.toLocaleDateString()} ${inputedDate.toLocaleTimeString()}`
                }
                await setDoc(doc(docRef, `${tokenAddress}`), updatedInfoObject);
                setCurrentPage(1);
                setStatus(true);
                setPending(false);
            }else{
                throw {reason: "Invalid date input!"};
            }
            
        } catch (error) {
            const reason = error.reason ? error.reason : "An error occured, Failed to update Database.";
            setStatus(false);
            setPending(false);
            setErrMsg(reason);
            console.log(error);
            throw Error(error);
        }
    }

    const proceedHandler = (e) => {
        e.preventDefault();
        const promise = processUpdate();
        toast.promise(promise,{
            loading: 'Updating Dividends payment date.',
            success: '📆 Date Updated successfully!',
            error: 'An error occurred.',
        })
    }

    return (
        <div className="div-carosel">
            <form action="" className="flex-form" onSubmit={proceedHandler}>
                <label>
                    <div style={{ textAlign: "center" }}>Set date to inform Stake holder when </div>
                    <div style={{ textAlign: "center" }}>the dividends period may commence</div>
                </label>
                <div className="inp-box">
                    <input type="date" name="" min={new Date(minDate !== "" ? minDate : '1997').toISOString().split('T')[0]} onChange={(e) => setDateData(e.target.value)} value={dateData} id="" className="inp" required />
                </div>
                <div className="inp-box">
                    <button className="btnx full">
                        Proceed
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Form
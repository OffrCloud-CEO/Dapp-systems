import React, { useContext, useEffect, useState } from 'react';
import { escapeString } from '../../../../../useful/useful_tool';
import { tokenSaleContext } from '../../card/startTokenSale';

const SetDate = () => {
    const { dates, setDates, setBatchNameTxt } = useContext(tokenSaleContext);
    const [batchName, setBatchName]= useState('');
    const [canEdit, setCanEdit] = useState(true);
    const [dateData, setDateData] = useState({
        startDate: "yyyy-MM-dd",
        endDate: "yyyy-MM-dd",
    });
    const [valid, setValid] = useState({
        start: 0,
        end: 0,
        name: 0
    })
    const [errMsg, setErrMsg]= useState("");

    const dateHandler = () =>{
        const err = [];
        let txt = "";
        const _startDate = dateData.startDate;
        const _endDate = dateData.endDate;
        const _now = new Date();

        const _date_1 = new Date(_startDate);
        const _date_2 = new Date(_endDate);

        if (_date_1.toLocaleDateString() === _now.toLocaleDateString()) {
            _date_1.setTime(_now.getTime());
            _date_1.setMinutes(_date_1.getMinutes() + 5)
        }
        
        const _test = _date_2 > _date_1;
        const _test_ii = _date_1.getTime() > _now.getTime();

        if (!_test) {
            err.push("End date must be greater than Start date!");
            setValid({...valid, end: 2})
        }

        if (!_test_ii) {
            err.push("Start date must be in the future!");
            setValid({...valid, start: 2})
        }else{
            setValid({...valid, start: 0})
        }

        err.forEach(element => {
             if (txt === '') {
                txt = element;
            }else{
                 txt = `, ${element}`;
             }
        });

        setErrMsg(txt);

        if (txt === '') {
            setDates({start: _date_1, end: _date_2});
            setValid({...valid, end: 1, start: 1});
        }else{
            return;
        }
    }

    
    const sethandler = () =>{
        if (escapeString(batchName) && batchName.length > 2) {
            setBatchNameTxt(batchName);
            setCanEdit(false);
            setValid({...valid, name: 1});
            setErrMsg("")
        }else{
            setErrMsg("Batch name too short")
            setValid({...valid, name: 2})
        }
    }

    const textType = (e) =>{
        if (e.key === "Enter") {
            sethandler();
        }
    }

    useEffect(()=>{
        if (dates !== null) {
            const d1 = ((dates.start).toISOString().slice(0, 16));
            const d2 = ((dates.end).toISOString().slice(0, 16));

            setDateData({...dateData, startDate: d1, endDate: d2});
        }
    }, []);


    useEffect(()=>{
        if (dateData.startDate !== "yyyy-MM-dd") {
            dateHandler();
        }
    }, [dateData]);

    useEffect(()=>{
        if (escapeString(batchName) && batchName.length > 2) {
            setValid({...valid, name: 0});
        }else{
            setValid({...valid, name: 2});
        }
    }, [batchName]);
    return (
        <div className="div-carosel">
            <div className="flex-form">
                <label>Batch Name</label>
                <div className={`inp-box`}>
                    <input type="text" value={batchName} disabled={!canEdit} onKeyPress={textType} onChange={(e)=>setBatchName(e.target.value)} name="" placeholder='initial Sale' id="" className={`inp ${valid.name === 1 && "good"}`} />
                    {canEdit && <div className="btnx" onClick={sethandler}>Set</div>}
                    {!canEdit && <div className="btnx" onClick={()=>setCanEdit(true)}>Edit</div>}
                </div>
                {valid.name === 1 && <label>Start date</label>}
                {valid.name === 1 &&<div className={`inp-box ${valid.start === 2 && "err"} ${valid.start === 1 && "good"}`}>
                    <input type="date" name="" min={new Date().toISOString().split('T')[0]} onChange={(e)=> setDateData({...dateData, startDate: e.target.value})} value={dateData.startDate} id="" className="inp" />
                </div>}
                {valid.name === 1 &&<label>End date</label>}
                {valid.name === 1 && <div className={`inp-box ${valid.end === 2 && "err"} ${valid.end === 1 && "good"}`}>
                    <input type="date" name="" min={new Date().toISOString().split('T')[0]} onChange={(e)=> setDateData({...dateData, endDate: e.target.value})} value={dateData.endDate} id="" className="inp" />
                </div>}
                {errMsg !== "" && <div className="error-message"><b>Error: </b>{errMsg}</div>}
            </div>
            <br />
        </div>
    )
}

export default SetDate;
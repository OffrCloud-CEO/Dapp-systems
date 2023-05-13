import React, { useContext, useEffect, useState } from 'react';
import { formatNum } from '../../../../useful/useful_tool';
import { batchesContext } from './Batches';
import { contextData } from '../../dashboard';

const Batch = ({id, data}) => {
    const { soldValue } = useContext(contextData);
    const {selected, setSelected} = useContext(batchesContext);
    const { endDate, startDate, status, batch_name, sold } = data;
    const [tokenSold, setTokenSold] = useState(0);

    useEffect(()=>{
        setTokenSold(soldValue);
    }, [soldValue]);

    function timestampToDateText(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const suffix = getSuffix(day);
        return `${day}${suffix} ${month}, ${year}`;
    }

    function getSuffix(day) {
        const suffixes = ["th", "st", "nd", "rd"];
        const suffixIndex = day % 10 > 3 ? 0 : day % 100 - 10 !== 0 ? day % 10 : 3;
        return suffixes[suffixIndex];
    }

    return (
        /* available classes: current, selected */
        <div className={`batch ${selected === id && "selected"} ${selected !==0 && selected !== id && "quiet"}`} onClick={()=> setSelected( selected !== id ? id : 0)}>
            <div className="topper">
                <div className="label">
                    <label>Stage name</label>
                    <label className={`${status ? 'active': "not-active"}`}>{`${status ? 'active': "ended"}`}</label>
                </div>
                <div className="name">{batch_name}</div>
            </div>
            <div className="mid">
                <div className="value">{status ? formatNum(((Number(sold) / (10**18)) + Number(tokenSold))) : formatNum((Number(sold) / (10**18)))}</div>
                <label>Token sold</label>
            </div>
            <div className="info">
                <div>
                    <label>Start Date</label>
                    <div className="value">{timestampToDateText(startDate)}</div>
                </div>
                <div>
                    <label>End Date</label>
                    <div className="value">{timestampToDateText(endDate)}</div>
                </div>
            </div>
        </div>
    )
}

export default Batch;
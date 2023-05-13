import React, { useContext, useEffect, useRef, useState } from 'react';
import TableRow from './Table Components/TableRow';
import { kycTableContext } from '../pages/KycManagament';

const TableDiv = () => {
    const { title, headers, body, filterFunc, filter } = useContext(kycTableContext);
    const [gottenTable, setGottenTable] = useState([...body]);
    const [holdsAllTable, setHoldsAllTable] = useState([]);
    const [displayTable, setDisplayTable] = useState([]);
    const [activeTable, setActiveTable] = useState(0);
    const [options, setOptions] = useState(false);
    const ref = useRef();

    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setOptions(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref]);

    useEffect(()=>{
        const splitArray = (arr) => {
            const result = [];
            const chunkSize = 10;
            for (let i = 0; i < arr.length; i += chunkSize) {
                result.push(arr.slice(i, i + chunkSize));
            }
            return result;
        };

        if (gottenTable.length > 0) {
            const tempArr = [...gottenTable];
            const hugeTempArr = splitArray(tempArr);
            
            setHoldsAllTable(hugeTempArr);
        }else{
            setHoldsAllTable([]);
        }
    }, [gottenTable, body]);

    useEffect(()=>{
        setGottenTable(body);
    }, [body]);

    useEffect(()=>{
        if (holdsAllTable.length > 0) {
            setDisplayTable(holdsAllTable[activeTable]);
        }else{
            setDisplayTable([]);
        }
    }, [activeTable, holdsAllTable, body]);

    const prevHandle = () =>{
        const former = activeTable;
        if (activeTable > 0) {
            setActiveTable(former - 1);
        }
    };
    
    const nextHandle = () =>{
        const len = holdsAllTable.length-1;
        const former = activeTable;
        if (len > activeTable) {
            setActiveTable(former + 1);
        }
    };

    return (
        <div className="tableDiv">
            <div className="top-row">
                <div className="label">{title} {filter === 0 ? "(*)" : filter === 1 ? "(Pending)" : filter === 2 ? "(Verified)" : "(Declined)"}</div>
                <div className="actionBtnx v" onClick={() => setOptions(!options)}>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                {options && <div className="control-div" ref={ref}>
                    <li className={`${filter === 0 ? "active" : ''}`} onClick={()=>filterFunc(0)}>View All</li>
                    <li className={`${filter === 1 ? "active" : ''}`} onClick={()=>filterFunc(1)}>View Pending</li>
                    <li className={`${filter === 2 ? "active" : ''}`} onClick={()=>filterFunc(2)}>View Verified</li>
                    <li className={`${filter === 3 ? "active" : ''}`} onClick={()=>filterFunc(3)}>View Declined</li>
                </div>}
            </div>
            {<table className="mainTable">
                <thead className='tableHead'>
                    <tr>
                        <td className='tableData'>S/N</td>
                        {headers && headers.map(i => (
                            <td className="tableData" key={i}>{i}</td>
                        ))}
                        <td>
                        </td>
                    </tr>
                </thead>
                {displayTable.length > 0 && <tbody className='tableBody'>
                    {displayTable && displayTable.map(i => (
                        <TableRow key={i.userId} documentFiles={i.documentFiles} sn={i.sn} fullname={i.fullname} userId={i.userId} docType={i.docType} documents={i.document} status={i.status}/>
                    ))}
                </tbody>}
            </table>}

            {displayTable.length === 0 &&
                <div className="no-data">
                    <div className="img">
                        <div><img src="https://gineousc.sirv.com/Images/icons/external-ghost-halloween-vitaliy-gorbachev-lineal-vitaly-gorbachev.png" alt="" /></div>
                    </div>
                </div>
            }
            <div className="tableBottonRow">
                <div className="left">
                    <div className={`btnx ${activeTable === 0 && "inactive"}`} onClick={prevHandle}>Prev</div>
                    {Array.from({length: (holdsAllTable.length)}, (_, i) => i).map(i=>{
                        if (i === 0) {
                            return <div onClick={()=>setActiveTable(i)} key={i} className={`btnx ${activeTable === i && "active"}`}>{i+1}</div>
                        }else if (i === (holdsAllTable.length-1)) {
                            return <div onClick={()=>setActiveTable(i)} key={i} className={`btnx ${activeTable === i && "active"}`}>{i+1}</div>
                        }else if (i === (activeTable + 1)) {
                            return <div onClick={()=>setActiveTable(i)} key={i} className={`btnx ${activeTable === i && "active"}`}>{i+1}</div>
                        }else if (i === (activeTable - 1)) {
                            return <div onClick={()=>setActiveTable(i)} key={i} className={`btnx ${activeTable === i && "active"}`}>{i+1}</div>
                        }else if (i === (activeTable)) {
                            return <div onClick={()=>setActiveTable(i)} key={i} className={`btnx ${activeTable === i && "active"}`}>{i+1}</div>
                        }
                    })}
                    <div className={`btnx ${activeTable === (holdsAllTable?.length-1) ? "inactive" : holdsAllTable.length === 0 ? "inactive" : ''}`} onClick={nextHandle}>Next</div>
                </div>
                <div className="right">
                    {holdsAllTable.length > 0 ? activeTable+1 : 0} / {holdsAllTable.length} of {gottenTable.length}
                </div>
            </div>
        </div>
    )
}

export default TableDiv;
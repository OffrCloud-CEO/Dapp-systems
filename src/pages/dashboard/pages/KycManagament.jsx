import React, { useEffect, useState } from 'react';
import TableDiv from '../components/TableDiv.jsx';
import { fireStore } from '../../../firebase/sdk.js';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { Toaster } from 'react-hot-toast';
import GridCard from '../components/GridCard.jsx';
import { formatNum } from '../../../useful/useful_tool.js';
import TransactionHashs from '../components/TransactionHashs.jsx';

export const kycTableContext = React.createContext();
const KycManagament = () => {
    const header = ["user", "Doc Type", "Documents", "Status"];
    const [tableBodyData, setTableBodyData] = useState([]);
    const [showData, setSHowData] = useState([]);
    const [filter, setFilter] = useState(0);
    const [allKyc, setAllKyc] = useState(0);
    const [pendingKyc, setPendingKyc] = useState(0);
    const [verifiedKyc, setVerifiedKyc] = useState(0);
    const [declinedKyc, setDeclinedKyc] = useState(0);

    const fetchKycList = async () => {
        const docRef = collection(fireStore, "kycApplications");

        onSnapshot(docRef, (snapshot) => {
            let countNum = 0;
            const snapDocs = snapshot.docs
            const tempArr = [];
            let pendingValue = 0;
            let verifiedValue = 0;
            let declinedValue = 0;
            if (snapDocs !== null) {
                snapDocs.forEach((application) => {
                    const { user, fullname, docType, status, frontImgUrl, backImgUrl, submitDate } = application.data();
                    const bodyData = {
                        userId: `${user}`,
                        fullname: `${fullname}`,
                        docType: ['Passport', 'National ID', 'Drivers Licence'][docType],
                        document: ["ID Front", "ID Back"],
                        status: ['Pending', 'Verified', 'Declined'][status],
                        documentFiles: [backImgUrl, frontImgUrl],
                        submitDate,
                    };

                    switch (status) {
                        case 0:
                            pendingValue++;
                            break;
                        case 1:
                            verifiedValue++;
                            break;
                        case 0:
                            declinedValue++;
                            break;
                    
                        default:
                            break;
                    }
    
                    tempArr.push(bodyData);
                });
            }
            tempArr.sort((a, b) => (new Date(a.submitDate)) - (new Date(b.submitDate)));
            const finalArr = [
                tempArr.reverse().map((element) => {
                    return { ...element, sn: countNum++ }
                })
            ];


            setTableBodyData(finalArr[0]);
            setPendingKyc(pendingValue);
            setVerifiedKyc(verifiedValue); 
            setDeclinedKyc(declinedValue);
            setAllKyc(finalArr[0].length);
        });
    }

    useEffect(() => {
        fetchKycList();
    }, []);

    useEffect(() => {
        let filteredArray = [];
        switch (filter) {
            case 1:
                filteredArray = tableBodyData.filter((i) => i.status === 'Pending');
                break;
            case 2:
                filteredArray = tableBodyData.filter((i) => i.status === 'Verified');
                break;
            case 3:
                filteredArray = tableBodyData.filter((i) => i.status === 'Declined');
                break;

            default:
                filteredArray = tableBodyData;
                break;
        }

        setSHowData(filteredArray);
    }, [filter, tableBodyData]);

    return (
        <kycTableContext.Provider value={{ headers: header,  title:"KYC Applications", filterFunc:setFilter, body:showData, filter }}>
            <div className="dash_section">
                <Toaster
                    toastOptions={{
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                    }}
                />
                <label>KYC Management</label>
                <div className="dash-row home">
                    <div className="div-4">
                        <GridCard ico={"https://gineousc.sirv.com/Images/icons/id-verified.png"} detail={allKyc > 9? formatNum(allKyc) : allKyc > 9 ? `0${allKyc}` : `00${allKyc}`} p={'All'}/>
                        <GridCard ico={"https://gineousc.sirv.com/Images/icons/id-verified.png"} detail={pendingKyc > 99 ? formatNum(pendingKyc) : pendingKyc > 9 ? `0${pendingKyc}` : `00${pendingKyc}`} p={'Pending'}/>
                        <GridCard ico={"https://gineousc.sirv.com/Images/icons/id-verified.png"} detail={verifiedKyc > 99 ? formatNum(verifiedKyc) : verifiedKyc > 9 ? `0${verifiedKyc}` : `00${verifiedKyc}`} p={'Verified'}/>
                        <GridCard ico={"https://gineousc.sirv.com/Images/icons/id-verified.png"} detail={declinedKyc > 99 ? formatNum(declinedKyc) : declinedKyc > 9 ? `0${declinedKyc}` : `00${declinedKyc}`} p={'Declined'}/>
                    </div>
                </div>
                <br />
                <TableDiv headers={header} title={'KYC Applications'} filterFunc={setFilter} body={showData} />
                <br />
                <TransactionHashs maxL={5} methods={[9]} />
            </div>
        </kycTableContext.Provider>
    )
}

export default KycManagament;
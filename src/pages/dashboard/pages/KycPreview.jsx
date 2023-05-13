import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ImageViewer from '../components/Table Components/ImageViewer';
import { collection, doc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { fireStore } from '../../../firebase/sdk';
import { escapeString, formatPhoneNumber } from '../../../useful/useful_tool';
import { countryList } from '../../../useful/variables';

const KycPreview = () => {
    const { id } = useParams();
    const [viewingImage, setViewingImage]= useState(false);
    const [imgToView, setImgToView] = useState("");
    const navigate = useNavigate();
    const [userWallet, setUserWallet] = useState('');
    const [userData, setUserData] = useState(null);
    const [_id, setId]= useState(id);
    const [userExist, setUserExist] = useState(false);

    const viewerHandle = (url) =>{
        setViewingImage(true);
        setImgToView(url);
    }

    const backBtnHandler = () =>{
        navigate(-1);
    }

    useEffect(()=>{
        setId(id);
    }, [id]);

    const updateCheckOn = async() =>{
        const today = new Date();
        const checkOnTime = `${today.toLocaleDateString()} ${today.toLocaleTimeString()}`;
        
        if (userExist) {
            const userRef = collection(fireStore, "kycApplications");
            const objectToChange = {...userData, checkedDate: checkOnTime}
            if (userData.status === 0) {
                await setDoc(doc(userRef, `${userWallet}`), objectToChange);
            }else if(userData.checkedDate === "") {
                await setDoc(doc(userRef, `${userWallet}`), objectToChange);
            }
        }
    }

    
    const fetchUserKycDetails = async () => {
        const userRef = collection(fireStore, "kycApplications");

        onSnapshot(userRef, (kycDocs) => {
            kycDocs && kycDocs.forEach(element => {
                const { id } = element;
                const data = element.data();
                
                if (data.user === _id) {
                    setUserWallet(id);
                    setUserData(data);
                    setUserExist(true);
                }
            });
        });
    };

    useEffect(() => {
        if (String(_id).length > 0) {
            fetchUserKycDetails();
        }
    }, []);
    
    useEffect(() => {
        if (userExist) {
            updateCheckOn();
        }
    }, [userExist]);

    return (
        <div className="dash_section">
            {userExist && <label>Viewing {userData.fullname}'s Application</label>}
            {!userExist && <label>User Don't Exist!</label>}
            {viewingImage && <ImageViewer imgUrl={imgToView} closeFunc={setViewingImage} />}
            <div className="tableDiv">
                <div className="Trow">
                    <div className="label">KYC Details</div>
                    <div className="toolbar">
                        <div className="btnx" onClick={backBtnHandler}><img src="https://gineousc.sirv.com/Images/icons/icons8-go-back-96.png" alt="" /> back</div>
                    </div>
                </div>
                {!userExist && <div className="no-data">
                    <div className="img">
                        <div><img src="https://gineousc.sirv.com/Images/icons/external-ghost-halloween-vitaliy-gorbachev-lineal-vitaly-gorbachev.png" alt="" /></div>
                    </div>
                </div>}
                {userExist && <table className="infoTable">
                    <div className="info">
                        <span>Sumitted By</span>
                        <span>{userData.user}</span>
                    </div>
                    <div className="info">
                        <span>Sumitted On</span>
                        <span>{userData.submitDate}</span>
                    </div>
                    <div className="info">
                        <span>Checked On</span>
                        <span>{String(userData.checkedDate).length > 0 ? String(userData.checkedDate) : "---"}</span>
                    </div>
                    <div className="info">
                        <span>Status</span>
                        {userData.status === 1 &&<span><div className="status good">Approved</div></span>}
                        {userData.status === 2 &&<span><div className="status bad">Declined</div></span>}
                        {userData.status === 0 &&<span><div className="status wait">Pending</div></span>}
                    </div>
                </table>}
                {userExist && <label>Personal Information</label>}
                {userExist && <div className="info-grid">
                    <div className="info-row">
                        <span>Full Name:</span>
                        <span>{userData.fullname}</span>
                    </div>
                    <div className="info-row">
                        <span>Connected Wallet:</span>
                        <span>{userWallet}</span>
                    </div>
                    <div className="info-row">
                        <span>Email Address:</span>
                        <span>{userData.email}</span>
                    </div>
                    <div className="info-row">
                        <span>Phone Number:</span>
                        <span>{formatPhoneNumber(escapeString(userData.mobile), userData.country)}</span>
                    </div>
                    <div className="info-row">
                        <span>Residencial Info:</span>
                        <span>
                            {<p>Address Line 1: {userData.address[0]}</p>}
                            {(userData.address).length > 0 && userData.address[1] !== '' && <p>Address Line 2: {userData.address[1]}</p>}
                        </span>
                    </div>
                    <div className="info-row">
                        <span>City:</span>
                        <span>{userData.city}.</span>
                    </div>
                    <div className="info-row">
                        <span>State:</span>
                        <span>{userData.state}.</span>
                    </div>
                    <div className="info-row">
                        <span>Zipcode:</span>
                        <span>{userData.zipcode}.</span>
                    </div>
                    <div className="info-row">
                        <span>Country of Residence:</span>
                        <span>{countryList[userData.country]}.</span>
                    </div>
                </div>}
                {userExist && <label>Uploaded Documents</label>}
                {userExist && <div className="info-grid">
                    <div className="doc-row">
                        {<span>{['Passport', 'National ID', 'Drivers Licence'][userData.docType]}:</span>}
                        
                        <div className="pic-td">
                            <div className="img">
                                <div className="viewTrigger">
                                    <div className="ico" onClick={()=>viewerHandle(`${userData.frontImgUrl}`)}><img src="https://gineousc.sirv.com/Images/icons/icons8-vision-96.png" alt="" /></div>
                                </div>
                                <img src={`${userData.frontImgUrl}`} alt={`${['Passport', 'National ID', 'Drivers Licence'][userData.docType]} Front`} />
                            </div>
                        </div>
                        <div className="pic-td">
                            <div className="img">
                                <div className="viewTrigger">
                                    <div className="ico" onClick={()=>viewerHandle(`${userData.backImgUrl}`)}><img src="https://gineousc.sirv.com/Images/icons/icons8-vision-96.png" alt="" /></div>
                                </div>
                                <img src={`${userData.backImgUrl}`} alt={`${['Passport', 'National ID', 'Drivers Licence'][userData.docType]} Back`} />
                            </div>
                        </div>
                    </div>
                </div>}
            </div>
        </div>
    )
}

export default KycPreview;
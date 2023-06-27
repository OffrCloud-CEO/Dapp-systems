import React, { useContext, useEffect, useRef, useState } from 'react';
import UploadArea from './Form elements/UploadArea';
// import { countryList } from '../../../../useful/variables';
import { profileContext } from '../ProfilePage';
import { formatPhoneNumber } from '../../../../useful/useful_tool';
import { fireStore, storage } from '../../../../firebase/sdk';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import PopUp from './extra/PopUp';
import KycTerms from '../../../super components/KycTerms';

const SectionKYC = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 16);
    const formattedDate = date.toISOString().slice(0, 10);

    const { profileData, walletAddress, kycData } = useContext(profileContext);
    
    const [loading, setLoading] = useState(false);
    const [viewingTerms, setViewingTerms] = useState(false);
    const [phoneMaxLength, setPhoneMaxLength] = useState(11);

    const [documentType, setDocumentType] = useState(0);
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState('');
    const [dob, setDob] = useState('');
    const [addr1, setAddr1] = useState("");
    const [addr2, setAddr2] = useState("");
    const [city, setCity] = useState("");
    const [stateTxt, setStateTxt] = useState("");
    const [zipTxt, setZipTxt] = useState("");
    const [frontImg, setFrontImg] = useState(null);
    const [accreditedInvestorDoc, setAccreditedInvestorDoc] = useState(null);
    const [backImg, setBackImg] = useState(null);
    const [readOnlyStatus, setReadOnlyStatus] = useState(false)

    const [fullnameChange, setFullnameChange] = useState("");
    const [mobileChange, setMobileChange] = useState('');
    const [dobChange, setDobChange] = useState('');

    useEffect(()=>{
        setFullnameChange(fullname);
        setMobileChange(mobile);
        setDobChange(dob);
    }, [mobile, dob, fullname]);


    const [errorWatch, setErrorWatch] = useState({
        addrs: false,
        city: false,
        stateN: false,
        zipcode: false,
        frontImg: false,
        backImg: false,
        fullname: false,
        mobile: false,
        dob: false,
    });
    const [goodToGo, setGoodToGo] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [agreedTerms01, setAgreedTerms01] = useState(false);
    const [agreedTerms02, setAgreedTerms02] = useState(false);
    const [showPopUp, setShowPopUp] = useState(false);

    const [kycStatus, setKycStatus] = useState(null);
    const [frontImgUrl, setFrontImgUrl] = useState(null);
    const [backImgUrl, setBackImgUrl] = useState(null);
    const checkRef = useRef();
    const checkRef02 = useRef();
    const checkRef03 = useRef();
    const [editingPhone, setEditingPhone] = useState(false);

    const initializeState = () => {
        const { name, email, mobile, dob, address } = profileData;
        setFullname(name);
        setEmail(email);
        setMobile(mobile);
        setDob(dob);

        switch (address.length) {
            case 1: 
                setAddr1(address[0]);
                break;
            case 1:
                setAddr1(address[0]);
                setAddr2(address[1]);
                break;
        
            default:
                break;
        }

    }
    
    useEffect(()=>{
        switch(kycStatus){
            case 0:
                setReadOnlyStatus(true);
                break;
            case 1:
                setReadOnlyStatus(true);
                break;
            default:
                setReadOnlyStatus(false);
                break;
        }
    }, [kycStatus]);


    useEffect(()=>{
        if (kycData !== null) {
            const { status, state, city, zipcode, address, docType, frontImgUrl, backImgUrl, accInvestorDoc } = kycData;
            setStateTxt(state);
            setCity(city);
            setZipTxt(zipcode);
            setAddr1(address[0]);
            setAddr2(address[1]);
            setKycStatus(status);
            setDocumentType(docType);
            setBackImgUrl(backImgUrl);
            setFrontImgUrl(frontImgUrl);
            setAccreditedInvestorDoc(accInvestorDoc);
        }
    }, [kycData]);

    useEffect(()=>{
        const testValues = Object.values(errorWatch);
        let canProceed = true;
        
        testValues.forEach(testValue => {
            if (testValue) {
                canProceed = false;
                return;
            }
        });

        if (!canProceed) {
            setGoodToGo(false);
            return;
        }

        if (addr1 === "") {
            setErrorWatch({...errorWatch, addrs: true});
            setGoodToGo(false);
            return;
        }

        if (city === "") {
            setErrorWatch({...errorWatch, city: true});
            setGoodToGo(false);
            return;
        }

        if (stateTxt === "") {
            setErrorWatch({...errorWatch, stateN: true});
            setGoodToGo(false);
            return;
        }

        if (zipTxt === "") {
            setErrorWatch({...errorWatch, zipcode: true});
            setGoodToGo(false);
            return;
        }

        if (frontImg === null) {
            setGoodToGo(false);
            return;
        }

        if (backImg === null) {
            setGoodToGo(false);
            return;
        }

        if (accreditedInvestorDoc === null) {
            setGoodToGo(false);
            return;
        }

        if (agreedTerms === false) {
            setGoodToGo(false);
            return;
        }

        if (agreedTerms01 === false) {
            setGoodToGo(false);
            return;
        }
        
        if (agreedTerms02 === false) {
            setGoodToGo(false);
            return;
        }

        setGoodToGo(true);
    }, [errorWatch, agreedTerms, agreedTerms01, agreedTerms02, accreditedInvestorDoc, frontImg, backImg]);

    useEffect(()=>{
        if (profileData !== null) {
            initializeState();
        }
    }, [profileData]);

    const addr1InputHandler = () =>{
        if (addr1.length < 4 || addr1 === '') {
            setErrorWatch({...errorWatch, addrs: true});
        }else{
            setErrorWatch({...errorWatch, addrs: false});
        }
    }

    useEffect(()=>{
        addr1InputHandler();
    }, [addr1]);
    
    const cityInputHandler = () =>{
        if (city.length < 3) {
            setErrorWatch({...errorWatch, city: true});
        }else{
            setErrorWatch({...errorWatch, city: false});
        }
    }

    useEffect(()=>{
        cityInputHandler();
    }, [city]);
    
    const stateInputHandler = () =>{
        if (stateTxt.length < 3) {
            setErrorWatch({...errorWatch, stateN: true});
        }else if (stateTxt === '') {
            setErrorWatch({...errorWatch, stateN: true});
        }else{
            setErrorWatch({...errorWatch, stateN: false});
        }
    }

    useEffect(()=>{
        stateInputHandler();
    }, [stateTxt, zipTxt]);
    
    const zipcodeInputHandler = () =>{
        if (zipTxt.length < 3) {
            setErrorWatch({...errorWatch, zipcode: true});
        }else{
            setErrorWatch({...errorWatch, zipcode: false});
        }
    }

    useEffect(()=>{
        zipcodeInputHandler();
    }, [zipTxt]);

    // Upload Back Image
    const uploadDoc002 = async ()=>{
        const filename02 = `${generateUniqueId()}.${(backImg.name).substring((backImg.name).lastIndexOf('.') + 1)}`
        const storageRef02 = ref(storage, `kycDocuments/${filename02}`);
        
        let filename02Url ='';

        // 'file' comes from the Blob or File API
        await uploadBytes(storageRef02, backImg).then(async (snapshot) => {
            await getDownloadURL(snapshot.ref).then((url) => {
                filename02Url = (url);
            });
        });

        return filename02Url;
    }

    // Upload Front Image
    const uploadDoc001 = async() =>{
        const filename01 = `${generateUniqueId()}.${(frontImg.name).substring((frontImg.name).lastIndexOf('.') + 1)}`
        const storageRef01 = ref(storage, `kycDocuments/${filename01}`);

        let filename01Url ='';

        // 'file' comes from the Blob or File API
        await uploadBytes(storageRef01, frontImg).then(async (snapshot) => {
            await getDownloadURL(snapshot.ref).then(async (url) => {
                filename01Url = (url);
            });
        });
    

        return filename01Url;
    }

    // Upload Accredited Investor Document
    const uploadDoc003 = async() =>{
        const filename01 = `${generateUniqueId()}.${(accreditedInvestorDoc.name).substring((accreditedInvestorDoc.name).lastIndexOf('.') + 1)}`
        const storageRef01 = ref(storage, `investorsDoc/${filename01}`);

        let filename01Url ='';

        // 'file' comes from the Blob or File API
        try {
            await uploadBytes(storageRef01, accreditedInvestorDoc).then(async (snapshot) => {
                await getDownloadURL(snapshot.ref).then(async (url) => {
                    filename01Url = (url);
                });
            });
        } catch (error) {
            console.log("Failed to upload Document");
        }
    
        return filename01Url;
    }

    // Update Personal Information if changed
    const updateInfo = async() =>{
        try {
            const docRef = collection(fireStore, "user_credentials");
            const getDocData = await getDocs(docRef);

            let toChangeData = {}

            getDocData.forEach(doc=>{ 
                const { wallet_Address } = doc.data();
                if (String(wallet_Address).toLowerCase() === String(walletAddress).toLowerCase()) {
                    toChangeData = doc.data();
                }
            })


            const updatedInfoObject = {...toChangeData, name: fullnameChange, mobile: mobileChange, dob: dobChange}
        
            await setDoc(doc(docRef, `${String(walletAddress).toLocaleLowerCase()}`), updatedInfoObject);
        } catch (error) {
            throw new Error(error)
        }
    }

    // Save Information to Database
    const saveInformation = async (data) =>{
        const docRef = collection(fireStore, "kycApplications");
        const updatedInfoObject = {...data};
        await updateInfo();
        await setDoc(doc(docRef, `${String(walletAddress).toLocaleLowerCase()}`), updatedInfoObject);
    }

    const submitKYC = async () => {
        setLoading(true);
        const today = new Date();

        try {
            const url01 = await uploadDoc001();
            const url02 = await uploadDoc002();
            const url03 = await uploadDoc003();

            const dataToSumbit = {
                fullname: fullname,
                email: email,
                city: city,
                state: stateTxt,
                zipcode: zipTxt,
                mobile: mobile,
                address: [addr1, addr2],
                docType: documentType,
                frontImgUrl: `${url01}`,
                backImgUrl: `${url02}`,
                accInvestorDoc: `${url03}`,
                status: 0,
                user: profileData.displayname,
                submitDate: `${today.toLocaleDateString()} ${today.toLocaleTimeString()}`,
                checkedDate: '',
                verifiedOn: '',
            }

            if (String(url01).length === 0) {
                return;
            }

            if (String(url02).length === 0) {
                return;
            }

            await saveInformation(dataToSumbit);
            setLoading(false);
            setShowPopUp(true);
        } catch (error) {
            setLoading(false);
            throw Error(`Application Could not go through because: ${error}`);
        }
    }

    const handleSumbit = () =>{
        const promise = submitKYC();
        toast.promise(promise,{
            loading: 'Submitting KYC Application.',
            success: 'KYC Application sent',
            error: 'An error occurred'
        })
    }

    function generateUniqueId() {
        const timestamp = new Date().getTime();
        const randomString = Math.random().toString(25).substring(2, 15);
        return `${randomString}-${timestamp}`;
    }

    useEffect(()=>{
        if (profileData !== null) {
            if (fullnameChange.split(" ").length < 2) {
                setErrorWatch({...errorWatch, fullname: true});
            }else if (fullnameChange.split(" ")[(fullnameChange.split(" ").length - 1)].length < 3) {
                setErrorWatch({...errorWatch, fullname: true});
            }else{
                setErrorWatch({...errorWatch, fullname: false});
            }
        }
    }, [fullnameChange]);
    
    useEffect(()=>{
        if (profileData !== null) {            
            if (dobChange === null) {
                setErrorWatch({...errorWatch, dob: true});
            }else{
                setErrorWatch({...errorWatch, dob: false});
            }
        }
    }, [dobChange]);
    
    useEffect(()=>{
        if (profileData !== null) {
            setPhoneMaxLength(11);

            if (!(Number(mobileChange) > 1)) {
                setErrorWatch({...errorWatch, mobile: true});
            }else if (mobileChange.length < (phoneMaxLength-1)) {
                setErrorWatch({...errorWatch, mobile: true});
            }else{
                setErrorWatch({...errorWatch, mobile: false});
            }
        }
    }, [mobileChange]);

    // const countriesArr = Object.entries(countryList).map(([code, name]) => ({ code, name }));
    /**
     * The function limits the length of a phone number input and sets it as the mobile number.
     */
    function phoneInput(e) {
        const input = e.target.value;

        if ((input).length <= (phoneMaxLength-1)) {
            setMobileChange(input);
        }
    }

    return (
        <div className="tab">
            {showPopUp && <PopUp func={setShowPopUp}/>}
            {viewingTerms && <KycTerms closeFunction={setViewingTerms}/>}
            {kycStatus === null && <div className="header">Begin your KYC Verification Process</div>}
            {kycStatus === 2 && <div className="header">Re-Apply For KYC verification</div>}
            {kycStatus === 1 && <div className="header">KYC Verified</div>}
            {kycStatus === 0 && <div className="header">Your is KYC Awaiting verification</div>}
            {kycStatus === 0 && <div className="p">Your KYC application is being processed at the moment.</div>}
            {kycStatus === null && <div className="p">Complete identity verification to participate in the tokensale.</div>}
            {kycStatus === 2 && <div className="p">Your last KYC application was declined, you can re-apply.</div>}

            {/* Personal Information */}
            <section>
                <div className="head">
                    <div className="numbering">01</div>
                    <div className="txt">
                        <span>Personal information</span>
                        <span>We need some basic personal information to identify you.</span>
                    </div>
                </div>
                <div className="warning">
                    Please type carefully and fill out the form with your personal details. Your can’t edit these details once you submitted the form.
                </div>
                <form action='' method='POST' className="form-section">
                    {/* Personal Informartion */}
                    <div className="form-grid">
                        <div className={`form-g ${errorWatch.fullname ? 'err': ''}`}>
                            <label>Full Name <div className="t">*</div><span>(Required)</span></label>
                            <input 
                                type="text" 
                                className="inp" 
                                placeholder='Chris Wilkinson' 
                                value={fullnameChange} 
                                onChange={(e)=>setFullnameChange(e.target.value)} 
                                readOnly={readOnlyStatus}
                                required
                            />
                        </div>
                        <div className="form-g">
                            <label>Email Address <div className="t">*</div><span>(Required)</span></label>
                            <input 
                                type="email" 
                                className="inp" 
                                value={email} 
                                placeholder='Chris Wilkinson.com' 
                                readOnly 
                                required
                            />
                        </div>
                        <div className={`form-g ${errorWatch.mobile ? 'err': ''}`}>
                            <label>Mobile Number <div className="t">*</div><span>(Required)</span></label>
                            <input 
                                type={`${editingPhone ? "number": "text"}`} 
                                className="inp"
                                value={editingPhone ? mobileChange : formatPhoneNumber(mobileChange, "US")} 
                                onChange={phoneInput}
                                placeholder='+555 555 5555' 
                                onFocus={()=>{
                                    if(!readOnlyStatus){
                                        setEditingPhone(true)
                                    }
                                }}
                                onBlur={(e) => {
                                    if (!e.target.matches(":focus")) {
                                        setEditingPhone(false);
                                    }
                                }}
                                readOnly={readOnlyStatus}
                                required 
                            />
                        </div>
                        <div className={`form-g ${errorWatch.dob ? 'err': ''}`}>
                            <label>Date of Birth <div className="t">*</div><span>(Required)</span></label>
                            <input 
                                type="date" 
                                min={new Date("1920-01-01").toISOString().split('T')[0]} 
                                max={new Date(`${formattedDate}`).toISOString().split('T')[0]} 
                                defaultValue={dobChange} 
                                onChange={(e)=>setDobChange(e.target.value)}
                                className="inp" 
                                readOnly={readOnlyStatus} 
                                required
                            />
                        </div>
                    </div>

                    {/* Residential Information */}
                    <div className="title">Residential Information</div>
                    {kycStatus === null && <div className="form-grid">
                        <div className={`form-g ${errorWatch.addrs ? 'err' : ''}`}>
                            <label>Address Line 1 <div className="t">*</div><span>(Required)</span></label>
                            <input type="text" autoComplete='address' onFocus={addr1InputHandler} value={addr1} onChange={(e) => setAddr1(e.target.value)} className="inp" placeholder='Your address 1' required />
                        </div>
                        <div className={`form-g`}>
                            <label>Address Line 2 <span>(Optional)</span></label>
                            <input type="text" autoComplete='address' onChange={(e) => setAddr2(e.target.value)} className="inp" placeholder='Your address 2' value={addr2} />
                        </div>
                        <div className={`form-g ${errorWatch.city ? 'err' : ''}`}>
                            <label>City <div className="t">*</div><span>(Required)</span></label>
                            <input type="text" autoComplete="city" value={city} onChange={(e) => setCity(e.target.value)} onFocus={cityInputHandler} className="inp" placeholder='Ohio' required />
                        </div>
                        <div className={`form-g ${errorWatch.stateN ? 'err' : ''}`}>
                            <label>State <div className="t">*</div><span>(Required)</span></label>
                            <input type={'text'} autoComplete='state' onFocus={stateInputHandler} value={stateTxt} onChange={(e) => setStateTxt(e.target.value)} className="inp" placeholder='Texas' required />
                        </div>
                        <div className={`form-g ${errorWatch.zipcode ? 'err' : ''}`}>
                            <label>Zip Code <div className="t">*</div><span>(Required)</span></label>
                            <input type="text" onFocus={zipcodeInputHandler} onChange={(e) => setZipTxt(e.target.value)} value={zipTxt} className="inp" placeholder='XXXXX' required />
                        </div>
                    </div>}
                    {kycStatus === 2 && <div className="form-grid">
                        <div className={`form-g ${errorWatch.addrs ? 'err' : ''}`}>
                            <label>Address Line 1 <div className="t">*</div><span>(Required)</span></label>
                            <input type="text" autoComplete='address' onFocus={addr1InputHandler} value={addr1} onChange={(e) => setAddr1(e.target.value)} className="inp" placeholder='Your address 1' required />
                        </div>
                        <div className={`form-g`}>
                            <label>Address Line 2 <span>(Optional)</span></label>
                            <input type="text" autoComplete='address' onChange={(e) => setAddr2(e.target.value)} className="inp" placeholder='Your address 2' value={addr2} />
                        </div>
                        <div className={`form-g ${errorWatch.city ? 'err' : ''}`}>
                            <label>City <div className="t">*</div><span>(Required)</span></label>
                            <input type="text" autoComplete="city" value={city} onChange={(e) => setCity(e.target.value)} onFocus={cityInputHandler} className="inp" placeholder='Ohio' required />
                        </div>
                        <div className={`form-g ${errorWatch.stateN ? 'err' : ''}`}>
                            <label>State <div className="t">*</div><span>(Required)</span></label>
                            <input type={'text'} autoComplete='state' onFocus={stateInputHandler} value={stateTxt} onChange={(e) => setStateTxt(e.target.value)} className="inp" placeholder='Texas' required />
                        </div>
                        <div className={`form-g ${errorWatch.zipcode ? 'err' : ''}`}>
                            <label>Zip Code <div className="t">*</div><span>(Required)</span></label>
                            <input type="text" onFocus={zipcodeInputHandler} onChange={(e) => setZipTxt(e.target.value)} value={zipTxt} className="inp" placeholder='XXXXX' required />
                        </div>
                    </div>}
                    {kycStatus < 2 && kycStatus !== null && <div className="form-grid">
                        <div className={`form-g`}>
                            <label>Address Line 1 <div className="t">*</div><span>(Required)</span></label>
                            <input type="text" value={addr1} className="inp" placeholder='Your address 1' readOnly />
                        </div>
                        <div className={`form-g`}>
                            <label>Address Line 2 <span>(Optional)</span></label>
                            <input type="text" className="inp" placeholder='Your address 2' value={addr2} readOnly />
                        </div>
                        <div className={`form-g`}>
                            <label>City <div className="t">*</div><span>(Required)</span></label>
                            <input type="text" value={city} className="inp" placeholder='Ohio' readOnly />
                        </div>
                        <div className={`form-g`}>
                            <label>State <div className="t">*</div><span>(Required)</span></label>
                            <input type={'text'} value={stateTxt} className="inp" placeholder='Texas' readOnly />
                        </div>
                        <div className={`form-g`}>
                            <label>Zip Code <div className="t">*</div><span>(Required)</span></label>
                            <input type="text" value={zipTxt} className="inp" placeholder='XXXXX' readOnly />
                        </div>
                    </div>}
                </form>
            </section>

            {/* Upload ID Section */}
            <section>
                <div className="head">
                    <div className="numbering">02</div>
                    <div className="txt">
                        <span>Document Upload</span>
                        <span>To confirm your identity, please upload a legal documents.</span>
                    </div>
                </div>
                <div className="warning">
                    To complete the process, {`${kycStatus}`} please upload one of the following personal documents.
                </div>
                
                {kycStatus === null && <div className={`r-3`}>
                    <div className={`${documentType === 0 && 'active'}`} onClick={() => setDocumentType(0)}>
                        <img src="https://gineousc.sirv.com/Images/icons/icon-passport-color.png" alt="" />
                        <div className="p">Passport</div>
                    </div>
                    <div className={`${documentType === 1 && 'active'}`} onClick={() => setDocumentType(1)}>
                        <img src="https://gineousc.sirv.com/Images/icons/icon-national-id-color.png" alt="" />
                        <div className="p">National ID</div>
                    </div>
                    <div className={`${documentType === 2 && 'active'}`} onClick={() => setDocumentType(2)}>
                        <img src="https://gineousc.sirv.com/Images/icons/icon-licence-color.png" alt="" />
                        <div className="p">Driver's License</div>
                    </div>
                </div>}
                
                {kycStatus === 2 && <div className={`r-3`}>
                    <div className={`${documentType === 0 && 'active'}`} onClick={() => setDocumentType(0)}>
                        <img src="https://gineousc.sirv.com/Images/icons/icon-passport-color.png" alt="" />
                        <div className="p">Passport</div>
                    </div>
                    <div className={`${documentType === 1 && 'active'}`} onClick={() => setDocumentType(1)}>
                        <img src="https://gineousc.sirv.com/Images/icons/icon-national-id-color.png" alt="" />
                        <div className="p">National ID</div>
                    </div>
                    <div className={`${documentType === 2 && 'active'}`} onClick={() => setDocumentType(2)}>
                        <img src="https://gineousc.sirv.com/Images/icons/icon-licence-color.png" alt="" />
                        <div className="p">Driver's License</div>
                    </div>
                </div>}

                {kycStatus < 2 && kycStatus !== null && <div className={`r-3`}>
                    <div className={`${documentType === 0 && 'active'}`}>
                        <img src="https://gineousc.sirv.com/Images/icons/icon-passport-color.png" alt="" />
                        <div className="p">Passport</div>
                    </div>
                    <div className={`${documentType === 1 && 'active'}`}>
                        <img src="https://gineousc.sirv.com/Images/icons/icon-national-id-color.png" alt="" />
                        <div className="p">National ID</div>
                    </div>
                    <div className={`${documentType === 2 && 'active'}`}>
                        <img src="https://gineousc.sirv.com/Images/icons/icon-licence-color.png" alt="" />
                        <div className="p">Driver's License</div>
                    </div>
                </div>}

                {kycStatus === null && <div className="steps">
                    <div className="h">To prevent any delays in verifying your account, please ensure the following:</div>
                    <li><img src="https://gineousc.sirv.com/Images/icons/ch.png" alt="" /><span>Ensure that there is no glare of light on the card.</span></li>
                    <li><img src="https://gineousc.sirv.com/Images/icons/ch.png" alt="" /><span>The document should be in good condition and clearly visible.</span></li>
                    <li><img src="https://gineousc.sirv.com/Images/icons/ch.png" alt="" /><span>The selected credential must not be expired.</span></li>
                </div>}
                
                {kycStatus === 2 && <div className="steps">
                    <div className="h">To prevent any delays in verifying your account, please ensure the following:</div>
                    <li><img src="https://gineousc.sirv.com/Images/icons/ch.png" alt="" /><span>Ensure that there is no glare of light on the card.</span></li>
                    <li><img src="https://gineousc.sirv.com/Images/icons/ch.png" alt="" /><span>The document should be in good condition and clearly visible.</span></li>
                    <li><img src="https://gineousc.sirv.com/Images/icons/ch.png" alt="" /><span>The selected credential must not be expired.</span></li>
                </div>}

                <div className="steps">
                    {kycStatus === null && <div className="h">Please upload a copy of your ID here. (FRONT)</div>}
                    {kycStatus === 2 &&<div className="h">Please upload a copy of your ID here. (FRONT)</div>}
                    {kycStatus !== null && kycStatus < 2 && <div className="h">Uploaded ID Document. (FRONT)</div>}
                    {kycStatus === null && <UploadArea func={setFrontImg} />}
                    {kycStatus === 2 && <UploadArea func={setFrontImg} />}
                    {kycStatus < 2 && kycStatus !== null && <UploadArea status={kycStatus} viewImg={frontImgUrl} func={setFrontImg} />}
                </div>
                <div className="steps">
                    {kycStatus === null && <div className="h"> Please upload a copy of your ID here. (BACK)</div>}
                    {kycStatus === 2 && <div className="h"> Please upload a copy of your ID here. (BACK)</div>}
                    {kycStatus !== null && kycStatus < 2 && <div className="h">Uploaded ID Document. (BACK)</div>}
                    {kycStatus === null && <UploadArea func={setBackImg} />}
                    {kycStatus === 2 && <UploadArea func={setBackImg} />}
                    {kycStatus < 2 && kycStatus !== null && <UploadArea status={kycStatus} viewImg={backImgUrl} func={setBackImg} />}
                </div>
            </section>

            {/* Wallet Information Section */}
            <section>
                <div className="head">
                    <div className="numbering">03</div>
                    <div className="txt">
                        <span>Wallet Information</span>
                        <span>Your connected wallet information.</span>
                    </div>
                </div>
                <div className="form-section">
                    <div className="form-g">
                        <label>Your Wallet Address:</label>
                        <input type="text" placeholder='Eth Wallet Address' value={walletAddress ? `${walletAddress}`: ''} className="inp" required readOnly/>
                    </div>
                </div>
            </section>

            {/* Accredited Investor Section */}
            {kycStatus !== 1 &&<section>
                <div className="head">
                    <div className="numbering">04</div>
                    <div className="txt">
                        <span>Accredited Investor Section</span>
                        <span>Only Accredited Investors are allowed to KYC</span>
                    </div>
                </div>
                <div className="warning">
                    Attach Profit & Loss (P&L) documents that proves you are an accredited investor (i.e Your Networth is over 1 Million Dollars, Excluding primary residence & Income is over $200K in each prior 2 year and reasonably expect the same for the current year).
                </div>
                <div className="steps">
                    {kycStatus === null && <div className="h">Attach Document</div>}
                    {kycStatus === 2 &&<div className="h">Attach Document</div>}
                    {kycStatus !== null && kycStatus < 2 && <div className="h">Uploaded Document</div>}
                    {kycStatus === null && <UploadArea uploadType={1} func={setAccreditedInvestorDoc} />}
                    {kycStatus === 2 && <UploadArea uploadType={1} func={setAccreditedInvestorDoc} />}
                    {kycStatus < 2 && kycStatus !== null && <UploadArea status={1} viewImg={accreditedInvestorDoc} func={setBackImg} uploadType={1} />}
                </div>
            </section>}

            {/* Agree to Terms */}
            {kycStatus === null && <section>
                <div className="r">
                    <div className="containerd">
                        <input type="checkbox" onChange={(e)=>setAgreedTerms(e.target.checked)} ref={checkRef} />
                        <div className="checkmark" onClick={()=>checkRef.current.click()}></div>
                    </div>
                    <span>I Have Read The <span className='url' onClick={()=>setViewingTerms(true)}>Terms Of Condition</span> And <span className='url' onClick={()=>setViewingTerms(true)}>Privacy Policy</span>.</span>
                </div>
                <div className="r">
                    <div className="containerd">
                        <input type="checkbox" onChange={(e)=>setAgreedTerms01(e.target.checked)} ref={checkRef02} />
                        <div className="checkmark" onClick={()=>checkRef02.current.click()}></div>
                    </div>
                    <span>All personal information entered is correct and up-to-date.</span>
                </div>
                <div className="r">
                    <div className="containerd">
                        <input type="checkbox" onChange={(e)=>setAgreedTerms02(e.target.checked)} ref={checkRef03} />
                        <div className="checkmark" onClick={()=>checkRef03.current.click()}></div>
                    </div>
                    <span>I am an Accredited Investor.</span>
                </div>
                <div className="form-section">
                    {!goodToGo && <div className={`btnx disable`}>Submit KYC Documents</div>}
                    {goodToGo && !loading &&  <div className={`btnx`} onClick={handleSumbit}>Submit KYC Documents</div>}
                    {goodToGo && loading && <div className={`btnx`}> <img src="https://gineousc.sirv.com/Images/Spinner-2.gif" alt="" /> </div>}
                </div>
            </section>}
            
            {/* Agree to Terms if rejected*/}
            {kycStatus === 2 && <section>
                <div className="r">
                    <div className="containerd">
                        <input type="checkbox" onChange={(e)=>setAgreedTerms(e.target.checked)} ref={checkRef} />
                        <div className="checkmark" onClick={()=>checkRef.current.click()}></div>
                    </div>
                    <span>I Have Read The <span className='url' onClick={()=>setViewingTerms(true)}>Terms Of Condition</span> And <span className="url" onClick={()=>setViewingTerms(true)}>Privacy Policy</span>.</span>
                </div>
                <div className="r">
                    <div className="containerd">
                        <input type="checkbox" onChange={(e)=>setAgreedTerms01(e.target.checked)} ref={checkRef02} />
                        <div className="checkmark" onClick={()=>checkRef02.current.click()}></div>
                    </div>
                    <span>All personal information entered is correct and up-to-date.</span>
                </div>
                <div className="r">
                    <div className="containerd">
                        <input type="checkbox" onChange={(e)=>setAgreedTerms02(e.target.checked)} ref={checkRef03} />
                        <div className="checkmark" onClick={()=>checkRef03.current.click()}></div>
                    </div>
                    <span>I am an Accredited Investor.</span>
                </div>
                <div className="form-section">
                    {!goodToGo && <div className={`btnx disable`}>Submit KYC Documents</div>}
                    {goodToGo && !loading &&  <div className={`btnx`} onClick={handleSumbit}>Submit KYC Documents</div>}
                    {goodToGo && loading && <div className={`btnx`}> <img src="https://gineousc.sirv.com/Images/Spinner-2.gif" alt="" /> </div>}
                </div>
            </section>}
        </div>
    )
}

export default SectionKYC;

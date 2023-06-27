import { collection, doc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react'
import { fireStore } from '../../../../firebase/sdk';
import { compareObjects, formatPhoneNumber, isValidEmail, escapeString } from '../../../../useful/useful_tool';
import { countryList } from '../../../../useful/variables';
import ChangeProfilePicture from '../../components/ChangeProfilePicture';
import { profileContext } from '../ProfilePage';
import { toast } from 'react-hot-toast';

const SectionProfile = () => {
    const { profileData, walletAddress, kycData } = useContext(profileContext);
    const [fullname, setFullname] = useState("");
    const [displayname, setDisplayname] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState('');
    const [mobileFrom, setMobileFrom] = useState('');
    const [dob, setDob] = useState('');
    const [profilePic, setProfilePic] = useState('');
    const [settingDp, setSettingDp] = useState(false);
    const [editing, setEditing] = useState(false);
    const [usedDisplaynames, setUsedDisplaynames] = useState([]);
    const [errorWatch, setErrorWatch] = useState({
        fullname: false,
        displayname: false,
        email: false,
        mobile: false,
        dob: false,
    });
    const [goodToGo, setGoodToGo] = useState(false);

    const [phoneMaxLength, setPhoneMaxLength] = useState(11);
    
    useEffect(()=>{
        setMobile(mobileFrom);
    }, [mobileFrom]);
    
    const initializeState = () => {
        const { name, displayname, email, mobile, dob, profile_picture } = profileData;
        setFullname(name);
        setDisplayname(displayname);
        setEmail(email);
        setMobileFrom(mobile);
        setDob(dob);
        setProfilePic(profile_picture);
    }

    useEffect(()=>{
        if (profileData !== null) {
            initializeState();
        }
    }, [profileData, editing]);

    const getDisplayNames = async() =>{
        if (profileData !== null) {
            const collectionSnap = await getDocs(collection(fireStore, "user_credentials"));
    
            onSnapshot(collection(fireStore, "user_credentials"), (snaps)=>{
                const tempArr = [];
                snaps.forEach(snap=>{
                    const data = snap.data()
                    if (data.displayname !== profileData.displayname) {
                        tempArr.push(data.displayname);
                    }
                })
                setUsedDisplaynames(tempArr);
            });
            
            const tempArr = [];
            collectionSnap.forEach(snap=>{
                const data = snap.data()
                if (data.displayname !== profileData.displayname) {
                    tempArr.push(data.displayname);
                }
            });
            setUsedDisplaynames(tempArr);
        }
    }

    useEffect(()=>{
        getDisplayNames();
    },[]);

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

        setGoodToGo(true);
    }, [errorWatch]);

    const saveChangesHandler = () =>{
        const previousData = { 
            name: profileData.name, 
            displayname: profileData.displayname, 
            email: profileData.email, 
            mobile: profileData.mobile, 
            dob: dob, 
        };
        const newData = {
            name: fullname, 
            displayname: displayname, 
            email: email, 
            mobile: mobile, 
            dob: dob, 
        };

        const findDifference = !compareObjects(previousData, newData);
        
        
        if (findDifference && goodToGo) {
            const testValues = Object.values(errorWatch);
            let conProceed = true;

            testValues.forEach(testValue => {
                if (testValue) {
                    conProceed = false;
                    return;
                }
            });

            if (!conProceed) {
                return;
            }
            handleUpdateDB();
        }
    }

    const updateDB = async() =>{
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


            const updatedInfoObject = {...toChangeData, name: fullname, displayname: displayname, mobile: mobile, dob: dob}
        
            await setDoc(doc(docRef, `${String(walletAddress).toLocaleLowerCase()}`), updatedInfoObject);
            setEditing(false);
        } catch (error) {
            throw Error(`This Happened: ${error}`);
        }
    }

    function handleUpdateDB (){
        const promise = updateDB();
        toast.promise(promise,{
            loading: 'Updating Your Profile',
            success: 'Profile updated successfully',
            error:'An Error Occurred'
        })
    }

    useEffect(()=>{
        if (profileData !== null) {
            if (!isValidEmail(email)) {
                setErrorWatch({...errorWatch, email: true});
            }else{
                setErrorWatch({...errorWatch, email: false});
            }
        }
    }, [email]);

    useEffect(()=>{
        if (profileData !== null) {
            if (displayname.length < 3) {
                setErrorWatch({ ...errorWatch, displayname: true });
            } else if (usedDisplaynames.includes(displayname)) {
                setErrorWatch({ ...errorWatch, displayname: true });
            } else {
                setErrorWatch({ ...errorWatch, displayname: false });
            }
        }
    }, [displayname]);
    
    useEffect(()=>{
        if (profileData !== null) {
            if (fullname.split(" ").length < 2) {
                setErrorWatch({...errorWatch, fullname: true});
            }else if (fullname.split(" ")[(fullname.split(" ").length - 1)].length < 3) {
                setErrorWatch({...errorWatch, fullname: true});
            }else{
                setErrorWatch({...errorWatch, fullname: false});
            }
        }
    }, [fullname]);
    
    
    useEffect(()=>{
        if (profileData !== null) {            
            if (dob === null) {
                setErrorWatch({...errorWatch, dob: true});
            }else{
                setErrorWatch({...errorWatch, dob: false});
            }
        }
    }, [dob]);
    
    useEffect(()=>{
        if (profileData !== null) {
            setPhoneMaxLength(11);

            if (!(Number(mobile) > 1)) {
                setErrorWatch({...errorWatch, mobile: true});
            }else if (mobile.length < phoneMaxLength) {
                setErrorWatch({...errorWatch, mobile: true});
            }else if (mobile.length > phoneMaxLength) {
                setErrorWatch({...errorWatch, mobile: true});
            }else{
                setErrorWatch({...errorWatch, mobile: false});
            }
        }
    }, [mobile]);

    function phoneInput(e) {
        const input = e.target.value;

        if ((input).length <= phoneMaxLength) {
            setMobile(input);
        }
    }

    const date = new Date();
    date.setFullYear(date.getFullYear() - 16);
    const formattedDate = date.toISOString().slice(0, 10);

    const countriesArr = Object.entries(countryList).map(([code, name]) => ({ code, name }));
    
    return (
        <div className="tab">
            {settingDp && <ChangeProfilePicture setSettingDp={setSettingDp}/>}
            <section className='minis'>
                <div className="mini">
                    <div className="dp" onClick={()=>setSettingDp(true)}>
                        {profilePic && <img src={`${profilePic}`} alt="" />}
                        {!profilePic && <img src="https://gineousc.sirv.com/Images/Infinite.gif" alt="" />}
                    </div>
                    <span>*Select a profile photo by clicking the icon.</span>
                </div>
                <div className="mini info">
                    <div className="txt">
                        {walletAddress && <span>Linked Wallet: {walletAddress}</span>}
                        <span></span>
                    </div>
                </div>
            </section>
            <section>
                <div className="title">User Information</div>
                <form action='' method='POST' className="form-section">
                    {!editing && <div className="form-grid">
                        <div className="form-g">
                            <label>Full Name: </label>
                            <input type="text"  value={escapeString(fullname)} className="inp" readOnly/>
                        </div>
                        <div className="form-g">
                            <label>Display Name: </label>
                            <input type="text" value={`@${escapeString(displayname)}`} className="inp" readOnly />
                        </div>
                        <div className="form-g">
                            <label>Email Address: </label>
                            <input type="email" className="inp" value={escapeString(email)} readOnly />
                        </div>
                        <div className="form-g">
                            <label>Mobile Number: </label>
                            <input type="text" className="inp" value={mobile > 0 ? formatPhoneNumber(escapeString(mobile), "US") : "N/A"} readOnly/>
                        </div>
                        <div className="form-g">
                            <label>Date of Birth:</label>
                            <input type="date" defaultValue={dob} className="inp" readOnly/>
                        </div>
                    </div>}
                    {editing && <div className="form-grid">
                        <div className={`form-g ${errorWatch.fullname ? "err" : ''}`}>
                            <label>Full Name: </label>
                            <input type="text" onChange={(e)=>setFullname(e.target.value)} value={escapeString(fullname)} className="inp" placeholder='Chris Wilkinson' required />
                        </div>

                        <div className={`form-g ${errorWatch.displayname ? "err" : ''}`}>
                            <label>Display Name: </label>
                            <input type="text" onChange={(e)=>setDisplayname(e.target.value)} value={escapeString(displayname)} className="inp" placeholder='@ChrisWilkinson' required />
                        </div>
                        <div className={`form-g ${errorWatch.email ? "err" : ''}`}>
                            <label>Email Address: </label>
                            <input type="email" className="inp" value={escapeString(email)}  placeholder='chriswilkinson@mail.com' readOnly />
                        </div>
                        <div className={`form-g ${errorWatch.mobile ? "err" : ''}`}>
                            <label>Mobile Number: {errorWatch.mobile ? `Max: ${phoneMaxLength}` : ""}</label>
                            <input type="tel" className="inp" value={`${mobile}`} onChange={phoneInput} placeholder={`${formatPhoneNumber("5".repeat(phoneMaxLength).trim())}`} required />
                        </div>
                        <div className={`form-g ${errorWatch.dob ? "err" : ''}`}>
                            <label>Date of Birth:</label>
                            <input type="date" min={new Date("1920-01-01").toISOString().split('T')[0]} max={new Date(`${formattedDate}`).toISOString().split('T')[0]} onChange={(e)=>setDob(e.target.value)} defaultValue={dob} className="inp" placeholder='mm/dd/yyyy' required />
                        </div>
                    </div>}
                    
                    <div className="btnxs">
                        {!editing && kycData?.status === 2 && <div className="btnx" onClick={() => setEditing(!editing)}>
                            Edit
                        </div>}
                        {!editing && kycData === null && <div className="btnx" onClick={() => setEditing(!editing)}>
                            Edit
                        </div>}
                        {editing && <div className={`btnx ${goodToGo ? "": 'disable'}`} onClick={saveChangesHandler}>
                            Update Changes
                        </div>}
                        {editing && <div className="btnx bad" onClick={() => setEditing(false)}>Cancel</div>}
                    </div>
                </form>
            </section>
        </div>
    )
}

export default SectionProfile;
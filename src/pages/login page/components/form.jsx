import React from 'react'
import { useState } from 'react';
import { fireStore } from '../../../firebase/sdk';
import { getDoc, collection, doc, setDoc } from 'firebase/firestore';
import { useRef } from 'react';
import { createSession, isValidEmail } from '../../../useful/useful_tool';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getDataFromLogin } from '../../../store/reducers/userDetails';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

const FormPart = () => {
    const emailRef = useRef();
    const nameRef = useRef();
    const checkBoxRef = useRef();
    const contRef = useRef();
    const dispatch = useDispatch();


    const [emailText, setEmailText] = useState('');
    const [nameText, setNameText] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const [walletAddress, setWalletAddress] = useState('');
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [proceeding, setProceeding] = useState(false);
    const [hasError, setHasError] = useState({
        email: false,
        name: false,
        agree: false
    });

    const [coin, setCoin] = useState({});
    const [userInfo, setUserInfo] = useState({});

    const [accountExist, setAccountExist] = useState(false);

    function generateUsername() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        let username = 'user';
      
        // Generate a random 4-digit number
        const randomNumber = Math.floor(Math.random() * 10000);
        username += randomNumber.toString().padStart(4, '0');
      
        // Add two random letters
        for (let i = 0; i < 2; i++) {
          const randomIndex = Math.floor(Math.random() * letters.length);
          username += letters[randomIndex];
        }
      
        return username;
    }

    const createAccountHandler = async () => {
        if (!proceeding) {
            if (checkBoxRef.current.checked) {
                const lenName = (nameRef.current.value).split(' ');
                if (lenName.length > 1) {
                    if (isValidEmail(emailRef.current.value)) {
                        setProceeding(true);

                        const transactionDate = new Date();
                        const timeStamp = transactionDate.toISOString().slice(0, 19).replace('T', ' ');

                        const userRef = collection(fireStore, "user_credentials");


                        await setDoc(doc(userRef, `${walletAddress}`), {
                            name: nameRef.current.value,
                            email: emailRef.current.value,
                            profile_picture: dp(),
                            wallet_Address: walletAddress,
                            created: timeStamp,
                            displayname: generateUsername(),
                            emailstatus: false,
                            dob: null,
                            nationality: '',
                            mobile: '',
                            address: [],
                            city: '',
                            state: '',
                            zipcode: '',
                            kyc: false,
                            
                        });
                        setProceeding(false);
                        proceedHandler();
                    } else {
                        setHasError({ email: true });
                    }
                } else {
                    setHasError({ name: true });
                }
            } else {
                setHasError({ agree: true });
            }
        }
    }

    const fetchCredentials = async () => {
        setProceeding(true);
        const docRef = doc(fireStore, "user_credentials", `${walletAddress}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setAccountExist(true);
            const userInfo = docSnap.data();
            setEmailText(userInfo.email);
            setNameText(userInfo.name);
            setImageUrl(userInfo.profile_picture);
            checkBoxRef.current.checked = true;
        } else {
            // doc.data() will be undefined in this case
            setAccountExist(false);
        }
        setProceeding(false);

    }

    function dp() {
        const dps = ["https://gineousc.sirv.com/Images/profile_pictures/icons8-sheep-on-bike-96.png", "https://gineousc.sirv.com/Images/profile_pictures/icons8-bear-96.png", "https://gineousc.sirv.com/Images/profile_pictures/icons8-cat-head-96.png", "https://gineousc.sirv.com/Images/profile_pictures/icons8-cow-96.png", "https://gineousc.sirv.com/Images/profile_pictures/icons8-crab-96.png", "https://gineousc.sirv.com/Images/profile_pictures/icons8-doge-96.png", "https://gineousc.sirv.com/Images/profile_pictures/icons8-fish-96.png", "https://gineousc.sirv.com/Images/profile_pictures/icons8-giraffe-96.png", "https://gineousc.sirv.com/Images/profile_pictures/icons8-octopus-96.png", "https://gineousc.sirv.com/Images/profile_pictures/icons8-racoon-96.png"];
        return (dps[Math.floor(Math.random() * (dps.length - 1))]);
    }

    const connectWallet = async () => {
        setConnecting(true);

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            const signer = await provider.getSigner();
            const user = await signer.getAddress();
            setWalletAddress(user);

            setConnected(true);
        } catch (error) {
            console.log(error)
            throw Error(error)
        }
        
        setConnecting(false);
    }

    useEffect(() => {
        if (walletAddress !== '') {
            fetchCredentialsWatch();
        }
    }, [walletAddress]);

    useEffect(() => {
        const data = {
            email: emailText,
            name: nameText,
            dp: imageUrl,
        }
        setUserInfo(data);
    }, [emailText, nameText, imageUrl]);

    const proceedHandler = () => {
        if (!proceeding) {
            setProceeding(true);
            dispatch(getDataFromLogin({ coinInfo: coin, userInfo }));

            createSession(walletAddress, { coinInfo: coin });

            setTimeout(() => {
                contRef.current.click();
            }, 200);
        }
    }

    const connectWatch = ()=>{
        const promise = connectWallet();
        toast.promise(promise, {
            loading: "Connecting to Your Wallet",
            success: "Wallet is connected.",
            error: "An error occured!"
        });
    }

    const fetchCredentialsWatch = ()=>{
        const promise = fetchCredentials();
        toast.promise(promise, {
            loading: "Fetching credentials",
            success: "credentials found.",
            error: "An error occured!"
        });
    }

    const createAccountWatch = ()=>{
        const promise = createAccountHandler();
        toast.promise(promise, {
            loading: "Creating an Account for you",
            success: "Your account is created",
            error: "An error occured!"
        });
    }


    return (
        <section className="formPart">
            {/* <ConnectionModal /> */}
            <section>
                <div className="form-g">
                    <label>
                        {connected ? "Connected to:" : "Connect your wallet!"}
                    </label>
                    {!connected && <div className={`btnx`} onClick={connectWatch}>
                        {!connecting && "Connect wallet"}
                        {connecting && <img src="https://gineousc.sirv.com/Images/Circles-menu-3.gif" alt="" />}
                    </div>}
                    {connected && <input type="Text" className="inp" placeholder={`${walletAddress}`} disabled />}
                </div>
                <div className={`limit ${connected ? 'connected' : 'notConnected'}`}>
                    <div className={`form-g ${hasError.email && 'error'}`}>
                        <label>Email:</label>
                        <input type="email" name='email' disabled={accountExist} ref={emailRef} value={emailText} onChange={e => setEmailText(e.target.value)} autoComplete='on' className="inp" placeholder='Enter email address' />
                    </div>
                    <div className={`form-g ${hasError.name && 'error'}`}>
                        <label>Full Name:</label>
                        <input type="Text" className="inp" disabled={accountExist} ref={nameRef} value={nameText} onChange={e => setNameText(e.target.value)} name='name' placeholder="What's your name?" />
                    </div>
                    <div className={`form-g ${hasError.agree && 'error'}`}>
                        <br />
                        <div className="r">
                            <input type="checkbox" disabled={accountExist} ref={checkBoxRef} />
                            <div className="p" onClick={() => checkBoxRef.current.click()}>I agree to OffrToken's <a className='url' href="">Terms & Conditions</a></div>
                        </div>
                        <br />
                        {!accountExist && <div className={`btnx`} onClick={createAccountWatch}>
                            {!proceeding && "Create account"}
                            {proceeding && <img src="https://gineousc.sirv.com/Images/Spinner-2.gif" alt="" />}
                        </div>}
                        {accountExist && <div className={`btnx`} onClick={proceedHandler}>
                            {!proceeding && "Proceed"}
                            {proceeding && <img src="https://gineousc.sirv.com/Images/Spinner-2.gif" alt="" />}
                        </div>}
                    </div>
                </div>
            </section>
            <Link to={"/dashboard"} ref={contRef} style={{ display: 'none' }} >to Dashboard</Link>
        </section>
    )
}

export default FormPart;
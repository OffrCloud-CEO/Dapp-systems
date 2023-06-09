import React from 'react'
import { useState } from 'react';
import { fireStore } from '../../../firebase/sdk';
import { getDoc, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { useRef } from 'react';
import { createSession, isValidEmail } from '../../../useful/useful_tool';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import emailjs from 'emailjs-com';
import Terms from '../../super components/Terms';
import { useDebounce } from '../../../useful/myHooks/useDebounce';

const ErrSection = ({errorMessage, clean, cleanData, keyValue}) => {
    const [innerStatus, setInnerStatus] = useState(true);

    useEffect(()=>{
        setTimeout(() => {
            setInnerStatus(false);
            clean(cleanData.filter(i=>i.key !== keyValue));
        }, 5000);
    }, [clean, cleanData, keyValue]);

    return (
        <div className={`errorMsg ${innerStatus ? "show" : ""}`}>
            {errorMessage}
        </div>
    )
}

const FormPart = () => {
    const emailRef = useRef();
    const nameRef = useRef();
    const checkBoxRef = useRef();
    const contRef = useRef();
    const verifyRef = useRef();

    const [emailText, setEmailText] = useState('');
    const [nameText, setNameText] = useState('');
    const debounceEmailText = useDebounce(emailText, 500);
    const debounceNameText = useDebounce(nameText, 500);
    const [errorMessage, setErrorMessage] = useState([]);
    const [viewingTerms, setViewingTerms] = useState(false);

    const [walletAddress, setWalletAddress] = useState('');
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [proceeding, setProceeding] = useState(false);
    const [hasError, setHasError] = useState({
        email: 0,
        name: 0,
    });

    const [accountExist, setAccountExist] = useState(false);
    const [accountVerified, setAccountVerified] = useState(false);
    const [existingEmails, setExistingEmails] = useState([]);
    const [canProceed, setCanProceed] = useState(false);
    const [agreedToTerm, setAgreedToTerms] = useState(false);

    function generateUsername() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
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

    function generateVerificationCode() {
        const length = 8;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    }

    function generateVerificationUrl() {
        const baseUrl = 'https://demo.offrcloud.com';
        const code = generateVerificationCode();
        return [`${baseUrl}/verify?token=${code}`, code];
    }

    const createAccountHandler = async () => {
        if (!proceeding && canProceed) {
            try {
                if (checkBoxRef.current.checked) {
                    const lenName = (nameRef.current.value).split(' ');
                    if (!isValidEmail(emailRef.current.value)) {
                        setHasError({ email: true });
                        return
                    }

                    if (lenName.length <= 1) {
                        setHasError({ name: true });
                        return;
                    }

                    setProceeding(true);

                    const transactionDate = new Date();
                    const timeStamp = transactionDate.toISOString().slice(0, 19).replace('T', ' ');

                    const userRef = collection(fireStore, "user_credentials");
                    const emailAuth = collection(fireStore, "email_authetication");
                    const formName = nameRef.current.value;
                    const formEmail = emailRef.current.value;
                    const walletAdr = String(walletAddress).toLocaleLowerCase();

                    try {
                        const serviceId = process.env.REACT_APP_SERVICE_ID;
                        const templateId = process.env.REACT_APP_TEMPLATE_003;
                        const userId = process.env.REACT_APP_USER_ID;
                        const emailAuthdata = generateVerificationUrl();

                        const emailProperties = {
                            subjectTxt: "Verify Email - OffrCloud",
                            titleTxt: "Verify Your Email Address",
                            bodyTxt: "Thank you for registering with our platform. To ensure the security of your account, we require you to verify your email address. Please click on the verification button below to complete the process. If you did not register with our platform, please ignore this message.",
                            urlTxt: emailAuthdata[0],
                            btnTxt: "Verify Email",
                            toEmail: formEmail,
                        }

                        await setDoc(doc(emailAuth, `${emailAuthdata[1]}`), {
                            user: `${walletAdr}`,
                            email: formEmail,
                            code: `${emailAuthdata[1]}`,
                            status: false,
                        });

                        emailjs.send(serviceId, templateId, emailProperties, userId)
                            .then((result) => {
                                console.log('Email sent successfully:', result.text);
                            })
                            .catch((error) => {
                                console.error('Error sending email:', error);
                            });

                        await setDoc(doc(userRef, `${walletAdr}`), {
                            name: formName,
                            email: formEmail,
                            profile_picture: dp(),
                            wallet_Address: walletAddress,
                            created: timeStamp,
                            displayname: generateUsername(),
                            emailstatus: false,
                            dob: null,
                            mobile: '',
                            address: [],
                            city: '',
                            state: '',
                            zipcode: '',
                            kyc: false,

                        });

                        setProceeding(false);
                        setAccountVerified(false);
                        setAccountExist(true);
                    } catch (error) {
                        console.log(error);
                        throw ({ cause: "Email provided might mispelt" });
                    }
                } else {
                    setHasError({ agree: true });
                    throw ({cause: "Please read & agree to the Terms & Condition!"});
                }
            } catch (error) {
                setProceeding(false);
                const reason  = error.cause ? error.cause : "Please filling the form correctly!";
                setErrorMessage([...errorMessage, {msg:reason, key: Math.random().toString(36).substring(2, 10)}]);
                throw Error(error);
            }
        }
    }

    const fetchCredentials = async () => {
        setProceeding(true);
        const docRef = doc(fireStore, "user_credentials", `${String(walletAddress).toLocaleLowerCase()}`);
        try {
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setAccountExist(true);
                const userInfo = docSnap.data();
                setEmailText(userInfo.email);
                setNameText(userInfo.name);
                checkBoxRef.current.checked = true;

                if (userInfo.emailstatus) {
                    setAccountVerified(true);
                }else{
                    setAccountVerified(false);
                }
            } else {
                // doc.data() will be undefined in this case
                setAccountExist(false);
                const reason  = "You don't have an account, create one.";
                setErrorMessage([...errorMessage, {msg:reason, key: Math.random().toString(36).substring(2, 10)}]);
            }
            setProceeding(false);
        } catch (error) {
            setProceeding(false);
            const reason  = "failed to Fetch Credentials client is offline. Refresh the page.";
            setErrorMessage([...errorMessage, {msg:reason, key: Math.random().toString(36).substring(2, 10)}]);
            throw Error(error);
        }

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
            setConnecting(false);
        } catch (error) {
            setConnected(false);
            setConnecting(false);
            const reason  = error.reason ? `Error: ${error.reason === "missing provider" ? "No Wallet Detected." : error.reason}` : "No Wallet Detected.";
            setErrorMessage([...errorMessage, {msg:reason, key: Math.random().toString(36).substring(2, 10)}]);
            throw Error(error)
        }
        
    }

    useEffect(() => {
        async function fetchEmails() {
            const emailsCollectionsRef = collection(fireStore, "user_credentials");
            const emailsDocs = await getDocs(emailsCollectionsRef);

            const tempArray = [];
            emailsDocs.forEach((doc)=>{
                const docData = doc.data();
                const { email } = docData;
                tempArray.push(String(email).toLocaleLowerCase());
            });

            setExistingEmails([...tempArray]);
        }

        fetchEmails();
    }, []);

    useEffect(() => {
        if (walletAddress !== '') {
            fetchCredentialsWatch();
        }
    }, [walletAddress]);

    const proceedHandler = () => {
        if (!proceeding) {
            if (accountExist) {
                setProceeding(true);
                if (!accountVerified) {
                    createSession(walletAddress, false);
                    setTimeout(() => {
                        verifyRef.current.click();
                    }, 200);
                } else {
                    createSession(walletAddress, true);
                    setTimeout(() => {
                        contRef.current.click();
                    }, 200);
                }
            } else {
                return;
            }
        }
    }

    const connectWatch = () => {
        if (!connecting) {
            const promise = connectWallet();
            toast.promise(promise, {
                loading: "Connecting to Your Wallet",
                success: "Wallet is connected.",
                error: "An error occured!"
            });
        }
    }

    const fetchCredentialsWatch = ()=>{
        const promise = fetchCredentials();
        toast.promise(promise, {
            loading: "Checking for user in database...",
            success: "Check Complete.",
            error: "An error occured!"
        });
    }

    const createAccountWatch = ()=>{
        if (canProceed) {
            const promise = createAccountHandler();
            toast.promise(promise, {
                loading: "Creating an Account for you",
                success: "Your account has been created.",
                error: "An error occured!"
            });
        }
    }

    useEffect(() => {
        if (accountExist) {
            return;
        }

        if(emailText === ""){
            return;
        }

        if (!isValidEmail(emailText)) {
            setHasError({...hasError, email:2});
            return;
        }

        if (existingEmails.includes(String(emailText).toLocaleLowerCase())) {
            setHasError({...hasError, email:2});
            setErrorMessage([...errorMessage, {msg:"This email is already registered with Us.", key: Math.random().toString(36).substring(2, 10)}]);
            return;
        }

        setHasError({...hasError, email:1});

    }, [debounceEmailText]);

    useEffect(() => {
        const lenName = (nameText).split(' ');
        if (accountExist) {
            return;
        }

        if (nameText === "") {
            setHasError({ ...hasError, name: 0 });
            return;
        }

        if (lenName.length < 2 || String(lenName[lenName.length-1]).length < 3) {
            setHasError({ ...hasError, name: 2 });
            setErrorMessage([...errorMessage, {msg:"Please enter your Fullname.", key: Math.random().toString(36).substring(2, 10)}]);
            return;
        }
        
        setHasError({ ...hasError, name: 1 });
    }, [debounceNameText]);

    useEffect(() => {
        function noErrorFound() {
            return Object.values(hasError).every(value => value === 1);
        }

        if (noErrorFound() && agreedToTerm) {
            setCanProceed(true);
            return;
        }
        setCanProceed(false);
    }, [hasError, agreedToTerm]);

    return (
        <section className="formPart">      
        {viewingTerms && <Terms closeFunction={setViewingTerms}/>}
            <a href="https://offrcloud.com" target='_blank' className="mbOnly">
                <img src="https://gineousc.sirv.com/Images/coin-main.png" alt="offrcloud ico" />
                <span>OffrCloud</span>
            </a>
            <section>
                <div className="title">
                    {!connected && "Connect your wallet"}
                    {connected && accountExist && `Welcome Back, ${nameText.split(" ")[1]}`}
                    {connected && !accountExist && `Create an account`}
                </div>
                <div className="p-center">
                    {!connected && <span>To begin accessing the Dapp&apos;s features, securely connect your wallet for seamless login.</span> }
                    {connected && accountExist && accountVerified && <span>Continue to your dashboard</span> }
                    {connected && accountExist && !accountVerified && <span>We&apos;ve sent verification email to your address, please verify your account to get access to your dashboard</span> }
                    {connected && !accountExist && <span>Signup with us to join the OffrCloud community.</span> }
                </div>
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
                    <div className={`form-g ${hasError.email === 2 && 'err'}`}>
                        <label>Email:</label>
                        <input type="email" name='email' disabled={accountExist} ref={emailRef} value={emailText} onChange={e => setEmailText(e.target.value)} autoComplete='on' className="inp" placeholder='Enter email address' />
                    </div>
                    <div className={`form-g ${hasError.name === 2 && 'err'}`}>
                        <label>Full Name:</label>
                        <input type="Text" className="inp" disabled={accountExist} ref={nameRef} value={nameText} onChange={e => setNameText(e.target.value)} name='name' placeholder="What's your name?" />
                    </div>
                    <div className={`form-g ${hasError.agree === 2 && 'err'}`}>
                        <br />
                        <div className="r">
                            <input type="checkbox" disabled={accountExist} ref={checkBoxRef} onChange={()=>setAgreedToTerms(checkBoxRef.current.checked)}  />
                            <div className="p"> <span onClick={() => checkBoxRef.current.click()}>I agree to OffrToken's </span><span className='url' onClick={()=>setViewingTerms(true)}>Terms & Conditions</span></div>
                        </div>
                        <br />
                        {!accountExist && <div className={`${canProceed ? "btnx" : "disabledBtn"}`} onClick={createAccountWatch}>
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
            <div className="errHanger">
                {errorMessage.length > 0 && errorMessage.map(i => (
                    <ErrSection key={i.key} keyValue={i.key} errorMessage={i.msg} clean={setErrorMessage} cleanData={errorMessage} />
                ))}
            </div>
            <Link to={"/dashboard"} ref={contRef} style={{ display: 'none' }} >to Dashboard</Link>
            <Link to={"/verify"} ref={verifyRef} style={{ display: 'none' }} >to Verfication</Link>
        </section>
    )
}

export default FormPart;
import React, { useEffect, useState } from 'react';
import { isSessionSet } from '../../useful/useful_tool';
import { fireStore } from '../../firebase/sdk';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const VerifyEmail = () => {
    const [verificationToken, setVerifiactionToken] = useState("");
    const [userWalletAddr, setUserWalletAddr] = useState('');
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        status: false,
    });

    const [verifyState, setVerifyState] = useState(0);

    const fetchUserData = async (addr) => {
        const dataRef = doc(fireStore, "user_credentials", `${addr}`);
        try {

            const docSnap = await getDoc(dataRef);

            if (docSnap.exists()) {
                const userInfo = docSnap.data();
                const { name, emailstatus, email } = userInfo;

                setUserData({
                    name,
                    email,
                    status: emailstatus,
                });

                if (!emailstatus) {
                    setVerifyState(0);
                }else{
                    setVerifyState(1);
                }
            } else {
                throw new Error("Wallet doesn't Exist in Database!");
            }
        }catch (error){
            throw Error(error);
        }
    }

    const fetchTokenData = async (token) => {
        const dataRef = doc(fireStore, "email_authetication", `${token}`);
        try {
            const tokenSnap = await getDoc(dataRef);

            if (tokenSnap.exists()) {
                
                
                const tokenInfo = tokenSnap.data();
                const { status, user, email, name } = tokenInfo;

                setUserData({
                    email: email,
                    name: name,
                });
                
                if (!status) {
                    const userInfoRef = doc(fireStore, "user_credentials", `${user}`);
                    
                    const userRef = collection(fireStore, "user_credentials");
                    const tokenRef = collection(fireStore, "email_authetication");
                    
                    const docSnap = await getDoc(userInfoRef);
                    
                    if (docSnap.exists()) {
                        const userInfo = docSnap.data();
                        
                        const updatedInfo = ({...userInfo, emailstatus: true});
                        const updatedInfoToken = ({...tokenInfo, status: true});
                        
                        await setDoc(doc(userRef, `${user}`), updatedInfo);
                        await setDoc(doc(tokenRef, `${token}`), updatedInfoToken);
                        setVerifyState(1);
                    }
            }else{
                setVerifyState(1); 
            }

            } else {
                setVerifyState(2);
                throw ("Invalid Token!");
            }
        }catch (error){
            throw Error(error);
        }
    }

    useEffect(() => {
        if (userWalletAddr !== "") {
            const userAddr = String(userWalletAddr).toLocaleLowerCase();
            fetchUserData(userAddr);
        }

        const foundToken = verificationToken;
        if (foundToken !== null) {
            fetchTokenData(foundToken);
        }
    }, [verificationToken, userWalletAddr, userData]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        setVerifiactionToken(token);

        if (token === null) {
            if (isSessionSet()) {
                const loginSession = JSON.parse(localStorage.getItem('loginSession'));
                const emailStatus = loginSession.status;
                const userWallet = String(loginSession.username).toLocaleLowerCase();

                setUserWalletAddr(userWallet);

                if (emailStatus) {
                    window.location = "/dashboard";
                }
            } else {
                window.location = "/";
            }
        }
    }, []);

    return (
        <div className="login verify">
            <main>
                <section className="verify">
                    <div className="img">
                        {verifyState === 0 && <img src="https://gineousc.sirv.com/Images/icons/undraw_mail_sent_re_0ofv.svg" alt="icon" />}
                        {verifyState === 1 && <img src="https://gineousc.sirv.com/Images/icons/undraw_completing_re_i7ap.svg" alt="icon" />}
                        {verifyState === 2 && <img src="https://gineousc.sirv.com/Images/icons/undraw_page_not_found_re_e9o6.svg" alt="icon" />}
                    </div>

                    {verifyState === 0 && <div className="h1">Pending Email verification</div>}
                    {verifyState === 1 && <div className="h1">Email Verified</div>}
                    {verifyState === 2 && <div className="h1">Invalid Token</div>}

                    {verifyState === 0 && <div className="p">
                        We've sent an Email to {<span className="url">{userData?.email}</span>}, Please go to your email and follow the steps to verify your email address to proceed to the Dashboard.
                    </div>}
                    {verifyState === 2 && <div className="p">
                        You've followed an Invalid Email verification Link, Please endavour follow the link sent to your email.
                    </div>}
                    {verifyState === 1 && <div className="p">
                        {<span className="url">{userData?.email}</span>}
                    </div>}
                    {verifyState === 1 && <Link to={"/"} className='btnx'>Login</Link>}
                    {verifyState === 0 && <div className="loading">
                        <img src="https://gineousc.sirv.com/Images/sp.gif" alt="loading gif" />
                    </div>}
                </section>
            </main>
        </div>
    )
}

export default VerifyEmail;

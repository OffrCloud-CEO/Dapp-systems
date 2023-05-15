import React, { useEffect, useState } from 'react';
import { createSession, isSessionSet } from '../../useful/useful_tool';
import { fireStore } from '../../firebase/sdk';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const VerifyEmail = () => {
    const [verifiactionToken, setVerifiactionToken] = useState("");
    const [userWalletAddr, setUserWalletAddr] = useState('');
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        status: false,
    });

    const [isValidToken, setIsValidToken] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        setVerifiactionToken(token);
    }, []);

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
            } else {
                throw ("Wallet doesn't Exist in Database!");
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
                const { status, user } = tokenInfo;

                if (!status) {
                    const userInfoRef = doc(fireStore, "user_credentials", `${user}`);
                    const userRef = collection(fireStore, "user_credentials");
                    const tokenRef = collection(fireStore, "email_authetication");
                    const docSnap = await getDoc(userInfoRef);

                    if (docSnap.exists()) {
                        setIsValidToken(true);
                        const userInfo = docSnap.data();

                        const updatedInfo = ({...userInfo, emailstatus: true});
                        const updatedInfoToken = ({...tokenInfo, status: true});

                        await setDoc(doc(userRef, `${user}`), updatedInfo);
                        await setDoc(doc(tokenRef, `${token}`), updatedInfoToken);
                    }
        
                    
                }

            } else {
                setIsValidToken(false);
                throw ("Invalid Token! 02");
            }
        }catch (error){
            throw Error(error);
        }
    }

    useEffect(() => {
        if (userWalletAddr !== "") {
            const foundToken = verifiactionToken;
            const userAddr = String(userWalletAddr).toLocaleLowerCase();
            fetchUserData(userAddr);

            if (foundToken !== null && userData.email !== '') {
                fetchTokenData(foundToken, userAddr);
            }
        }

    }, [verifiactionToken, userWalletAddr, userData]);

    useEffect(() => {
        if (isSessionSet()) {
            const loginSession = JSON.parse(localStorage.getItem('loginSession'));
            const emailStatus = loginSession.status;
            const userWallet = loginSession.username;

            setUserWalletAddr(userWallet);
            
            if (emailStatus) {
                window.location = "/dashboard";
            }
        }else{
            window.location = "/";
        }
    }, []);

    return (
        <div className="login">
            <main>
                <section className="verify">
                    <div className="img">
                        {!userData.status && verifiactionToken === null && <img src="https://gineousc.sirv.com/Images/icons/undraw_mail_sent_re_0ofv.svg" alt="icon" />}
                        {userData.status && <img src="https://gineousc.sirv.com/Images/icons/undraw_completing_re_i7ap.svg" alt="icon" />}
                        {!isValidToken && verifiactionToken !== null && <img src="https://gineousc.sirv.com/Images/icons/undraw_page_not_found_re_e9o6.svg" alt="icon" />}
                    </div>

                    {!userData.status && verifiactionToken === null && <div className="h1">Pending Email verification</div>}
                    {userData.status && <div className="h1">Email Verified</div>}
                    {!isValidToken && verifiactionToken !== null && <div className="h1">Invalid Token</div>}

                    {!userData.status && verifiactionToken === null && <div className="p">
                        We've sent an Email to {<span className="url">{userData?.email}</span>}, Please go to your email and follow the steps to verify your email address to proceed to the Dashboard.
                    </div>}
                    {!isValidToken && verifiactionToken !== null && <div className="p">
                        You've followed an Invalid Email verification Link.
                    </div>}
                    {userData.status && <div className="p">
                        {<span className="url">{userData?.email}</span>}
                    </div>}
                    {userData.status && <Link to={"/"} className='btnx'>Login</Link>}
                    {!userData.status && verifiactionToken === null && <div className="loading">
                        <img src="https://gineousc.sirv.com/Images/sp.gif" alt="loading gif" />
                    </div>}
                </section>
            </main>
        </div>
    )
}

export default VerifyEmail;

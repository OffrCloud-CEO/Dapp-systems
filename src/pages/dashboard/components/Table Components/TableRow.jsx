import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom"
import ImageViewer from './ImageViewer';
import { fireStore } from '../../../../firebase/sdk';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import { tokenABI, tokenAddress } from '../../../../util/constants/tokenContract';

const TableRow = ({ fullname, userId, docType, status, documents, sn, documentFiles }) => {

    const [options, setOptions] = useState(false);
    const [viewingImage, setViewingImage] = useState(false);
    const [viewImage, setViewImage] = useState(false);
    const [userWallet, setUserWallet] = useState('');
    const [userData, setUserData] = useState(null);
    const ref = useRef();
    const navigate = useNavigate();

    const fetchUserKycDetails = async() =>{
        const userRef = collection(fireStore, "kycApplications");
        const kycArray = await getDocs(userRef);

        kycArray.forEach(element => {
            const { id } = element;
            const data = element.data();

            if (data.user === userId) {
                setUserWallet(id);
                setUserData(data);
            }
        });
    }

    useEffect(()=>{
        fetchUserKycDetails();
    }, []);

    const addToKycListOnBlockchain = async() =>{
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();

            const token = new ethers.Contract(tokenAddress, tokenABI, signer);

            const isKYCed = (await token.isKYCed(userWallet));

            if (!isKYCed) {
                const transaction = await token.addKYCUser(userWallet);

                await transaction.wait();
                return true;
            }
        } catch (error) {
            const reason = String(error.reason).slice(19);
            throw Error(`${reason}`);
        }
    }

    const approveKycHandler = async() =>{
        if (userData !== null && String(status).toLowerCase() !== 'verified') {
            try {
                const today = new Date();
                const verificationTime = `${today.toLocaleDateString()} ${today.toLocaleTimeString()}`;

                const userRef = collection(fireStore, "kycApplications");
                const objectToUpdate = { ...userData, status: 1, verifiedOn: verificationTime };

                const addingProcess = await addToKycListOnBlockchain();
                if (addingProcess) {
                    await setDoc(doc(userRef, `${String(userWallet).toLocaleLowerCase()}`), objectToUpdate);
                }
            } catch (error) {
                console.log(error);
                throw Error(`This error Occurred: ${error}`);
            }
        }
    }
    
    const declineKycHandler = async() =>{
        if (userData !== null && String(status).toLowerCase() === 'pending') {
            try {
                const userRef = collection(fireStore, "kycApplications");
                const objectToUpdate = { ...userData, status: 2 };
    
                await setDoc(doc(userRef, `${String(userWallet).toLocaleLowerCase()}`), objectToUpdate);
            } catch (error) {
                throw Error(`This error occurred: ${error}`);
            }
        }else if(userData !== null && String(status).toLowerCase() === 'verified'){
            try {
                const userRef = collection(fireStore, "kycApplications");
                const objectToUpdate = { ...userData, status: 2 };
    
                const removingProcess = await removeFromKycList();
                
                if (removingProcess) {
                    await setDoc(doc(userRef, `${String(userWallet).toLocaleLowerCase()}`), objectToUpdate);
                }
            } catch (error) {
                throw Error(`This error occurred: ${error}`);
            }

        }
    }

    const removeFromKycList = async() =>{
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();

            const token = new ethers.Contract(tokenAddress, tokenABI, signer);

            const isKYCed = (await token.isKYCed(userWallet));

            if (isKYCed) {
                const transaction = await token.removeKYCUser(userWallet);

                await transaction.wait();
                return true;
            } else {
                throw Error(`Can not remove a wallet that doesn't have a kyc verification.`);
            }
        } catch (error) {
            const reason = String(error.reason).slice(19);
            throw Error(`${reason}`);
        }
    }

    function toastWatchApprove () {
        setOptions(false);
        const promise = approveKycHandler();
        toast.promise(promise, {
            loading: 'Approving KYC Application.',
            success: `${userId} has been Verified.`,
            error: 'An error occurred.'
        });
    }
    
    function toastWatchDecline () {
        setOptions(false);
        const promise = declineKycHandler();
        toast.promise(promise, {
            loading: 'Declining KYC Application.',
            success: `${userId} application was declined.`,
            error: 'An error occurred.'
        });
    }

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

    const viewImageHandler = (txt) => {
        setOptions(false);
        if (txt == "ID Back") {
            setViewingImage(true);
            setViewImage(documentFiles[0]);
        } else {
            setViewingImage(true);
            setViewImage(documentFiles[1]);
        }
    }

    const viewApplicationHandler = () =>{
        navigate(`${userId}`);
    }

    return (
        <tr className='tableRow'>
            <td>{sn + 1}</td>
            <td className='tableData'>
                <div className="infos">
                    <span>
                        {fullname}
                    </span>
                    <span>
                        {userId}
                    </span>
                </div>
            </td>
            <td className='tableData'>{docType}</td>
            <td className='tableData'>
                <div className="docs">
                    {documents.map(d => (
                        <div key={d} className="doc" onClick={() => viewImageHandler(d)}>{d} <img src="https://gineousc.sirv.com/Images/icons/icons8-vision-96.png" alt="" /></div>
                    ))}
                </div>
            </td>
            <td className={`tableData`}>
                <div className={`status ${String(status).toLowerCase()}`}>
                    {status}
                </div>
            </td>
            <td className='tableData' ref={ref}>
                <div className="actionBtnx" onClick={() => setOptions(!options)}>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
                {viewingImage && <ImageViewer closeFunc={setViewingImage} imgUrl={viewImage} />}
                {options && <div className="control-div">
                    <li onClick={viewApplicationHandler}>View Application</li>
                    <li className={`${String(status).toLowerCase() === "verified" ? "inactive" : ''}`} onClick={toastWatchApprove}>Approve KYC</li>
                    <li onClick={() => viewImageHandler("ID Front")} className='mobileOnly'>ID Front</li>
                    <li onClick={() => viewImageHandler("ID Back")} className='mobileOnly'>ID Back</li>
                    <li className={`${String(status).toLowerCase() === "declined" ? "inactive" : ''}`} onClick={toastWatchDecline}>Decline KYC</li>
                </div>}
            </td>
        </tr>
    )
}

export default TableRow;
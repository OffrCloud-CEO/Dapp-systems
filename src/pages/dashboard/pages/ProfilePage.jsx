import React, { useContext, useEffect, useState } from 'react';
import GridCard from '../components/GridCard';
import { contextData } from '../dashboard';
import SectionProfile from './Profile Components/Section Profile';
import SectionKYC from './Profile Components/SectionKYC';
import { Toaster } from 'react-hot-toast';

export const profileContext = React.createContext();

const ProfilePage = ({pg}) => {
    const [currentPage, setCurrentPage] = useState(pg);
    const [walletAddress, setWalletAddress] = useState('');
    const [profileData, setProfileData] = useState(null);

    const { coinBase, storeDataUser, kycData } = useContext(contextData);

    const fetchProfileInformation = async () => {
        const {
            name,
            email,
            gender,
            dp,
            wallet_Address,
            date,
            displayname,
            emailstatus,
            dob,
            nationality,
            mobile,
            address,
            city,
            state,
            zipcode,
            kyc,
        } = storeDataUser;

        setProfileData({
            name,
            email,
            gender,
            profile_picture: dp,
            wallet_Address,
            date,
            displayname,
            emailstatus,
            dob,
            nationality,
            mobile,
            address,
            city,
            state,
            zipcode,
            kyc,
        });
    }

    

    useEffect(() => {
        if (coinBase !== null && storeDataUser !== null) {
            setWalletAddress(coinBase.coinbase);
        }
    }, [coinBase, storeDataUser]);

    useEffect(() => {
        if (walletAddress !== '') {
            fetchProfileInformation();
        }
    }, [walletAddress, storeDataUser, kycData]);

    return (
        <profileContext.Provider value={{ profileData, walletAddress, kycData }}>
            <div className="dash_section">
                <Toaster
                    toastOptions={{
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                    }}
                />
                <label>Profile Page</label>
                <div className="dash-row home">
                    <div className="div-3">
                        <GridCard ico={"https://gineousc.sirv.com/Images/icons/id-verified.png"} detail={kycData?.status === 0 ? `Pending` : kycData?.status === 1 ? `Verified`: kycData?.status === 2 ? 'Declined': 'Not Enrolled'} p={`KYC Status`} kyc={kycData?.status >= 0 ? kycData?.status : 2} />
                        <GridCard ico={"https://gineousc.sirv.com/Images/icons/sign-mail.png"} detail={`Verified`} p={`Email Verification`} kyc={1} />
                    </div>
                </div>
                <div className="tabs">
                    <div className="triggers">
                        <span className={`${currentPage === 0 && "active"}`} onClick={() => setCurrentPage(0)}>Profile Setting</span>
                        <span className={`${currentPage === 1 && "active"}`} onClick={() => setCurrentPage(1)}>
                            KYC Settings
                            {kycData && kycData.status === 1 && <img src="https://gineousc.sirv.com/Images/icons/verified-account--v1.png" alt="verified" />}
                        </span>
                    </div>
                    {currentPage == 0 && storeDataUser !== null &&  <SectionProfile />}
                    {currentPage == 1 && <SectionKYC />}
                </div>
            </div>
        </profileContext.Provider>
    )
}

export default ProfilePage;
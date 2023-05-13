import React, { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useContext } from 'react';
import { contextData } from '../dashboard';
import { Link, useLocation } from 'react-router-dom';
import { moneyFormat } from '../../../useful/useful_tool';

const UserCard = () => {
    const { showUserCard, setShowUserCard, storeDataUser, setLogOut, ethBalance, usdcBalance, kycData, dividendDate, dividendInitialInfo } = useContext(contextData);
    const [options, setOptions] = useState(false);
    const [user, setUser] = useState(null);
    const [isProfilePage, setIsProfilePage] = useState(false);
    const [divDate, setDivDate] = useState({
        mm: 0,
        dd: 0,
        yy: 0,
    })
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const location = useLocation();
    const cardRef = useRef();

    useEffect(() => {
        setOptions(showUserCard);
    }, [showUserCard]);

    useEffect(() => {
        if (String(location.pathname).includes("/dashboard/profile")) {
            setIsProfilePage(true);
        } else {
            setIsProfilePage(false);
        }

    }, [location.pathname]);

    useEffect(() => {
        if (storeDataUser !== null) {
            setUser(storeDataUser);
        }
    }, [storeDataUser]);

    useEffect(() => {
        if (dividendDate !== '') {

            const setDate = new Date(dividendDate);
            setDate.setTime(setDate.getTime() + (604800000));

            const today = new Date();

            if (setDate > today) {
                const dateTxt = dividendDate.split(' ')[0];
                const [month, day, year] = dateTxt.split('/');
                setDivDate({ mm: month, dd: day, yy: year });
            }
        }
    }, [dividendDate]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (cardRef.current && !cardRef.current.contains(event.target)) {
                setShowUserCard(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [cardRef]);


    return (
        <div className={`usercard ${options ? "show" : "hide"}`} ref={cardRef}>
            <div className="track">
                <div className="top">
                    KYC: {kycData?.status === 1 ? <img src="https://gineousc.sirv.com/Images/icons/verified-account--v1.png" alt="" /> : kycData?.status === 0 ? <img src="https://gineousc.sirv.com/Images/sp.gif" alt="" /> : "N/A"}
                </div>
                <div className="infocard br">
                    <Link to={"profile"} className="profile-circle">
                        <div className="img">
                            {user && <img src={user?.dp} alt="" />}
                            {!user && <img src="https://gineousc.sirv.com/Images/Infinite.gif" alt="" />}
                        </div>
                    </Link>
                    <div className="info">
                        <div className=""><strong>{user ? `@${user.displayname}` : "@username"}</strong></div>
                        <div className="bts">
                            {!isProfilePage && <Link to={"profile"} className='btnx'>View profile</Link>}
                            {isProfilePage && <Link to={""} className='btnx'>Dashboard</Link>}
                            <div className="btnx d" onClick={() => setLogOut(true)}>disconnect</div>
                        </div>
                    </div>
                </div>
                {kycData?.status === 0 && <div className="infocard">
                    <div className="pending">
                        <p>We have received your KYC application and it is currently awaiting verification.</p>

                        <p>We will review your application in a short time period and notify you of the outcome.</p>
                        <p>Thank you for your cooperation.</p>
                    </div>
                    <Link to={"profile/kyc"} className={`btnx kyc ${isProfilePage && "disable"}`}>view application</Link>
                </div>}

                {kycData === null && <div className="infocard">
                    <div className="notice">
                        <p>KYC verification is mandatory to buy and transfer tokens. please click on the button below to submit your ducments for KYC verification.</p>
                    </div>
                    <Link to={"profile/kyc"} className={`btnx kyc ${isProfilePage && "disable"}`}>submit KYC</Link>
                    <div className="s">*KYC required to buy tokens.</div>
                </div>}
                {kycData?.status === 2 && <div className="infocard">
                    <div className="title">Application Rejected</div>

                    <div className="notice">
                        <p>We regret to inform you that your KYC application has been rejected.
                            Please review your application and reapply as soon as possible.</p>
                    </div>
                    <Link to={"profile/kyc"} className={`btnx kyc ${isProfilePage && "disable"}`}>Re-Apply KYC</Link>
                    <div className="s">*Thank you for your cooperation.</div>
                </div>}
                <div className="infocard" data-hover={'$'}>
                    <div className="top">
                        <div className="card-ico us"><img src="https://gineousc.sirv.com/Images/icons/usd-coin-usdc-logo.svg" alt="" /></div>
                    </div>
                    <div className="details"><div>${Number(usdcBalance).toLocaleString()}</div></div>
                    <div className="p">Your USDC Balance</div>
                </div>
                <div className="infocard" data-hover={'Ξ'}>
                    <div className="top">
                        <div className="card-ico"><img src="https://gineousc.sirv.com/Images/icons/eth.png" alt="" /></div>
                    </div>
                    <div className="details">ETH {ethBalance !== null ? (Number(Number(ethBalance).toFixed(5)).toLocaleString()) : <img src="https://gineousc.sirv.com/Images/sp.gif" alt="" />}</div>
                    <div className="p">Your Eth Balance</div>
                </div>

                {divDate.yy > 0 && !dividendInitialInfo.status && <div className="infocard dateCard" data-hover={divDate.dd}>
                    <div className="date day">{divDate.dd}</div>
                    <div className="date month">{months[divDate.mm - 1]}</div>
                    <div className="date year">{divDate.yy}</div>
                    <div className="p">Dividend Period Starts</div>
                </div>}

                <div className="trigger" onClick={() => setShowUserCard(!showUserCard)}>
                    <img src="https://gineousc.sirv.com/Images/icons/angle-right.svg" alt="" />
                </div>
            </div>
        </div>
    )
}

export default UserCard;
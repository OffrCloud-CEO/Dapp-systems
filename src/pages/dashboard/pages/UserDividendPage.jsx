import React, { useContext, useEffect, useState } from 'react';
import { contextData } from '../dashboard';
import { formatNumFreeStyle, greetUser } from '../../../useful/useful_tool';
import GridCard from '../components/GridCard';
import TransactionHashs from '../components/TransactionHashs';
import DividendForm from './User Dividends Conponents/DividendForm';
import { ethers } from 'ethers';
import { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const UserDividendPage = () => {
    const { storeDataUser, lastBlockTime, claimableData, dividendSessionData, dividendInitialInfo, tokenBalance, rootData } = useContext(contextData);

    const [dividendPeriod, setIsDividendPeriod] = useState(false);
    const [percent, setPercent] = useState(0);
    const [session, setSessions] = useState(0);
    const [sessionsTotal, setSessionsTotal] = useState(0);
    const [tokenPrice, setTokenPrice] = useState(0);
    const [balance, setBalance] = useState(0);
    const [unclaimedDividends, setUnclaimedDividends] = useState(0);
    const [claimedDividends, setClaimedDividends] = useState(0);

    const [lastBlockTimestamp, setLastBlockTimestamp] = useState(0);
    const [futureDate, setFutureDate] = useState("");

    useEffect(() => {
        setLastBlockTimestamp(lastBlockTime);
    }, [lastBlockTime]);


    function getFutureDate() {
        if (dividendPeriod) {
            const interval = Number(dividendInitialInfo.interval) * (86400 * 1000);
            const today = new Date();
            const blockTime = new Date(lastBlockTimestamp);

            const future = new Date(blockTime.getTime() + (interval));
            const difference = Math.floor((today.getTime() - future) / 1000);

            const isFutureDate = (difference / 60) < -1440;

            let formattedDate;

            if (difference < 0) {
                if (isFutureDate) {
                    const month = future.toLocaleString('default', { month: 'short' });
                    const day = future.getDate();
                    const suffix = getDaySuffix(day);
                    formattedDate = `${month} ${day}${suffix}`;
                } else {
                    const hours = Math.floor((Math.abs(difference) / 60) / 60);
                    const minutes = Math.floor(Math.abs(difference) / 60) % 60;

                    formattedDate = `${hours}h ${minutes}mins`;
                }
            } else {
                formattedDate = `Now`;
            }

            setFutureDate(formattedDate);
        }
    }

    function getDaySuffix(day) {
        if (day === 1 || day === 21 || day === 31) {
            return 'st';
        } else if (day === 2 || day === 22) {
            return 'nd';
        } else if (day === 3 || day === 23) {
            return 'rd';
        } else {
            return 'th';
        }
    }

    useEffect(() => {
        getFutureDate();
    }, [lastBlockTimestamp, dividendInitialInfo, dividendPeriod]);


    useEffect(() => {
        const { claimable, withdrawn } = claimableData;
        const { paid, total } = dividendSessionData;
        const { status, percentValue } = dividendInitialInfo;
        setIsDividendPeriod(status);
        setPercent(percentValue);
        setSessions(paid);
        setSessionsTotal(total);
        setBalance(Number(tokenBalance) / (10 ** 18));
        setUnclaimedDividends(claimable);
        setClaimedDividends(withdrawn);
        setTokenPrice(rootData?.tokenPriceRates);
    }, [claimableData, dividendSessionData, dividendInitialInfo, tokenBalance, rootData]);

    return (
        <div className="dash_section">
            <Toaster
                toastOptions={{
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />
            <div className="greet">
                <div className="title">{greetUser()} {storeDataUser ? ((storeDataUser.displayname)) : "@firstname"}, </div>
                <div className="tags">
                    <Link to={"/dashboard/profile"} className="img">
                        {storeDataUser && <img src={storeDataUser?.dp} alt="" />}
                        {!storeDataUser && <img src="https://gineousc.sirv.com/Images/Infinite.gif" alt="" />}
                    </Link>
                </div>
            </div>
            <label> My Dividends </label>
            <div className="dash-row home">
                <div className="div-4">
                    <GridCard ico={"https://gineousc.sirv.com/Images/icons/money%20(2).svg"} detail={dividendPeriod ? `Active` : "Not active"} p={`Dividends Period`} type={dividendPeriod ? "status" : ''} />
                    <GridCard ico={"https://gineousc.sirv.com/Images/icons/percentage.png"} detail={percent > 0 ? `${((percent / 1000))}%` : "---"} p={`Percent per session`} />
                    <div className='kard'>
                        <div className="tag">Session(s)<img src="https://gineousc.sirv.com/Images/icons/external-fraction-math-vol-1-outline-outline-black-m-oki-orlando.png" alt="" /></div>
                        <div className="value">
                            {percent > 0 ? <div className="hang" data-hang={`of ${sessionsTotal}`}>
                                {session}
                            </div> : "---"}
                        </div>
                    </div>
                    {sessionsTotal > session && <GridCard ico={"https://gineousc.sirv.com/Images/icons/coin-in-hand--v2.png"} detail={percent > 0 ? `${futureDate}` : "---"} p={`Next session`} />}
                </div>
                <div className="div-3">
                    <GridCard ico={"https://gineousc.sirv.com/Images/icons/money%20(2).svg"} detail={`${percent > 0 ? `$${formatNumFreeStyle((balance * (1 / tokenPrice)) * ((percent / 1000) / 100))}` : "---"}`} p={`My Dividends Per Session`} />
                    <GridCard ico={"https://gineousc.sirv.com/Images/icons/money%20(2).svg"} detail={unclaimedDividends > 0 ? `$${formatNumFreeStyle(unclaimedDividends / (10 ** 18))}` : "---"} p={`Unclaimed Dividends`} />
                    <GridCard ico={"https://gineousc.sirv.com/Images/icons/money%20(2).svg"} detail={claimedDividends > 0 ? `$${formatNumFreeStyle(claimedDividends / (10 ** 18))}` : "---"} p={`Claimed Dividends`} />
                </div>

                <div className="form-divs">
                    {unclaimedDividends > 0 && <DividendForm defaultValue={ethers.utils.formatEther(unclaimedDividends)} type={0} status={unclaimedDividends > 0} />}
                    <DividendForm type={1} />
                    <DividendForm type={2} />
                </div>

                <div className="info-tab">
                    <div className="information">
                        <TransactionHashs maxL={5} methods={[8, 3]} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserDividendPage;
import React from 'react';
import { useContext } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navdata } from './navArea';
import { contextData } from '../dashboard';
import { fireStore } from '../../../firebase/sdk';
import { collection, onSnapshot } from 'firebase/firestore';
import { ethers } from 'ethers';

const NavBar = () => {
  const { expand } =  useContext(navdata);
  const location = useLocation();
  const { rootData, kycVerified, tokenBalance, claimableData, dividendInitialInfo } = useContext(contextData);
  const [navPosition, setNavPosition]= useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingKyc, setPendingKyc] = useState(0);
  const [pendingDividend, setPendingDividend] = useState(0);
  
  useEffect(()=>{
    const id = location.pathname;

    switch (String(id).toLowerCase()) {
      case "/dashboard":
        setNavPosition(0);
        break;
      case "/dashboard/wallet":
        setNavPosition(1);
        break;
      case "/dashboard/owner":
        setNavPosition(3);
        break;
      case "/dashboard/dividend":
        setNavPosition(4);
        break;
      case "/dashboard/batch%20history":
        setNavPosition(2);
        break;
      case "/dashboard/profile":
        setNavPosition(5);
        break;
      case "/dashboard/kyc":
        setNavPosition(6);
        break;
      case "/dashboard/profile/kyc":
        setNavPosition(5);
        break;
      case "/dashboard/mydividend":
        setNavPosition(8);
        break;
    
      default:
        setNavPosition(6);
        break;
    }
  }, [location]);

  useEffect(()=>{
    if (rootData.cap !== null) {
      setIsAdmin(rootData.isOwner);
    }
  }, [rootData]);

  useEffect(()=>{
    const { percentValue } = dividendInitialInfo;
    const { claimable } = claimableData;
    
    const divdendPerSessionValue = (Number(ethers.utils.formatEther(tokenBalance)) * percentValue ) / (100000) ;
    setPendingDividend(Math.round(Number(ethers.utils.formatEther(claimable))/divdendPerSessionValue));

  }, [tokenBalance, claimableData, dividendInitialInfo]);

  const listenForKycApplications = async() =>{
    const collectionSnap = collection(fireStore, "kycApplications");

    onSnapshot(collectionSnap, (snap) => {
      const collection = snap.docs;
      let counter = 0;
      if (collection !== null) {
        collection.forEach(element => {
          if ((element.data()).status === 0) {
            counter++;
          }
        });
        setPendingKyc(counter);
      }
    });
  }



  useEffect(()=>{
    listenForKycApplications();
  }, []);

  return (
    <div className={`navBar ${expand === 3 && "open"} ${expand === 2 && ""} ${expand === 1 && "hide"}`}>
      <section className='logo'><img src="https://gineousc.sirv.com/Images/loader-ico.png" alt="" /></section>
      <section>
        <Link className='navTag' to={"/dashboard"}>
          <div onClick={() => setNavPosition(0)} data-text={'overview'} className={`navTag ${navPosition === 0 && 'active'}`}>
            <img src="https://gineousc.sirv.com/Images/icons/home.svg" alt="Overview" />
            {expand === 3 && <span className="txt" data-name={"Overview"}>overview</span>}
          </div>
        </Link>

        <Link className='navTag' to={"/dashboard/wallet"}><div onClick={()=>setNavPosition(1)} data-text={'Token Sale'} className={`navTag ${navPosition === 1 && 'active'}`}><img src="https://gineousc.sirv.com/Images/icons/usd-circle.svg" alt="Token Sale" /> {expand === 3 && <span className="txt" data-name={"OFFR"}>Buy OFFR</span>}</div></Link>

        {kycVerified && <Link className='navTag' to={"/dashboard/mydividend"}>
          <div onClick={() => setNavPosition(8)} data-text={'My Dividends'} className={`navTag ${navPosition === 8 && 'active'}`}>
            <img src="https://gineousc.sirv.com/Images/icons/sales-balance-1.png" alt="Token Sale" />
            {pendingDividend > 0 && <div className="tag">
              {pendingDividend > 5 ? "5+" : pendingDividend}
            </div>}
          </div>
        </Link>}

        {isAdmin && <Link className='navTag' to={"/dashboard/owner"}><div onClick={()=>setNavPosition(3)} data-text={'Token Management'} className={`navTag ${navPosition === 3 && 'active'}`}><img src="https://gineousc.sirv.com/Images/icons/mgt.png" alt="Token Management" /> {expand === 3 && <span className="txt" data-name={"transactions"}>transactions</span>}</div></Link>}
        {isAdmin && <Link className='navTag' to={"/dashboard/dividend"}><div onClick={()=>setNavPosition(4)} data-text={'Dividend Management'} className={`navTag ${navPosition === 4 && 'active'}`}><img src="https://gineousc.sirv.com/Images/icons/div2.png" alt="dividend" /> {expand === 3 && <span className="txt" data-name={"Dividend"}>Dividend</span>}</div></Link>}
        {isAdmin && <Link className='navTag' to={"/dashboard/kyc"}><div onClick={()=>setNavPosition(4)} data-text={'KYC Management'} className={`navTag ${navPosition === 6 && 'active'}`}>
          <img src="https://gineousc.sirv.com/Images/icons/external-ic_biometric_kyc-crypto-security-outline-lafs.png" alt="KYC" />
          {pendingKyc > 0 && <div className="tag">
            {pendingKyc > 5 ? "5+" : pendingKyc}
          </div>}
        </div></Link>}
      </section>

      <section>
        <Link className='navTag' to={"/dashboard/profile"}><div onClick={()=>setNavPosition(5)} data-text={'Profile'} className={`setting ${navPosition === 5 && 'active'}`}><img src="https://gineousc.sirv.com/Images/icons/user.svg" alt="profile" /> {expand === 3 && <span className="txt">Profile</span>}</div></Link>
        {isAdmin && <Link className='navTag' to={"/dashboard/batch history"}><div onClick={()=>setNavPosition(2)} data-text={'Batch History'} className={`navTag ${navPosition === 2 && 'active'}`}><img src="https://gineousc.sirv.com/Images/icons/list-alt.svg" alt="Batch History" /> {expand === 3 && <span className="txt" data-name={"transactions"}>transactions</span>}</div></Link>}
      </section>
    </div>
  )
}

export default NavBar;
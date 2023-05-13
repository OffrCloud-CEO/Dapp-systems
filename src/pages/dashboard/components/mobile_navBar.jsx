import React, { useContext, useEffect } from 'react';
import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { contextData } from '../dashboard';
import { ethers } from 'ethers';
import { collection, onSnapshot } from 'firebase/firestore';
import { fireStore } from '../../../firebase/sdk';

const Mobile_navBar = () => {
    const [navPosition, setNavPosition] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { rootData, kycVerified, tokenBalance, claimableData, dividendInitialInfo } = useContext(contextData);
    const [isAdmin, setIsAdmin] = useState(false);
    const [pendingKyc, setPendingKyc] = useState(0);
    const [pendingDividend, setPendingDividend] = useState(0);
  
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
      setIsOpen(false);
    }, [navPosition]);

    
    return (
        <div className={`mbNav ${isOpen ? "open" : ''}`}>
            <div className="case">
              <Link to={"/dashboard"} className={`ball ${navPosition === 0 && 'active'}`}>
                <div className="div">
                  <div className="data-tip">Overview</div>
                  <img src="https://gineousc.sirv.com/Images/icons/home.svg" alt="" />
                </div>
              </Link>
              <Link to={"/dashboard/wallet"} className={`ball ${navPosition === 1 && 'active'}`}>
                <div className="div">
                  <div className="data-tip">Token sale</div>
                  <img src="https://gineousc.sirv.com/Images/icons/usd-circle.svg" alt="" />
                </div>
              </Link>
              {kycVerified && <Link to={"/dashboard/mydividend"} className={`ball ${navPosition === 8 && 'active'}`}>
                <div className="div">
                  <div className="data-tip">My Dividends</div>
                  <img src="https://gineousc.sirv.com/Images/icons/sales-balance-1.png" alt="" />
                </div>
              </Link>}
              {isAdmin && <Link to={"/dashboard/owner"} className={`ball ${navPosition === 3 && 'active'}`}>
                <div className="div">
                  <div className="data-tip">Token Admin</div>
                  <img src="https://gineousc.sirv.com/Images/icons/mgt.png" alt="" />
                </div>
              </Link>}
              {isAdmin && <Link to={"/dashboard/dividend"} className={`ball ${navPosition === 4 && 'active'}`}>
                <div className="div">
                  <div className="data-tip">Dividends Admin</div>
                  <img src="https://gineousc.sirv.com/Images/icons/div2.png" alt="" />
                </div>
              </Link>}
              {isAdmin && <Link to={"/dashboard/kyc"} className={`ball ${navPosition === 6 && 'active'}`}>
                <div className="div">
                  <div className="data-tip">KYC Admin</div>
                  <img src="https://gineousc.sirv.com/Images/icons/external-ic_biometric_kyc-crypto-security-outline-lafs.png" alt="" />
                </div>
              </Link>}
              <Link to={"/dashboard/profile"} className={`ball ${navPosition === 5 && 'active'}`}>
                <div className="div">
                  <div className="data-tip">Profile</div>
                  <img src="https://gineousc.sirv.com/Images/icons/user.svg" alt="" />
                </div>
              </Link>
              {isAdmin && <Link to={"/dashboard/batch history"} className={`ball ${navPosition === 2 && 'active'}`}>
                <div className="div">
                  <div className="data-tip">Batch History</div>
                  <img src="https://gineousc.sirv.com/Images/icons/list-alt.svg" alt="" />
                </div>
              </Link>}
            </div>
            <div className="trigger" onClick={()=>setIsOpen(!isOpen)}>
              <div></div>
              <div></div>
              <div></div>
            </div>
        </div>
    )
}

export default Mobile_navBar;
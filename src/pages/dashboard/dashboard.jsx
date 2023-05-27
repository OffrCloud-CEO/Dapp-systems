import { collection, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { fireStore } from '../../firebase/sdk';
import { bigNum, destroySession, disconnectWallet, isSessionSet } from '../../useful/useful_tool';
import getContract from '../../util/getContract';
import Mobile_navBar from './components/mobile_navBar';
import NavArea from './components/navArea';
import UserCard from './components/userCard';
import HomePage from './pages/Home';
import Settings from './pages/Settings';
import Wallet from './pages/Wallet';
import Owner from './pages/Owner';
import DividendManagement from './pages/Dividend Management';
import SaleBatches from './pages/SaleBatches';
import { ethers } from 'ethers';
import { tokenSaleABI, tokenSaleAddress } from '../../util/constants/tokenSaleContract';
import ProfilePage from './pages/ProfilePage';
import { tokenABI, tokenAddress } from '../../util/constants/tokenContract';
import { dividendManagementABI, dividendManagementAddress } from '../../util/constants/tokenDividendManagement';
import { usdcABI, usdcAddress } from '../../util/constants/usdcContract';
import KycManagament from './pages/KycManagament';
import KycPreview from './pages/KycPreview';
import UserDividendPage from './pages/UserDividendPage';

export const contextData = React.createContext();

const Dashboard = () => {
  const [storeDataUser, setStoreDataUser] = useState(null);
  const [coinBase, setCoinbase] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [contract, setContract] = useState(null);
  const [logOut, setLogOut] = useState(false);
  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminConnected, setAdminConnected] =useState(true);
  const [myWalletAddress, setMyWalletAddress] = useState("");
  const [showUserCard, setShowUserCard] = useState(false);
  const [errorMessage, setErrorMessage]= useState("");

  // Live Token Data Management Variables
  const [dividendDate, setDividendDate] = useState('');
  const [ethBalance, setEthBalance] = useState(null);
  const [lastBlockTime, setLastBlockTime] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [tokenBalance, setTokenBalnce] = useState(0);
  const [totalSupplyBalance, setTotalSupplyBalance] = useState(0);
  const [tokenSaleInfo, setTokenSaleInfo] = useState({
    batchName: '',
    status: false,
    startDateTxt: '',
    endDateTxt: ''
  });
  const [kycDataList, setKycDataList] = useState([]);
  const [dividendInitialInfo, setDividendInitialInfo] = useState({
    status: false,
    interval: 0,
    period: 0,
    percentValue: 0,
  });
  const [kycVerified, setKycVerified] = useState(false);
  const [dividendSessionData, setDividendSessionData]= useState({
    paid: 0,
    total: 0
  });
  const [soldValue, setSoldValue] = useState(0);
  const [contractUsdcBalance, setContractUsdcBalance] = useState(0);
  const [dividendUsdcBalance, setDividendUsdcBalance] = useState(0);
  const [claimableData, setClaimableData] = useState({
    claimable: 0,
    withdrawn: 0
  });

  // Static Token Data Management
  const [rootData, setRootData] = useState({
    batchName: null,
    KYC: null,
    sold: null,
    contractUSDC: null,
    startDate: null,
    endDate: null,
    totalSupply: null,
    name: null,
    symbol: null,
    decimals: null,
    beneficiaryAddress: null,
    contractAdress: null,
    myBalance: null,
    cap: null,
    isSaleOpen: null,
    isKycVerified: null,
    isDividendPeriod: null,
    divPeriod: null,
    divInterval: null,
    divIntervalCount: null,
    divCount: null,
    divPercent: null,
    divPeriodValue: null,
    divIntervalValue: null,
    divIntervalCountValue: null,
    divCountValue: null,
    claimableDividendsOf: null,
    claimedDividendsOf: null,
    tokenPriceRates: null,
  });
  
  const [kycData, setKycData] = useState(null);

  /**
   * ConnectWallet() is a function that calls getContract() and getWeb3() and then sets the state of
   * contract and coinbase.
   */
  const connectWallet = async () => {
    const fetchContracts = getContract; 
    fetchContracts.then(i => setContract(i));

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = await provider.getSigner();
      const user = await signer.getAddress();
      
      setCoinbase({coinbase: user});
      
    } catch (error) {

      console.log(error)
      throw Error(error)
    }
  }

  /**
   * This function fetches all the documents in the collection 'Token_Sale_Batches' and then checks if
   * the status of the document is true, if it is, it sets the data of the document to the state
   * 'batchData'.
   */
  const fetchActiveSalesBatch = async() =>{
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();

    const tokenHandler = new ethers.Contract(tokenSaleAddress, tokenSaleABI, signer);
    const tokenBatchName = await tokenHandler.getTokenBatchName();
    const collectionSnap = await getDocs(collection(fireStore, "Token_Sale_Batches"));
    
    collectionSnap.forEach(element => {
      const data = element.data();
      const batchName = data.batch_name;

      if (batchName === tokenBatchName) {
        setBatchData(data);
      }
    });
  }

  /**
   * It takes a new sale value, gets the collection of batches, and then updates the sold value of the
   * batch that matches the batch name of the new sale.
   * </code>
   */
  const updateTokenSoldToBatchData = async(newSale) =>{
    try {
      const userRef = collection(fireStore, `Token_Sale_Batches`);
      const collectionSnap = await getDocs(userRef);

      /* Updating the sold value of the document in the collection. */
      collectionSnap.forEach(async (snap) => {
        const data = snap.data()

        if (data.batch_name === batchData.batch_name) {
          const obj = data;
          const soldValue = Number(Number(data.sold) + Number(newSale));
          const adjustObj = { ...obj, sold: soldValue };
          await setDoc(doc(userRef, `${snap.id}`), adjustObj);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * It fetches user data from firestore and returns it.
   * </code>
   * @returns An object with the following properties: email, name, gender, dp
   */
  const fetchCredentials = async (e) => {
    try {

      const docRef = doc(fireStore, "user_credentials", `${e}`);
      const docSnap = await getDoc(docRef);
      onSnapshot(docRef, (docSnapy) => {
        const asycData = docSnapy.data();
        
        if (asycData !== undefined) {
          const {
            name,
            email,
            gender,
            profile_picture,
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
          } = asycData;

          const data = {
            email: email,
            name: name,
            gender: gender,
            dp: profile_picture,
            created: date,
            wallet_Address,
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
          }



          setStoreDataUser(data);

        }

      });

      if (docSnap.exists()) {
        const userInfo = docSnap.data();
        const {
          name,
          email,
          gender,
          profile_picture,
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
          kyc
        } = userInfo;

        const data = {
          email: email,
          name: name,
          gender: gender,
          dp: profile_picture,
          created: date,
          wallet_Address,
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
        }

        setStoreDataUser(data);
      }
    } catch (error) {
      const reason = error.message ? `${error.message}` : "Error: something went wrong!";
      setErrorMessage(reason);
      throw Error(error);
    }
  }

  const fetchKycData = async () => {
    const docRef = collection(fireStore, "kycApplications");
    const docRefDate = doc(fireStore, "DividendStartDate", `${tokenAddress}`);

    onSnapshot(docRef, (kyc) => {
      kyc.forEach(snap => {
        if (snap !== undefined && String(snap.id).toLowerCase() === String(coinBase?.coinbase).toLowerCase()) {
          const {
            fullname,
            email,
            city,
            state,
            zipcode,
            mobile,
            address,
            country,
            docType,
            frontImgUrl,
            backImgUrl,
            status,
            user,
            submitDate,
            checkedDate,
          } = snap.data();

          setKycData({
            fullname,
            email,
            city,
            state,
            zipcode,
            mobile,
            address,
            country,
            docType,
            frontImgUrl,
            backImgUrl,
            status,
            user,
            submitDate,
            checkedDate
          });
        }
      });
    });

    onSnapshot(docRefDate, (date) => {
      if (date.data() !== undefined) {
        const { dividendDate } = date.data();
        setDividendDate(dividendDate);
      }
    });
  }

  function formatDate(date) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    const monthName = months[monthIndex];

    return `${day} ${monthName}, ${year}`;
  }

  const fetchTokenInformation = async() =>{
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = await provider.getSigner();
      const user = await signer.getAddress();
      const ethBal = await signer.getBalance();

      provider.on(user, (newBalance) => {
        setEthBalance(ethers.utils.formatEther(newBalance));
      });

      setEthBalance(ethers.utils.formatEther(ethBal));

      const tokenHandler = new ethers.Contract(tokenSaleAddress, tokenSaleABI, signer);
      const token = new ethers.Contract(tokenAddress, tokenABI, signer);
      const tokenDividendManagement = new ethers.Contract(dividendManagementAddress, dividendManagementABI, signer);
      const usdcInstance = new ethers.Contract(usdcAddress, usdcABI, signer);

      const getLastDividendTime = Number(await tokenDividendManagement.getLastDividendTime());
      setLastBlockTime(getLastDividendTime * 1000);

      const userBalance = await usdcInstance.balanceOf(user);
      const value = ethers.utils.formatEther(userBalance);
      setUsdcBalance((value));

      const UsdcTransferEvent = usdcInstance.filters.Transfer();

      usdcInstance.on(UsdcTransferEvent, async (address01, address02, amount, event) => {

        if (String(address01).toLowerCase() === String(user).toLowerCase()) {
          const userBalance = await usdcInstance.balanceOf(user);
          const value = ethers.utils.formatEther(userBalance);
          setUsdcBalance((value));
        }

        if (String(address02).toLowerCase() === String(user).toLowerCase()) {
          const userBalance = await usdcInstance.balanceOf(user);
          const value = ethers.utils.formatEther(userBalance);
          setUsdcBalance((value));
        }

        if (String(address01).toLowerCase() === String(tokenSaleAddress).toLowerCase()) {
          const userBalance = await usdcInstance.balanceOf(tokenSaleAddress);
          const value = ethers.utils.formatEther(userBalance);
          setContractUsdcBalance((value));
        }

        if (String(address02).toLowerCase() === String(tokenSaleAddress).toLowerCase()) {
          const userBalance = await usdcInstance.balanceOf(tokenSaleAddress);
          const value = ethers.utils.formatEther(userBalance);
          setContractUsdcBalance((value));
        }

        if (String(address01).toLowerCase() === String(dividendManagementAddress).toLowerCase()) {
          const userBalance = await usdcInstance.balanceOf(dividendManagementAddress);
          const value = ethers.utils.formatEther(userBalance);
          setDividendUsdcBalance((value));
        }
        if (String(address02).toLowerCase() === String(dividendManagementAddress).toLowerCase()) {
          const userBalance = await usdcInstance.balanceOf(dividendManagementAddress);
          const value = ethers.utils.formatEther(userBalance);
          setDividendUsdcBalance((value));
        }
      });

      const adminWallet = await tokenHandler.getAdmin();

      const divPeriod = Number(await tokenDividendManagement.getDividendPeriod());
      const divInterval = Number(await tokenDividendManagement.getDividendInterval());
      const divIntervalCount = divPeriod > 0 ? Number(await tokenDividendManagement.getDividendIntervalCount()) : 0;
      const divCount = Number(await tokenDividendManagement.getTotalDividendCount());
      const divPercent = parseFloat(await tokenDividendManagement.getDividendPercent());

      const divPeriodValue = (divPeriod / (24 * 60 * 60));
      const divIntervalValue = divInterval / (24 * 60 * 60);
      const divIntervalCountValue = divIntervalCount;
      const divCountValue = divCount;
      const claimableDividendsOf = await tokenDividendManagement.claimableDividendsOf(user);
      const claimedDividendsOf = await tokenDividendManagement.claimedDividendsHistoryOf(user);

      const name = await token.name();
      const symbol = await token.symbol();
      const decimals = await token.decimals();
      const totalSupply = await token.totalSupply();
      const rates = await token.rate();
      let cap = await token.cap();
      cap = bigNum(cap);
      const beneficiaryAddress = await token.getBeneficiary();
      const myBalance = await token.balanceOf(user);

      const KYCList = await token.getKYCList();
      const isOwner = String(adminWallet).toLocaleLowerCase() === String(user).toLocaleLowerCase();

      const kycList = await token.getKYCList();

      // TokenHandler Data
      const isSaleOpen = await tokenHandler.tokensale_open();
      const isKycVerified = kycList.includes(user);
      const salesEndDate = Number(await tokenHandler.getSaleEndDate());

      const txtEndDate = formatDate(new Date(salesEndDate));

      const isDividendPeriod = await tokenDividendManagement.isDividendPaymentPeriodActive();

      const contractUSDC = await usdcInstance.balanceOf(tokenSaleAddress);
      const dividendUsdc = await usdcInstance.balanceOf(dividendManagementAddress);

      setDividendUsdcBalance(ethers.utils.formatEther(dividendUsdc));
      const batchName = await tokenHandler.getTokenBatchName();

      const sold = ethers.utils.formatEther(await tokenHandler.getTokenSold());
      const salesStartDate = Number(await tokenHandler.startTimestamp());

      const txtStartDate = formatDate(new Date(salesStartDate));

      setAdminConnected(isOwner);
      const obj = {
        batchName: batchName,
        KYC: KYCList,
        KYCLength: KYCList.length,
        sold: sold,
        contractUSDC: contractUSDC,
        startDate: txtStartDate,
        endDate: txtEndDate,
        totalSupply: totalSupply,
        name: name,
        symbol: symbol,
        decimals: decimals,
        beneficiaryAddress: beneficiaryAddress,
        contractAdress: tokenAddress,
        myBalance: myBalance,
        cap: cap,
        isSaleOpen: isSaleOpen,
        isKycVerified: isKycVerified,
        isDividendPeriod: isDividendPeriod,
        isOwner: isOwner,
        divPeriod: divPeriodValue,
        divInterval: divIntervalValue,
        divIntervalCountValue,
        divCount: divCountValue,
        divPercent,
        claimableDividendsOf,
        claimedDividendsOf,
        tokenPriceRates: rates,
      }

      setRootData(obj);
      setLoading(false);

      // Token Event Listener
      const TransferEvent = token.filters.Transfer();
      const KYCUserAddedEvent = token.filters.KYCUserAdded();
      const KYCUserRemovedEvent = token.filters.KYCUserRemoved();

      // Token Sale Event Listener
      const TokensPurchasedEvent = tokenHandler.filters.TokensPurchased();
      const TokenSaleStartedEvent = tokenHandler.filters.TokenSaleStarted();
      const TokenSaleEndedEvent = tokenHandler.filters.TokenSaleEnded();
      const FundsReleasedEvent = tokenHandler.filters.FundsReleased();

      // Dividend Contract Listeners
      const DividendsDistributedEvent = tokenDividendManagement.filters.DividendsDistributed();
      const DividendPeriodEndedEvent = tokenDividendManagement.filters.DividendPeriodEnded();
      const DividendPeriodStartedEvent = tokenDividendManagement.filters.DividendPeriodStarted();
      const DividendsClaimedEvent = tokenDividendManagement.filters.DividendsClaimed();

      tokenDividendManagement.on(DividendsClaimedEvent, async () => {
        const claimableDividendsOf = await tokenDividendManagement.claimableDividendsOf(user);
        const claimedDividendsOf = await tokenDividendManagement.claimedDividendsHistoryOf(user);
        const myBalance = await token.balanceOf(user);
        const totalSupply = await token.totalSupply();
        setTotalSupplyBalance(totalSupply);

        setClaimableData({
          claimable: claimableDividendsOf,
          withdrawn: claimedDividendsOf,
        });

        setTokenBalnce(myBalance);
      });

      tokenDividendManagement.on(DividendPeriodEndedEvent, async () => {
        const claimableDividendsOf = await tokenDividendManagement.claimableDividendsOf(user);
        const claimedDividendsOf = await tokenDividendManagement.claimedDividendsHistoryOf(user);
        const contractUSDC = await usdcInstance.balanceOf(tokenSaleAddress);
        const totalSupply = await token.totalSupply();
        const isDividendPeriod = await tokenDividendManagement.isDividendPaymentPeriodActive();

        setTotalSupplyBalance(totalSupply);
        setDividendInitialInfo({
          interval: 0,
          period: 0,
          percentValue: 0,
          status: isDividendPeriod
        });
        setContractUsdcBalance(ethers.utils.formatEther(contractUSDC));
        setClaimableData({
          claimable: claimableDividendsOf,
          withdrawn: claimedDividendsOf,
        });
      });

      tokenDividendManagement.on(FundsReleasedEvent, async () => {
        const contractUSDC = await usdcInstance.balanceOf(tokenSaleAddress);

        setContractUsdcBalance(ethers.utils.formatEther(contractUSDC));
      });

      tokenDividendManagement.on(DividendPeriodStartedEvent, async () => {
        const divIntervalCount = Number(await tokenDividendManagement.getDividendIntervalCount());
        const claimableDividendsOf = await tokenDividendManagement.claimableDividendsOf(user);
        const claimedDividendsOf = await tokenDividendManagement.claimedDividendsHistoryOf(user);

        const contractUSDC = await usdcInstance.balanceOf(tokenSaleAddress);
        const isDividendPeriod = await tokenDividendManagement.isDividendPaymentPeriodActive();

        const divPeriod = Number(await tokenDividendManagement.getDividendPeriod());
        const divInterval = Number(await tokenDividendManagement.getDividendInterval());
        const divCount = Number(await tokenDividendManagement.getTotalDividendCount());
        const divPercent = parseFloat(await tokenDividendManagement.getDividendPercent());

        const divPeriodValue = (divPeriod / (24 * 60 * 60));
        const divIntervalValue = divInterval / (24 * 60 * 60);

        setClaimableData({
          claimable: claimableDividendsOf,
          withdrawn: claimedDividendsOf,
        });

        setContractUsdcBalance(ethers.utils.formatEther(contractUSDC));

        setDividendSessionData({
          paid: divCount,
          total: divIntervalCount
        });

        setDividendInitialInfo({
          interval: divIntervalValue,
          period: divPeriodValue,
          percentValue: divPercent,
          status: isDividendPeriod,
        });

      });

      tokenDividendManagement.on(DividendsDistributedEvent, async () => {

        const divCountValue = Number(await tokenDividendManagement.getTotalDividendCount());
        const divIntervalCount = Number(await tokenDividendManagement.getDividendIntervalCount());
        const getLastDividendTime = Number(await tokenDividendManagement.getLastDividendTime());

        const claimableDividendsOf = await tokenDividendManagement.claimableDividendsOf(user);
        const claimedDividendsOf = await tokenDividendManagement.claimedDividendsHistoryOf(user);

        const contractUSDC = await usdcInstance.balanceOf(tokenSaleAddress);

        setLastBlockTime(getLastDividendTime * 1000);

        setClaimableData({
          claimable: claimableDividendsOf,
          withdrawn: claimedDividendsOf,
        });

        setContractUsdcBalance(ethers.utils.formatEther(contractUSDC));

        setDividendSessionData({
          paid: divCountValue,
          total: divIntervalCount,
        });
      });

      token.on(KYCUserAddedEvent, async () => {
        const KYCList = await token.getKYCList();
        const isKycVerified = KYCList.includes(user);

        setKycVerified(isKycVerified);
        setKycDataList(KYCList);
      });

      token.on(KYCUserRemovedEvent, async () => {
        const KYCList = await token.getKYCList();
        const isKycVerified = KYCList.includes(user);

        setKycVerified(isKycVerified);
        setKycDataList(KYCList);
      });

      tokenHandler.on(TokenSaleStartedEvent, async () => {
        const isSaleOpen = await tokenHandler.tokensale_open();
        const salesEndDate = Number(await tokenHandler.getSaleEndDate());
        const salesStartDate = Number(await tokenHandler.startTimestamp());
        const txtStartDate = formatDate(new Date(salesStartDate));
        const txtEndDate = formatDate(new Date(salesEndDate));
        const batchName = await tokenHandler.getTokenBatchName();
        const sold = ethers.utils.formatEther(await tokenHandler.getTokenSold());

        setTokenSaleInfo({
          batchName: batchName,
          endDateTxt: txtEndDate,
          startDateTxt: txtStartDate,
          status: isSaleOpen
        });

        setSoldValue(sold);
      });

      tokenHandler.on(TokenSaleEndedEvent, async () => {
        const isSaleOpen = await tokenHandler.tokensale_open();
        const salesEndDate = Number(await tokenHandler.getSaleEndDate());
        const salesStartDate = Number(await tokenHandler.startTimestamp());
        const txtStartDate = formatDate(new Date(salesStartDate));
        const txtEndDate = formatDate(new Date(salesEndDate));
        const batchName = await tokenHandler.getTokenBatchName();
        const sold = ethers.utils.formatEther(await tokenHandler.getTokenSold());

        setTokenSaleInfo({
          batchName: batchName,
          endDateTxt: txtEndDate,
          startDateTxt: txtStartDate,
          status: isSaleOpen
        });

        setSoldValue(sold);
      });

      tokenHandler.on(TokensPurchasedEvent, async () => {
        const myBalance = await token.balanceOf(user);
        const totalSupply = await token.totalSupply();
        const claimableDividendsOf = await tokenDividendManagement.claimableDividendsOf(user);
        const claimedDividendsOf = await tokenDividendManagement.claimedDividendsHistoryOf(user);
        const sold = ethers.utils.formatEther(await tokenHandler.getTokenSold());

        setClaimableData({
          claimable: claimableDividendsOf,
          withdrawn: claimedDividendsOf,
        });
        setTokenBalnce(myBalance);
        setSoldValue(sold);
        setTotalSupplyBalance(totalSupply);
      });

      token.on(TransferEvent, async (from, to, amount, event) => {
        const myBalance = await token.balanceOf(user);
        const claimableDividendsOf = await tokenDividendManagement.claimableDividendsOf(user);
        const claimedDividendsOf = await tokenDividendManagement.claimedDividendsHistoryOf(user);
        if (from === user || to === user) {
          setClaimableData({
            claimable: claimableDividendsOf,
            withdrawn: claimedDividendsOf,
          });
          setTokenBalnce(myBalance);
        }
      });
    } catch (error) {
      const reason = error.reason ? `Error: ${error.reason}` : "Please make sure you are on the right Network (Sepolia Networt), please refreash the page after update.";
      setErrorMessage(reason);
      console.log(error);
      throw Error(error);
    }

  }

  useEffect(()=>{
    const { batchName, isKycVerified, claimedDividendsOf, claimableDividendsOf, divIntervalCountValue, divCount, isDividendPeriod, divPercent, startDate, endDate ,totalSupply ,myBalance ,isSaleOpen, name, KYC, contractUSDC, sold, divInterval, divPeriod  } = rootData;

    if(name !== null){
      setTokenBalnce(myBalance);
      setTotalSupplyBalance(totalSupply);
      setTokenSaleInfo({
        status: isSaleOpen,
        startDateTxt: startDate,
        endDateTxt: endDate,
        batchName: batchName,
      });
      setKycDataList(KYC);
      setContractUsdcBalance(ethers.utils.formatEther(contractUSDC));
      setSoldValue(sold);
      setDividendInitialInfo({
        interval: divInterval,
        period: divPeriod,
        percentValue: divPercent,
        status: isDividendPeriod
      });
      setDividendSessionData({
        paid: divCount,
        total: divIntervalCountValue
      });
      setClaimableData({
        claimable: claimableDividendsOf,
        withdrawn: claimedDividendsOf
      });
      setKycVerified(isKycVerified);
    }
  }, [rootData]);

  useEffect(() => {
    if (!isSessionSet()) {
      window.location = "/";
    } else {
      const loginSession = JSON.parse(localStorage.getItem('loginSession'));
      const emailStatus = loginSession.status;

      if(!emailStatus){
        window.location = "/verify";
      }

      const addr = String(loginSession.username).toLocaleLowerCase();
      if (fetchCredentials(addr) !== false) {
        fetchCredentials(addr);
      }

      connectWallet();
    }

    fetchTokenInformation();
    fetchActiveSalesBatch();
  }, [myWalletAddress]);

  useEffect(() => {
    if (logOut) {
      if (window.confirm("Are you sure you want to disconnect?")) {
        destroySession();
        disconnectWallet();
        window.location = "/";
      }else{
        setLogOut(false);
      }
    }
  }, [logOut]);

  useEffect(()=>{
    fetchKycData();
  }, [myWalletAddress]);

  useEffect(()=>{
    if (coinBase !== null) {
      setMyWalletAddress(coinBase.coinbase);
    }
  }, [coinBase]);

  return (
    <contextData.Provider value={{ adminConnected, showUserCard, setShowUserCard, dividendDate, dividendUsdcBalance, lastBlockTime, kycVerified, ethBalance, usdcBalance, claimableData, kycDataList, dividendInitialInfo, dividendSessionData, soldValue, contractUsdcBalance, kycData, loading, rootData, tokenBalance, totalSupplyBalance, tokenSaleInfo, updateTokenSoldToBatchData, batchData, storeDataUser, coinBase, contract, setStoreDataUser, setLogOut, transactions, setTransactions }}>
      <div className="top-logo-holder">
        <Link to={"/dashboard"}><img src="https://gineousc.sirv.com/Images/loader-ico.png" alt="" /></Link>
      </div>
      <div className="dashboard">
        {loading && <div className="loadingScreen">
          <div>
            <img src="https://gineousc.sirv.com/Images/Infinite.gif" alt="preloader" />
            {errorMessage && <span>{errorMessage}</span>}
          </div>
        </div>}
        <NavArea />
        <Mobile_navBar />
        <Routes>
          <Route index element={<HomePage />}></Route>
          <Route exact path='/wallet' element={<Wallet />}></Route>
          {adminConnected && <Route exact path='owner' element={<Owner />}></Route>}
          {adminConnected && <Route exact path='dividend' element={<DividendManagement />}></Route>}
          {kycVerified ? <Route exact path='mydividend' element={<UserDividendPage />}></Route> : <Route exact path='mydividend' element={<div className='dash_section'></div>}></Route>}
          <Route exact path='settings' element={<Settings />}></Route>
          {adminConnected && <Route exact path='batch%20history' element={<SaleBatches />}></Route>}
          <Route exact path='profile' element={<ProfilePage pg={0}/>}></Route>
          <Route exact path='profile/kyc' element={<ProfilePage pg={1} />}></Route>
          {adminConnected && <Route exact path='kyc' element={<KycManagament />}></Route>}
          {adminConnected && <Route exact path='kyc/:id' element={<KycPreview />}></Route>}
        </Routes>
        
        <UserCard />
      </div>
    </contextData.Provider>
  )
}

export default Dashboard;
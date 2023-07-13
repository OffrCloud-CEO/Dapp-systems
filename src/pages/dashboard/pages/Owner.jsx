import { ethers } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { formatLargeNumber, formatNum, formatPercentage, toEth } from "../../../useful/useful_tool";
import StartTokenSale from "../token/card/startTokenSale";
import { contextData } from "../dashboard";
import { tokenSaleABI, tokenSaleAddress } from "../../../util/constants/tokenSaleContract";
import TransactionHashs from "../components/TransactionHashs";
import toast, { Toaster } from "react-hot-toast";
import LastSevenDays from "./Owner components/lastSevenDays";
import LastSevenDaysUsers from "./Owner components/lastSevenDaysUsers";
import { collection, doc, getDocs, setDoc, } from "firebase/firestore";
import { fireStore } from "../../../firebase/sdk";

/* Creating a context object. */
export const ownerContext = React.createContext();
const Owner = () => {
  const { rootData, batchData, totalSupplyBalance, tokenSaleInfo, kycDataList, soldValue, contractUsdcBalance,} = useContext(contextData);
  const [initiateTokenSale, setInitiateTokenSale] = useState(false);
  const [pending, setPending] = useState(false);
  const [coin, setCoin] = useState(null);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [liveData, setLiveData] = useState({
    batchName: "",
    status: false,
    kycedUsers: 0,
    sold: 0,
    contractUSC: 0,
    startDate: 0,
    endDate: 0,
    totalSupply: 0,
  });

  /**
   * It's a function that updates the sold & status value of a document in a collection.
   */
  const adjustTokenSaleBatch = async (soldValue) => {
    const userRef = collection(fireStore, `Token_Sale_Batches`);
    const collectionSnap = await getDocs(userRef);

    /* Updating the sold value of the document in the collection. */
    collectionSnap.forEach(async(snap) => {
      const data = snap.data();

      if (data.batch_name === batchData.batch_name) {
        const object_ = data;
        const today = new Date();
        const endTimestamp = today.getTime();
        const adjustObject = {...object_, sold: toEth(soldValue), status: false, endDate: endTimestamp};
        try {
          await setDoc(doc(userRef, `${snap.id}`), adjustObject);

        } catch (error) {
          throw Error("Couldn't complete the updating request to firebase!");
        }
      }
    });

  }

  /**
   * Ending the sale of the tokenHandler and waiting for the endSale event to be emitted and then it is
   * calling the adjustTokenSaleBatch function.
   */
  const endSaleFunc = async () => {
    setPending(true);
    if (coin !== null) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
  
        const tokenHandler = new ethers.Contract(tokenSaleAddress, tokenSaleABI, signer);
  
        /* Ending the sale of the tokenHandler. */
        const endSale = await tokenHandler.endSale({
          from: signer.getAddress()
        });
  
        /* Waiting for the endSale event to be emitted and then it is calling the adjustTokenSaleBatch
        function. */
        await endSale.wait().then(async() => {
          await adjustTokenSaleBatch(Number(liveData.sold));
          setPending(false);
        });
  
      } catch (error) {
        throw error;
      }
    }
    setPending(false);
  }

  /**
   * "endTokenSaleHandler" is a function that calls the "endSaleFunc" function, and then displays a
   * toast message based on the result of the "endSaleFunc" function.
   */
  const endTokenSaleHandler = async () => {
    const promise = endSaleFunc();
    toast.promise(promise, {
      loading: "Ending Token Sale",
      success: "Token Sale Ended",
      error: "Process Failed",
    })
  }

  /**
   * If the user is logged in, then fetch the contract information from the blockchain and display it
   * on the page.
   */
  const fetchCoinInformation = () => {
      const { cap, isOwner, tokenPriceRates } = rootData;
      const { endDateTxt, startDateTxt, status, batchName } = tokenSaleInfo;
      setTokenPrice(tokenPriceRates);

      let obj;

      if (status) {
        const salesEndDate = new Date(endDateTxt);
        const dateVar = new Date();
        const remainTime = salesEndDate.getTime() - dateVar.getTime();

        obj = {
          kycedUsersList: kycDataList,
          sold: soldValue,
          status: status,
          endDate: endDateTxt,
          startDate: startDateTxt,
          totalSupply: totalSupplyBalance,
          tokenCap: cap,
          remainTime: remainTime,
          contractUSDC: contractUsdcBalance,
          isOwner: isOwner,
          batchName: batchName,
        };
      } else {
        obj = {
          sold: totalSupplyBalance,
          totalSupply: totalSupplyBalance,
          kycedUsersList: kycDataList,
          status: status,
          contractUSDC: contractUsdcBalance,
          isOwner: isOwner,
          tokenCap: cap,
          batchName: batchName,
        };
      }
      setCoin(obj);
  };

  useEffect(()=>{
    if (coin !== null) {
      const { batchName, status, sold, kycedUsersList, startDate, endDate, totalSupply } = coin;

      if (status) {
        setLiveData({ 
          batchName:batchName, 
          status: status, 
          kycedUsers: kycedUsersList.length, 
          sold: sold, 
          contractUSC: contractUsdcBalance, 
          startDate: startDate, 
          endDate: endDate,
          totalSupply: totalSupply,
        });
      }else{
        setLiveData({ 
          batchName: batchName,
          status: status,
          kycedUsers: kycedUsersList.length,
          sold: sold,
          contractUSC: contractUsdcBalance,
          totalSupply: totalSupply,
        });
      }
    }
  }, [coin]);

  
  const releaseFundsHandler = async() =>{
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();

      const tokenHandler = new ethers.Contract(tokenSaleAddress, tokenSaleABI, signer);

      /* Calling the releaseFunds function of the tokenHandler contract. */
      const releaseFunds = await tokenHandler.releaseFunds({
        from: signer.getAddress()
      });

      await releaseFunds.wait();

    } catch (error) {
      console.log(error.reason);
      throw `${error.reason}`;
    }
  }

  /**
   * The releaseFundsWatch function is a wrapper for the releaseFundsHandler function. It uses the
   * toast.promise function to display a loading message, a success message, or an error message
   * depending on the outcome of the releaseFundsHandler function.
   */
  const releaseFundsWatch = () =>{
    const promise = releaseFundsHandler();
    toast.promise(promise,{
      loading: "Releasing funds to beneficiary...",
      success: '🗿 Beneficiary has received the Funds.',
      error: 'An error occurred.',
    })
  }

  useEffect(() => {
    if (rootData?.cap !== null) {
      fetchCoinInformation();
    }

  }, [rootData, totalSupplyBalance, tokenSaleInfo, kycDataList, contractUsdcBalance, soldValue]);


  const handleBtnxTriggers = (e) =>{
    switch (e.toLowerCase()) {
      case "start":
        if (coin != null && !liveData.status) {
          setInitiateTokenSale(true);
        }
        break;
      case "end":
        if (coin != null && liveData.status) {
          endTokenSaleHandler();
        }
        break;
      case "releasefund":
        if (coin != null && !liveData.status && liveData.contractUSC) {
          releaseFundsWatch();
        }
        break;
    
      default:
        break;
    }
  }

  return (
    <ownerContext.Provider value={{ initiateTokenSale, setInitiateTokenSale }}>
      <div className="dash_section">

        <Toaster
          toastOptions={{
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />

        <label>Token Sale Management</label>

        {initiateTokenSale && <StartTokenSale />}

        <div className="dash-row">

          <div className="div-2">
            <div className="kard">
              <div className="tag">
                Token Sale Batch
                <img src={coin != null && liveData.status ? "https://gineousc.sirv.com/Images/icons/icons8-boy-on-the-rocket-100.png" : "https://gineousc.sirv.com/Images/icons/icons8-page-not-found-64.png"} alt="" />
              </div>
              <div className={`value info`}>{coin != null ? liveData.batchName !== "" ? liveData.batchName : "N/A" : `---`}</div>
            </div>
            <div className="kard">
              <div className="tag">
                Sales Status
                <img src={coin != null && liveData.status ? "https://gineousc.sirv.com/Images/icons/icons8-land-sales-80.png" : "https://gineousc.sirv.com/Images/icons/icons8-page-not-found-64.png"} alt="" />
              </div>
              <div className={`value info ${coin != null && liveData.status ? "good" : "bad"}`}>{coin != null ? liveData.status ? "Active" : "Not on Sale" : `---`}</div>
            </div>
          </div>

          <div className="div-3">
            <div className="kard">
              <div className="tag">KYC kycedUsers
                <img src="https://gineousc.sirv.com/Images/icons/icons8-people-64.png" alt="" />
              </div>
              <div className="value">
                {coin != null && coin.kycedUsersList ? `${liveData.kycedUsers > 0 ? liveData.kycedUsers : '0'}` : `---`}
              </div>
            </div>
            <div className="kard">
              <div className="tag">Token Sold
                <img src="https://gineousc.sirv.com/Images/icons/icons8-donation-50.png" alt=""/>
              </div>
              <div className="value">
                {coin != null && coin ? `${liveData.sold > 0 ? formatNum((Number(liveData.sold).toFixed())) : '0.00'}` : `---`}
              </div>
            </div>
          </div>

          <div className="div-2">
            <div className="kard">
              <div className="tag">
                Contract USDC Balance
                <img src="https://gineousc.sirv.com/Images/icons/money%20(1).svg" alt="" />
              </div>
              <div className="value">
                {coin != null && coin ? `$${liveData.contractUSC > 0 ? formatNum((Number(liveData.contractUSC)).toFixed()) : '0.00'}` : `---`}
              </div>
            </div>
            <div className="kard">
              <div className="tag">
                Contract ETH Balance
                <img src="https://gineousc.sirv.com/Images/icons/money%20(1).svg" alt="" />
              </div>
              <div className="value">
                {coin != null && coin ? `$${liveData.contractUSC > 0 ? formatNum((Number(liveData.contractUSC)).toFixed()) : '0.00'}` : `---`}
              </div>
            </div>
          </div>

          <div className="div-2">
            <div className="kard">
              <div className="tag">
                Sale Start Date
                <img src="https://gineousc.sirv.com/Images/icons/off.png" alt="" />
              </div>
              <div className="value info">{coin != null && liveData.status ? liveData.startDate : "-- -- --"}</div>
            </div>
            <div className="kard">
              <div className="tag">
                Sale End Date
                <img src="https://gineousc.sirv.com/Images/icons/on.png" alt="" />
              </div>
              <div className="value info">{coin != null && liveData.status ? liveData.endDate : "-- -- --"}</div>
            </div>
          </div>

          {coin && coin?.isOwner &&  <div className="btnx-row">
            <label>Action Buttons</label>
            <div className="row">
              <div className={`btnx ${coin != null && !liveData.status && liveData.contractUSC > 0 ? "" : "disable" }`} onClick={() => handleBtnxTriggers('releaseFund')}>
                Release funds
              </div>
              <div className={`btnx ${coin != null && !liveData.status ? "start" : "disable" }`} onClick={() => handleBtnxTriggers('start')}>
                Start sales
              </div>
              <div className={`btnx ${coin != null && liveData.status ? "warn" : "disable" }`} onClick={()=> handleBtnxTriggers('end')}>
                End Sales
              </div>
            </div>
          </div>}

          <div className="div-2">

            <LastSevenDaysUsers /> 

            <div className="kard exempt big">
              <div className="title">Sales Info</div>
              <div className="grided">
                <div className="full">
                  <span>{coin != null && coin ? `${liveData.totalSupply > 0 ? `${formatLargeNumber((Number(liveData.totalSupply) / (10**18) * (1/tokenPrice)), "max")} USDC` : '0.00'}` : `---`}</span>
                  <span>USDC raised</span>
                </div>
                
                <div>
                  <span>{coin != null && coin ? `${coin.tokenCap > 0 ? `${formatPercentage(((100 / coin.tokenCap) * liveData.totalSupply).toFixed(6))}` : '0.00'}` : `0.00`}</span>
                  <span>Total sold</span>
                </div>
                <div>
                  <span>{coin != null && coin ? `${liveData.totalSupply > 0 ? `${formatNum(((Number(coin.tokenCap) / (10**18)) - (Number(liveData.totalSupply) / (10**18))))}` : '0.00'}` : `---`}</span>
                  <span>Token Remaining</span>
                </div>
                <div className="dt">
                  <span>{coin != null && liveData.status ? `${coin.remainTime > 0 ? `${Math.floor(coin.remainTime / (1000 * 60 * 60 * 24))}` : '--'}` : `--`}</span>
                  <span>Days left</span>
                </div>
                <div className="dt">
                  <span>{coin != null && liveData.status ? `${coin.remainTime > 0 ? `${Math.floor((coin.remainTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}` : '--'}` : `--`}</span>
                  <span>Hours left</span>
                </div>
                <div className="dt">
                  <span>{coin != null && liveData.status ? `${coin.remainTime > 0 ? `${Math.floor((coin.remainTime % (1000 * 60 * 60)) / (1000 * 60))}` : '--'}` : `--`}</span>
                  <span>minutes left</span>
                </div>
              </div>
            </div>

            {coin && batchData && liveData.sold > 0 && <LastSevenDays status={liveData.status} />}
          </div>

          <div className="info-tab">

            <div className="information">
              <TransactionHashs maxL={10} />
            </div>
            
          </div>
        </div>
      </div>
    </ownerContext.Provider>
  );
};

export default Owner;

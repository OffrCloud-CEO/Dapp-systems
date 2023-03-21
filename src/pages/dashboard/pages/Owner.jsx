import { ethers } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { formatLargeNumber, formatNum, formatEth, formatPercentage, greetUser, toEth } from "../../../useful/useful_tool";
import StartTokenSale from "../token/card/startTokenSale";
import { contextData } from "../dashboard";
import { ABI3, address3 } from "../../../util/constants/tokenHandlerContract";
import TransactionHashs from "../components/TransactionHashs";
import toast, { Toaster } from "react-hot-toast";
import { ABI2, address2 } from "../../../util/constants/usdcContract";
import LastSevenDays from "./Owner components/lastSevenDays";
import LastSevenDaysUsers from "./Owner components/lastSevenDaysUsers";
import { collection, doc, getDocs, setDoc, } from "firebase/firestore";
import { fireStore } from "../../../firebase/sdk";

/* Creating a context object. */
export const ownerContext = React.createContext();
const Owner = () => {
  const { contract, coinBase, storeDataUser, batchData } = useContext(contextData);
  const [initiateTokenSale, setInitiateTokenSale] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [coin, setCoin] = useState(null);
  const [salesStarted, setSalesStarted] = useState(false);
  const [salesEnded, setSalesEnded] = useState(false);
  const [fundsReleased, setFundsReleased] = useState(false);

  /**
   * It takes a date object as an argument and returns a string in the format of "day month, year".
   * @returns The date in the format of day month, year.
   */
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

  /**
   * It's a function that updates the sold & status value of a document in a collection.
   */
  const adjustTokenSaleBatch = async (soldValue) => {
    const userRef = collection(fireStore, `Token_Sale_Batches`);
    const collectionSnap = await getDocs(userRef);

    /* Updating the sold value of the document in the collection. */
    collectionSnap.forEach(async(snap) => {
      const data = snap.data()

      if (data.batch_name === batchData.batch_name) {
        const object_ = data;
        const adjustObject = {...object_, sold: toEth(soldValue), status: false};
        try {
          await setDoc(doc(userRef, `${snap.id}`), adjustObject);

        } catch (error) {
          throw Error("Couldn't complete the updating request to firebase!");
        }
        setSalesEnded(true);
      }
    });

  }

  /**
   * Ending the sale of the OffrToken and waiting for the endSale event to be emitted and then it is
   * calling the adjustTokenSaleBatch function.
   */
  const endSaleFunc = async () => {
    setPending(true);
    if (coin !== null) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
  
        const OffrToken = new ethers.Contract(address3, ABI3, signer);
  
        /* Ending the sale of the OffrToken. */
        const endSale = await OffrToken.endSale({
          from: signer.getAddress()
        });
  
        /* Waiting for the endSale event to be emitted and then it is calling the adjustTokenSaleBatch
        function. */
        await endSale.wait().then(async() => {
          await adjustTokenSaleBatch(Number(coin.sold));
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
  const fetchCoinInformation = async () => {
    if(coinBase){
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();

      const OffrToken = new ethers.Contract(address3, ABI3, signer);
      const usdcInstance = new ethers.Contract(address2, ABI2, signer);

      const token = contract[0];

      const tokenSale = await OffrToken.tokensale_open();
      const adminWallet = await OffrToken.getAdmin();

      const isOwner = String(adminWallet).toLocaleLowerCase() === String(coinBase?.coinbase).toLocaleLowerCase();
      
      let obj;

      const holdersList = await token.getHolderList();
      const totalSupply = formatEth(await token.totalSupply());

      const contractUSDC = await usdcInstance.balanceOf(address3);
      const tokenCap = formatEth(await token.cap());

      /* Checking if the token sale is active or not. If it is active, it will display the token sale
      information. If it is not active, it will display the token information. */
      if (tokenSale) {

        const sold = formatEth(await OffrToken.getTokenSold());
        const salesEndDate = Number(await OffrToken.getSaleEndDate());
        const salesStartDate = Number(await OffrToken.startTimestamp());

        const txtStartDate = formatDate(new Date(salesStartDate));
        const txtEndDate = formatDate(new Date(salesEndDate));

        const dateVar = new Date();
        const remainTime = salesEndDate - dateVar.getTime();

        obj = {
          holdersList,
          sold: Number(sold),
          status: tokenSale,
          endDate: txtEndDate,
          startDate: txtStartDate,
          totalSupply,
          tokenCap,
          remainTime,
          contractUSDC,
          isOwner,
        };
      } else {
        obj = {
          sold: totalSupply,
          totalSupply,
          holdersList,
          status: tokenSale,
          contractUSDC,
          isOwner,
          tokenCap,
        };
      }

      setCoin(obj);
      setLoading(false);
    }
  };

  /**
   * The releaseFundsHandler function is an asynchronous function that uses the ethers.js library to
   * connect to the Ethereum blockchain and call the releaseFunds function of the OffrToken contract.
   */
  const releaseFundsHandler = async() =>{
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();

      const OffrToken = new ethers.Contract(address3, ABI3, signer);

      /* Calling the releaseFunds function of the OffrToken contract. */
      const releaseFunds = await OffrToken.releaseFunds({
        from: signer.getAddress()
      });

      await releaseFunds .wait().then(()=>{
        setFundsReleased(true)
      })

    } catch (error) {
      throw error;
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
      loading: "Awaiting a few approvals...",
      success: 'Funds has been released.',
      error: 'An error occurred.',
    })
  }

  useEffect(() => {
    if (contract && coinBase) {
      fetchCoinInformation();
    }
  }, [contract, coinBase]);

  /**
   * "If the coin is not null and the coin status is false, then set the initiateTokenSale to true."
   * 
   * I'm not sure what the "coin" variable is, but I'm guessing it's a boolean.
   * 
   * If you want to check if the coin is null, then you can use the following:
   * 
   * if (coin === null) {
   *   // do something
   * }
   * 
   * If you want to check if the coin is not null, then you can use the following:
   * 
   * if (coin !== null) {
   *   // do something
   * }
   * 
   * If you want to check if the coin is false, then you can use the following:
   * 
   * if (coin === false) {
   *   // do something
   * }
   * 
   * If you want to check if the coin is not false, then you
   */
  const handleBtnxTriggers = (e) =>{
    switch (e.toLowerCase()) {
      case "start":
        if (coin != null && !coin.status) {
          setInitiateTokenSale(true);
        }
        break;
      case "end":
        if (coin != null && coin.status) {
          endTokenSaleHandler();
        }
        break;
      case "releasefund":
        if (coin != null && !coin.status && coin.contractUSDC) {
          releaseFundsWatch();
        }
        break;
    
      default:
        break;
    }
  }

  useEffect(()=>{
    if (salesStarted) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [salesStarted]);

  useEffect(()=>{
    if (salesEnded) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [salesEnded]);

  useEffect(()=>{
    if (fundsReleased) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [fundsReleased]);

  return (
    <ownerContext.Provider value={{ initiateTokenSale, setInitiateTokenSale, setSalesStarted }}>
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
          <div className="title">{greetUser()} {storeDataUser ? ((storeDataUser?.name).split(" ")[0]) : "@firstname"}, </div>
          <div className="tags">
            <div className="img">
              {storeDataUser && <img src={storeDataUser?.dp} alt="" />}
              {!storeDataUser && <img src="https://gineousc.sirv.com/Images/Infinite.gif" alt="" />}
            </div>
          </div>
        </div>
        <label>Token Sale Management</label>

        {loading && <div className="pending">
          <img src="https://gineousc.sirv.com/Images/sp.gif" alt="" />
        </div>}

        {initiateTokenSale && <StartTokenSale />}

        <div className="dash-row">

          <div className="div-2">
            <div className="kard">
              <div className="tag">
                Token Sale Batch
                <img src={coin != null && coin.status ? "https://gineousc.sirv.com/Images/icons/icons8-boy-on-the-rocket-100.png" : "https://gineousc.sirv.com/Images/icons/icons8-page-not-found-64.png"} alt="" />
              </div>
              <div className={`value info`}>{coin != null ? coin.status ? batchData?.batch_name : "N/A" : `---`}</div>
            </div>
            <div className="kard">
              <div className="tag">
                Sales Status
                <img src={coin != null && coin.status ? "https://gineousc.sirv.com/Images/icons/icons8-land-sales-80.png" : "https://gineousc.sirv.com/Images/icons/icons8-page-not-found-64.png"} alt="" />
              </div>
              <div className={`value info ${coin != null && coin.status ? "good" : "bad"}`}>{coin != null ? coin.status ? "Active" : "Not on Sale" : `---`}</div>
            </div>
          </div>

          <div className="div-3">
            <div className="kard">
              <div className="tag">Token Holders
                <img src="https://gineousc.sirv.com/Images/icons/icons8-people-64.png" alt="" />
              </div>
              <div className="value">
                {coin != null && coin.holdersList ? `${coin.holdersList.length > 0 ? coin.holdersList.length : '0.00'}` : `---`}
              </div>
            </div>
            <div className="kard">
              <div className="tag">Token Sold
                <img src="https://gineousc.sirv.com/Images/icons/icons8-donation-50.png" alt=""/>
              </div>
              <div className="value">
                {coin != null && coin ? `${coin.sold > 0 ? formatNum((Number(coin.sold).toFixed())) : '0.00'}` : `---`}
              </div>
            </div>
            <div className="kard">
              <div className="tag">
                Contract USDC Balance
                <img src="https://gineousc.sirv.com/Images/icons/money%20(1).svg" alt="" />
              </div>
              <div className="value">
                {coin != null && coin ? `$ ${coin.contractUSDC > 0 ? formatNum((Number(coin.contractUSDC)/(10**18)).toFixed()) : '0.00'}` : `---`}
              </div>
            </div>
          </div>

          <div className="div-2">
            <div className="kard">
              <div className="tag">
                Sale Start Date
                <img src="https://gineousc.sirv.com/Images/icons/off.png" alt="" />
              </div>
              <div className="value info">{coin != null && coin.status ? coin.startDate : "-- -- --"}</div>
            </div>
            <div className="kard">
              <div className="tag">
                Sale End Date
                <img src="https://gineousc.sirv.com/Images/icons/on.png" alt="" />
              </div>
              <div className="value info">{coin != null && coin.status ? coin.endDate : "-- -- --"}</div>
            </div>
          </div>

          {coin && coin?.isOwner &&  <div className="btnx-row">
            <label>Action Buttons</label>
            <div className="row">
              <div className={`btnx ${coin != null && !coin.status && coin.contractUSDC > 0 ? "" : "disable" }`} onClick={() => handleBtnxTriggers('releaseFund')}>
                Release funds
              </div>
              <div className={`btnx ${coin != null && !coin.status ? "start" : "disable" }`} onClick={() => handleBtnxTriggers('start')}>
                Start sales
              </div>
              <div className={`btnx ${coin != null && coin.status ? "warn" : "disable" }`} onClick={()=> handleBtnxTriggers('end')}>
                End Sales
              </div>
            </div>
          </div>}

          <div className="div-2">

            <LastSevenDaysUsers />

            <div className="kard exempt">
              <div className="title">Sales Info</div>
              <div className="grided">
                <div className="full">
                  <span>{coin != null && coin ? `${coin.totalSupply > 0 ? `${formatLargeNumber(coin.totalSupply)} USDC` : '0.00'}` : `---`}</span>
                  <span>USDC raised</span>
                </div>
                <div>
                  <span>{coin != null && coin ? `${coin.tokenCap > 0 ? `${formatPercentage(((100 / coin.tokenCap) * coin.totalSupply).toFixed(6))}` : '0.00'}` : `0.00`}</span>
                  <span>Total sold</span>
                </div>
                <div>
                  <span>{coin != null && coin ? `${coin.totalSupply > 0 ? `${formatNum((coin.tokenCap - coin.totalSupply))}` : '0.00'}` : `---`}</span>
                  <span>Token Remaining</span>
                </div>
                <div className="dt">
                  <span>{coin != null && coin.status ? `${coin.remainTime > 0 ? `${Math.floor(coin.remainTime / (1000 * 60 * 60 * 24))}` : '--'}` : `--`}</span>
                  <span>Days left</span>
                </div>
                <div className="dt">
                  <span>{coin != null && coin.status ? `${coin.remainTime > 0 ? `${Math.floor((coin.remainTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}` : '--'}` : `--`}</span>
                  <span>Hours left</span>
                </div>
                <div className="dt">
                  <span>{coin != null && coin.status ? `${coin.remainTime > 0 ? `${Math.floor((coin.remainTime % (1000 * 60 * 60)) / (1000 * 60))}` : '--'}` : `--`}</span>
                  <span>minutes left</span>
                </div>
              </div>
            </div>

            {batchData && <LastSevenDays />}
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

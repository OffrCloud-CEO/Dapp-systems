import { ethers } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import { daysToText, formatEth, formatNum } from '../../../useful/useful_tool';
import { contextData } from '../dashboard';
import { ABI3, address3 } from '../../../util/constants/tokenHandlerContract';
import DividendSettings from '../token/card/DividendSettings';
import { ABI2, address2 } from '../../../util/constants/usdcContract';
import { toast, Toaster } from 'react-hot-toast';
import FundContract from '../token/card/FundContract';
import TransactionHashs from '../components/TransactionHashs';

export const dividendContext = React.createContext();
const DividendManagement = () => {
  const { contract, coinBase, setTransactions, transactions } = useContext(contextData);
  const [dividendProperties, setDividendProperties] = useState(false);
  const [fundingContract, setFundingContract ] = useState(false);
  const [fundedContract, setFundedContract ] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coin, setCoin] = useState(null);
  const [updatedDividendProperties, setUpdatedDividendProperties] = useState(false);
  const [startedDividendPeriod, setStartedDividendPeriod] = useState(false);
  const [distributedDividend, setDistributedDividend]= useState(false);

  useEffect(()=>{
    if (updatedDividendProperties) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [updatedDividendProperties]);
  
  useEffect(()=>{
    if (fundedContract) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [fundedContract]);
  
  useEffect(()=>{
    if (distributedDividend) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [distributedDividend]);

  useEffect(()=>{
    if (startedDividendPeriod) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [startedDividendPeriod]);

  const fetchCoinInformation = async () => {
    setLoading(true)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();

    const tokenHandler = new ethers.Contract(address3, ABI3, signer);
    const usdcInstance = new ethers.Contract(address2, ABI2, signer);

    const token = contract[0];

    const symbol = await token.symbol();

    const tokenSale = await tokenHandler.tokensale_open();
    let obj;

    const holdersList = await token.getHolderList();
    const totalSupply = formatEth(await token.totalSupply());
    const tokenCap = formatEth(await token.cap());
    const divPeriod = Number(await tokenHandler.getDividendPeriod());
    const divInterval = Number(await tokenHandler.getDividendInterval());
    const divIntervalCount = divPeriod > 0 ? Number(await tokenHandler.getDividendIntervalCount()): 0;
    const divCount = Number(await tokenHandler.getDividendCount());
    const divPercent = parseFloat(await tokenHandler.getDividendPercent());

    const divPeriodValue = (divPeriod / (24 * 60 * 60));
    const divIntervalValue = divInterval / (24 * 60 * 60);
    const divIntervalCountValue = divIntervalCount;
    const divCountValue = divCount;
    const contractUSDC = await usdcInstance.balanceOf(address3);
    const userUSDC = await usdcInstance.balanceOf(signer.getAddress());

    const adminWallet = await tokenHandler.getAdmin();
    const isDividendPaymentPeriod = await tokenHandler.isDividendPaymentPeriodActive();

    const isOwner = String(adminWallet).toLocaleLowerCase() === String(coinBase?.coinbase).toLocaleLowerCase();

    obj = {
      holdersList,
      status: tokenSale,
      tokenCap,
      totalSupply,
      divPeriodValue,
      divIntervalValue,
      divIntervalCountValue,
      divCountValue,
      divPercent,
      divCount,
      contractUSDC,
      isOwner,
      isDividendPaymentPeriod,
      symbol,
      userUSDC,
    };

    setCoin(obj);
    setLoading(false);
  };

  const startDividendPaymentPeriod = async () => {
    /* Creating a new instance of the Web3Provider. */
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    /* Getting the signer from the provider. */
    const signer = await provider.getSigner();
    /* Creating a new instance of the smart contract. */
    const tokenHandler = new ethers.Contract(address3, ABI3, signer);
    try {
      const transactionDate = new Date();
      const timeStamp = transactionDate.toISOString().slice(0, 19).replace('T', ' ');

      let fromAddress;
      /* Getting the address of the signer. */
      await (signer.getAddress()).then((result) => {
        fromAddress = result;
      });

      const startDividendPeriod = await tokenHandler.startDividendPeriod({
        from: signer.getAddress()
      });

      await startDividendPeriod.wait().then(()=>{
        setStartedDividendPeriod(true);
      })

    } catch (error) {
      throw Error(`An error occurred: ${error}`);
    }

  }

  const startDividendPaymentPeriodHandler = () =>{
    const promise = startDividendPaymentPeriod();
    
    toast.promise(promise, {
      loading: 'Starting the Dividend Payment Period.',
      success: "🎉 Hurray! It's Dividend time.",
      error: "An error occured"
    });
  }

  const distributeDividend = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      /* Creating a new instance of the smart contract. */
      const tokenHandler = new ethers.Contract(address3, ABI3, signer);

      const transactionDate = new Date();
      const timeStamp = transactionDate.toISOString().slice(0, 19).replace('T', ' ');
      let fromAddress;

      await (signer.getAddress()).then((result) => {
        fromAddress = result;
      });

      const distributeDividendTransaction = await tokenHandler.distributeDividend({from: signer.getAddress()});

      await distributeDividendTransaction.wait().then((i)=>{
        setDistributedDividend(true);
        console.log(i);
      });

    } catch (error) {
      console.log(error);
      throw Error(`An error occurred: ${error}`);
    }
  }

  const distributeDividendHandler = () => {
    const promise = distributeDividend();
    toast.promise(promise,{
      loading: 'Distributing Dividend to Holders',
      success: 'Dividend has been Distribute',
      error: 'An error occurred'
    });
  };

  useEffect(() => {
    if (contract) {
      fetchCoinInformation();
    }
  }, [contract, coinBase]);

  return (
    <dividendContext.Provider value={{ setFundingContract, setFundedContract, dividendProperties, setDividendProperties, coin, setUpdatedDividendProperties, setTransactions, transactions }}>
      <div className="dash_section">
        <Toaster
          toastOptions={{
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <label>Dividend Management</label>
        {loading && <div className="pending">
          <img src="https://gineousc.sirv.com/Images/sp.gif" alt="" />
        </div>}

        {dividendProperties && <DividendSettings />}
        {fundingContract && <FundContract />}

        <div className="dash-row">
          <div className="div-3">
            <div className='kard'>
              <div className="tag">Token Holders <img src="https://gineousc.sirv.com/Images/icons/icons8-client-64.png" alt="" /></div>
              <div className="value">{coin != null && coin.holdersList.length > 0 ? `${coin.holdersList.length > 0 ? coin.holdersList.length : '0.00'}` : `---`}</div>
            </div>
            <div className='kard'>
              <div className="tag">Total Dividend Paid <img src="https://gineousc.sirv.com/Images/icons/icons8-bounced-check-100.png" alt="" /></div>
              <div className="value">{coin != null && coin.divCountValue > 0 ? `${coin.divCountValue > 0 ? coin.divCountValue : '0.00'}` : `---`}</div>
            </div>
            <div className='kard'>
              <div className="tag">Next Pay date<img src="https://gineousc.sirv.com/Images/icons/date-to.png" alt="" /></div>
              <div className="value info">Friday 13th</div>
            </div>
            <div className='kard'>
              <div className="tag">Dividend Period <img src="https://gineousc.sirv.com/Images/icons/icons8-date-span-100.png" alt="" /></div>
              <div className="value info">{coin != null && coin.divPeriodValue > 0 ? `${coin.divPeriodValue > 0 ? `${daysToText(Number(coin.divPeriodValue)) }` : '0.00'}` : `---`}</div>
            </div>
            <div className='kard'>
              <div className="tag">Dividend Intervals<img src="https://gineousc.sirv.com/Images/icons/hourglass-sand-bottom.png" alt="" /></div>
              <div className="value info">{coin != null && coin.divIntervalValue > 0 ? `${coin.divIntervalValue > 0 ? `${daysToText(Number(coin.divIntervalValue)) }` : '0.00'}` : `---`}</div>
            </div>
          </div>

          {/* You can use the disable class to disable some buttons */}
          <div className="btnx-row">
            <label>Action Buttons</label>
            <div className="row">
              {coin && coin.isDividendPaymentPeriod && <div className="btnx disable">
                Edit Dividend Properties
              </div>}
              {coin && !coin.isDividendPaymentPeriod && <div className="btnx" onClick={()=>setDividendProperties(true)}>
                Edit Dividend Properties
              </div>}
              {coin && coin.isDividendPaymentPeriod && <div className="btnx" onClick={()=>setFundingContract(true)}>
                Fund Contract
              </div>}
              {coin && !coin.isDividendPaymentPeriod && <div className="btnx disable">
                Fund Contract
              </div>}
              {coin && coin.isDividendPaymentPeriod && <div className="btnx disable">
                Start Dividend Period
              </div>}
              {coin && coin.status && <div className="btnx disable">
                Start Dividend Period
              </div>}
              {coin && !coin.isDividendPaymentPeriod && !coin.status && <div className="btnx start" onClick={startDividendPaymentPeriodHandler}>
                Start Dividend Period
              </div>}
              {coin && coin.isDividendPaymentPeriod && <div className="btnx start" onClick={distributeDividendHandler}>
                Pay Dividend
              </div>}
              {coin && !coin.isDividendPaymentPeriod && <div className="btnx disable">
                Distribute Dividend
              </div>}
            </div>
          </div>

          {coin != null && !coin.isDividendPaymentPeriod && <div className="action-card">
            <div className="img"><img src="https://gineousc.sirv.com/Images/undraw_empty_cart_co35%20(1).svg" alt="" /></div>
            <div className="txt">
              <span>Dividend Payment Period hasn't been activated yet, so Dividend related activities will wait until after *Date String*.</span>
              <span>You can set The Dividend Properties during this time i.e <code>`assign Dividend Period`</code>, <code>`assign Dividend Interval`</code>, <code>assign Dividend Amount</code>.</span>
            </div>
          </div>}

          <div className="div-2">
            <div className="kard exempt">
              <div className="title">Dividend Info</div>
              <div className="r">
                <div className="grided">
                  
                  <div>
                    <span>{coin != null && coin.isDividendPaymentPeriod ? `${coin.divPercent > 0 ? coin.divPercent : '0.00'}%` : `---`}</span>
                    <span>Dividend percent</span>
                  </div>
                  <div>
                    <span>{coin != null && coin.isDividendPaymentPeriod ? `${coin.divIntervalCountValue > 0 ? coin.divIntervalCountValue : '0.00'}` : `---`}</span>
                    <span>Total Session</span>
                  </div>

                  <div>
                    <span>{coin != null && coin.isDividendPaymentPeriod ? `$${coin.divPercent > 0 ? formatNum(((coin.divPercent * (coin.divIntervalCountValue-1))/100) * coin.totalSupply) : '0.00'}` : `---`}</span>
                    <span>Total Accumulated Dividend</span>
                  </div>
                </div>
                <div className="grided">
                  
                  <div>
                    <span>{coin != null && coin.isDividendPaymentPeriod ? `$ ${coin.isDividendPaymentPeriod > 0 ? formatNum((Number(coin.totalSupply)) * (coin.divPercent/100)) : '0.00'}` : `---`}</span>
                    <span>USDC payment per session</span>
                  </div>
                  <div>
                    <span>{coin != null && coin.totalSupply ? `${coin.totalSupply > 0 ? formatNum(coin.totalSupply) : '0.00'}` : `---`}</span>
                    <span>TotalSupply</span>
                  </div>
                  <div>
                    <span>{coin != null && coin.contractUSDC ? `$ ${coin.contractUSDC > 0 ? `${formatNum(coin.contractUSDC)}` : '0.00'}` : `---`}</span>
                    <span>Contract USDC Balance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="info-tab">
            <div className="information">
              <TransactionHashs maxL={10} />
            </div>
          </div>
        </div>
      </div>
    </dividendContext.Provider>
  )
}

export default DividendManagement;

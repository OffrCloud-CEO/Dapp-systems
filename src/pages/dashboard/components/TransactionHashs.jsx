import { ethers } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import { tokenSaleABI, tokenSaleAddress } from '../../../util/constants/tokenSaleContract';
import TdType from '../token/components/transsactions/TdType';
import TdTime from '../token/components/transsactions/TdTime'; 
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { fireStore } from '../../../firebase/sdk';
import { contextData } from '../dashboard';
import { tokenABI, tokenAddress } from '../../../util/constants/tokenContract';
import { dividendManagementABI, dividendManagementAddress } from '../../../util/constants/tokenDividendManagement';

const TransactionHashs = ({ methods, maxL }) => {
    const [signerAddress, setSignerAddress] = useState("");
    const { tokenSaleInfo } = useContext(contextData);
    const [batchNameLive, setBatchNameLive] = useState("");
    const [displayTransactions, setDisplayTransactions] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [tempHoldTransactions, setTempHoldTransactions] = useState(null);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(()=>{
        setBatchNameLive(tokenSaleInfo?.batchName);
    }, [tokenSaleInfo]);

    useEffect(() => {
        async function fetchData() {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            await signer.getAddress().then(i=>{
                setSignerAddress(i);
            });

            const tokenSaleContract = new ethers.Contract(tokenSaleAddress, tokenSaleABI, signer);
            const tokenDividendManagement = new ethers.Contract(dividendManagementAddress, dividendManagementABI, signer);
            const token = new ethers.Contract(tokenAddress, tokenABI, signer);

            // Token Event Listener
            const KYCUserAddedEvent = token.filters.KYCUserAdded();

            // Token Sale Event Listener
            const TokensPurchasedEvent = tokenSaleContract.filters.TokensPurchased();
            const TokenSaleStartedEvent = tokenSaleContract.filters.TokenSaleStarted();
            const TokenSaleEndedEvent = tokenSaleContract.filters.TokenSaleEnded();
            const FundsReleasedEvent = tokenSaleContract.filters.FundsReleased();

            // Dividend Contract Listeners
            const DividendsDistributedEvent = tokenDividendManagement.filters.DividendsDistributed();
            const DividendPeriodEndedEvent = tokenDividendManagement.filters.DividendPeriodEnded();
            const DividendPeriodStartedEvent = tokenDividendManagement.filters.DividendPeriodStarted();
            const DividendsClaimedEvent = tokenDividendManagement.filters.DividendsClaimed();

            token.on(KYCUserAddedEvent, async(ad1, event)=>{

                const tx = await provider.getTransaction(event.transactionHash);
                const transactionObject = {
                    hash: tx.hash,
                    from: tx.from,
                    type: 9,
                    amount: "---",
                    timestamp: new Date().getTime(),
                    batch_name: batchNameLive === "" ? tokenSaleInfo?.batchName : batchNameLive,
                };

                setTempHoldTransactions(transactionObject);
            });

            tokenSaleContract.on(TokensPurchasedEvent, async(ad1, ad2, v1, v2, event)=>{
                const tx = await provider.getTransaction(event.transactionHash);
                const transactionObject = {
                    hash: tx.hash,
                    from: tx.from,
                    type: 1,
                    amount: ethers.utils.formatEther(v2),
                    timestamp: new Date().getTime(),
                    batch_name: batchNameLive === "" ? tokenSaleInfo?.batchName : batchNameLive,
                };

                setTempHoldTransactions(transactionObject);
            });

            // Listen For Token Sale Start Event 🎉
            tokenSaleContract.on(TokenSaleStartedEvent, async (startDate, endDate, event) => {
                const tx = await provider.getTransaction(event.transactionHash);
                const transactionObject = {
                    hash: tx.hash,
                    from: tx.from,
                    type: 2,
                    amount: 0,
                    timestamp: new Date().getTime(),
                    batch_name: batchNameLive === "" ? tokenSaleInfo?.batchName : batchNameLive,
                };

                setTempHoldTransactions(transactionObject);
            });
            
            // Listen For Token Sale End Event ❌
            tokenSaleContract.on(TokenSaleEndedEvent, async (batchN, sold, event) => {
                const tx = await provider.getTransaction(event.transactionHash);
                const transactionObject = {
                    hash: tx.hash,
                    from: tx.from,
                    type: 4,
                    amount: 0,
                    timestamp: new Date().getTime(),
                    batch_name: batchNameLive === "" ? tokenSaleInfo?.batchName : batchNameLive,
                };
                setTempHoldTransactions(transactionObject);
            });

            // Listen For Dividend Payment Period Activated ✅
            tokenDividendManagement.on(DividendPeriodStartedEvent, async (_per, _intr, _perc, event) => {
                const tx = await provider.getTransaction(event.transactionHash);
                const transactionObject = {
                    hash: tx.hash,
                    from: tx.from,
                    type: 6,
                    amount: "---",
                    timestamp: new Date().getTime(),
                    batch_name: batchNameLive === "" ? tokenSaleInfo?.batchName : batchNameLive,
                };

                setTempHoldTransactions(transactionObject);
            });
            
            // Listen For Dividend Payment Period Ended ❌
            tokenDividendManagement.on(DividendPeriodEndedEvent, async (_per, _intr, _perc, event) => {
                const tx = await provider.getTransaction(event.transactionHash);
                const transactionObject = {
                    hash: tx.hash,
                    from: tx.from,
                    type: 7,
                    amount: "---",
                    timestamp: new Date().getTime(),
                    batch_name: batchNameLive === "" ? tokenSaleInfo?.batchName : batchNameLive,
                };

                setTempHoldTransactions(transactionObject);
            });
            
            // Listen For Dividend Payment Period Activated ✅
            tokenDividendManagement.on(DividendsDistributedEvent, async (idx, val, event) => {
                const tx = await provider.getTransaction(event.transactionHash);
                const transactionObject = {
                    hash: tx.hash,
                    from: tx.from,
                    type: 3,
                    amount: ethers.utils.formatEther(val),
                    timestamp: new Date().getTime(),
                    batch_name: batchNameLive === "" ? tokenSaleInfo?.batchName : batchNameLive,
                };

                setTempHoldTransactions(transactionObject);
            });

            // Listen For Dividend Payment Period Activated ✅
            tokenDividendManagement.on(DividendsClaimedEvent, async (idx, val, event) => {
                const tx = await provider.getTransaction(event.transactionHash);
                const transactionObject = {
                    hash: tx.hash,
                    from: tx.from,
                    type: 8,
                    amount: ethers.utils.formatEther(val),
                    timestamp: new Date().getTime(),
                    batch_name: batchNameLive === "" ? tokenSaleInfo?.batchName : batchNameLive,
                };

                setTempHoldTransactions(transactionObject);
            });

            // Listen For Funds Released Event 🎁
            tokenSaleContract.on(FundsReleasedEvent, async (from, amountToken, event) => {
                const tx = await provider.getTransaction(event.transactionHash);
                const transactionObject = {
                    hash: tx.hash,
                    from: tx.from,
                    type: 5,
                    amount: ethers.utils.formatEther(amountToken),
                    timestamp: new Date().getTime(),
                    batch_name: batchNameLive === "" ? tokenSaleInfo?.batchName : batchNameLive,
                };

                setTempHoldTransactions(transactionObject);
            });

            return () => {
                tokenSaleContract.removeAllListeners();
            }
        }
        fetchData();
    }, []);

    /** 
   * If coinBase is true, then for each element in the transactions array, set the document in the
   * user_transactions collection to the value of the element.
   */
    const updateTransactionList = async () => {
        const userRef = collection(fireStore, "user_transactions");
        const uniqueArray = [...new Set(transactions)];

        uniqueArray.forEach(async (element) => {
            await setDoc(doc(userRef, `${element.hash}`), element);
        });
    }

    useEffect(() => {
        if (transactions.length > 0) {
            updateTransactionList();
            const unFilteredArray = [...new Set(transactions)]; 
            const filteredArray = []; 

            unFilteredArray.forEach(element => {
                if (methods) {
                    if (methods.includes(element.type)) {
                        filteredArray.push(element);
                    }
                }else{
                    filteredArray.push(element);
                }
            });

            setDisplayTransactions(filteredArray);
        }
    }, [transactions]);

    const fetchTransactions = async () => {
        setLoadingData(true);
        const collectionSnap = await getDocs(collection(fireStore, "user_transactions"));
        let tempArray = [];
        let refinedArray = [];

        collectionSnap.forEach(element => {
            const data = element.data();

            if (methods) {
                // if (data.batch_name === batchNameLive) {
                // }
                tempArray.push(data);
            }else{
                tempArray.push(data);
            }
        });

        !methods && tempArray.forEach(element => {
            refinedArray.push(element);
        });
        
        methods && tempArray.forEach(element => {
            if (methods.includes(element.type)) {
                refinedArray.push(element);
            }
        });

        refinedArray.sort((a, b) => {
            let timestampA = new Date(a.timestamp);
            let timestampB = new Date(b.timestamp);
            if (timestampA < timestampB) {
                return -1;
            }
            if (timestampA > timestampB) {
                return 1;
            }
            return 0;
        }).reverse();

        const max = maxL ? maxL : 10;
        const total = refinedArray.length - max;

        if (total > 0) {
            refinedArray.splice(-total, total);
        }

        setTransactions(refinedArray);
        setLoadingData(false);
    }

    useEffect(() => {
        if (batchNameLive !== '') {
            fetchTransactions();
        }
    }, [batchNameLive]);

    function addObjectToArray(obj, arr) {
        // Check if the object already exists in the array
        const index = arr.findIndex((element) => JSON.stringify(element) === JSON.stringify(obj));
        if (index === -1) {
            // If the object doesn't exist, add it to the array
            arr.unshift(obj);
        }
    }

    useEffect(()=>{
        if (tempHoldTransactions !== null) {
            const tempArray = [...transactions];
            addObjectToArray(tempHoldTransactions, tempArray);
            setTransactions(tempArray);
        }
    }, [tempHoldTransactions]);


    return (
        <div className="div-table">
            {loadingData && <div className="pending">
                <img src="https://gineousc.sirv.com/Images/sp.gif" alt="" />
            </div>}
            <label>Last {maxL ? maxL : "10"} Transactions</label>
            <table>
                <thead>
                    <tr>
                        <td>Hash</td>
                        <td className='mb'>Sender</td>
                        <td className='mb amt'>Method</td>
                        <td className='amt'>Amount</td>
                        <td className='mb'>Date</td>
                    </tr>
                </thead>
                <tbody>
                    {displayTransactions.length > 0 && displayTransactions.map(transaction => (
                        <tr key={transaction.hash}>
                            <td className='ad'><a href={`https://sepolia.etherscan.io/tx/${transaction.hash}`} target="_blank" rel="noopener noreferrer">{transaction.hash}</a></td>
                            <td className='ad mb'>{String(transaction.from).toLowerCase() === String(signerAddress).toLowerCase() ? `✌ ${(transaction.from)}` : `${(transaction.from)}`}</td>
                            <TdType type={(transaction.type)} />
                            <td className='amt'>{transaction.amount> 0 ? (Number((transaction.amount)).toLocaleString()): "---"}</td>
                            <TdTime timestamp={(transaction.timestamp)} />
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {transactions.length === 0 && <div className="empty">No Transactions...</div>}
        </div>
    )
}

export default TransactionHashs;
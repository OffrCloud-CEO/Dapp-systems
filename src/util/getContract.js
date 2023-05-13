import { tokenAddress, tokenABI } from './constants/tokenContract';
import { usdcAddress, usdcABI } from './constants/usdcContract';
import { ethers } from 'ethers';


let getContract = new Promise(async function (resolve, reject) {
  let provider;

  try {
    // Connect to ethereum
    if (window.ethereum) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
    } else if (window.web3) {
      provider = new ethers.providers.Web3Provider(window.web3);
    } else {
      provider = new ethers.providers.Web3Provider("http://127.0.0.1:8545");
    }
  } catch (e) {
    console.log(e)
  }

  await provider?.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();


  const fundContractInstance = new ethers.Contract(tokenAddress, tokenABI, signer);
  const daiContractInstance = new ethers.Contract(usdcAddress, usdcABI, signer);

  resolve([fundContractInstance, daiContractInstance]);

})

export default getContract;

import { address3, ABI3 } from './constants/tokenSaleContract';
import { ethers } from 'ethers';


let tokenHandleContract = new Promise(async function (resolve, reject) {
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
  const signerAddress = await signer.getAddress();
  const tokenHandler = new ethers.Contract(address3, ABI3, provider);

  resolve(tokenHandler);

})

export default tokenHandleContract;

export function isValidEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function greetUser() {
  var currentHour = new Date().getHours();
  if (currentHour < 12) {
    return ("Good morning!");
  } else if (currentHour < 17) {
    return ("Good afternoon!");
  } else if (currentHour < 22) {
    return ("Good evening!");
  } else {
    return ("Good night!");
  }
}

export function isSessionSet() {
  const loginSession = JSON.parse(localStorage.getItem('loginSession'));

  if (loginSession) {
    const expDate = new Date(loginSession.expiresAt);
    if (expDate.getTime() > new Date().getTime()) {
      return true;
    }
  }
  return false;
}

export function checkExpiration() {
  const loginSession = JSON.parse(localStorage.getItem('loginSession'));
  if (loginSession && loginSession.expiresAt < new Date()) {
    // Session has expired
    localStorage.removeItem('loginSession');
    return false;
  }
  return true;
}

export function createSession(username, userId) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  // Create the session object
  const loginSession = {
    expiresAt: expiresAt,
    username: username,
    userId: userId
  };

  // Store the session in a cookie or local storage
  localStorage.setItem('loginSession', JSON.stringify(loginSession));
}

function isBigNumber(n) {
  return (typeof n === 'object' && n.constructor.name === 'BigNumber');
}

export function bigNum(num) {
  return num.toLocaleString();
}

export function formatNum(params) {
  let num = params;
  if (isBigNumber(params) || num > 10000000000) {
    num = (bigNum(params)) / (10 ** 18);
  }
  if (num > 1) {
    return bigNum(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else if (num > 0) {
    return num.toFixed(8);
  } else {
    return num;
  }
}

export function formatNumFreeStyle(params) {
  let num = params;
  if (isBigNumber(params) || num > (10**19)) {
    num = (bigNum(params)) / (10 ** 18);
  }
  if (num > 1) {
    return bigNum(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else if (num > 0) {
    return parseFloat(num).toFixed(8);
  } else {
    return num;
  }
}

export function formatEth(params) {
  let num = params;
  if (isBigNumber(params) || num > (10**19)) {
    num = (bigNum(params)) / (10 ** 18);
  }
  
  return num;
}

export function destroySession() {
  localStorage.removeItem('loginSession');
}

export function disconnectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.enable();
    window.ethereum.on('disconnect', (error) => {
      if (!error) {
        console.log('Wallet successfully disconnected.');
      } else {
        console.error('Error disconnecting wallet: ', error);
      }
    });
  } else {
    console.log('No wallet detected. No action taken.');
  }
}



export function moneyFormat(params, test) {
  let returnData = params.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (checkFloatLength(params) > 3 && test === 1) {
    params = params.toFixed(3);
    returnData = params.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }else if (checkFloatLength(params) > 3 && test === 2) {
    params = params.toFixed(8);
    const sp = (params).toString().split(".");
    const fP = sp[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const cP = sp.length > 1 ? sp[1] : "";
    returnData = (`${fP}.${cP}`);
  }
  return returnData;  
}

export async function getCryptoPrice(crypto) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`;
  const response = await fetch(url);
  const data = await response.json();
  return data[crypto].usd;
}

export function checkFloatLength(num) {
  var str = num.toString();
  var decimalIndex = str.indexOf('.');
  if (decimalIndex === -1) {
    return 0;
  } else {
    return str.length - decimalIndex - 1;
  }
}

export function isObjectEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

export const toEth = (e) =>{
  const Web3 = require("web3");
  const web3 = new Web3(new Web3.providers.HttpProvider("https://goerli.infura.io/v3/1b56ed566d884e259fec1d6f94f581b0"));

  return web3.utils.toWei(String(e), 'ether');
}

export function interpretBigNumber(bigNumber) {
    return parseInt(String(bigNumber.hex).slice(2), 16);
}

export function isValidEthAddress(address) {
  if (typeof address !== 'string') return false;
  if (address.length !== 42) return false;
  if (address.slice(0, 2) !== '0x') return false;
  if (!/^[0-9a-fA-F]+$/.test(address.slice(2))) return false;
  return true;
}

export function pasteClipboard(func) {
    navigator.clipboard.readText().then(text => {
      func(String(text).trim());
    });
}

export function calculateTimeDifference(givenTime) {
  const now = new Date();
  const difference = now.getTime() - new Date(givenTime).getTime();
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;

  if (difference < minute) {
    return `${Math.round(difference/1000)} sec${Math.round(difference/1000) === 1 ? '' : 's'} ago`;
  } else if (difference < hour) {
    return `${Math.round(difference/minute)} mins ago`;
  } else if (difference < day) {
    return `${Math.round(difference/hour)} hrs ago`;
  } else if (difference < month) {
    return `${Math.round(difference/day)} days ago`;
  } else if (difference < year) {
    return `${Math.round(difference/month)} months ago`;
  } else {
    return `${Math.round(difference/year)} yrs ago`;
  }
}

export const getPercentage = (start, end) =>{
  const startDate = start;
  const endDate = end;
  const now  = new Date();

  const difference = endDate.getTime() - now.getTime();
  const differenceInit = endDate.getTime() - startDate.getTime();

  const percent = (100 -(100/differenceInit) * difference);

  return (percent).toPrecision(2);
}

export function getDateDiff(startdate, enddate) {
  // Get the difference between the two dates in milliseconds
  const diffInMs = Math.abs(enddate - startdate);

  // Convert the difference to days and hours
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  // Construct the output string based on the days and hours difference
  let output = "";
  if (days > 0) {
    output += days + " days ";
  }else if (hours > 0) {
    output += hours + " hrs ";
  }
  output += "Left";

  return output;
}

export function formatLargeNumber(num) {
  function roundToOneDecimalPlace(num) {
    return Math.round(num * 10) / 10;
  }

  num = roundToOneDecimalPlace(num);

  const suffixes = ['', 'k', 'M', 'B', 'T'];
  let i = 0;
  while (num >= 1000 && i < suffixes.length - 1) {
    num /= 1000;
    i++;
  }

  if (i === 2 && num >= 100) {
    num = roundToOneDecimalPlace(num / 1000);
    i++;
  }

  const precision = (i === 0) ? 0 : 1;
  return `${num.toFixed(precision)}${suffixes[i]}`;
}

export function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in one day
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
  return diffDays;
}


export function isNameValid(name) {
  // Define a list of unaccepted strings to check against
  const unacceptedStrings = ['<', '>', 'script', 'alert', 'eval'];

  // Convert the input to lowercase for case-insensitive checking
  const lowercaseName = name.toLowerCase();

  // Check if the input contains any of the unaccepted strings
  for (let i = 0; i < unacceptedStrings.length; i++) {
      if (lowercaseName.includes(unacceptedStrings[i])) {
          return false;
      }
  }

  // If the input does not contain any unaccepted strings, return true
  return true;
}

export function daysToText(days) {
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);

  if (years > 0 && months > 0) {
    return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
  } else if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''}`;
  } else if (days >= 1) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }else{
    const value = Math.floor(days * (24 * 60 * 60));
    const hours = Math.floor(value / (60 * 60));
    const minute = Math.floor(value / (60));
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s": '' }`;
    }else {
      return `${minute} minute${minute > 1 ? "s": '' }`;
    }
  }
}

export function formatPercentage(decimal) {
  let percentage = Number(decimal);
  if (percentage % 1 === 0) {
    return percentage.toFixed(0) + '%';
  } else {
    return percentage.toFixed(2).replace(/\.?0+$/, '') + '%';
  }
}
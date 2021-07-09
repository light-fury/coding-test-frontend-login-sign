import React, { useState } from 'react';
import { ethers } from 'ethers';
import Axios from 'axios';

import './App.css';

function App() {
  const [walletAddr, setWalletAddr] = useState('')

  const truncate = (fullStr, strLen, separator) => {
    if (fullStr.length <= strLen) return fullStr;

    separator = separator || '...';

    var sepLen = separator.length,
      charsToShow = strLen - sepLen,
      frontChars = Math.ceil(charsToShow / 2),
      backChars = Math.floor(charsToShow / 2);

    return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
  }

  const connectWallet = async () => {
    if (walletAddr.length > 0) {
      return;
    }
    // Connect to the network
    await window.ethereum.enable()
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const currentNetwork = await provider.getNetwork()
    if (currentNetwork.chainId === 1) {
      const signer = provider.getSigner();
      const walletAddress = await signer.getAddress();
      setWalletAddr(walletAddress)
    } else {
      setWalletAddr('');
    }
  }

  const registerAddress = async () => {
    if (walletAddr.length === 0) {
      await connectWallet();

      setTimeout(() => {
        registerAddress();
      }, 1000);
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenRes = await Axios.get('http://localhost:4000/token', {
        headers: {
          'Content-Type': 'Application/json'
        }
      });
      const nonce = tokenRes.data;
      const message = nonce.toString();
      const signature = await signer.signMessage(message);
      const res = await Axios.post('http://localhost:4000/auth',
        {
          signature,
          address: walletAddr,
          nonce: message
        }, {
          headers: {
            'Content-Type': 'Application/json'
          }
        }
      );
      console.log(res.data);
    } catch (error) {
      //
    }
  }

  return (
    <div className="App">
      <button onClick={() => connectWallet()}>
        {truncate(walletAddr || "Connect Wallet", 15)}
      </button>
      <button onClick={() => registerAddress()}>Register</button>
    </div>
  );
}

export default App;

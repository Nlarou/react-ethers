import React, { useState } from "react";
import { ethers } from "ethers";
import { ReactComponent as MetaMask_Fox } from "../assets/MetaMask_Fox.svg";
import Jazzicon from "react-jazzicon";

function Metamask() {
  const [data, setData] = useState({
    address: "",
    balance: "",
    block: "",
  });

  const connectToMetamask = async () => {
    //Probably get the current metamask account connected here
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const balance = await provider.getBalance(accounts[0]);
    const balanceInEther = ethers.utils.formatEther(balance);
    const block = await provider.getBlockNumber();
    setData({
      address: accounts[0],
      balance: balanceInEther,
      block: block,
    });
  };

  if (data.address === "") {
    return (
      <div className="flex justify-center h-screen p-5">
        <div className="content my-10 mx-auto grid justify-items-center">
          <MetaMask_Fox className="w-3/4 h-3/4" />
          <button
            className="btn btn-large btn-primary"
            onClick={connectToMetamask}
          >
            Connect to Metamask
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center h-screen p-5">
      <div className="content my-10 flex justify-center">
        <div className="card w-full h-full bg-base-100 shadow-xl p-10">
          <figure>
            <Jazzicon diameter={200} seed={data.address} />
          </figure>
          <div className="card-body">
            <div className="card-title font-bold justify-center">
              Welcome web3 Adventurer !
            </div>
            <div className="card-subtitle">Your account: {data.address}</div>
            <div className="">Your balance: {data.balance} ETH</div>
            <div className="">Your block: {data.block}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Metamask;

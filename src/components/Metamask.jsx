import React, { useState } from "react";
import { ethers } from "ethers";
import { ReactComponent as MetaMask_Fox } from "../assets/MetaMask_Fox.svg";
import Jazzicon from "react-jazzicon";
import abi2 from "../utils/abi.json";

const abi = [
  "function store(uint256 num) public",
  "function retrieve() public view returns (uint256)",
];

function Metamask() {
  const [data, setData] = useState({
    address: "",
    balance: "",
    block: "",
    transactions: "",
  });
  const [activeTab, setActiveTab] = useState(0);
  const inputref = React.createRef(null);
  const [transactionData, setTransactionData] = useState({
    to: "",
    value: 0,
    wallet: "metamask",
    privateKey: "",
  });
  const connectToMetamask = async () => {
    //Probably get the current metamask account connected here
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const balance = await provider.getBalance(accounts[0]);
    const balanceInEther = ethers.utils.formatEther(balance);
    const block = await provider.getBlockNumber();
    const transactions = await provider.getTransactionCount(accounts[0]);

    //Listen for changes in the metamask account
    provider.on("block", (block) => {
      setData((prevState) => ({
        ...prevState,
        block: block,
      }));
    });

    setData({
      address: accounts[0],
      balance: balanceInEther,
      block: block,
      transactions: transactions,
    });
  };
  const changeActiveTab = (tab) => {
    setActiveTab(tab.currentTarget.id);
  };

  const connectToContractToken = async () => {
    const address = inputref.current.value;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const contract = new ethers.Contract(address, abi2, provider.getSigner());
    const balance = await contract.balanceOf(accounts[0]);
    const balanceInEther = ethers.utils.formatEther(balance);
    const name = await contract.name();
    const symbol = await contract.symbol();
    alert(`${name} - ${accounts[0]} has ${balanceInEther} ${symbol}`);
  };

  const connectToContract = async () => {
    const address = inputref.current.value;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(address, abi2, provider.getSigner());
    //display the contract methods
    const methods = await contract.interface.functions;
    alert(JSON.stringify(methods));
  };

  const sendTransaction = async () => {
    if (transactionData.wallet === "metamask") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const response = await signer.sendTransaction({
        to: transactionData.to,
        value: ethers.utils.parseEther(transactionData.value),
      });
    }
    if (transactionData.wallet === "custom") {
      const provider = new ethers.providers.JsonRpcProvider(
        "HTTP://127.0.0.1:7545"
      );
      const wallet = new ethers.Wallet(transactionData.privateKey, provider);
      const response = await wallet.sendTransaction({
        to: transactionData.to,
        value: ethers.utils.parseEther(transactionData.value),
      });
      await response.wait();
      alert("Transaction sent: " + response.hash);
      connectToMetamask();
    }
  };

  const transactionOnchange = (e) => {
    setTransactionData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
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
              Welcome To this Sad App
            </div>
            <div className="card-subtitle">Your account: {data.address}</div>
            <div className="">Your balance: {data.balance} ETH</div>
            <div className="">Your block: {data.block}</div>
            <div className="">Number of transactions: {data.transactions}</div>
            <div class="tabs mx-auto">
              <a
                class={`tab tab-bordered ${activeTab == 1 ? "tab-active" : ""}`}
                onClick={changeActiveTab}
                id={1}
              >
                Make Transaction
              </a>
              <a
                class={`tab tab-bordered ${activeTab == 0 ? "tab-active" : ""}`}
                onClick={changeActiveTab}
                id={0}
              >
                Read Contract
              </a>
            </div>
            {activeTab == 0 && (
              <div className="card-body">
                <div className="card-title font-bold justify-center">
                  Read contract data
                </div>
                <input
                  type="text"
                  placeholder="Enter a contract address"
                  ref={inputref}
                />
                <button
                  className="btn btn-large btn-primary"
                  onClick={connectToContract}
                >
                  Get Contract
                </button>
              </div>
            )}
            {activeTab == 1 && (
              <div className="card-body">
                <div className="card-title font-bold justify-center">
                  Make transaction
                </div>
                <div className="flex justify-start space-x-2">
                  <div>Metamask / Custom Wallet:</div>
                  <input
                    type="radio"
                    name="radio-1"
                    class="radio"
                    id="wallet"
                    value="metamask"
                    onChange={transactionOnchange}
                    checked={transactionData.wallet === "metamask"}
                  />
                  <input
                    type="radio"
                    name="radio-1"
                    class="radio"
                    id="wallet"
                    value="custom"
                    onChange={transactionOnchange}
                    checked={transactionData.wallet === "custom"}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Enter a destination wallet address"
                  id="to"
                  onChange={transactionOnchange}
                />
                {transactionData.wallet === "custom" && (
                  <input
                    type="text"
                    placeholder="Enter your private key"
                    id="privateKey"
                    onChange={transactionOnchange}
                  />
                )}
                <input
                  type="number"
                  placeholder="Enter a value"
                  id="value"
                  onChange={transactionOnchange}
                />
                <button
                  className="btn btn-large btn-primary"
                  onClick={sendTransaction}
                >
                  Send Transaction
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Metamask;

import { useEffect, useState } from 'react';
import './App.css';
//An Application Binary Interface (ABI) is a collection of Fragments which specify how to interact with various components of a Contract. here we import a .json object containing data for interaction with the smart contract.
import contractabi from './contracts/contract.json';
import Select from 'react-select'
import { ethers } from 'ethers';

// contract address on the blockchain
const contractAddress = "0x68601a35205Bd0772C876D0Fd50d714A5FA5B4A8";
const abi = contractabi;
console.log(abi)
function App() {
  // state using react hooks , current account for the logged in metamask account 
  const [currentAccount, setCurrentAccount] = useState(null);
  // Options for the Options to be injected to the React selector
  const [Options, SetOptions] = useState([]);
  // selected to the choice the user selected for the vote .
  const [selected , Setselected] = useState(null);

  const checkWalletIsConnected = async () => {

    const { ethereum } = window;
    // detects if the user connected a wallet to the page ( Metamask ,)
    if (!ethereum) {
      console.log("Please install metamask");
      return;
    } 
      console.log("Wallet exists")
    

   
  }

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {

      // get ethereum account data 
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
      const provider = new ethers.providers.Web3Provider(ethereum);
      // get signer of the transaction 
      const signer = provider.getSigner();
      // create Votecontract , we could load it in the state but left here for educational purposes 
      const Votecontract = new ethers.Contract(contractAddress, abi, signer);
      
      // get the voting proposals from the smart contract  blockchain 
      let  contractoptions =  await Votecontract.viewProposals()
      let  selectoroptions = [];
      // create label and value array of object type for react-select https://react-select.com/home load them into the state 
      contractoptions.map((x,i) => {
        let op = {value: i, label: x}
        selectoroptions.push(op)
      })
      SetOptions(selectoroptions)
        
    } catch (err) {
      console.log(err)
    }
  }

  const voteHandler = async () => {

               


    try {
      const { ethereum } = window;

      if (ethereum) {
        // get ethereum provider
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer =  await provider.getSigner();
            // create Votecontract , we could load it in the state but left here for educational purposes 
        const Votecontract = new ethers.Contract(contractAddress, abi, signer);
        // initiate the transaction 
        console.log(selected)
        let voteTxn = await Votecontract.vote(selected);

        console.log("Mining... please wait");
        await voteTxn.wait();
        // return in the console the hash 
        console.log(`Mined, see transaction: https://ropsten.etherscan.io/tx/${voteTxn.hash}`);

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      alert(err);
    }
  }





  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const VoteButton = () => {
    return (
      <div>
     
      <Select onChange={(x) =>{Setselected(x.value)}} options={Options} />
      <button onClick={voteHandler} className='cta-button mint-nft-button'>
        Votefor 
      </button>

     </div>
    )
  }



  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
    <div className='main-app'>
      <h1>Vote Button</h1>
       
      <div>
        {currentAccount ? VoteButton() : connectWalletButton()}
      </div>
    </div>
  )
}

export default App;

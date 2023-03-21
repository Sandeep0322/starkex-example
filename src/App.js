import './App.css';
import react, { useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from 'react-bootstrap';
const starkwareCrypto = require('@starkware-industries/starkware-crypto-utils');
const StarkExAPI = require('@starkware-industries/starkex-js/browser');

function App() {
  const [account, setAccount] = react.useState("");
  const [starkKey, setStarkKey] = react.useState("");
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const starkExAPI = new StarkExAPI({
    endpoint: 'https://perpetual-playground-v2.starkex.co'
  });

  const handleMetaMask = async () => {
  
    if (!window.ethereum) {
      alert('Metamask not installed..!')
    } else {
      let walletData = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('wallet data', walletData)
      // setReadOnly(true);
      setAccount(walletData[0]);
      window.ethereum.on('accountsChanged', function (accounts) {
        let acc = accounts[0];
        setAccount(acc)
      });
    }
  }

  const getStarkKey = async () => {
    console.log('nonBIP32 key generation');
    const signer = provider.getSigner()
    let message = "We need you sign this message to create you a guardian link account"
    let flatsig = await signer.signMessage(message);
    let sig = ethers.utils.splitSignature(flatsig);
    console.log("r",sig.r)
    const grinded = starkwareCrypto.keyDerivation.grindKey(sig.r, starkwareCrypto.ec.n)
    console.log("grind Key :", grinded)
    let datas = starkwareCrypto.ec.keyFromPrivate(grinded, 'hex');
    const publicKey1 = starkwareCrypto.ec.keyFromPublic(datas.getPublic(true, 'hex'), 'hex');
    const pkey1 = datas.getPrivate('hex');                               //grindkey is nothing but privatekey//
    console.log("private Key :", pkey1);
    const publicKey1X = publicKey1.pub.getX();
    console.log("public Key :", publicKey1X.toString(16))
    setStarkKey(publicKey1X.toString(16))
    return publicKey1X.toString(16);
  }

  // const getStarkSign = async (msgHash) => {
  //   console.log("msgHash :", msgHash)
  //   console.log('nonBIP32 key generation');
  //   const signer = provider.getSigner()
  //   let message = "We need you sign this message to create you a guardian link account"
  //   let flatsig = await signer.signMessage(message);
  //   let sig = ethers.utils.splitSignature(flatsig);
  //   const grinded = starkwareCrypto.keyDerivation.grindKey(sig.r, starkwareCrypto.ec.n)
  //   console.log("grind Key :", grinded)
  //   let datas = starkwareCrypto.ec.keyFromPrivate(grinded, 'hex');
  //   let sign = starkwareCrypto.sign(datas, msgHash)
  //   console.log(sign)
  //   return sign
  // }

  const transferToken = async () => {
    // let senderStarkKey = await getStarkKey();
    // let receiverStarkKey = "0x35f08479cc3c90e5dae64cc8c1f537a8875a04e3045ef0635972f48256599d1";
    let txId = await starkExAPI.gateway.getFirstUnusedTxId();
    console.log("txId",txId);
  }

  return (
    <div className="App">
      <p>Connected Account : {account}</p>
      {account == "" && <Button onClick={handleMetaMask}>connect</Button>}<br></br>
      {account != "" && <Button className="button-85" onClick={getStarkKey}>starkKey</Button>}
      {starkKey && <p>StarkKey - {starkKey}</p>}
      {account != "" && <Button className="button-85" onClick={transferToken}>transfer</Button>}
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import Select from "react-select";
import CanvasContract from "./Canvas.json";
import { Color } from "./utils/types"
import { hexToColor } from "./utils/convert"

const ethers = require('ethers');

const connMethodOptions = [
  {value: "localhost", label: "localhost"},
  {value: "Metamask", label: "Metamask"}
]

function App() {
  const [connMethod, setConnMethod] = useState("localhost");
  const [contractAddress, setContractAddress] = useState(null);

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const [canvasColors, setCanvasColors] = useState("");
  const [tokenId, setTokenId] = useState(null);
  const [color, setColor] = useState(Color);

  const handleProviderConnect = () => {
      const connectLocalhost = async () => {
          const localhostProvider = new ethers.JsonRpcProvider('http://localhost:8545');
          setProvider(localhostProvider);

          localhostProvider.getSigner(0).then(account => {
              setSigner(account);
          });
      };

      const connectMetamask = async () => {
          if (!window.ethereum) console.log("Metamask not avaiable");
          else {
              const metamaskProvider = new ethers.BrowserProvider(window.ethereum);
              setProvider(metamaskProvider);

              metamaskProvider.send("eth_requestAccounts", []).then(() => {
                  metamaskProvider.getSigner().then(account => {
                      setSigner(account);
                  });
              }).catch(() => console.log("Could not get signer"));
          }
      };

      if (connMethod == "localhost") connectLocalhost();
      else connectMetamask();
  };

  const handleContractAddressChange = event => {
      setContractAddress(event.target.value);
  };

  const handleSetContract = () => {
      console.log("Setting contract...");
      setContract(new ethers.Contract(
        contractAddress,
        CanvasContract.abi,
        signer
    ));
  };

  const handleSetTokenId = event => {
    setTokenId(event.target.value);
  };

  const handleSetColor = event => {
    setColor(hexToColor(event.target.value));
  };

  const handleChangeColor = async () => {
    await contract.changeNFTColour(tokenId, color.red, color.green, color.blue);
  };

  const checkCanvasColors = async () => {
      if (!contract) setCanvasColors("Please set the contract first");
      else {
          let raport = "";
          for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                // TODO: fix logic for getting the cell index from (i, j) coordinates
                raport += `Cell (${i}, ${j}) has color ${await contract.getNFTColour(i * 5 + j)}\n`
            }
          }

          setCanvasColors(raport);
      }
  }

  return (
    <div>
      <p>NFT Canvas</p>

      <div>
        <p>Select provider</p>
        <Select 
          defaultValue={connMethod}
          onChange={item => setConnMethod(item.value)}
          options={connMethodOptions}/>
        <button onClick={handleProviderConnect}>Connect</button>
        <p>Your address: {signer == null ? "None" : signer.address} </p>
      </div>

      <div>
        <p>Contract address</p>
        <input onChange={handleContractAddressChange} />
        <button onClick={handleSetContract}>Set contract</button>
        <p>Contract set: {contract == null ? "No" : "Yes"}</p>
      </div>

      <div>
        <button onClick={checkCanvasColors}>Check canvas colors</button>
        {canvasColors != "" && <p>{canvasColors}</p>}
      </div>
      
      <div>
      <p>Change canvas colors</p>
      Token ID <input onChange={handleSetTokenId}/>
      New hex color <input onChange={handleSetColor} />
      <button onClick={handleChangeColor}>Change color</button>
      </div>
    </div>
  );
}

export default App;

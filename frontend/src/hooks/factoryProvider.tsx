import { ethers } from "ethers"
import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { FACTORY_CONTRACT_ADDRESS } from "../utils/constants"
import FactoryContract from "./Factory.json";
import { CanvasInfo } from "../utils/types";

type FactoryContextValue = {
  canvases: CanvasInfo[],
  refreshCanvases: () => Promise<void>;
}

const defaultValue: FactoryContextValue = {
  canvases: [],
  refreshCanvases: async () => {return;}
}

const FactoryContext = createContext<FactoryContextValue>(defaultValue)

interface FactoryProviderProps {
  children: React.ReactNode;
}

export const FactoryProvider: React.FC<FactoryProviderProps> = ({
  children
}) => {
  const [provider, setProvider] = useState<ethers.JsonRpcProvider>()
  const [signer, setSigner] = useState<ethers.JsonRpcSigner>()
  const [contract, setContract] = useState<ethers.Contract>()
  const [canvases, setCanvases] = useState<CanvasInfo[]>([])

  const populateCanvases = async (provider: ethers.JsonRpcProvider, factory_contract: ethers.Contract) => {
    const creationEventFilter = {
      address: FACTORY_CONTRACT_ADDRESS,
      topics: [
          ethers.id("CanvasCreation(address,uint8,string)")
      ]
    };

    const changeTitleEventFilter = {
        address: FACTORY_CONTRACT_ADDRESS,
        topics: [
            ethers.id("CanvasTitleChange(address,string)")
        ]
    };

    // mapping from canvas to size and title
    var canvases: {[address: string] : {size: bigint, title: string}} = {};

    // Fetch all logs
    const creationLogs = await provider.getLogs({
        ...creationEventFilter,
        fromBlock: 0,
        toBlock: 'latest'
    });

    const renameLogs = await provider.getLogs({
        ...changeTitleEventFilter,
        fromBlock: 0,
        toBlock: 'latest'
    });

    creationLogs.forEach(log => {
        const parsedLog = factory_contract.interface.parseLog(log);
        if (parsedLog !== null) {
          const [addr, size, title] = parsedLog.args;
          canvases[addr] = {size, title};
        }
    });

    renameLogs.forEach(log => {
      const parsedLog = factory_contract.interface.parseLog(log);
      if (parsedLog !== null) {
        const [addr, title] = parsedLog.args;
        canvases[addr].title = title;
      }
    });

    // write context
    let canvasesInfo: CanvasInfo[] = [];
    for (const addr in canvases) {
        const {size, title} = canvases[addr];
        canvasesInfo.push({address: addr, size, title});
    }
    setCanvases(canvasesInfo);
  }

  const handleFactory = useCallback(async () => {
    const localhostProvider = new ethers.JsonRpcProvider();
    setProvider(localhostProvider);

    const account = await localhostProvider.getSigner(0);
    setSigner(account);

    const factory_contract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FactoryContract.abi, account);
    setContract(factory_contract);

    await populateCanvases(localhostProvider, factory_contract);
  }, [])

  useEffect(() => {
    try {
        handleFactory()
    } catch(error) {
        console.error(error)
    }
  }, [])

  const refreshCanvases = async () => {
    if (provider !== undefined && contract !== undefined)
      await populateCanvases(provider, contract);
  };

  return (
    <FactoryContext.Provider value={{
      canvases: canvases,
      refreshCanvases: refreshCanvases,
    }}>
      {children}
    </FactoryContext.Provider>
  )
}

const useFactory = (): FactoryContextValue => {
  return useContext(FactoryContext)
}

export default useFactory

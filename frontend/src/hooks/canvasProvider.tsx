import { ethers } from "ethers"
import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { NUM_OF_COLS, NUM_OF_ROWS } from "../utils/constants"
import { Color } from "../utils/types"
import CanvasContract from "./Canvas.json";

type CanvasContextValue = {
  provider?: ethers.JsonRpcProvider;
  signer?: ethers.JsonRpcSigner;
  contract?: ethers.Contract;
  colors: Color[];
  setColor: (tokenId: number, color: Color) => void;
  refreshToken: (tokenId: number) => Promise<void>;
}

const defaultValue: CanvasContextValue = {
  colors: [],
  setColor: () => {return;},
  refreshToken: async () => {return;}
}

const CanvasContext = createContext<CanvasContextValue>(defaultValue)

interface CanvasProviderProps {
  children: React.ReactNode;
}

export const CanvasProvider: React.FC<CanvasProviderProps> = ({
  children
}) => {
  const [provider, setProvider] = useState<ethers.JsonRpcProvider>()
  const [signer, setSigner] = useState<ethers.JsonRpcSigner>()
  const [contract, setContract] = useState<ethers.Contract>()
  const [colors, setColors] = useState<Color[]>([])

  const handleContract = useCallback(async () => {
    const localhostProvider = new ethers.JsonRpcProvider();
    setProvider(localhostProvider);

    const account = await localhostProvider.getSigner();
    setSigner(account);

    const contract = new ethers.Contract("0x5FbDB2315678afecb367f032d93F642f64180aa3", CanvasContract.abi, signer);
    setContract(contract);
  }, [])

  const getNFTColorByToken = useCallback(async (tokenId: number): Promise<Color | undefined> => {
    const color = await contract?.getNFTColour(tokenId)
    if (color) {
      return {
        red: color[0],
        green: color[1],
        blue: color[2]
      }
    } else {
      return undefined
    }
  }, [contract])

  const setColor = useCallback(async (tokenId: number, color: Color) => {
    await contract?.changeNFTColour(tokenId, color.red, color.green, color.blue)
  }, [contract])

  const refreshToken = useCallback(async (tokenId: number) => {
    const newColor = await getNFTColorByToken(tokenId)
    if (newColor !== undefined) {
      setColors(colors.map((color, index) => index === tokenId ? newColor : color))
    }
  }, [colors, getNFTColorByToken])

  const createCanvas = useCallback(async () => {
    const newColors: Color[] = []

    for (let i = 0; i < NUM_OF_ROWS; i++) {
      for (let j = 0; j < NUM_OF_COLS; j++) {
        const tokenId = i * NUM_OF_ROWS + j;
        const newColor = await getNFTColorByToken(tokenId)
        if (newColor === undefined) {
          newColors.push({red: BigInt(-1), green: BigInt(-1), blue: BigInt(-1)})
        } else {
          newColors.push(newColor)
        }
        // setColors(newColors.map(color => color))
      }
    }

    setColors(newColors)
  }, [contract, getNFTColorByToken])


  useEffect(() => {
    try {
      handleContract()
    } catch(error) {
      console.error(error)
    }
  }, [])


  useEffect(() => {
    if (contract !== undefined && signer !== undefined && provider !== undefined) {
      try {
        createCanvas()
      } catch (error) {
        console.error(error);
      }
      
    } 

  }, [contract, signer, provider])

  return (
    <CanvasContext.Provider value={{
      signer: signer,
      provider: provider,
      contract: contract,
      colors: colors,
      setColor: setColor,
      refreshToken: refreshToken,
    }}>
      {children}
    </CanvasContext.Provider>
  )
}

const useCanvas = (): CanvasContextValue => {
  return useContext(CanvasContext)
}

export default useCanvas
import { ethers } from "ethers"
import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { Color } from "../utils/types"
import CanvasContract from "./Canvas.json";

type CanvasContextValue = {
  provider?: ethers.JsonRpcProvider;
  signer?: ethers.JsonRpcSigner;
  contract?: ethers.Contract;
  size: number,
  title: string,
  colors: Color[];
  changeCanvas: (address: string, size: number, title: string) => void;
  setColor: (tokenId: number, color: Color) => void;
  refreshToken: (tokenId: number) => Promise<void>;
}

const defaultValue: CanvasContextValue = {
  colors: [],
  size: 1,
  title: "",
  changeCanvas: () => {},
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
  // etherjs state
  const [provider, setProvider] = useState<ethers.JsonRpcProvider>()
  const [signer, setSigner] = useState<ethers.JsonRpcSigner>()

  // canvas-specific state
  const [contract, setContract] = useState<ethers.Contract>()
  const [size, setSize] = useState<number>(5)
  const [title, setTitle] = useState<string>()

  const [colors, setColors] = useState<Color[]>([])

  const setupProviderSigner = async () => {
    const localhostProvider = new ethers.JsonRpcProvider();
    setProvider(localhostProvider);

    const account = await localhostProvider.getSigner(0);
    setSigner(account);
  }

  const changeCanvas = (address: string, size: number, title: string) => {
      const contract = new ethers.Contract(address, CanvasContract.abi, signer);
      setContract(contract);
      setSize(size);
      setTitle(title);
  }

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

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const tokenId = i * size + j;
        const newColor = await getNFTColorByToken(tokenId)
        if (newColor === undefined) {
          newColors.push({red: BigInt(-1), green: BigInt(-1), blue: BigInt(-1)})
        } else {
          newColors.push(newColor)
        }
      }
    }

    setColors(newColors)
  }, [contract, getNFTColorByToken])


  useEffect(() => {
    try {
      setupProviderSigner()
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
      size: size,
      title: title ? title : "",
      colors: colors,
      changeCanvas: changeCanvas,
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
import { ethers } from "ethers"
import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { Color } from "../utils/types"
import CanvasContract from "./Canvas.json";
import useFactory from "./factoryProvider";

type CanvasContextValue = {
  contract?: ethers.Contract;
  size: number,
  title: string,
  colors: Color[];
  balance: bigint;
  refreshBalance: () => void;
  setTitle: (title: string) => void;
  changeCanvas: (address: string, size: number, title: string) => void;
  unsetCanvas: () => void;
  setColor: (tokenId: number, color: Color) => void;
  refreshToken: (tokenId: number) => Promise<void>;
}

const defaultValue: CanvasContextValue = {
  colors: [],
  size: 1,
  title: "",
  balance: BigInt(0),
  refreshBalance: () => { },
  setTitle: () => { },
  changeCanvas: () => { },
  unsetCanvas: () => { },
  setColor: () => { return; },
  refreshToken: async () => { return; }
}

const CanvasContext = createContext<CanvasContextValue>(defaultValue)

interface CanvasProviderProps {
  children: React.ReactNode;
}

export const CanvasProvider: React.FC<CanvasProviderProps> = ({
  children
}) => {
  // etherjs state
  const { provider, signer } = useFactory();

  // account-specific state
  const [balance, setBalance] = useState<bigint>(BigInt(0))

  // canvas-specific state
  const [contract, setContract] = useState<ethers.Contract>()
  const [size, setSize] = useState<number>(5)
  const [title, setTitle] = useState<string>()

  const [colors, setColors] = useState<Color[]>([])

  const changeCanvas = (address: string, size: number, title: string) => {
    const contract = new ethers.Contract(address, CanvasContract.abi, signer);
    contract.on("ChangedColor", (pixelIdx, r, g, b) => {
      setColors(prevColors => {
        const newColors = prevColors.map((col, index) =>
          index == pixelIdx ? { red: r, green: g, blue: b } : col
        );
        console.log(newColors); // Here, newColors should reflect the updated state
        return newColors;
      });
    });

    setContract(contract);
    setSize(size);
    setTitle(title);
  }

  // reset current canvas when clicking the back button
  const unsetCanvas = () => {
    setContract(undefined);
    setColors([]);
  }

  const getNFTColorByToken = useCallback(async (tokenId: number): Promise<Color | undefined> => {
    const color = await contract?.getNFTColour(tokenId)
    refreshBalance();
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
    refreshBalance();
  }, [contract])

  const refreshToken = useCallback(async (tokenId: number) => {
    const newColor = await getNFTColorByToken(tokenId)
    if (newColor !== undefined) {
      setColors(colors.map((color, index) => index === tokenId ? newColor : color))
    }
    refreshBalance();
  }, [colors, getNFTColorByToken])

  const createCanvas = useCallback(async () => {
    const newColors: Color[] = []

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const tokenId = i * size + j;
        const newColor = await getNFTColorByToken(tokenId)
        if (newColor === undefined) {
          newColors.push({ red: BigInt(-1), green: BigInt(-1), blue: BigInt(-1) })
        } else {
          newColors.push(newColor)
        }
        setColors(newColors.map(color => color))
      }
    }
    setColors(newColors)
  }, [contract, getNFTColorByToken])

  const refreshBalance = async () => {
    if (provider !== undefined && signer !== undefined) {
      const balance = await provider.getBalance(signer.address);
      setBalance(balance);
    }
  }

  useEffect(() => {
    if (contract !== undefined && signer !== undefined && provider !== undefined) {
      try {
        refreshBalance();
        createCanvas()
      } catch (error) {
        console.error(error);
      }
    }

  }, [contract, signer, provider])

  return (
    <CanvasContext.Provider value={{
      contract: contract,
      size: size,
      title: title ? title : "",
      colors: colors,
      balance: balance,
      refreshBalance: refreshBalance,
      setTitle: setTitle,
      changeCanvas: changeCanvas,
      unsetCanvas: unsetCanvas,
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
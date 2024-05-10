import React, { createContext, useContext, useEffect, useState } from "react"
import useCanvas from "./canvasProvider";

type PickedPixelContextValue = {
  index?: number;
  setIndex: (index: number) => void;
}

const defaultValue: PickedPixelContextValue = {
  setIndex: (index: number) => {return;}
}

const PickedPixelContext = createContext<PickedPixelContextValue>(defaultValue)

interface PickedPixelProviderProps {
  children: React.ReactNode;
}

export const PickedPixelProvider: React.FC<PickedPixelProviderProps> = ({
  children
}) => {
  const [index, setIndex] = useState<number>()

  // reset the color picker when moving between canvases
  const { contract } = useCanvas();
  useEffect(() => {
      setIndex(undefined);
  }, [contract])

  return (
    <PickedPixelContext.Provider value={{
      index: index,
      setIndex: setIndex
    }}>
      {children}
    </PickedPixelContext.Provider>
  )
}

const usePickedPixel = ():PickedPixelContextValue => {
  return useContext(PickedPixelContext)
}

export default usePickedPixel
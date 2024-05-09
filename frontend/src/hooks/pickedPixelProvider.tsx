import React, { createContext, useContext, useState } from "react"

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
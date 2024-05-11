import { ethers } from 'ethers'
import { Button, Flex, Input, Text } from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'
import useCanvas from '../hooks/canvasProvider'
import usePickedPixel from '../hooks/pickedPixelProvider'
import { hexToColor, rgbToHex } from '../utils/convert'
import useFactory from "../hooks/factoryProvider"

const SetColorCard: React.FC = () => {

  const { index } = usePickedPixel()
  const { contract, colors, setColor, refreshToken } = useCanvas()
  const { signer } = useFactory()

  const [currentColor, setCurrentColor] = useState<string>('#000000')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [shootEffect, setShootEffect] = useState<boolean>(false)
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [salePrice, setSalePrice] = useState<number>(0)
  const [isForSale, setIsForSale] = useState<boolean>(false)
  const [isBuying, setIsBuying] = useState<boolean>(false)

  useEffect(() => {
    if (index !== undefined && contract !== undefined && signer !== undefined) {
      contract.ownerOf(index)
        .then((owner) => {
          signer?.getAddress()
            .then((signerAddress) => {
            setIsOwner(owner === signerAddress);
          })
        })
        .catch((e) => {
          console.error(e);
        });

      contract.getIsAvailableForSell(index)
        .then((availableForSell) => {
          setIsForSale(availableForSell);
        })
        .catch((error) => {
          console.error(error);
        });
      
      contract.getSalePrice(index)
        .then((res) => {
          setSalePrice(res);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      setIsOwner(false);
      setIsForSale(false);
    }
  }, [index, contract, signer, isOwner]);

  useEffect(() => {
    const currentValue =
      index === undefined ? '#000000' : rgbToHex(colors[index].red, colors[index].green, colors[index].blue)
    setCurrentColor(currentValue)
    
  }, [index])

  const onColorPicked = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentColor(event.currentTarget.value)
  }, [])

  const onSetPress = useCallback(() => {
    const newColor = hexToColor(currentColor)
    if (newColor !== undefined && index !== undefined){
      setColor(index, newColor)
    }
  }, [currentColor, index])

  const refreshPixel = () => {
    const val = !shootEffect
    setShootEffect(val)
  }
  
  const onPriceSet = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSalePrice(parseInt(event.currentTarget.value))
  }, [])

  const putForSale = useCallback(() => {
    if (index !== undefined && contract !== undefined) {
      contract.sell(index, salePrice)
        .then(() => {
          setIsForSale(true);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [index, contract, salePrice]);

  const buyPixel = useCallback(async () => {
    if (index !== undefined && contract !== undefined) {
      try {
        setIsBuying(true);
        const transaction = await contract.buy(index, { gasLimit: 3000000, value: salePrice });
        await transaction.wait();
        setIsForSale(false);
        setIsOwner(true);
      } catch (error) {
        console.error("Error buying pixel:", error);
      } finally {
        setIsBuying(false);
      }
    }
  }, [index, contract, salePrice]);

  const revertSell = useCallback(() => {
    if (index !== undefined && contract !== undefined) {
      contract.revertSell(index)
        .then(() => {
          setIsForSale(false);
        })
        .catch((error) => {
          console.error("Error reverting sell:", error);
        });
    }
  }, [index, contract]);

  useEffect(() => {
    setIsLoading(true)
    try {
      if (index !== undefined){
      refreshToken(index)
    }
  } catch(error) {
    console.error(error)
  }
    setIsLoading(false)
  }, [shootEffect])

  return (
    <Flex
      bgColor='#BFBFBF'
      borderRadius='0.5rem'
      flexDir='column'
      padding='0.5rem'
      alignItems='center'
      gridGap='0.5rem'
      width='6rem'
    >
      <Text>{`Pixel: ${index}`}</Text>

      {isOwner ? (
        <>
          <Input type='color' value={currentColor} onChange={onColorPicked}/>
          <Button onClick={onSetPress}>Set Color</Button>
          {!isForSale ? (
            <>
              <Input
                type='number'
                placeholder='Sale Price'
                value={salePrice}
                onChange={onPriceSet}
              />
              <Button onClick={putForSale}>Put for Sale</Button>
            </>
          ) : (
            <Button onClick={revertSell}>Revert Sell</Button>
          )}
        </>
      ) : (
        isForSale && (
          <>
            <Text>{`This pixel is out for sale for ${salePrice}`}</Text>
            {isBuying ? (
              <Text>Loading...</Text>
            ) : (
              <Button onClick={buyPixel}>Buy Pixel</Button>
            )}
          </>
        )
      )}  
      
      <Button onClick={refreshPixel}>{isLoading ? 'Loading...' :'Refresh Pixel'}</Button>

    </Flex>
  );
};

export default SetColorCard

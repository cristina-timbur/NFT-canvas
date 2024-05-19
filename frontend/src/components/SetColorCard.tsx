import { Button, Input, Text } from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'
import useCanvas from '../hooks/canvasProvider'
import usePickedPixel from '../hooks/pickedPixelProvider'
import { hexToColor, rgbToHex } from '../utils/convert'
import useFactory from "../hooks/factoryProvider"

const SetColorCard: React.FC = () => {

  const { index } = usePickedPixel()
  const { contract, colors, setColor, refreshToken, refreshBalance } = useCanvas()
  const { signer, provider } = useFactory()

  const [currentColor, setCurrentColor] = useState<string>('#000000')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [shootEffect, setShootEffect] = useState<boolean>(false)
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [salePrice, setSalePrice] = useState<number>(0)
  const [isForSale, setIsForSale] = useState<boolean>(false)
  const [isBuying, setIsBuying] = useState<boolean>(false)

  const [gasCost, setGasCost] = useState<string>("")

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
    if (newColor !== undefined && index !== undefined) {
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
          refreshBalance();
        })
        .catch((error) => {
          console.error(error);
          refreshBalance();
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
        refreshBalance();
      }
    }
  }, [index, contract, salePrice]);

  const revertSell = useCallback(() => {
    if (index !== undefined && contract !== undefined) {
      contract.revertSell(index)
        .then(() => {
          setIsForSale(false);
          refreshBalance();
        })
        .catch((error) => {
          console.error("Error reverting sell:", error);
          refreshBalance();
        });
    }
  }, [index, contract]);

  const estimateGasCost = async () => {
    if (contract !== undefined && signer !== undefined && provider !== undefined) {
      let estimatedGas = await contract.changeNFTColour.estimateGas(index, 0, 0, 0);
      let gasPrice = (await provider.getFeeData()).gasPrice
      let costInWei = estimatedGas * (gasPrice ? gasPrice : BigInt(0))

      setGasCost(costInWei.toString() + " WEI");
    }
  }

  useEffect(() => {
    setIsLoading(true)
    try {
      if (index !== undefined) {
        refreshToken(index)
      }
    } catch (error) {
      console.error(error)
    }
    setIsLoading(false)
  }, [shootEffect])

  return (
    <>
      <Text className='pixel-text'>{`PIXEL ${index}`}</Text>
      <div className="z-10 flex-actions flex-wrap justify-center lg:gap-y-8">
        {isOwner ? (
          <>
            <div className="no-margin">
              <Input type='color' value={currentColor} onChange={onColorPicked} className="buton-color" />
              <Button onClick={onSetPress} className="flex items-end font-medium text-onSecondaryContainer sm:text-lg logres-form-button buton buton-col">Set Color</Button>
            </div>
            {!isForSale ? (
              <div className="no-margin gazcost">
                <center><p className="price-label">PRICE</p></center>
                <Input
                  type='number'
                  placeholder=''
                  value={salePrice}
                  onChange={onPriceSet}
                  className="new-price-input"
                />
                <Button onClick={putForSale} className="flex items-end font-medium text-onSecondaryContainer sm:text-lg logres-form-button buton">Put for Sale</Button>
              </div>
            ) : (
              <Button onClick={revertSell} className="flex items-end revert font-medium text-onSecondaryContainer sm:text-lg logres-form-button buton">Revert Sell</Button>
            )}

            <div className="flex margin" >
              <Text className="new-gaz-input">{gasCost}</Text>
              <Button onClick={estimateGasCost} className="font-medium text-onSecondaryContainer sm:text-lg logres-form-button buton gazbuton">Gas Cost</Button>
            </div>

          </>
        ) : (
          isForSale && (
            <>
              {isBuying ? (
                <Text className='loading'>LOADING...</Text>
              ) : (
                <>
                  <Text className='our-for-sale-text'>{`PIXEL PRICE: ${salePrice} WEI`}</Text>
                  <Button onClick={buyPixel} className="flex items-end font-medium text-onSecondaryContainer sm:text-lg logres-form-button buton ">Buy Pixel</Button>
                </>
              )}
            </>
          )
        )}
      </div>
    </>
  );
};

export default SetColorCard

import { Button, Flex, Input, Text } from '@chakra-ui/react'
import React, { useCallback, useEffect, useState } from 'react'
import useCanvas from '../hooks/canvasProvider'
import usePickedPixel from '../hooks/pickedPixelProvider'
import { hexToColor, rgbToHex } from '../utils/convert'

const SetColorCard: React.FC = () => {

  const { index } = usePickedPixel()
  const { colors, setColor, refreshToken } = useCanvas()
  
  const [currentColor, setCurrentColor] = useState<string>('#000000')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [shootEffect, setShootEffect] = useState<boolean>(false)
  
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

  useEffect(() => {
    setIsLoading(true)
    try {
      if (index){
        refreshToken(index)
      }
    } catch(error) {
      console.error(error)
    }
    setIsLoading(false)
  }, [shootEffect])

  return (
    <Flex bgColor='#BFBFBF' borderRadius='0.5rem'flexDir='column' padding='0.5rem' alignItems='center' gridGap='0.5rem' width='6rem'>
      <Text>{`Pixel: ${index}`}</Text>
      <Input type='color' value={currentColor} onChange={onColorPicked}/>
      
      <Button onClick={onSetPress}>Set Color</Button>
      <Button onClick={refreshPixel}>{isLoading ? 'Loading...' :'Refresh Pixel'}</Button>
    </Flex>
  )
}

export default SetColorCard
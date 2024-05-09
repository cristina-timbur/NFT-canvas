import { Box, Flex, Text } from '@chakra-ui/react';
import React, { useMemo } from 'react'
import useCanvas from '../hooks/canvasProvider'
import { NUM_OF_COLS, NUM_OF_ROWS } from '../utils/constants';


const LoadingBar: React.FC = () => {
  const { colors } = useCanvas();
  const percent = useMemo(() => {
    return Math.trunc(colors.length / (NUM_OF_COLS * NUM_OF_ROWS) * 100)
  }, [colors.length])
  return (
    <Flex
      pos='relative'
      height='1.5rem'
      width='10rem'
      border='solid black 1px'
      borderRadius='1rem'
      overflow='hidden'
      alignItems='center'
      margin='10px auto'
    >
      <Box
        pos='absolute'
        height='100%'
        width='100%'
        background='linear-gradient(to right, #e5405e 0%, #ffdb3a 45%, #3fffa2 100%);'
      />
      <Box
        pos='absolute'
        height='100%'
        width={`${100 - percent}%`}
        right='0'
        backgroundColor='white'
      />
      <Flex width='60%' alignItems='center' gridGap='0.5rem' justifyContent='space-between'>
        <Text zIndex={1} ml='0.5rem'>{`${percent}%`}</Text>
        <Text zIndex={1} fontSize='0.75rem'>{`${colors.length}/${NUM_OF_COLS * NUM_OF_ROWS}`}</Text>
      </Flex>


    </Flex>
  )
}

export default LoadingBar
import { Box } from '@chakra-ui/react'
import React from 'react'
import usePickedPixel from '../../hooks/pickedPixelProvider'
import { CELL_SIZE } from '../../utils/constants'
import { Color } from '../../utils/types'

const HOVER_PADDING = 1
const PICKED_PADDING = 2

type PixelCellProps = {
  color: Color;
  index: number;
}

const PixelCell: React.FC<PixelCellProps> = ({
  color,
  index
}) => {
  const { index : pickedIndex} = usePickedPixel()
  return (
    <Box
      _hover={{
        border: `solid white ${HOVER_PADDING}px`,
        h: `calc(${CELL_SIZE}rem - ${2 * HOVER_PADDING}px)`,
        w: `calc(${CELL_SIZE}rem - ${2 * HOVER_PADDING}px)`
      }}
      border={pickedIndex === index ? `solid white ${PICKED_PADDING}px` : 'none'}
      backgroundColor={`rgb(${color.red}, ${color.green}, ${color.blue})`}
      height={pickedIndex === index ? `calc(${CELL_SIZE}rem - ${2 * PICKED_PADDING}px)` : `${CELL_SIZE}rem`}
      width={pickedIndex === index ? `calc(${CELL_SIZE}rem - ${2 * PICKED_PADDING}px)` : `${CELL_SIZE}rem`}
    />
  )
}

export default PixelCell
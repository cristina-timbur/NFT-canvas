import React from 'react'
import useCanvas from '../../hooks/canvasProvider'
import { Box, Grid } from '@chakra-ui/react'
import PixelCell from './PixelCell'
import usePickedPixel from '../../hooks/pickedPixelProvider'
import { CELL_SIZE } from '../../utils/constants'

const PixelGrid: React.FC = () => {
  const { colors, size } = useCanvas()
  const { setIndex } = usePickedPixel()

  return (
    <Grid
      gridTemplateColumns={`repeat(${size}, ${CELL_SIZE}rem)`}
      alignContent='start'
      height='auto'
    >
      {
        colors.map((color, index) => (
          <Box key={index} onClick={() => setIndex(index)}>
            <PixelCell color={color} index={index} />
          </Box>
        ))
      }
    </Grid>
  )
}


export default PixelGrid
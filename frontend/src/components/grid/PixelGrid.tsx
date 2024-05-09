import React from 'react'
import useCanvas from '../../hooks/canvasProvider'
import { NUM_OF_COLS, CELL_SIZE } from '../../utils/constants'
import { Box, Grid } from '@chakra-ui/react'
import PixelCell from './PixelCell'
import usePickedPixel from '../../hooks/pickedPixelProvider'

const PixelGrid: React.FC = () => {
  const { colors } = useCanvas()
  const { setIndex } = usePickedPixel()

  return (
    <Grid
      gridTemplateColumns={`repeat(${NUM_OF_COLS}, ${CELL_SIZE}rem)`}
      alignContent='start'
      height='auto'
    >
      {
        colors.map((color, index) => (
          <Box key={index} onClick={() => setIndex(index)}>
            <PixelCell color={color} index={index}/>
          </Box>
        ))
      }
    </Grid>
  )
}


export default PixelGrid
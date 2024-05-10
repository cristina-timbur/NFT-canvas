import { Flex } from "@chakra-ui/react";
import React from "react";
import usePickedPixel from "../hooks/pickedPixelProvider";
import LoadingBar from "./LoadingBar";
import PixelGrid from "./grid/PixelGrid";
import SetColorCard from "./SetColorCard";
import useFactory from "../hooks/factoryProvider";
import useCanvas from "../hooks/canvasProvider";

const MainPage: React.FC = () => {

  const { index } = usePickedPixel()
  const { canvases } = useFactory()
  const { changeCanvas } = useCanvas()

  return (
    <div>
      <ul>
        {
          canvases.map((canvasInfo, idx) => (
            <li key={idx} onClick={() => changeCanvas(canvasInfo.address, Number(canvasInfo.size), canvasInfo.title)}>Address={canvasInfo.address} size={canvasInfo.size.toString()} title={canvasInfo.title}</li>
          ))
        }
      </ul>

      <LoadingBar />
      <Flex
        gridGap='1rem'
        alignContent='center'
        justifyContent='center'
      >
        <PixelGrid />
        {index !== undefined &&
          <SetColorCard />
        }
      </Flex>
    </div>
  );
}

export default MainPage
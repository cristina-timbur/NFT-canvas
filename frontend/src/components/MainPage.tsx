import { Flex } from "@chakra-ui/react";
import React from "react";
import usePickedPixel from "../hooks/pickedPixelProvider";
import LoadingBar from "./LoadingBar";
import PixelGrid from "./grid/PixelGrid";
import SetColorCard from "./SetColorCard";

const MainPage: React.FC = () => {

  const { index } = usePickedPixel()

  return (
    <div>
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
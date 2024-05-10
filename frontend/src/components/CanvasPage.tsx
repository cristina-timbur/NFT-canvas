import { Flex } from "@chakra-ui/react";
import React from "react";
import usePickedPixel from "../hooks/pickedPixelProvider";
import LoadingBar from "./LoadingBar";
import PixelGrid from "./grid/PixelGrid";
import SetColorCard from "./SetColorCard";
import { useNavigate } from "react-router-dom";
import useCanvas from "../hooks/canvasProvider";

const MainPage: React.FC = () => {
    const navigate = useNavigate();
    const { index } = usePickedPixel();
    const { title, unsetCanvas } = useCanvas();

    const handleNavigateBack = () => {
        unsetCanvas();
        navigate("/", { replace: true });
    }

    return (
        <div>
            <button onClick={handleNavigateBack}>Back</button>
            <h2>{title}</h2>
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
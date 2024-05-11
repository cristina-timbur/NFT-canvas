import React, { useEffect, useCallback, useState } from "react";
import { Flex, Input, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import usePickedPixel from "../hooks/pickedPixelProvider";
import LoadingBar from "./LoadingBar";
import PixelGrid from "./grid/PixelGrid";
import SetColorCard from "./SetColorCard";
import useCanvas from "../hooks/canvasProvider";
import useFactory from "../hooks/factoryProvider";

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { index } = usePickedPixel();
  const { title, unsetCanvas, contract, setTitle } = useCanvas();
  const { handleChangeTitle, signer } = useFactory();
  const [typingTitle, setTypingTitle] = useState<string>("");
  const [isOwner, setIsOwner] = useState<boolean>(false)

  const refreshTitle = useCallback(async () => {
    try {
      const _title = await contract?.getTitle();
      setTitle(_title || "");
    } catch (error) {
      console.error("Error fetching title:", error);
    }
  }, [contract, setTitle]);

  useEffect(() => {
    refreshTitle();
  }, [refreshTitle]);

  const handleNavigateBack = () => {
    unsetCanvas();
    navigate("/", { replace: true });
  };

    useEffect(() => {
        if (contract !== undefined) {
            contract.owner()
            .then((owner) => {
            signer?.getAddress()
                .then((signerAddress) => {
                setIsOwner(owner === signerAddress);
            })
            })
            .catch((e) => {
            console.error(e);
            });
        }   
    }, [contract, isOwner])

  const handleTitleChange = () => {
    if (typingTitle.trim()) {
      handleChangeTitle(typingTitle);
      setTitle(typingTitle);
    } else {
      console.error("Title cannot be empty");
    }
  };

  return (
    <div>
      <button onClick={handleNavigateBack}>Back</button>
      <h2>{title}</h2>
        {isOwner ?  (
          <>
            <Input
                type="text"
                placeholder="New title"
                value={typingTitle}
                onChange={(e) => setTypingTitle(e.target.value)}
                minLength={3}
                maxLength={50}
                required
            />
            <Button onClick={handleTitleChange}>Change Title</Button>
            </>
        ) 
          : (<></>)
        }
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
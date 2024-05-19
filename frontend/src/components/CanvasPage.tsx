import React, { useEffect, useCallback, useState } from "react";
import { Text, Input, Button } from "@chakra-ui/react";
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
  const { title, balance, unsetCanvas, contract, setTitle, refreshBalance } = useCanvas();
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
      refreshBalance();
    } else {
      console.error("Title cannot be empty");
    }
  };

  return (
    <div>
      <div className="flex justify-between" >
        <button className="butonback marginr-950" onClick={handleNavigateBack}>
          <img className="back" src={require('../css/inapoi.png')}></img>
        </button>

        <Text className="balance"><center><span style={{color: '#1E0E62'}}><b>BALANCE</b></span> {balance.toString()} WEI </center></Text>
      </div>
      <div className="z-10 flex-canvas flex-wrap justify-center lg:gap-y-8">
        <div className="flex-unu m-5 rounded-3xl bg-onPrimary p-10 shadow-2xl ">
          <center><p className="text-xl font-bold sm:text-2xl">{title.toUpperCase()}</p></center>
          <LoadingBar />
          <PixelGrid />
        </div>

        <div className="flex-doi flex-col m-5 justify-between gap-5 rounded-3xl bg-onPrimary p-10 shadow-2xl second-div ">
          <center><p className="text-xl font-bold sm:text-2xl">ACTIONS</p></center>

          {isOwner ? (
            <>
              <center><div className="logres-form-div no-margin">
                <center><p className="logres-form-label title">NEW CANVAS TITLE</p></center>
                <Input
                    type="text"
                    placeholder=""
                    value={typingTitle}
                    onChange={(e) => setTypingTitle(e.target.value)}
                    minLength={3}
                    maxLength={50}
                    required
                    className="new-title-input"
                />
                <Button onClick={handleTitleChange} className="flex items-end font-medium text-onSecondaryContainer sm:text-lg logres-form-button buton">Change Title</Button>
              </div></center>
            </>
          ) 
            : (<></>)
          }
          {index !== undefined && <SetColorCard />}
        </div>
      </div>
    </div>
  );
}

export default MainPage
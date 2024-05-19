import React, { useState } from "react";
import { Select } from "@chakra-ui/react";
import useFactory from "../hooks/factoryProvider";
import useCanvas from "../hooks/canvasProvider";
import { useNavigate } from 'react-router-dom';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { canvases, loading, createCanvas, setCurrentCanvasAddress, setSignerIndex, signerIndex } = useFactory()
  const { changeCanvas } = useCanvas()

  const handleChangeCanvas = (address: string, size: number, title: string) => {
    setCurrentCanvasAddress(address);
    changeCanvas(address, size, title);
    navigate("/canvas", {
      replace: true
    });
  };

  // form for creating a new canvas
  const [size, setSize] = useState<number>(5);
  const [royaltyPercent, setRoyaltyPercent] = useState<number>(10);
  const [title, setTitle] = useState<string>("");

  const handleCanvasCreation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (size !== undefined && royaltyPercent != undefined)
      await createCanvas(size, royaltyPercent, title);

    setSize(5);
    setRoyaltyPercent(10);
    setTitle('');
  };

  return (
    <div className="z-10 my-8 flex flex-wrap justify-center lg:gap-y-8">
      <div className="flex flex-col m-5 justify-start gap-5 rounded-3xl bg-onPrimary p-10 shadow-2xl zero-div ">
        <center><p className="text-xl font-bold sm:text-2xl">SELECT SIGNER</p></center>
        <center>
          <Select size='lg' className="select"  onChange={item => setSignerIndex(item.currentTarget.value)} value={signerIndex ? signerIndex : '0'}>
            <option value='0'>Signer 0</option>
            <option value='1'>Signer 1</option>
            <option value='2'>Signer 2</option>
            <option value='3'>Signer 3</option>
            <option value='4'>Signer 4</option>
            <option value='5'>Signer 5</option>
            <option value='6'>Signer 6</option>
            <option value='7'>Signer 7</option>
            <option value='8'>Signer 8</option>
            <option value='9'>Signer 9</option>
          </Select>
        </center>
        <center><img className="mic" src={require('../css/finger.png')} alt="Image Description" /></center>

      </div>
      <div className="flex flex-col m-5 justify-between gap-5 rounded-3xl bg-onPrimary p-10 shadow-2xl ">
        <center><p className="text-xl font-bold sm:text-2xl">CREATE CANVAS</p></center>
  
        <form onSubmit={handleCanvasCreation} className="logres-form">
          <div className="logres-form-div">
            <label htmlFor="sizeInput" className="logres-form-label">CANVAS SIZE</label>
            <input
              type="number"
              id="sizeInput"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              min={3}
              max={10}
              required
              className="logres-form-input"
            />
          </div>
          <div className="logres-form-div">
            <label htmlFor="royaltyInput" className="logres-form-label">ROYALTY PERCENT</label>
            <input
              type="number"
              id="royaltyInput"
              value={royaltyPercent}
              onChange={(e) => setRoyaltyPercent(parseInt(e.target.value))}
              min={0}
              max={99}
              required
              className="logres-form-input"
            />
          </div>
          <div className="logres-form-div">
            <label htmlFor="titleInput" className="logres-form-label">CANVAS TITLE</label>
            <input
              type="text"
              id="titleInput"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              minLength={3}
              maxLength={50}
              required
              className="logres-form-input"
            />
          </div>
          <button type="submit" className="flex items-end font-medium text-onSecondaryContainer sm:text-lg logres-form-button">Submit</button>
        </form>
      </div>
      <div className="flex flex-col m-5 justify-start gap-5 rounded-3xl bg-onPrimary p-10 shadow-2xl second-div">
        <center><p className="text-xl font-bold sm:text-2xl">EXISTING CANVASES</p></center>
        {
          loading ? <>
            <div className="container1">
              <center><img className="mare" src={require('../css/lista.png')} alt="Image Description" /></center>
              <center><div className="centered">Loading...</div></center>
            </div>
          </>
          : 
          <>          
            { canvases.length == 0 ?
              <>
                <div className="container1">
                  <center><img className="mare" src={require('../css/lista.png')} alt="Image Description" /></center>
                  <center><div className="centered">Empty, create a canvas first</div></center>
                </div>
              </>
              : 
              <>
                <ul className="canvas-list flex flex-col m-5 center-content">
                  {
                    canvases.map((canvasInfo, idx) => (
                      <li key={idx} onClick={() => handleChangeCanvas(canvasInfo.address, Number(canvasInfo.size), canvasInfo.title)}>
                        <div className="canvas-info-container">
                          <div className="canvas-info-item">
                            CANVAS TITLE: <b>{canvasInfo.title}</b>
                          </div>
                          <div className="canvas-info-item">
                            CANVAS SIZE: <b>{canvasInfo.size.toString()}</b>
                          </div>
                          <div className="canvas-info-item">
                            ADDRESS: <b>{canvasInfo.address}</b>
                          </div>
                        </div>
                      </li>
                    ))
                  }
                </ul>
              </>
            }
          </>
        }
      </div>
    </div>
  );
}

export default MainPage
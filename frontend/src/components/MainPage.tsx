import React, { useState } from "react";
import useFactory from "../hooks/factoryProvider";
import useCanvas from "../hooks/canvasProvider";
import { useNavigate } from 'react-router-dom';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { canvases, loading, createCanvas } = useFactory()
  const { changeCanvas } = useCanvas()

  const handleChangeCanvas = (address: string, size: number, title: string) => {
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
    <div>
      {
        loading ? <p>Loading....</p> :
          <ul>
            {
              canvases.map((canvasInfo, idx) => (
                <li key={idx} onClick={() => handleChangeCanvas(canvasInfo.address, Number(canvasInfo.size), canvasInfo.title)}>Address={canvasInfo.address} size={canvasInfo.size.toString()} title={canvasInfo.title}</li>
              ))
            }
          </ul>
      }

      <form onSubmit={handleCanvasCreation}>
        <div>
          <label htmlFor="sizeInput">Enter the canvas size (between 3 and 20):</label>
          <input
            type="number"
            id="sizeInput"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            min={3}
            max={20}
            required
          />
        </div>
        <div>
          <label htmlFor="royaltyInput">Enter the royalty percent (between 0 and 99):</label>
          <input
            type="number"
            id="royaltyInput"
            value={royaltyPercent}
            onChange={(e) => setRoyaltyPercent(parseInt(e.target.value))}
            min={0}
            max={99}
            required
          />
        </div>
        <div>
          <label htmlFor="titleInput">Enter a title (between 3 and 50 chars):</label>
          <input
            type="text"
            id="titleInput"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={3}
            maxLength={50}
            required
          />
        </div>
        <button type="submit">Create canvas</button>
      </form>
    </div>
  );
}

export default MainPage
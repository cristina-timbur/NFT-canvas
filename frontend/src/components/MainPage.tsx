import React from "react";
import useFactory from "../hooks/factoryProvider";
import useCanvas from "../hooks/canvasProvider";
import { useNavigate } from 'react-router-dom';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { canvases } = useFactory()
  const { changeCanvas } = useCanvas()

  const handleChangeCanvas = (address: string, size: number, title: string) => {
    changeCanvas(address, size, title);
    navigate("/canvas", {
      replace: true
    });
  };

  return (
    <div>
      <ul>
        {
          canvases.map((canvasInfo, idx) => (
            <li key={idx} onClick={() => handleChangeCanvas(canvasInfo.address, Number(canvasInfo.size), canvasInfo.title)}>Address={canvasInfo.address} size={canvasInfo.size.toString()} title={canvasInfo.title}</li>
          ))
        }
      </ul>
    </div>
  );
}

export default MainPage
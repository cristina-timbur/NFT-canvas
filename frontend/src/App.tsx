import React from 'react';
import MainPage from './components/MainPage';

import { CanvasProvider } from './hooks/canvasProvider';
import { PickedPixelProvider } from './hooks/pickedPixelProvider';


const App: React.FC = () => {

  return (
    <CanvasProvider>
      <PickedPixelProvider>
        <MainPage />
      </PickedPixelProvider>
    </CanvasProvider>
  )
  
}

export default App;
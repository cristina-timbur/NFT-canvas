import React from 'react';
import MainPage from './components/MainPage';

import { CanvasProvider } from './hooks/canvasProvider';
import { PickedPixelProvider } from './hooks/pickedPixelProvider';
import { FactoryProvider } from './hooks/factoryProvider';


const App: React.FC = () => {

  return (
    <FactoryProvider>
      <CanvasProvider>
        <PickedPixelProvider>
          <MainPage />
        </PickedPixelProvider>
      </CanvasProvider>
    </FactoryProvider>
  )
  
}

export default App;
import React from 'react';
import MainPage from './components/MainPage';
import CanvasPage from './components/CanvasPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { CanvasProvider } from './hooks/canvasProvider';
import { PickedPixelProvider } from './hooks/pickedPixelProvider';
import { FactoryProvider } from './hooks/factoryProvider';
import "./css/styles.css"


const App: React.FC = () => {

  return (
    <html>
      <FactoryProvider>
        <CanvasProvider>
          <PickedPixelProvider>
            <BrowserRouter>
              <Routes>
                <Route path='/' Component={MainPage} />
                <Route path='/canvas' Component={CanvasPage} />
              </Routes>
            </BrowserRouter>
          </PickedPixelProvider>
        </CanvasProvider>
      </FactoryProvider>
    </html>
  )

}

export default App;
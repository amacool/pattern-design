import React from 'react';
import './App.css';
import DrawingPanel from './canvas/DrawingPanel';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <DrawingPanel />
      </header>
    </div>
  );
}

export default App;

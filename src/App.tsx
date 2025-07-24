import React from 'react';
import './App.css';
import IsogramFinder from './IsogramFinder';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <div className="App" role="main">
      <IsogramFinder />
      <Analytics />
    </div>
  );
}

export default App;
import React, { useEffect, useState } from 'react';
import TestData from './TestData';
import './App.css';
import CSVTable from './CSVTable';

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <p className="App-title">
          Simple DL
        </p>
      </header>
      <div>
        <CSVTable />
      </div>
    </div>
  );
}

export default App;

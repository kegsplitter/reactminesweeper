import React, { Component } from 'react';
import './App.css';
import MineSweeper from './MineSweeper.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <MineSweeper widthLength={20} heightLength={20} mineCount={45}/>
      </div>
    );
  }
}

export default App;

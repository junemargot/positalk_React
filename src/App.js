import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header/Header';
import Main from './components/Main/Main';
import Transform from './components/Transform/Transform';
import Footer from './components/Footer/Footer';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/transform" element={<Transform />} /></Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

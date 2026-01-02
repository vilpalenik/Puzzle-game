import React from 'react'; //komponenty
import { Link } from 'react-router-dom'; //linky
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    //pozadie
    <div className="home-container"> 
      <div className="home-content"> 
        <h1 className="home-title">
          <span className="title-shape">SHAPE</span>
        </h1>
        <h2 className="home-subtitle">
          <span className="title-builder">BUILDER</span>
        </h2>
        <p className="home-description">- sem by mohol ísť krátky popis -</p>

        <div className="home-buttons">
          <Link to="/difficulties" className="btn btn-primary"> 
            Play Now
          </Link>
          <Link to="/controls" className="btn btn-secondary">
            How to Play
          </Link>
        </div>
      </div>

    </div>
  );
};

export default HomePage;
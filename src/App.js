import logo from './logo.svg';
import './App.css';
import { useSocket } from './Context/SocketProvider';
import {Route, Routes} from "react-router-dom"
import LandingPage from './Pages/LandingPage/LandingPage';
import GamePlay from './Pages/GamePlay/GamePlay';

function App() {

  const socket = useSocket();

  return (
    <div className="App">
      <header className="App-header">
        <Routes>
          <Route exact path='/' element={<LandingPage />}></Route>
          <Route exact path='/game/:roomID' element={<GamePlay />}></Route>
          
        </Routes>
      </header>
    </div>
  );
}

export default App;

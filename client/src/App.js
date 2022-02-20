import useLocalStorage from "./hooks/useLocalStorage";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useState } from "react";

// Components
import Navbar from "./app components/Navbar";
import Model from "./app components/Model";
import PageLoader from "./app components/PageLoader";

// PAGE
import PrivateRoute from "./hooks/PrivateRoute";
import Authentication from "./pages/Authentication/Authentication";
import Home from "./pages/Home/Home";
import Room from './pages/Room/Room';


export const USERCONTEXT = createContext();

function App() {
  const [user, setUser, loadingUser] = useLocalStorage('user-data');
  const [modelElement, setModelElement] = useState(null);

  if (loadingUser) return <PageLoader />;
  return (
    <USERCONTEXT.Provider value={[user, setUser, setModelElement]} >
      <Router>
        <Routes>
          <Route exact path="/" element={<PrivateRoute user={user} component={
            <div className="main-view">
              <Navbar />
              <Home />
            </div>
          }
          />} />

          <Route path=":roomid" element={<PrivateRoute user={user} component={
            <div className="main-view">
              <Navbar />
              <Room />
            </div>
          }
          />} />

          <Route path="authentication/*" element={user ? <Navigate to="/" /> : <Authentication />} />
        </Routes>
        {modelElement && <Model modelTitle="Hey Dude" element={modelElement} closeModel={() => setModelElement(null)} />}
      </Router>
    </USERCONTEXT.Provider>
  );
}

export default App;
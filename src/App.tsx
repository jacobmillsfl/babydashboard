import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppContextProvider, useAppContext } from './Contexts/AppContext';
import Login from './Login';
import Dashboard from './Dashboard';
import spaceImg from "./assets/space_05.mp4";

const CommonLayout: React.FC = ({ children }) => {
  return (
    <div>
      <div className="">
        <video className="fixed top-0 left-0 w-full h-full object-cover z-[-50]" autoPlay muted loop>
          <source src={spaceImg} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <nav className="bg-slate-800 p-4">
          <div className="container mx-auto">
            <p className="text-white">Baby Dashboard</p>
          </div>
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const context = useAppContext();

  return (
    <Router>
      <AppContextProvider>
        <CommonLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </CommonLayout>
      </AppContextProvider>
    </Router>
  );
};

export default App;

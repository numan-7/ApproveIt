import React from "react";
import {  Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SignIn from "./components/SignIn";
import Footer from "./components/Footer";

function App() {
  return (
      <div className="flex flex-col min-h-screen font-main">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={ <Hero /> }
            />
          </Routes>
        </main>
        <Footer />
      </div>
  );
}

export default App;

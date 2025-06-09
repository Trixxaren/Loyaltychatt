import React, { useState } from "react";
import Login from "./Login"; // sökväg till Login.jsx

// Navbar komponent för att göra komponenterna så små som möjligt och bryta ut dem.
const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false); // Här skapar vi en "låda" där vi sparar om inloggningensrutan ska synas eller inte.

  const toggleLogin = () => {
    // Det här är en knapp som byter från synlig till gömd, eller gömd till synlig.
    setShowLogin((prev) => !prev); //Om prev(det gamla värdet) är true, så blir det false. Om prev är false, så blir det true.
    //Den växlar alltså "tillstånden" fram och tillbaka.
  };

  return (
    <div className="relative">
      {/* Navbar menyn där vi placerar våran logga in, knapp. */}
      <ul className="flex items-center list-none p-4 bg-gray-100 rounded">
        <li className="text-gray-700 mr-6 flex items-center cursor-pointer">
          Placeholder
        </li>
        <li className="text-gray-700 mr-6 flex items-center cursor-pointer">
          Placeholder
        </li>
        <li className="text-gray-700 mr-6 flex items-center cursor-pointer">
          Placeholder
        </li>
        <li className="ml-auto">
          {/* Här är Logga in knappen */}
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition cursor-pointer"
            onClick={toggleLogin}
          >
            Logga in
          </button>
        </li>
      </ul>
      {/* Om showLogin är true, visar vi Login modal komponenten, om Showlogin är false då händer ingenting(<Login /> visas inte) men om Showlogin är true, så visas (<Login />) */}
      {showLogin && <Login onClose={toggleLogin} />}
    </div>
  );
};

export default Navbar;

import React, { useState } from "react";

const Navbar = () => {
  const [showLogin, setShowLogin] = useState(false); //setter = showLogin och getter = setShowLogin, useState skapar ett tillstånd för att visa/dölja inloggningsrutan därav false

  const toggleLogin = () => {
    //toggleLogin slår på/av rutan när du klickar på knappen
    setShowLogin((prev) => !prev);
  };

  //   const login = () => {
  //     if (username = username && password == pasword) {
  //         return
  //     }
  //   }

  return (
    <div className="relative">
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
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition cursor-pointer"
            onClick={toggleLogin}
          >
            Logga in
          </button>
        </li>
      </ul>

      {showLogin && (
        <>
          {/* Bakgrund för modal - mörk transparent overlay */}
          <div
            className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
            onClick={toggleLogin}
          ></div>

          {/* Modalruta */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
              <h3 className="text-xl font-semibold mb-4">Logga in</h3>

              {/* Stängknapp (kryss uppe i hörnet) */}
              <button
                onClick={toggleLogin}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
                aria-label="Stäng"
              >
                &times;
              </button>

              <input
                type="text"
                placeholder="Användarnamn"
                className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="password"
                placeholder="Lösenord"
                className="w-full mb-5 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition cursor-pointer">
                Logga in
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;

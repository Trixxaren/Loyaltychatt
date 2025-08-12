// import React, { useState } from "react";
// import Login from "./Login"; // sökväg till Login.jsx
// import loyaltyChatImg from '../assets/loyaltyChat.png';

// // Navbar komponent för att göra komponenterna så små som möjligt och bryta ut dem.
// const Navbar = () => {
//   const [showLogin, setShowLogin] = useState(false); // Här skapar vi en "låda" där vi sparar om inloggningensrutan ska synas eller inte.
//   const [showRegister, setShowRegister] = useState(false);

//   const toggleLogin = () => {
//     // Det här är en knapp som byter från synlig till gömd, eller gömd till synlig.
//     setShowLogin((prev) => !prev); //Om prev(det gamla värdet) är true, så blir det false. Om prev är false, så blir det true.
//     //Den växlar alltså "tillstånden" fram och tillbaka.

//     // toggleRegister;
//   };

//   return (
//     <div className="relative">
//       <ul className="flex items-center list-none p-4 bg-gray-100 rounded w-full">
//         <li className="text-gray-700 mr-6 flex items-center cursor-pointer">
//           <img
//   src={loyaltyChatImg}
//   alt="Loyalty Chat"
//   className="w-11 h-11 rounded-sm object-cover"
// />

//         </li>
//         <li className="text-gray-700 mr-6 flex items-center cursor-pointer">
//           Placeholder
//         </li>
//         <li className="text-gray-700 mr-6 flex items-center cursor-pointer">
//           Placeholder
//         </li>

//         {/* Ny wrapper för knappar med ml-auto på den */}
//         <div className="flex gap-4 ml-auto">
//           <li>
//             <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition cursor-pointer">
//               Registrera dig
//             </button>
//           </li>
//           <li>
//             <button
//               className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition cursor-pointer"
//               onClick={toggleLogin}
//             >
//               Logga in
//             </button>
//           </li>
//         </div>
//       </ul>

//       {showLogin && <Login onClose={toggleLogin} />}
//     </div>
//   );
// };

// export default Navbar;

// En enkel SideNav som visar användarnamn + avatar och har en logout-knapp.
// Denna komponent kan du lägga på sidor som Chat/Profile.

import { getAuth, clearAuth } from "../utils/token";
import { useNavigate } from "react-router-dom";

export default function SideNav() {
  const { user } = getAuth(); // hämta användaren från localStorage
  const navigate = useNavigate(); // för att kunna skicka tillbaka till /login

  const handleLogout = () => {
    clearAuth(); // rensa token + user från localStorage
    navigate("/login"); // gå till login-sidan
  };

  return (
    <aside className="w-56 min-h-screen border-r p-4 flex flex-col gap-6">
      {/* Visa avatar (bild) – se till att CSP tillåter domänen */}
      <div className="flex items-center gap-3">
        <img
          src={user?.avatar || "https://i.pravatar.cc/200"} // använd sparad avatar eller fallback
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{user?.username || "Användare"}</p>
          <p className="text-xs text-gray-500">Inloggad</p>
        </div>
      </div>

      {/* Meny */}
      <nav className="flex flex-col gap-2">
        <button
          onClick={() => navigate("/profile")}
          className="text-left hover:underline"
        >
          Profile
        </button>
        <button
          onClick={() => navigate("/chat")}
          className="text-left hover:underline"
        >
          Chat
        </button>
      </nav>

      {/* Logout-knapp längst ned */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded"
        >
          Logga ut
        </button>
      </div>
    </aside>
  );
}

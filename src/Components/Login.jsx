const Login = ({ onClose }) => {
  //Komponent som heter Login för att bryta ut och göra mindre komponenter.
  return (
    <>
      {/* Bakgrund för modal, genomskinlig overlay */}
      <div
        className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
        onClick={onClose} // Onclick för att stänga inloggningsrutan.
      ></div>

      {/* Modalruta, själva vita rutan där man skriver in användarnamn och lösenord */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
          <h3 className="text-xl font-semibold mb-4">Logga in</h3>

          {/* Stängknapp (kryss uppe i hörnet) */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
            aria-label="Stäng"
          >
            &times; {/* Det här är ett "x" som används för att stänga */}
          </button>

          {/* Inmatningsfält för användarnamn */}
          <input
            type="text"
            placeholder="Användarnamn"
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {/* Inmatningsfält för lösenord */}
          <input
            type="password"
            placeholder="Lösenord"
            className="w-full mb-5 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {/* Knappen man trycker på för att logga in */}
          <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition cursor-pointer">
            Logga in
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;

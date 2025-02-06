/**
 * Top navigation bar component
 * Contains search, notifications, and user actions
 */
const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex-1">
          <div className="max-w-lg">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                🔍
              </div>
            </div>
          </div>
        </div>

        {/* <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            🔔
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            ⚙️
          </button>
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar; 
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Sidebar navigation component
 * Contains main navigation links and branding
 */
const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const navItems = [
    { label: 'Tableau de bord', path: '/', icon: '📊' },
    { label: 'Services', path: '/services', icon: '🔧' },
    { label: 'Alertes', path: '/alerts', icon: '🔔' },
    { label: 'Paramètres', path: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Service Monitor</h1>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full mr-3"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full mr-3 flex items-center justify-center text-white font-medium">
                  {user.displayName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-700">{user.displayName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="mr-3">🚪</span>
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar; 
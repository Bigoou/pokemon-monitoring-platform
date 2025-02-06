import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * Main layout component that wraps the entire dashboard
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render in the main content area
 */
interface MainLayoutProps {
  children: ReactNode;
} 

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 
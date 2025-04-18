import React, { useState } from 'react';
import SizingPage from './pages/SizingPage';
import InstallerDirectoryPage from './pages/InstallerDirectoryPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'sizer' | 'directory'>('sizer');

  return (
    <div className="App container mx-auto p-4">
      <header className="text-center my-6">
        <h1 className="text-3xl font-bold text-blue-600">SolarConnect App</h1>
        <nav className="mt-4 space-x-4">
          <button
            onClick={() => setCurrentPage('sizer')}
            className={`pb-1 ${currentPage === 'sizer' ? 'border-b-2 border-blue-600 text-blue-700 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}
          >
            System Sizer
          </button>
          <button
            onClick={() => setCurrentPage('directory')}
            className={`pb-1 ${currentPage === 'directory' ? 'border-b-2 border-blue-600 text-blue-700 font-semibold' : 'text-gray-600 hover:text-blue-600'}`}
          >
            Installer Directory
          </button>
        </nav>
      </header>

      <main>
        {currentPage === 'sizer' && <SizingPage />}
        {currentPage === 'directory' && <InstallerDirectoryPage />}
      </main>

      <footer className="text-center mt-8 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} SolarConnect App - Alpha Version</p>
      </footer>
    </div>
  );
}

export default App; 
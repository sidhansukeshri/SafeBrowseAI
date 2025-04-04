import React from "react";

interface HeaderProps {
  onOpenSettings: () => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

export default function Header({ onOpenSettings, darkMode, setDarkMode }: HeaderProps) {
  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <header className="bg-primary text-white py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <i className="mdi mdi-shield-check text-2xl mr-2"></i>
        <h1 className="text-xl font-bold">CyberGuard</h1>
      </div>
      <div className="flex items-center">
        <button 
          className="text-white hover:text-secondary p-1" 
          aria-label="Settings"
          onClick={onOpenSettings}
        >
          <i className="mdi mdi-cog text-lg"></i>
        </button>
        <button 
          className="text-white hover:text-secondary p-1 ml-2" 
          aria-label="Toggle dark mode"
          onClick={handleToggleDarkMode}
        >
          <i className={`mdi ${darkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'} text-lg`}></i>
        </button>
      </div>
    </header>
  );
}

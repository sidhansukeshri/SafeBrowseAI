import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import CyberGuardPopup from "./components/CyberGuardPopup";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Initialize dark mode from storage
    try {
      if (window.chrome?.storage?.local) {
        window.chrome.storage.local.get(["darkMode"])
          .then((result: any) => {
            if (result.darkMode !== undefined) {
              setDarkMode(result.darkMode);
            }
          })
          .catch((error: any) => {
            console.error("Error getting dark mode setting:", error);
          });
      }
    } catch (error) {
      console.error("Error accessing chrome API:", error);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    
    // Save dark mode preference
    try {
      if (window.chrome?.storage?.local) {
        window.chrome.storage.local.set({ darkMode })
          .catch((error: any) => {
            console.error("Error saving dark mode setting:", error);
          });
      }
    } catch (error) {
      console.error("Error accessing chrome API:", error);
    }
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-w-[340px] max-w-[380px] ${darkMode ? "dark" : ""}`}>
        <CyberGuardPopup darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

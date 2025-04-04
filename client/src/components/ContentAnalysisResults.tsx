import React, { useState, useEffect } from "react";
import ContentAnalysisCard from "./ContentAnalysisCard";
import { AnalysisResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ContentAnalysisResults() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load analysis results from storage
    try {
      setLoading(true);
      // Using Promise-based API to be compatible with our mock
      window.chrome?.storage.local.get(["analysisResults"]).then((data: Record<string, any>) => {
        if (data.analysisResults && Array.isArray(data.analysisResults)) {
          setResults(data.analysisResults);
        }
      }).catch((error: Error) => {
        console.error("Error loading analysis results:", error);
      }).finally(() => {
        setLoading(false);
      });
    } catch (error: any) {
      console.error("Error accessing storage:", error);
      setLoading(false);
    }
  }, []);

  const handleClearResults = async () => {
    try {
      setResults([]);
      await window.chrome?.storage.local.set({ analysisResults: [] });
      toast({
        title: "Results cleared",
        description: "All analysis results have been cleared",
      });
    } catch (error: any) {
      console.error("Error clearing results:", error);
      toast({
        title: "Error",
        description: "Failed to clear results",
        variant: "destructive"
      });
    }
  };

  const handleRemoveResult = async (id: number) => {
    try {
      const updatedResults = results.filter(result => result.id !== id);
      setResults(updatedResults);
      await window.chrome?.storage.local.set({ analysisResults: updatedResults });
    } catch (error: any) {
      console.error("Error removing result:", error);
      toast({
        title: "Error",
        description: "Failed to remove analysis result",
        variant: "destructive"
      });
    }
  };

  return (
    <section className="p-4 max-h-64 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">Recent Analysis</h2>
        <button 
          className="text-xs text-primary hover:text-primary-dark"
          onClick={handleClearResults}
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        {results.length > 0 ? (
          results.map(result => (
            <ContentAnalysisCard
              key={result.id}
              result={result}
              onRemove={() => handleRemoveResult(result.id)}
            />
          ))
        ) : (
          <div className="text-center py-6">
            <i className="mdi mdi-shield-check text-4xl text-gray-300"></i>
            <p className="text-sm text-gray-500 mt-2">No issues detected yet</p>
            <p className="text-xs text-gray-400">CyberGuard is actively monitoring this page</p>
          </div>
        )}
      </div>
    </section>
  );
}

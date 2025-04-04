import React, { useState } from "react";
import { AnalysisResult } from "@shared/schema";

interface ContentAnalysisCardProps {
  result: AnalysisResult;
  onRemove: () => void;
}

export default function ContentAnalysisCard({ result, onRemove }: ContentAnalysisCardProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  
  // Determine card type styling and icon
  const getCardStyles = () => {
    switch (result.type) {
      case "warning":
        return {
          bgColor: "bg-warning/10",
          borderColor: "border-warning/30",
          icon: "mdi-alert",
          iconColor: "text-warning",
          title: "Potentially Harmful Content"
        };
      case "negative":
        return {
          bgColor: "bg-danger/10",
          borderColor: "border-danger/30",
          icon: "mdi-emoticon-sad",
          iconColor: "text-danger",
          title: "Highly Negative Content"
        };
      case "info":
      default:
        return {
          bgColor: "bg-primary/10",
          borderColor: "border-primary/30",
          icon: "mdi-information",
          iconColor: "text-primary",
          title: "Misinformation Alert"
        };
    }
  };

  const styles = getCardStyles();

  // Format relative time
  const getRelativeTime = () => {
    const timestamp = new Date(result.timestamp).getTime();
    const now = new Date().getTime();
    const diff = now - timestamp;

    if (diff < 60000) {
      return "Just now";
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} min ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} hours ago`;
    } else {
      return `${Math.floor(diff / 86400000)} days ago`;
    }
  };

  const handleViewOriginal = () => {
    setShowOriginal(!showOriginal);
  };

  return (
    <div className={`content-card ${styles.bgColor} rounded-lg p-3 border ${styles.borderColor}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <i className={`mdi ${styles.icon} ${styles.iconColor} mr-1`}></i>
          <h3 className="text-sm font-medium">{styles.title}</h3>
        </div>
        <span className="text-xs text-gray-500">{getRelativeTime()}</span>
      </div>
      
      <p className="text-sm mb-2">
        {result.type === "warning" && "This content contains offensive language that was flagged."}
        {result.type === "negative" && "This content was found to have a highly negative sentiment score."}
        {result.type === "info" && "This content contains potentially misleading information."}
      </p>
      
      <div className="text-xs bg-background-light p-2 rounded border border-gray-200">
        <p className="font-medium mb-1">{showOriginal ? "Original Content:" : "Rephrased Content:"}</p>
        <p>{showOriginal ? result.originalContent : result.rephrasedContent}</p>
      </div>
      
      <div className="flex justify-end mt-2">
        <button 
          className="text-xs text-primary hover:text-primary-dark mr-2"
          onClick={handleViewOriginal}
        >
          {showOriginal ? "View Rephrased" : "View Original"}
        </button>
        <button 
          className="text-xs text-primary hover:text-primary-dark"
          onClick={onRemove}
        >
          {result.type === "info" ? "Acknowledge" : "Ignore"}
        </button>
      </div>
    </div>
  );
}

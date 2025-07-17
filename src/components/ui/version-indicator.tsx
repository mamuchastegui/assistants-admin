import React from "react";
import { Badge } from "@/components/ui/badge";

const VersionIndicator: React.FC = () => {
  // Extract version from package.json or use a build-time version
  const version = import.meta.env.VITE_APP_VERSION || "0.0.0";
  const buildTime = import.meta.env.VITE_BUILD_TIME || new Date().toISOString();

  return (
    <div className="fixed bottom-2 right-2 z-50">
      <Badge 
        variant="outline" 
        className="text-xs bg-background/80 backdrop-blur-sm border-border/50 text-muted-foreground hover:bg-background/90 transition-colors"
        title={`Versión ${version} - Build: ${new Date(buildTime).toLocaleString()}`}
      >
        v{version}
      </Badge>
    </div>
  );
};

export default VersionIndicator;
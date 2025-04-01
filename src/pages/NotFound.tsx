
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-6">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">Página no encontrada</p>
        <p className="text-gray-500 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Button asChild>
          <a href="/" className="inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

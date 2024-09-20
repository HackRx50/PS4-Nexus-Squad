import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@nexa_ui/shared";

const HomePage: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.log(location)
  }, [location])
  return (
    <div className="container mx-auto px-4 py-8 w-full h-full flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 text-center">Welcome to NexaFlow</h1>
      <p className="text-lg mb-8 text-center">
        Streamline your workflow with our powerful automation tools.
      </p>
      <div className="flex space-x-4 w-full max-w-md justify-center">
          <Button asChild>
        <a href='https://admin.nexaflow.co'>
            Get Started
        </a>
          </Button>
      </div>
    </div>
  );
};

export default HomePage;

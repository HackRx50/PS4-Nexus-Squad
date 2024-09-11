import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@nexa_ui/shared";

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 text-center">Welcome to NexaFlow</h1>
      <p className="text-lg mb-8 text-center">
        Streamline your workflow with our powerful automation tools.
      </p>
      <div className="flex space-x-4 w-full max-w-md justify-center">
        <Button asChild>
          <Link to="/actions">Setup Actions</Link>
        </Button>
        <Button asChild>
          <Link to="/conversation">Start Conversation</Link>
        </Button>
      </div>
    </div>
  );
};

export default HomePage;

import { Button } from '@nexa_ui/shared';

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="text-left h-full justify-start flex flex-col gap-8 w-3/5">
        <h1 className="text-4xl font-bold mb-8">Nexaflow</h1>
        <div className="flex items-baseline space-x-4 mb-8">
          <h2 className="text-8xl font-bold">404</h2>
          <p className="text-3xl text-gray-600">Nexabot not found</p>
        </div>
        <p className="text-gray-500 mb-8 max-w-md">
          Sorry, we couldn't find the page you're looking for.
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;

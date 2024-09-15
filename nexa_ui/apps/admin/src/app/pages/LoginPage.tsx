import React, { useState } from 'react';
import { Button, Input, Card, CardContent, CardHeader } from '@nexa_ui/shared';
import { loginWithEmail, useAuth } from '../contexts/AuthContext';
import { getUserFromDB } from '../utility';
import LoginPageGuard from '../guards/LoggedInGuard';
import { Link } from 'react-router-dom'; // Add this import
import Loading from '../components/Loading';

const LoginPage = () => {
  const [formSubmissionLoading, setFormSubmissionLoading] = useState(false);

  const { setCurrentUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      setFormSubmissionLoading(true);

      const credential = await loginWithEmail(email, password);
      const { user, error } = await getUserFromDB(credential.user.uid);
      if (error) {
        console.log(error);
        setFormSubmissionLoading(false);
        return;
      }
      setCurrentUser!(user);
      setFormSubmissionLoading(false);
    } catch (error: any) {
      setError(error.message || 'Login failed');
    }
  };

  return (
    <LoginPageGuard>
        { formSubmissionLoading ? <Loading message='' /> : "" }

    <div
      className="flex items-center justify-center min-h-screen"
    >
    {/* <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: 'rgb(14, 14, 15)' }}
    > */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="scroll-m-20 text-sm font-semibold tracking-tight">
            Nexaflow
          </h2>
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            Login
          </h4>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="my-4 flex justify-between items-center">
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-500">Sign up</Link> {/* Add this line */}
              </p>
              <p>
                <Link to="/forgot-password" className="text-blue-500">Forgot password?</Link> 
              </p>
            </div>
            <Button type="submit" variant="default">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </LoginPageGuard>
  );
};

export default LoginPage;

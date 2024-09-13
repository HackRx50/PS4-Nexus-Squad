import React, { useState } from 'react';
import { Button, Input, Card, CardContent, CardHeader } from '@nexa_ui/shared';
import { signupWithEmail, useAuth } from '../contexts/AuthContext';
import { addUserDetails } from '../utility';
import SignupPageGuard from '../guards/SignupPageGuard';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { setCurrentUser } = useAuth();
  const [formSubmissionLoading, setFormSubmissionLoading] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    try {
      setFormSubmissionLoading(true);
      const credential = await signupWithEmail(email, password);
      const user = await addUserDetails({
        email: credential.user.email!,
        displayName: username,
        emailVerified: credential.user.emailVerified!,
        uid: credential.user.uid,
        photoURL: credential.user.photoURL,
        isAnonymous: credential.user.isAnonymous,
      });
      setCurrentUser!(user);
      setFormSubmissionLoading(false);
    } catch (err) {
      console.log(err);
      setFormSubmissionLoading(false);
    }
  };

  return (
    <SignupPageGuard>
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: 'rgb(14, 14, 15)' }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              Sign Up
            </h4>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
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
              <div className="mb-4">
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500">{error}</p>}
              <Button type="submit" variant="default">
                Sign Up
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </SignupPageGuard>
  );
};

export default SignupPage;

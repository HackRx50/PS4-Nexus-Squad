import React, { useEffect, useState } from 'react';
import { Button, Input, Card, CardContent, CardHeader, Toaster, useToast } from '@nexa_ui/shared';
import { signupWithEmail, useAuth } from '../contexts/AuthContext';
import { addUserDetails } from '../utility';
import SignupPageGuard from '../guards/SignupPageGuard';
import { Link } from 'react-router-dom'; // Add this import
import Loading from '../components/Loading';
import { sendEmailVerification } from 'firebase/auth';
import { useAppDispatch } from '../hooks';
import { setAppTitle, setUser } from '../store';
import { E_TITLES, TOAST_MESSAGES } from '../constants';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toasts } = useToast();
  const { setCurrentUser } = useAuth();
  const [formSubmissionLoading, setFormSubmissionLoading] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setAppTitle(E_TITLES.SIGNUP_PAGE_TITLE))
  }, [])

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
      toasts.push({
        id: "signup",
        title: TOAST_MESSAGES.SIGNUP_SUCCESS.title,
        duration: 3000
      });
      if (credential.user) {
        await sendEmailVerification(credential.user);
        toasts.push({
          id: "emailVerification",
          title: TOAST_MESSAGES.EMAIL_VERIFICATION_SENT.title,
          duration: 3000
        });
      }
      setFormSubmissionLoading(false);
    } catch (err) {
      console.log(err);
      setFormSubmissionLoading(false);
    }
  };

  return (
    <SignupPageGuard>
      {formSubmissionLoading ? <Loading message="" /> : ''}

      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h2 className="scroll-m-20 text-sm font-semibold tracking-tight">
              Nexaflow
            </h2>
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
              <div className="my-4">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-500">
                    Log in
                  </Link>{' '}
                  {/* Add this line */}
                </p>
              </div>
              <Button type="submit" variant="default">
                Sign Up
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </SignupPageGuard>
  );
};

export default SignupPage;

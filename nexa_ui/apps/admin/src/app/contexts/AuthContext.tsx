import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  sendEmailVerification,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, firestore } from '../firebase.config';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  where,
  query,
} from 'firebase/firestore';
import { useAppDispatch } from '../hooks';
import { setUser } from '../store';
import { User } from '../types';

type TAuthContextObject = {
  loaded: AuthLoadStatus;
  IsLoggedIn: typeof IsLoggedIn;
  LoggedInGuard?: () => void;
  setCurrentUser?: (u: User | null) => void;
};

export enum AuthLoadStatus {
  IDLE,
  LOADING,
  ERROR,
  SUCCESS,
}

const AuthContext = createContext<TAuthContextObject>({
  loaded: AuthLoadStatus.IDLE,
  IsLoggedIn,
});

export async function saveUser(user: User) {
  try {
    const userDoc = doc(firestore, `users/${user.uid}`);
    await setDoc(userDoc, JSON.parse(JSON.stringify(user)));
    return user;
  } catch (error) {
    console.log(error);
    alert("Couldn't save user");
  }
}

export async function checkUserExists(
  uid: string
): Promise<[User | null, Error | null]> {
  try {
    const q = query(collection(firestore, 'users'), where('uid', '==', uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [null, new Error('User data not available')];
    }

    const userData = snapshot.docs[0].data() as User;
    return [userData, null];
  } catch (error: any) {
    console.error('Error checking user existence: ', error);
    return [null, error];
  }
}

export async function authenticateWithGoogle() {
  const googleAuthProvider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, googleAuthProvider);
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      console.log('User signed in: ', user);
    }
  } catch (error) {
    console.error('Error handling redirect result: ', error);
    alert('Error handling redirect result: ' + (error as any).message);
  }
}

export async function signupWithEmail(email: string, password: string) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCred.user);
  return userCred;
}

export async function loginWithEmail(email: string, password: string) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred;
}

export async function signOutFromApp() {
  return signOut(auth);
}

async function IsLoggedIn(): Promise<[User | null, any]> {
  try {
    const user = await new Promise<FirebaseUser | null>((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          resolve(user);
        } else {
          reject(null);
        }
        unsubscribe();
      });
    });
    if (!user) {
      return [null, new Error('User not Found')];
    }
    const [userData, error] = await checkUserExists(user!.uid);
    if (userData && user!.emailVerified !== userData?.emailVerified) {
      userData.emailVerified = user.emailVerified;
      await saveUser({
        ...userData!,
        emailVerified: user.emailVerified,
      });
      console.log(user);
    }
    if (!userData && error) {
      return [null, error];
    }
    userData!.accessToken = await user.getIdToken();
    return [userData, null];
  } catch (error) {
    return [null, error];
  }
}

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const setCurrentUser = (user: User | null) => dispatch(setUser(user));
  const [loaded, setLoaded] = useState<AuthLoadStatus>(AuthLoadStatus.IDLE);

  function LoggedInGuard() {
    setLoaded(AuthLoadStatus.LOADING);
    IsLoggedIn().then(async ([user, err]) => {
      console.assert(!err, err);
      console.assert(user, 'User not loggedin');
      if (err) {
        setLoaded(AuthLoadStatus.ERROR);
      }

      setCurrentUser(user);
      setLoaded(AuthLoadStatus.SUCCESS);
    });
  }

  useEffect(() => {
    LoggedInGuard();
  }, [location]);

  return (
    <AuthContext.Provider
      value={{
        loaded,
        IsLoggedIn,
        LoggedInGuard,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

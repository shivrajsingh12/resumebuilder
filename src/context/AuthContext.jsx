import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, authPersistence, db } from '../firebase';

const defaultProfile = {
  name: '',
  email: '',
  school: '',
  course: '',
  goal: '',
  bio: '',
  location: '',
  website: '',
  createdAt: '',
  updatedAt: '',
};

const AuthContext = createContext(null);

const normalizeUser = (firebaseUser, profileData = {}) => {
  const profile = {
    ...defaultProfile,
    ...(profileData.profile || {}),
    ...(profileData || {}),
  };

  const name = (profile.name || firebaseUser?.displayName || '').trim();
  const email = ((profile.email || firebaseUser?.email || '') + '').toLowerCase();

  return {
    ...firebaseUser,
    uid: firebaseUser?.uid || profile.uid || null,
    email,
    displayName: name,
    name,
    profile: {
      ...profile,
      name,
      email,
    },
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    const setupAuth = async () => {
      try {
        await authPersistence;
      } catch {
        // persistence is optional and should not block login flows
      }

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const snapshot = await getDoc(userRef);
          const data = snapshot.exists() ? snapshot.data() : {};

          const profile = {
            ...defaultProfile,
            ...(data.profile || {}),
            ...(data || {}),
            email: (data.email || firebaseUser.email || '').toLowerCase(),
            name: data.name || firebaseUser.displayName || '',
          };

          setUser(normalizeUser(firebaseUser, { ...data, profile }));
        } catch {
          setUser(normalizeUser(firebaseUser));
        } finally {
          setLoading(false);
        }
      });
    };

    setupAuth();
    return () => unsubscribe();
  }, []);

  const signup = async (name, email, password) => {
    try {
      await authPersistence;
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const safeName = name.trim();
      const createdAt = new Date().toISOString();

      await updateProfile(credential.user, { displayName: safeName });

      const profile = {
        ...defaultProfile,
        name: safeName,
        email: email.trim().toLowerCase(),
        createdAt,
        updatedAt: createdAt,
      };

      const payload = {
        uid: credential.user.uid,
        name: safeName,
        email: profile.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profile,
      };

      await setDoc(doc(db, 'users', credential.user.uid), payload, { merge: true });
      setUser(normalizeUser(credential.user, payload));
      return { success: true };
    } catch (error) {
      return { success: false, message: authMessage(error.code) };
    }
  };

  const login = async (email, password) => {
    try {
      await authPersistence;
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { success: true };
    } catch (error) {
      return { success: false, message: authMessage(error.code) };
    }
  };

  const saveProfile = async (profileInput) => {
    if (!user?.uid) {
      return { success: false, message: 'Please sign in to save your profile.' };
    }

    try {
      const nextProfile = {
        ...defaultProfile,
        ...(user.profile || {}),
        ...(profileInput || {}),
        name: (profileInput?.name || user.profile?.name || user.displayName || '').trim(),
        email: ((profileInput?.email || user.profile?.email || user.email || '') + '').toLowerCase(),
        updatedAt: new Date().toISOString(),
      };

      if (!nextProfile.createdAt) {
        nextProfile.createdAt = user.profile?.createdAt || new Date().toISOString();
      }

      const payload = {
        uid: user.uid,
        name: nextProfile.name,
        email: nextProfile.email,
        createdAt: user.profile?.createdAt || nextProfile.createdAt,
        updatedAt: nextProfile.updatedAt,
        profile: nextProfile,
      };

      await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
      const nextUser = normalizeUser(auth.currentUser || user, payload);
      setUser(nextUser);
      return { success: true, message: 'Profile saved successfully.' };
    } catch (error) {
      return { success: false, message: authMessage(error.code || 'permission-denied') };
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        saveProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function authMessage(code) {
  const messages = {
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/weak-password': 'Choose a password with at least 6 characters.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
    'auth/operation-not-allowed': 'Email sign-up is not enabled for this Firebase project.',
    'auth/configuration-not-found': 'Firebase Authentication is not configured for this project.',
    'auth/invalid-api-key': 'The Firebase API key is invalid. Check the project configuration.',
    'auth/unauthorized-domain': 'This domain is not authorized in the Firebase project.',
    'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
    'permission-denied': 'Your profile data could not be saved. Check your Firestore rules and permissions.',
  };

  return messages[code] || `We could not complete that request${code ? ` (${code})` : ''}.`;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

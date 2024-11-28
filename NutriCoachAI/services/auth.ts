// services/auth.ts
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    User,
    onAuthStateChanged
  } from 'firebase/auth';
  import { auth } from './firebase';
  
  export interface AuthError {
    code: string;
    message: string;
  }
  
  export const createUser = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw formatAuthError(error);
    }
  };
  
  export const signIn = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw formatAuthError(error);
    }
  };
  
  export const logOut = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      throw formatAuthError(error);
    }
  };
  
  export const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw formatAuthError(error);
    }
  };
  
  export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  };
  
  const formatAuthError = (error: any): AuthError => {
    return {
      code: error.code || 'auth/unknown',
      message: error.message || 'An unknown error occurred'
    };
  };
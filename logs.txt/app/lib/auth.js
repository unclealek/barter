// app/lib/auth.js
import { supabase } from './supabase';
import Auth0 from 'react-native-auth0';


const auth0 = new Auth0({
  domain: ' https://accounts.google.com',
  clientId: '164469660096-c8nt99ul3gttub987i25l8ofevqh5t6m.apps.googleusercontent.com',});

  // Google Signin
export const signInWithGoogle = async () => {
  try {
    const credentials = await auth0.webAuth.authorize({
      scope: 'openid profile email',
    });

    const { id_token } = credentials;

    const { user, session, error } = await supabase.auth.signIn({
      provider: 'google',
      idToken: id_token,
    });

    if (error) {
      console.error('Error signing in with Google:', error.message);
      return { success: false, message: error.message };
    }

    console.log('User signed in:', user);
    return { success: true, user, session };
  } catch (error) {
    console.error('Error during Google sign-in:', error);
    return { success: false, message: error.message };
  }
};

// Google Signup

export const signUpWithGoogle = async () => {
  try {
    const credentials = await auth0.webAuth.authorize({
      scope: 'openid profile email',
    });

    const { id_token } = credentials;

    const { user, session, error } = await supabase.auth.signUp({
      provider: 'google',
      idToken: id_token,
    });

    if (error) {
      console.error('Error signing up with Google:', error.message);
      return { success: false, message: error.message };
    }

    console.log('User signed up:', user);
    return { success: true, user, session };
  } catch (error) {
    console.error('Error during Google sign-up:', error);
    return { success: false, message: error.message };
  }
};

   //Forgot Password
export const forgotPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  
  if (error) {
    console.error('Error sending password reset email:', error.message);
    return { success: false, message: error.message };
  }
  
  console.log('Password reset email sent:', data);
  return { success: true, message: 'Check your email for the password reset link' };
};

// Resend Verification Email
export const resendVerificationEmail = async (email) => {
    const { error } = await supabase.auth.api.sendVerificationEmail(email);
    if (error) {
      throw new Error(error.message);
    }
    return { message: 'Verification email resent successfully!' };
  };
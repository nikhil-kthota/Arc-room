import { supabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
}

export const authService = {
  async register(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed');
    }

    // Check if email confirmation is required
    if (!data.session) {
      throw new Error('Please check your email to confirm your account');
    }

    return {
      id: data.user.id,
      email: data.user.email!,
    };
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed');
    }

    return {
      id: data.user.id,
      email: data.user.email!,
    };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email!,
    };
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email!,
        });
      } else {
        callback(null);
      }
    });
  }
};
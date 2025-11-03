import { AuthContext } from '@/hooks/use-auth-context';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { PropsWithChildren, useEffect, useState } from 'react';

/**
 * Extracts username from session user data with fallbacks
 */
function extractUsername(session: Session): string {
  const { user } = session;

  // Try user_metadata.username first
  if (user.user_metadata?.username) {
    return user.user_metadata.username;
  }

  // Fallback to email prefix (part before @)
  if (user.email) {
    const emailPrefix = user.email.split('@')[0];
    if (emailPrefix) {
      return emailPrefix;
    }
  }

  // Fallback to full_name or name from user_metadata
  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name.toLowerCase().replace(/\s+/g, '_');
  }

  if (user.user_metadata?.name) {
    return user.user_metadata.name.toLowerCase().replace(/\s+/g, '_');
  }

  // Final fallback: user_{first8chars_of_user_id}
  return `user_${user.id.substring(0, 8)}`;
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | undefined | null>();
  const [profile, setProfile] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch the session once, and subscribe to auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error);
      }

      setSession(session);
      setIsLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', { event: _event, session });
      // Update session state - this will trigger the profile fetching effect
      setSession(session);
      // If signing out, clear profile immediately
      if (!session) {
        setProfile(null);
        setIsLoading(false);
      } else {
        // When signing in, profile will be fetched in the useEffect below
        setIsLoading(true);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch the profile when the session changes
  useEffect(() => {
    const fetchProfile = async () => {
      // If no session, clear profile and stop loading immediately
      if (!session) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const username = extractUsername(session);

      // Query profile by username (since id is auto-increment and not linked to auth)
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      // If profile doesn't exist (PGRST116 = not found error), create it automatically
      if (fetchError?.code === 'PGRST116' || !profileData) {
        try {
          // Don't insert 'id' - let database auto-generate it
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              username: username,
              expo_push_token: null,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) {
            if (createError.code === '23505') {
              // Profile was created by another process, fetch it again
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username)
                .single();
              setProfile(existingProfile);
            } else if (createError.code === '22P02') {
              console.error(
                'Database schema mismatch: profiles.id column must be UUID type, not int8. Please update your database schema.'
              );
              console.error('Error creating profile:', createError);
              setProfile(null);
            } else {
              console.error('Error creating profile:', createError);
              setProfile(null);
            }
          } else {
            setProfile(newProfile);
          }
        } catch (err) {
          console.error('Error creating profile:', err);
          setProfile(null);
        }
      } else if (fetchError) {
        // Other errors fetching profile
        console.error('Error fetching profile:', fetchError);
        setProfile(null);
      } else {
        // Profile exists, use it
        setProfile(profileData);
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        profile,
        isLoggedIn: !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

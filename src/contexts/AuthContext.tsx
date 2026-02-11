import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "buyer" | "chef";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  signUp: (email: string, password: string, fullName?: string, role?: UserRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
    
    if (data) {
      setUserRole(data.role as UserRole);
    } else {
      // No role found — try to assign from pending metadata
      await ensureUserRole(userId);
    }
  };

  useEffect(() => {
    // Check if this is a new browser session and user didn't want to be remembered
    const shouldRemember = localStorage.getItem("rememberMe");
    const sessionMarker = sessionStorage.getItem("authSessionActive");
    
    if (shouldRemember === "false" && !sessionMarker) {
      // User didn't want to be remembered and this is a new browser session
      supabase.auth.signOut();
    }
    
    // Mark this browser session as active
    sessionStorage.setItem("authSessionActive", "true");

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Fetch role after auth state change
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserRole = async (userId: string) => {
    // Check if user already has a role
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (existingRole) {
      setUserRole(existingRole.role as UserRole);
      return;
    }

    // No role yet — check user metadata for pending role from signup
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const pendingRole = currentUser?.user_metadata?.pending_role as UserRole | undefined;

    if (pendingRole) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: pendingRole });

      if (!roleError) {
        setUserRole(pendingRole);
      } else if (import.meta.env.DEV) {
        console.error("Failed to assign deferred role:", roleError);
      }
    }
  };

  const signUp = async (email: string, password: string, fullName?: string, role: UserRole = "buyer") => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          pending_role: role,
        },
      },
    });
    
    // Try to assign role immediately (works if session is active)
    if (!error && data.user && data.session) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: data.user.id, role });
      
      if (!roleError) {
        setUserRole(role);
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    // Store the remember me preference
    localStorage.setItem("rememberMe", rememberMe.toString());
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        userRole,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

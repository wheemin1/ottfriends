/**
 * v4.3.2: 클라이언트 사이드 Supabase 인증
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Authentication will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Google OAuth 로그인
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    console.error('Google sign in error:', error);
    return null;
  }

  return data;
}

/**
 * 로그아웃
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Sign out error:', error);
    return false;
  }

  return true;
}

/**
 * 인증 상태 변경 리스너
 */
export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((event: any, session: any) => {
    callback(session?.user || null);
  });
}

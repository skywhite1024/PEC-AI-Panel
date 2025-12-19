// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { login, register, LoginRequest, RegisterRequest, AuthResponse } from '../services/api';

interface User {
  id: string;
  phone: string;
  name: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    token: null,
    isLoading: false,
    error: null
  });

  // 从 localStorage 加载登录状态
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');
        
        if (savedToken && savedUser) {
          setAuthState({
            isLoggedIn: true,
            user: JSON.parse(savedUser),
            token: savedToken,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    };

    loadAuthState();
  }, []);

  // 保存登录状态到 localStorage
  const saveAuthState = useCallback((token: string, user: User) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }, []);

  // 清除登录状态
  const clearAuthState = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }, []);

  // 登录
  const handleLogin = useCallback(async (loginData: LoginRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await login(loginData);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        saveAuthState(token, user);
        
        setAuthState({
          isLoggedIn: true,
          user,
          token,
          isLoading: false,
          error: null
        });
        
        return response;
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || '登录失败'
        }));
        
        throw new Error(response.message || '登录失败');
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '登录失败'
      }));
      
      throw error;
    }
  }, [saveAuthState]);

  // 注册
  const handleRegister = useCallback(async (registerData: RegisterRequest) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await register(registerData);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        saveAuthState(token, user);
        
        setAuthState({
          isLoggedIn: true,
          user,
          token,
          isLoading: false,
          error: null
        });
        
        return response;
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || '注册失败'
        }));
        
        throw new Error(response.message || '注册失败');
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '注册失败'
      }));
      
      throw error;
    }
  }, [saveAuthState]);

  // 登出
  const handleLogout = useCallback(() => {
    clearAuthState();
    setAuthState({
      isLoggedIn: false,
      user: null,
      token: null,
      isLoading: false,
      error: null
    });
  }, [clearAuthState]);

  // 清除错误
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError
  };
};

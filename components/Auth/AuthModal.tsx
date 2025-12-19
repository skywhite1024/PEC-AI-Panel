// components/Auth/AuthModal.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { sendCode, SendCodeRequest } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginType, setLoginType] = useState<'password' | 'code'>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { login, register, isLoading, error: authError, clearError } = useAuth();

  // 关闭模态框时重置状态
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // 显示 Toast 提示
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 显示认证错误
  useEffect(() => {
    if (authError) {
      setToast({ message: authError, type: 'error' });
      clearError();
    }
  }, [authError, clearError]);

  // 验证码倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 重置表单
  const resetForm = () => {
    setPhone('');
    setPassword('');
    setCode('');
    setCountdown(0);
    setErrors({});
    setActiveTab('login');
    setLoginType('password');
  };

  // 表单验证
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    // 手机号验证
    if (!phone) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(phone)) {
      newErrors.phone = '请输入有效的手机号';
    }

    // 登录表单验证
    if (activeTab === 'login') {
      if (loginType === 'password') {
        if (!password) {
          newErrors.password = '请输入密码';
        } else if (password.length < 6) {
          newErrors.password = '密码长度至少为6位';
        }
      } else {
        if (!code) {
          newErrors.code = '请输入验证码';
        } else if (!/^\d{6}$/.test(code)) {
          newErrors.code = '请输入6位数字验证码';
        }
      }
    } 
    // 注册表单验证
    else {
      if (!password) {
        newErrors.password = '请输入密码';
      } else if (password.length < 6) {
        newErrors.password = '密码长度至少为6位';
      }

      if (!code) {
        newErrors.code = '请输入验证码';
      } else if (!/^\d{6}$/.test(code)) {
        newErrors.code = '请输入6位数字验证码';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [activeTab, phone, password, code, loginType]);

  // 发送验证码
  const handleSendCode = useCallback(async () => {
    if (countdown > 0 || isSendingCode || !phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return;
    }

    setIsSendingCode(true);
    setErrors(prev => ({ ...prev, code: '' }));

    try {
      const request: SendCodeRequest = {
        phone,
        type: activeTab
      };

      const response = await sendCode(request);
      
      if (response.success) {
        setCountdown(60);
        setToast({ message: response.message || '验证码发送成功', type: 'success' });
      } else {
        setToast({ message: response.message || '验证码发送失败', type: 'error' });
      }
    } catch (error) {
      setToast({ message: '验证码发送失败，请稍后重试', type: 'error' });
    } finally {
      setIsSendingCode(false);
    }
  }, [phone, activeTab, countdown, isSendingCode]);

  // 处理登录
  const handleLogin = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await login({
        phone,
        password: loginType === 'password' ? password : undefined,
        code: loginType === 'code' ? code : undefined,
        type: loginType
      });
      setToast({ message: '登录成功', type: 'success' });
      onClose();
    } catch (error) {
      // 错误已由 useAuth 处理
    }
  }, [phone, password, code, loginType, validateForm, login, onClose]);

  // 处理注册
  const handleRegister = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        phone,
        password,
        code
      });
      setToast({ message: '注册成功', type: 'success' });
      onClose();
    } catch (error) {
      // 错误已由 useAuth 处理
    }
  }, [phone, password, code, validateForm, register, onClose]);

  // 处理忘记密码
  const handleForgotPassword = useCallback(() => {
    setToast({ message: '忘记密码功能暂未开放', type: 'info' });
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E9FF] max-w-md w-full p-6 relative">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* 标题 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">PEC-AI 登录</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">请登录或注册以继续使用</p>

        {/* Tab 切换 */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'login' 
              ? 'border-b-2 border-[#5B5FC7] text-[#5B5FC7]' 
              : 'text-gray-500 hover:text-gray-700'}`}
          >
            登录
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'register' 
              ? 'border-b-2 border-[#5B5FC7] text-[#5B5FC7]' 
              : 'text-gray-500 hover:text-gray-700'}`}
          >
            注册
          </button>
        </div>

        {/* 登录表单 */}
        {activeTab === 'login' && (
          <div>
            {/* 登录方式切换 */}
            <div className="flex mb-4">
              <button
                onClick={() => setLoginType('password')}
                className={`flex-1 py-1.5 px-3 rounded-t-lg text-xs font-medium transition-colors ${loginType === 'password' 
                  ? 'bg-[#5B5FC7] text-white' 
                  : 'bg-gray-100 text-gray-600'}`}
              >
                密码登录
              </button>
              <button
                onClick={() => setLoginType('code')}
                className={`flex-1 py-1.5 px-3 rounded-t-lg text-xs font-medium transition-colors ${loginType === 'code' 
                  ? 'bg-[#5B5FC7] text-white' 
                  : 'bg-gray-100 text-gray-600'}`}
              >
                验证码登录
              </button>
            </div>

            {/* 手机号输入 */}
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                手机号
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5B5FC7]/20 focus:border-[#5B5FC7] transition-all ${errors.phone 
                  ? 'border-red-500' 
                  : 'border-[#E5E9FF]'}`}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* 密码输入 */}
            {loginType === 'password' && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    密码
                  </label>
                  <button
                    onClick={handleForgotPassword}
                    className="text-xs text-[#5B5FC7] hover:text-[#4a4ea3] transition-colors"
                  >
                    忘记密码？
                  </button>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5B5FC7]/20 focus:border-[#5B5FC7] transition-all ${errors.password 
                    ? 'border-red-500' 
                    : 'border-[#E5E9FF]'}`}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>
            )}

            {/* 验证码输入 */}
            {loginType === 'code' && (
              <div className="mb-4">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  验证码
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="请输入6位验证码"
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5B5FC7]/20 focus:border-[#5B5FC7] transition-all ${errors.code 
                      ? 'border-red-500' 
                      : 'border-[#E5E9FF]'}`}
                  />
                  <button
                    onClick={handleSendCode}
                    disabled={countdown > 0 || isSendingCode || !phone || !/^1[3-9]\d{9}$/.test(phone)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${countdown > 0 || isSendingCode 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#E0E7FF] text-[#5B5FC7] hover:bg-[#d0daff]'}`}
                  >
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </button>
                </div>
                {errors.code && (
                  <p className="text-xs text-red-500 mt-1">{errors.code}</p>
                )}
              </div>
            )}

            {/* 登录按钮 */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium transition-all shadow-sm ${isLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#2F54EB] to-[#5B5FC7] text-white hover:opacity-90'}`}
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </div>
        )}

        {/* 注册表单 */}
        {activeTab === 'register' && (
          <div>
            {/* 手机号输入 */}
            <div className="mb-4">
              <label htmlFor="register-phone" className="block text-sm font-medium text-gray-700 mb-1">
                手机号
              </label>
              <input
                type="tel"
                id="register-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5B5FC7]/20 focus:border-[#5B5FC7] transition-all ${errors.phone 
                  ? 'border-red-500' 
                  : 'border-[#E5E9FF]'}`}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* 密码输入 */}
            <div className="mb-4">
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                type="password"
                id="register-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请设置6-20位密码"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5B5FC7]/20 focus:border-[#5B5FC7] transition-all ${errors.password 
                  ? 'border-red-500' 
                  : 'border-[#E5E9FF]'}`}
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* 验证码输入 */}
            <div className="mb-6">
              <label htmlFor="register-code" className="block text-sm font-medium text-gray-700 mb-1">
                验证码
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="register-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="请输入6位验证码"
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#5B5FC7]/20 focus:border-[#5B5FC7] transition-all ${errors.code 
                    ? 'border-red-500' 
                    : 'border-[#E5E9FF]'}`}
                />
                <button
                  onClick={handleSendCode}
                  disabled={countdown > 0 || isSendingCode || !phone || !/^1[3-9]\d{9}$/.test(phone)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${countdown > 0 || isSendingCode 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-[#E0E7FF] text-[#5B5FC7] hover:bg-[#d0daff]'}`}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
              {errors.code && (
                <p className="text-xs text-red-500 mt-1">{errors.code}</p>
              )}
            </div>

            {/* 注册按钮 */}
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium transition-all shadow-sm ${isLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#2F54EB] to-[#5B5FC7] text-white hover:opacity-90'}`}
            >
              {isLoading ? '注册中...' : '注册'}
            </button>
          </div>
        )}

        {/* 切换 Tab 提示 */}
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-500">
            {activeTab === 'login' ? '还没有账号？' : '已有账号？'}
          </span>
          <button
            onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
            className="ml-1 text-[#5B5FC7] hover:text-[#4a4ea3] font-medium transition-colors"
          >
            {activeTab === 'login' ? '立即注册' : '去登录'}
          </button>
        </div>
      </div>

      {/* Toast 提示 */}
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'success' 
          ? 'bg-green-50 text-green-700' 
          : toast.type === 'error' 
          ? 'bg-red-50 text-red-700' 
          : 'bg-blue-50 text-blue-700'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

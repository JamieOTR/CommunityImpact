import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot-password' | 'verify-email';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password' | 'verify-email'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    verificationCode: ''
  });
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const { signIn, signUp, resetPassword, verifyEmail, loading, error } = useAuth();

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const passwordValidation = validatePassword(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        if (!passwordValidation.isValid) {
          alert('Password does not meet security requirements');
          return;
        }
        const result = await signUp(formData.email, formData.password, formData.name);
        if (result?.needsVerification) {
          setMode('verify-email');
          setVerificationSent(true);
        } else {
          onClose();
        }
      } else if (mode === 'signin') {
        await signIn(formData.email, formData.password);
        onClose();
      } else if (mode === 'forgot-password') {
        await resetPassword(formData.email);
        setResetEmailSent(true);
      } else if (mode === 'verify-email') {
        await verifyEmail(formData.email, formData.verificationCode);
        onClose();
      }
    } catch (err) {
      // Error handling is done in useAuth hook
      console.error('Auth error:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const switchMode = (newMode: typeof mode) => {
    setMode(newMode);
    setFormData({ email: '', password: '', name: '', confirmPassword: '', verificationCode: '' });
    setResetEmailSent(false);
    setVerificationSent(false);
  };

  const renderPasswordStrength = () => {
    if (!formData.password || mode !== 'signup') return null;

    return (
      <div className="mt-2 space-y-2">
        <div className="text-xs text-gray-600">Password strength:</div>
        <div className="space-y-1">
          {[
            { key: 'minLength', label: 'At least 8 characters' },
            { key: 'hasUpperCase', label: 'One uppercase letter' },
            { key: 'hasLowerCase', label: 'One lowercase letter' },
            { key: 'hasNumbers', label: 'One number' },
            { key: 'hasSpecialChar', label: 'One special character' }
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-2">
              {passwordValidation[key as keyof typeof passwordValidation] ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-gray-300" />
              )}
              <span className={`text-xs ${
                passwordValidation[key as keyof typeof passwordValidation] ? 'text-green-600' : 'text-gray-500'
              }`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black bg-opacity-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md mx-4"
          >
            <Card className="relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Back Button for sub-modes */}
              {(mode === 'forgot-password' || mode === 'verify-email') && (
                <button
                  onClick={() => switchMode('signin')}
                  className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">CI</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === 'signin' && 'Welcome Back'}
                  {mode === 'signup' && 'Join Community Impact'}
                  {mode === 'forgot-password' && 'Reset Password'}
                  {mode === 'verify-email' && 'Verify Email'}
                </h2>
                <p className="text-gray-600 mt-2">
                  {mode === 'signin' && 'Sign in to continue your impact journey'}
                  {mode === 'signup' && 'Start making a difference in your community'}
                  {mode === 'forgot-password' && 'Enter your email to receive reset instructions'}
                  {mode === 'verify-email' && 'Enter the verification code sent to your email'}
                </p>
              </div>

              {/* Success Messages */}
              {resetEmailSent && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Reset email sent!</p>
                      <p className="text-xs text-green-600 mt-1">
                        Check your inbox for password reset instructions.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {verificationSent && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Verification email sent!</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Please check your email and enter the verification code below.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name field for signup */}
                {mode === 'signup' && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                )}

                {/* Email field */}
                {mode !== 'verify-email' && (
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                )}

                {/* Verification Code field */}
                {mode === 'verify-email' && (
                  <div>
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="verificationCode"
                        name="verificationCode"
                        value={formData.verificationCode}
                        onChange={handleInputChange}
                        required
                        maxLength={6}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg tracking-widest"
                        placeholder="000000"
                      />
                    </div>
                  </div>
                )}

                {/* Password field */}
                {(mode === 'signin' || mode === 'signup') && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {renderPasswordStrength()}
                  </div>
                )}

                {/* Confirm Password field */}
                {mode === 'signup' && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                  size="lg"
                  disabled={mode === 'signup' && !passwordValidation.isValid}
                >
                  {mode === 'signin' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot-password' && 'Send Reset Email'}
                  {mode === 'verify-email' && 'Verify Email'}
                </Button>
              </form>

              {/* Demo Credentials */}
              {mode === 'signin' && !resetEmailSent && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium mb-2">🚀 Demo Credentials:</p>
                  <div className="text-xs text-blue-600 space-y-1">
                    <p><strong>Email:</strong> demo@communityimpact.org</p>
                    <p><strong>Password:</strong> demo123</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        email: 'demo@communityimpact.org',
                        password: 'demo123'
                      });
                    }}
                  >
                    Use Demo Credentials
                  </Button>
                </div>
              )}

              {/* Action Links */}
              <div className="mt-6 space-y-3">
                {mode === 'signin' && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot-password')}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                {mode === 'verify-email' && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        // Resend verification email logic would go here
                        setVerificationSent(true);
                      }}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Resend verification code
                    </button>
                  </div>
                )}

                {/* Switch Mode */}
                {(mode === 'signin' || mode === 'signup') && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                      <button
                        type="button"
                        onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                        className="ml-1 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {mode === 'signin' ? 'Sign up' : 'Sign in'}
                      </button>
                    </p>
                  </div>
                )}
              </div>

              {/* Terms and Privacy */}
              {mode === 'signup' && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    By creating an account, you agree to our{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-700">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, Key, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import Button from '../UI/Button';
import Card from '../UI/Card';

interface TwoFactorAuthProps {
  onComplete?: () => void;
  mode?: 'setup' | 'verify';
}

export default function TwoFactorAuth({ onComplete, mode = 'setup' }: TwoFactorAuthProps) {
  const [step, setStep] = useState<'intro' | 'qr' | 'verify' | 'backup' | 'complete'>(
    mode === 'verify' ? 'verify' : 'intro'
  );
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes] = useState([
    'A1B2C3D4', 'E5F6G7H8', 'I9J0K1L2',
    'M3N4O5P6', 'Q7R8S9T0', 'U1V2W3X4'
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock QR code data - in production, this would come from your auth service
  const qrCodeData = 'otpauth://totp/CommunityImpact:demo@example.com?secret=JBSWY3DPEHPK3PXP&issuer=CommunityImpact';
  const manualEntryKey = 'JBSWY3DPEHPK3PXP';

  const handleVerifyCode = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (verificationCode === '123456') {
        if (mode === 'setup') {
          setStep('backup');
        } else {
          setStep('complete');
          setTimeout(() => onComplete?.(), 1500);
        }
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Enable Two-Factor Authentication
            </h3>
            <p className="text-gray-600 mb-6">
              Add an extra layer of security to your account by enabling 2FA. 
              You'll need an authenticator app like Google Authenticator or Authy.
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <Smartphone className="w-4 h-4 text-green-500" />
                <span>Download an authenticator app</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <Key className="w-4 h-4 text-green-500" />
                <span>Scan QR code or enter setup key</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Verify with a 6-digit code</span>
              </div>
            </div>
            <Button onClick={() => setStep('qr')} className="w-full">
              Get Started
            </Button>
          </div>
        );

      case 'qr':
        return (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Scan QR Code
            </h3>
            <p className="text-gray-600 mb-6">
              Scan this QR code with your authenticator app
            </p>
            
            {/* QR Code Placeholder */}
            <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-6">
              <div className="text-center">
                <div className="w-32 h-32 bg-black mx-auto mb-2" style={{
                  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="white"/>
                      <rect x="10" y="10" width="10" height="10" fill="black"/>
                      <rect x="30" y="10" width="10" height="10" fill="black"/>
                      <rect x="50" y="10" width="10" height="10" fill="black"/>
                      <rect x="70" y="10" width="10" height="10" fill="black"/>
                      <rect x="10" y="30" width="10" height="10" fill="black"/>
                      <rect x="50" y="30" width="10" height="10" fill="black"/>
                      <rect x="10" y="50" width="10" height="10" fill="black"/>
                      <rect x="30" y="50" width="10" height="10" fill="black"/>
                      <rect x="70" y="50" width="10" height="10" fill="black"/>
                      <rect x="10" y="70" width="10" height="10" fill="black"/>
                      <rect x="50" y="70" width="10" height="10" fill="black"/>
                      <rect x="70" y="70" width="10" height="10" fill="black"/>
                    </svg>
                  `)}")`,
                  backgroundSize: 'contain'
                }}></div>
                <p className="text-xs text-gray-500">QR Code</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-2">Can't scan? Enter this key manually:</p>
              <div className="flex items-center justify-between bg-white p-2 rounded border">
                <code className="text-sm font-mono">{manualEntryKey}</code>
                <button
                  onClick={() => copyToClipboard(manualEntryKey)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <Button onClick={() => setStep('verify')} className="w-full">
              I've Added the Account
            </Button>
          </div>
        );

      case 'verify':
        return (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Verify Setup
            </h3>
            <p className="text-gray-600 mb-6">
              Enter the 6-digit code from your authenticator app
            </p>

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

            <div className="mb-6">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-32 h-12 text-center text-lg font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                maxLength={6}
              />
            </div>

            <Button
              onClick={handleVerifyCode}
              loading={loading}
              disabled={verificationCode.length !== 6}
              className="w-full"
            >
              Verify Code
            </Button>

            <p className="text-xs text-gray-500 mt-4">
              Demo: Use code "123456" to verify
            </p>
          </div>
        );

      case 'backup':
        return (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Save Backup Codes
            </h3>
            <p className="text-gray-600 mb-6">
              Store these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-white p-2 rounded border text-center">
                    <code className="text-sm font-mono">{code}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Codes
              </Button>
              <Button onClick={() => setStep('complete')} className="flex-1">
                I've Saved Them
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Two-Factor Authentication Enabled!
              </h3>
              <p className="text-gray-600 mb-6">
                Your account is now protected with two-factor authentication. 
                You'll need to enter a code from your authenticator app when signing in.
              </p>
              <Button onClick={onComplete} className="w-full">
                Done
              </Button>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      {renderStep()}
    </Card>
  );
}
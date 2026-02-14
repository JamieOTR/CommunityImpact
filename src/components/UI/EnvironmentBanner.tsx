import { AlertTriangle, Code, Users } from 'lucide-react';

type Environment = 'dev' | 'test' | 'demo' | 'production';

export default function EnvironmentBanner() {
  const environment = getEnvironment();

  if (environment === 'production') {
    return null;
  }

  const config = {
    dev: {
      label: 'DEVELOPMENT',
      bgColor: 'bg-blue-600',
      icon: Code,
      message: 'Development Environment',
    },
    test: {
      label: 'TEST',
      bgColor: 'bg-yellow-600',
      icon: AlertTriangle,
      message: 'Test Environment',
    },
    demo: {
      label: 'DEMO',
      bgColor: 'bg-purple-600',
      icon: Users,
      message: 'Demo Environment',
    },
  };

  const currentConfig = config[environment as keyof typeof config];
  if (!currentConfig) return null;

  const Icon = currentConfig.icon;

  return (
    <div className={`${currentConfig.bgColor} text-white py-2 px-4 text-center text-sm font-medium shadow-md z-50`}>
      <div className="flex items-center justify-center gap-2">
        <Icon className="w-4 h-4" />
        <span className="font-bold">{currentConfig.label}</span>
        <span className="hidden sm:inline">-</span>
        <span className="hidden sm:inline">{currentConfig.message}</span>
      </div>
    </div>
  );
}

function getEnvironment(): Environment {
  const env = import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE;

  if (env === 'production') return 'production';
  if (env === 'test' || env === 'testing') return 'test';
  if (env === 'demo') return 'demo';

  return 'dev';
}

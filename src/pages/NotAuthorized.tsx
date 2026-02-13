import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/UI/Button';

export default function NotAuthorized() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-red-100 rounded-full p-4">
            <ShieldAlert className="w-16 h-16 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Access Denied
        </h1>

        <p className="text-slate-600 mb-2">
          You don't have permission to access this area.
        </p>

        <p className="text-sm text-slate-500 mb-8">
          This section is restricted to community administrators only.
        </p>

        <div className="space-y-3">
          <Link to="/dashboard" className="block">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Need admin access?{' '}
            <a href="mailto:support@communityimpact.org" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

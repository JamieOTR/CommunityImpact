import React, { useState } from 'react';
import { Download, Database, User, CheckCircle, AlertCircle } from 'lucide-react';
import { downloadExportAsJSON } from '../../utils/dataExport';
import { supabase } from '../../services/supabase';
import Card from '../UI/Card';
import Button from '../UI/Button';

export function DataExportManager() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{
    success: boolean;
    message: string;
    stats?: { totalRecords: number; tableRecordCounts: Record<string, number> };
  } | null>(null);

  const handleFullExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      const stats = await downloadExportAsJSON(undefined, `full-database-export-${new Date().toISOString().split('T')[0]}.json`);
      setExportResult({
        success: true,
        message: `Successfully exported ${stats.totalRecords} records from the database`,
        stats,
      });
    } catch (error) {
      console.error('Export failed:', error);
      setExportResult({
        success: false,
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCurrentUserExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No user logged in');
      }

      const { data: userData } = await supabase
        .from('users')
        .select('user_id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) {
        throw new Error('User profile not found');
      }

      const stats = await downloadExportAsJSON(userData.user_id, `my-data-export-${new Date().toISOString().split('T')[0]}.json`);
      setExportResult({
        success: true,
        message: `Successfully exported ${stats.totalRecords} records from your account`,
        stats,
      });
    } catch (error) {
      console.error('Export failed:', error);
      setExportResult({
        success: false,
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Export</h2>
        <p className="text-gray-600">
          Export your data in JSON format for backup, migration, or analysis purposes.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Export My Data
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Export all data associated with your user account including achievements, rewards, interactions, and notifications.
              </p>
              <Button
                onClick={handleCurrentUserExport}
                disabled={isExporting}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export My Data'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Export Full Database
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Export all data from the entire database including all users, communities, programs, and related records.
              </p>
              <Button
                onClick={handleFullExport}
                disabled={isExporting}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export Full Database'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {exportResult && (
        <Card className={`p-4 ${exportResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start space-x-3">
            {exportResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${exportResult.success ? 'text-green-900' : 'text-red-900'}`}>
                {exportResult.message}
              </p>
              {exportResult.success && exportResult.stats && (
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-gray-700 font-semibold">Export Summary:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    {Object.entries(exportResult.stats.tableRecordCounts)
                      .filter(([_, count]) => count > 0)
                      .map(([table, count]) => (
                        <div key={table}>
                          <span className="font-medium">{table}:</span> {count} records
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-2">About Data Exports</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Exports are in JSON format and can be imported into other systems</li>
              <li>• All timestamps are in ISO 8601 format (UTC timezone)</li>
              <li>• File downloads will start automatically when export completes</li>
              <li>• Sensitive data like passwords are never included in exports</li>
              <li>• Full database exports require appropriate permissions</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

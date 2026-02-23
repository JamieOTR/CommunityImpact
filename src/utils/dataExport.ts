import { supabase } from '../services/supabase';

interface ExportData {
  exportDate: string;
  version: string;
  tables: {
    users?: any[];
    communities?: any[];
    programs?: any[];
    milestones?: any[];
    achievements?: any[];
    rewards?: any[];
    interactions?: any[];
    notifications?: any[];
    impact_metrics?: any[];
    badges?: any[];
    user_badges?: any[];
    files?: any[];
    audit_logs?: any[];
    analytics_events?: any[];
    program_members?: any[];
    comments?: any[];
    feature_flags?: any[];
  };
  statistics: {
    totalRecords: number;
    tableRecordCounts: Record<string, number>;
  };
}

const TABLES = [
  'users',
  'communities',
  'programs',
  'milestones',
  'achievements',
  'rewards',
  'interactions',
  'notifications',
  'impact_metrics',
  'badges',
  'user_badges',
  'files',
  'audit_logs',
  'analytics_events',
  'program_members',
  'comments',
  'feature_flags',
];

export async function exportAllData(userId?: string): Promise<ExportData> {
  const exportData: ExportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    tables: {},
    statistics: {
      totalRecords: 0,
      tableRecordCounts: {},
    },
  };

  for (const table of TABLES) {
    try {
      let query = supabase.from(table).select('*');

      if (userId && table === 'users') {
        query = query.eq('user_id', userId);
      } else if (userId && ['achievements', 'rewards', 'interactions', 'notifications', 'user_badges', 'analytics_events', 'program_members', 'comments'].includes(table)) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error exporting ${table}:`, error);
        exportData.tables[table as keyof typeof exportData.tables] = [];
        exportData.statistics.tableRecordCounts[table] = 0;
      } else {
        exportData.tables[table as keyof typeof exportData.tables] = data || [];
        const count = data?.length || 0;
        exportData.statistics.tableRecordCounts[table] = count;
        exportData.statistics.totalRecords += count;
      }
    } catch (err) {
      console.error(`Exception exporting ${table}:`, err);
      exportData.tables[table as keyof typeof exportData.tables] = [];
      exportData.statistics.tableRecordCounts[table] = 0;
    }
  }

  return exportData;
}

export async function downloadExportAsJSON(userId?: string, filename?: string) {
  const data = await exportAllData(userId);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `community-impact-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return data.statistics;
}

export async function exportUserData(userId: string) {
  return exportAllData(userId);
}

export async function exportFullDatabase() {
  return exportAllData();
}

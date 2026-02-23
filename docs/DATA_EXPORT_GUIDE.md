# Data Export Guide

This guide explains how to export your data from the Community Impact Tracker application.

## Overview

The Data Export feature allows you to download all your data in JSON format for:
- **Backup** - Keep a local copy of your data
- **Migration** - Move data to another account or system
- **Analysis** - Analyze your data using external tools
- **Compliance** - Meet data portability requirements

## How to Export Data

### For Regular Users

1. **Log in** to your account
2. Navigate to the **Admin Dashboard** (if you have admin access)
3. Scroll to the **Data Export** section
4. Click **"Export My Data"**
5. The download will start automatically

Your export will include:
- Your user profile information
- All your achievements
- All your rewards
- Your interactions with AI
- Your notifications
- Your badges
- Your program memberships
- Your comments
- Analytics events related to your account

### For Administrators

If you're an administrator, you have two export options:

#### Option 1: Export Your Own Data
Same as regular users - exports only your personal data.

#### Option 2: Export Full Database
Exports all data from the entire database including:
- All users
- All communities
- All programs
- All milestones
- All achievements
- All rewards
- All interactions
- All notifications
- All impact metrics
- All badges and user badges
- All files
- All audit logs
- All analytics events
- All program members
- All comments
- All feature flags

**Note:** Full database export requires appropriate admin permissions.

## Export File Format

The export file is in JSON format with the following structure:

```json
{
  "exportDate": "2024-01-15T10:30:00.000Z",
  "version": "1.0",
  "tables": {
    "users": [...],
    "achievements": [...],
    "rewards": [...],
    ...
  },
  "statistics": {
    "totalRecords": 1234,
    "tableRecordCounts": {
      "users": 1,
      "achievements": 45,
      "rewards": 20,
      ...
    }
  }
}
```

## Data Security

- **No Passwords**: Password hashes and authentication secrets are never included in exports
- **Timestamps**: All timestamps are in ISO 8601 format (UTC timezone)
- **UUIDs**: All IDs are preserved to maintain referential integrity

## Importing Data

To import data into another Supabase instance:

1. Create the same database schema using the migrations in `supabase/migrations/`
2. Parse the JSON export file
3. Insert data table by table, respecting foreign key relationships
4. Update sequences and regenerate any auto-generated values as needed

## Programmatic Access

You can also export data programmatically using the utility functions:

```typescript
import { exportAllData, downloadExportAsJSON, exportUserData } from './utils/dataExport';

// Export all data
const fullExport = await exportAllData();

// Export specific user data
const userExport = await exportUserData('user-id-here');

// Trigger download
await downloadExportAsJSON();
```

## Troubleshooting

### Export Failed
- Check your internet connection
- Verify you're logged in
- Ensure you have appropriate permissions
- Try refreshing the page and trying again

### Large Exports
For very large databases:
- The export may take several minutes
- Don't close the browser tab while exporting
- Ensure you have sufficient disk space
- Consider exporting during off-peak hours

### Permission Issues
If you can't access the export feature:
- Verify you have admin permissions
- Contact your community administrator
- Check that your account is active

## Support

For questions or issues with data export:
1. Check this guide
2. Review the console for error messages
3. Contact your system administrator
4. Submit a bug report with details of the issue

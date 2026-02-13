import { useEffect, useState } from 'react';
import { Save, Copy, Users, Link as LinkIcon } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Community {
  community_id: string;
  name: string;
  description: string | null;
  blockchain_address: string | null;
  member_count: number;
  referral_code: string | null;
  created_at: string;
}

export default function AdminSettings() {
  const { user } = useAuth();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    blockchain_address: '',
  });

  useEffect(() => {
    loadCommunity();
  }, [user]);

  async function loadCommunity() {
    if (!user) return;

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('community_id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!userData?.community_id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('community_id', userData.community_id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCommunity(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          blockchain_address: data.blockchain_address || '',
        });
      }
    } catch (error) {
      console.error('Error loading community:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!community) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('communities')
        .update({
          name: formData.name,
          description: formData.description || null,
          blockchain_address: formData.blockchain_address || null,
          updated_at: new Date().toISOString(),
        })
        .eq('community_id', community.community_id);

      if (error) throw error;

      await loadCommunity();
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function copyReferralCode() {
    if (community?.referral_code) {
      navigator.clipboard.writeText(community.referral_code);
      alert('Referral code copied to clipboard!');
    }
  }

  function copyReferralLink() {
    if (community?.referral_code) {
      const link = `${window.location.origin}/?ref=${community.referral_code}`;
      navigator.clipboard.writeText(link);
      alert('Referral link copied to clipboard!');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <Card className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No community found
          </h3>
          <p className="text-slate-600">
            You must be part of a community to access settings
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Community Settings
        </h1>
        <p className="text-slate-600">
          Manage your community configuration and preferences
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Basic Information */}
        <Card>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Community Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter community name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your community's mission and goals..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Blockchain Address
              </label>
              <input
                type="text"
                value={formData.blockchain_address}
                onChange={(e) => setFormData({ ...formData, blockchain_address: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="0x..."
              />
              <p className="text-xs text-slate-500 mt-1">
                Smart contract address for token distribution
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || !formData.name}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>

        {/* Community Stats */}
        <Card>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Community Statistics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Members</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {community.member_count}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-600 mb-1">Created</p>
                <p className="text-lg font-semibold text-slate-900">
                  {new Date(community.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Referral System */}
        <Card>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Referral System
          </h2>

          <p className="text-sm text-slate-600 mb-4">
            Share your referral code or link to invite new members to join your community
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Referral Code
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={community.referral_code || 'Not available'}
                  readOnly
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono"
                />
                <Button
                  onClick={copyReferralCode}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700"
                  disabled={!community.referral_code}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Referral Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={
                    community.referral_code
                      ? `${window.location.origin}/?ref=${community.referral_code}`
                      : 'Not available'
                  }
                  readOnly
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm"
                />
                <Button
                  onClick={copyReferralLink}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700"
                  disabled={!community.referral_code}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Share your referral link with potential members.
              They'll automatically join your community when they sign up.
            </p>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <h2 className="text-xl font-bold text-red-900 mb-4">
            Danger Zone
          </h2>

          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800 mb-3">
              These actions are permanent and cannot be undone. Please proceed with caution.
            </p>
            <Button className="bg-red-600 hover:bg-red-700 text-white" disabled>
              Delete Community
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Eye, Calendar, Users, Coins } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Program {
  program_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  status: string;
  total_budget: number | null;
  token_allocation: number | null;
  participant_count: number;
  created_at: string;
}

export default function AdminPrograms() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  useEffect(() => {
    loadPrograms();
  }, [user]);

  async function loadPrograms() {
    if (!user) return;

    try {
      // Get current user's community
      const { data: userData } = await supabase
        .from('users')
        .select('community_id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!userData?.community_id) {
        setLoading(false);
        return;
      }

      // Get programs for the community
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('community_id', userData.community_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Programs Management
          </h1>
          <p className="text-slate-600">
            Create and manage community development programs
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Program
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Programs List */}
      {filteredPrograms.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchTerm ? 'No programs found' : 'No programs yet'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Create your first program to get started with community development initiatives'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Program
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPrograms.map((program) => (
            <Card key={program.program_id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {program.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                      {program.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {program.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(program.start_date).toLocaleDateString()}
                </div>
                {program.participant_count > 0 && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Users className="w-4 h-4 mr-2" />
                    {program.participant_count} participants
                  </div>
                )}
                {program.token_allocation && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Coins className="w-4 h-4 mr-2" />
                    {program.token_allocation.toLocaleString()} tokens
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setSelectedProgram(program)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button
                  onClick={() => setSelectedProgram(program)}
                  className="flex-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Create New Program
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <CreateProgramForm
              onSuccess={() => {
                setShowCreateModal(false);
                loadPrograms();
              }}
              onCancel={() => setShowCreateModal(false)}
            />
          </Card>
        </div>
      )}
    </div>
  );
}

interface CreateProgramFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function CreateProgramForm({ onSuccess, onCancel }: CreateProgramFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    total_budget: '',
    token_allocation: '',
    status: 'draft' as const,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Get current user's community
      const { data: userData } = await supabase
        .from('users')
        .select('community_id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!userData?.community_id) {
        alert('You must be part of a community to create programs');
        return;
      }

      const { error } = await supabase.from('programs').insert({
        name: formData.name,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        total_budget: formData.total_budget ? parseInt(formData.total_budget) : null,
        token_allocation: formData.token_allocation ? parseInt(formData.token_allocation) : null,
        status: formData.status,
        community_id: userData.community_id,
      });

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error creating program:', error);
      alert('Failed to create program. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Program Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Youth Education Initiative"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Description *
        </label>
        <textarea
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe the program's goals and objectives..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Start Date *
          </label>
          <input
            type="date"
            required
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Total Budget (USD)
          </label>
          <input
            type="number"
            value={formData.total_budget}
            onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="10000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Token Allocation
          </label>
          <input
            type="number"
            value={formData.token_allocation}
            onChange={(e) => setFormData({ ...formData, token_allocation: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="5000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Status *
        </label>
        <select
          required
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="flex items-center space-x-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? 'Creating...' : 'Create Program'}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

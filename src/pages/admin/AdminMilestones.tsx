import { useEffect, useState } from 'react';
import { Plus, Target, Coins, Calendar, FolderKanban } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

interface Milestone {
  milestone_id: string;
  title: string;
  description: string;
  reward_amount: number;
  reward_token: string;
  verification_type: string;
  program_id: string;
  category: string;
  difficulty: string;
  deadline: string | null;
  program?: {
    name: string;
  };
}

interface Program {
  program_id: string;
  name: string;
}

export default function AdminMilestones() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterProgram, setFilterProgram] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
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

      // Load programs
      const { data: programsData } = await supabase
        .from('programs')
        .select('program_id, name')
        .eq('community_id', userData.community_id)
        .order('name');

      setPrograms(programsData || []);

      // Load milestones with program names
      if (programsData && programsData.length > 0) {
        const programIds = programsData.map(p => p.program_id);
        const { data: milestonesData } = await supabase
          .from('milestones')
          .select(`
            *,
            programs:program_id (name)
          `)
          .in('program_id', programIds)
          .order('created_at', { ascending: false });

        setMilestones(milestonesData as any || []);
      }
    } catch (error) {
      console.error('Error loading milestones:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMilestones = filterProgram === 'all'
    ? milestones
    : milestones.filter(m => m.program_id === filterProgram);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading milestones...</p>
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
            Milestones Management
          </h1>
          <p className="text-slate-600">
            Create and manage achievement milestones for programs
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={programs.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Milestone
        </Button>
      </div>

      {/* Filters */}
      {programs.length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-slate-700">
              Filter by Program:
            </label>
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Programs</option>
              {programs.map(program => (
                <option key={program.program_id} value={program.program_id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {/* Milestones List */}
      {programs.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No programs available
            </h3>
            <p className="text-slate-600 mb-6">
              You need to create a program first before adding milestones
            </p>
            <a
              href="/admin/programs"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Program
            </a>
          </div>
        </Card>
      ) : filteredMilestones.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No milestones yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first milestone to start tracking achievements
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Milestone
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMilestones.map((milestone) => (
            <Card key={milestone.milestone_id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {milestone.title}
                  </h3>
                  <p className="text-sm text-blue-600 mb-2">
                    {milestone.program?.name || 'Unknown Program'}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(milestone.difficulty)}`}>
                  {milestone.difficulty}
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {milestone.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center text-sm text-slate-600">
                  <Coins className="w-4 h-4 mr-2 text-yellow-500" />
                  {milestone.reward_amount} {milestone.reward_token}
                </div>
                {milestone.deadline && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(milestone.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="text-xs text-slate-500">
                  <span className="font-medium">Verification:</span> {milestone.verification_type}
                </div>
                {milestone.category && (
                  <div className="text-xs text-slate-500 mt-1">
                    <span className="font-medium">Category:</span> {milestone.category}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Create New Milestone
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <CreateMilestoneForm
              programs={programs}
              onSuccess={() => {
                setShowCreateModal(false);
                loadData();
              }}
              onCancel={() => setShowCreateModal(false)}
            />
          </Card>
        </div>
      )}
    </div>
  );
}

interface CreateMilestoneFormProps {
  programs: Program[];
  onSuccess: () => void;
  onCancel: () => void;
}

function CreateMilestoneForm({ programs, onSuccess, onCancel }: CreateMilestoneFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    program_id: programs[0]?.program_id || '',
    reward_amount: '',
    reward_token: 'IMPACT',
    verification_type: 'admin_approval',
    category: '',
    difficulty: 'medium',
    deadline: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('milestones').insert({
        title: formData.title,
        description: formData.description,
        program_id: formData.program_id,
        reward_amount: parseInt(formData.reward_amount),
        reward_token: formData.reward_token,
        verification_type: formData.verification_type,
        category: formData.category || null,
        difficulty: formData.difficulty,
        deadline: formData.deadline || null,
      });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error creating milestone:', error);
      alert('Failed to create milestone. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Milestone Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Complete First Week Training"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Description *
        </label>
        <textarea
          required
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe what needs to be achieved..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Program *
        </label>
        <select
          required
          value={formData.program_id}
          onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {programs.map(program => (
            <option key={program.program_id} value={program.program_id}>
              {program.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Reward Amount *
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.reward_amount}
            onChange={(e) => setFormData({ ...formData, reward_amount: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Difficulty *
          </label>
          <select
            required
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Education, Training"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Deadline
          </label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Verification Type *
        </label>
        <select
          required
          value={formData.verification_type}
          onChange={(e) => setFormData({ ...formData, verification_type: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="admin_approval">Admin Approval</option>
          <option value="automatic">Automatic</option>
          <option value="peer_review">Peer Review</option>
          <option value="document_upload">Document Upload</option>
        </select>
      </div>

      <div className="flex items-center space-x-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? 'Creating...' : 'Create Milestone'}
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

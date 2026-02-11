import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Coins, ArrowRight, CheckCircle, Upload, AlertCircle } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import ProgressRing from '../UI/ProgressRing';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

const statusColors = {
  available: 'bg-blue-50 text-blue-700 border-blue-200',
  'in-progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  submitted: 'bg-purple-50 text-purple-700 border-purple-200',
  verified: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-gray-50 text-gray-700 border-gray-200'
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800'
};

interface Milestone {
  milestone_id: string;
  title: string;
  description: string;
  reward_amount: number;
  reward_token: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  deadline: string | null;
  achievement?: {
    achievement_id: string;
    status: string;
    progress: number;
    evidence_url: string | null;
  };
}

export default function MilestonesGrid() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingEvidence, setSubmittingEvidence] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    if (user) {
      fetchMilestones();
    }
  }, [user]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);

      const { data: milestonesData, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (milestonesError) throw milestonesError;

      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user?.user_id);

      const achievementsMap = new Map(
        achievementsData?.map(a => [a.milestone_id, a]) || []
      );

      const milestonesWithStatus = (milestonesData || []).map(milestone => ({
        ...milestone,
        achievement: achievementsMap.get(milestone.milestone_id)
      }));

      setMilestones(milestonesWithStatus);
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMilestone = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('achievements')
        .insert({
          user_id: user?.user_id,
          milestone_id: milestoneId,
          status: 'in-progress',
          progress: 0
        });

      if (error) throw error;

      await fetchMilestones();
    } catch (error) {
      console.error('Failed to start milestone:', error);
      alert('Failed to start milestone. Please try again.');
    }
  };

  const handleSubmitEvidence = async () => {
    if (!selectedMilestone?.achievement) return;

    try {
      setSubmittingEvidence(selectedMilestone.milestone_id);

      const { error } = await supabase
        .from('achievements')
        .update({
          status: 'submitted',
          progress: 100,
          evidence_url: evidenceUrl || 'Pending verification',
          updated_at: new Date().toISOString()
        })
        .eq('achievement_id', selectedMilestone.achievement.achievement_id);

      if (error) throw error;

      setShowEvidenceModal(false);
      setEvidenceUrl('');
      setSelectedMilestone(null);
      await fetchMilestones();
    } catch (error) {
      console.error('Failed to submit evidence:', error);
      alert('Failed to submit evidence. Please try again.');
    } finally {
      setSubmittingEvidence(null);
    }
  };

  const openEvidenceModal = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setShowEvidenceModal(true);
  };

  const getStatus = (milestone: Milestone) => {
    if (!milestone.achievement) return 'available';
    return milestone.achievement.status;
  };

  const getProgress = (milestone: Milestone) => {
    return milestone.achievement?.progress || 0;
  };

  const activeMilestones = milestones.filter(m => getStatus(m) !== 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Active Milestones</h2>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/milestones'}>
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {activeMilestones.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Milestones</h3>
              <p className="text-gray-600">Check back later for new opportunities to make an impact!</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeMilestones.map((milestone, index) => {
              const status = getStatus(milestone);
              const progress = getProgress(milestone);

              return (
                <motion.div
                  key={milestone.milestone_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[status]}`}>
                            {status.replace('-', ' ')}
                          </span>
                          {milestone.difficulty && (
                            <span className={`px-2 py-1 text-xs font-medium rounded ${difficultyColors[milestone.difficulty]}`}>
                              {milestone.difficulty}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                      </div>
                      {status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>

                    {progress > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-500">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-primary-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Coins className="w-4 h-4" />
                          <span>Reward</span>
                        </div>
                        <span className="font-semibold text-secondary-600">
                          {milestone.reward_amount} {milestone.reward_token || 'IMPACT'}
                        </span>
                      </div>

                      {milestone.deadline && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Deadline</span>
                          </div>
                          <span className="text-gray-700">
                            {formatDistanceToNow(new Date(milestone.deadline), { addSuffix: true })}
                          </span>
                        </div>
                      )}

                      {milestone.category && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Category</span>
                          </div>
                          <span className="text-gray-700">{milestone.category}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      {status === 'available' && (
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={() => handleStartMilestone(milestone.milestone_id)}
                        >
                          Start Milestone
                        </Button>
                      )}
                      {status === 'in-progress' && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => window.location.href = `/milestones/${milestone.milestone_id}`}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => openEvidenceModal(milestone)}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Submit Evidence
                          </Button>
                        </div>
                      )}
                      {status === 'submitted' && (
                        <div className="text-center">
                          <p className="text-sm text-yellow-600 font-medium">Verification in progress...</p>
                          <p className="text-xs text-gray-500 mt-1">Usually takes 2-3 business days</p>
                        </div>
                      )}
                      {status === 'verified' && (
                        <div className="text-center">
                          <p className="text-sm text-green-600 font-medium">Verified! Reward pending...</p>
                          <p className="text-xs text-gray-500 mt-1">Tokens will be distributed shortly</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Evidence Submission Modal */}
      {showEvidenceModal && selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Evidence</h3>
            <p className="text-sm text-gray-600 mb-4">
              Provide evidence of completing: <strong>{selectedMilestone.title}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence URL or Description
              </label>
              <input
                type="text"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://example.com/evidence or description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a link to photos, documents, or describe what you've accomplished
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowEvidenceModal(false);
                  setEvidenceUrl('');
                  setSelectedMilestone(null);
                }}
                disabled={!!submittingEvidence}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleSubmitEvidence}
                disabled={!!submittingEvidence || !evidenceUrl.trim()}
              >
                {submittingEvidence ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
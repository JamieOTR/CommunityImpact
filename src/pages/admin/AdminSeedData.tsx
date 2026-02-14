import { useState } from 'react';
import { Database, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { supabase } from '../../services/supabase';

interface SeedResult {
  success: boolean;
  message: string;
  details?: {
    communities: number;
    programs: number;
    milestones: number;
    achievements: number;
    rewards: number;
  };
}

export default function AdminSeedData() {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);

  async function handleSeedData() {
    if (!confirm('This will create demo data (2 communities, 4 programs, 20 milestones, 20 achievements, 20 rewards). Continue?')) {
      return;
    }

    setSeeding(true);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: currentUser } = await supabase
        .from('users')
        .select('user_id, is_admin, role')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!currentUser?.is_admin) {
        throw new Error('Admin access required');
      }

      const communities = [];
      const programs = [];
      const milestones = [];
      const achievements = [];
      const rewards = [];

      const { data: existingCommunities, error: commError } = await supabase
        .from('communities')
        .select('community_id, name');

      if (commError) throw commError;

      if (!existingCommunities || existingCommunities.length < 2) {
        const communityData = [
          {
            name: 'Green Valley Initiative',
            description: 'Environmental conservation and sustainability programs',
            owner_user_id: currentUser.user_id,
            status: 'active',
            privacy_level: 'public',
            referral_code: `GVI${Date.now().toString().slice(-6)}`,
          },
          {
            name: 'Tech for Good Alliance',
            description: 'Technology education and digital literacy programs',
            owner_user_id: currentUser.user_id,
            status: 'active',
            privacy_level: 'public',
            referral_code: `TFG${Date.now().toString().slice(-6)}`,
          },
        ];

        for (const comm of communityData) {
          const { data: newComm, error } = await supabase
            .from('communities')
            .insert(comm)
            .select()
            .single();

          if (error) throw error;
          communities.push(newComm);
        }
      } else {
        communities.push(...existingCommunities.slice(0, 2));
      }

      const programData = [
        {
          name: 'Tree Planting Campaign 2024',
          description: 'Plant 1000 trees across the valley',
          community_id: communities[0].community_id,
          created_by: currentUser.user_id,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          program_type: 'environmental',
          participant_count: 0,
        },
        {
          name: 'Clean Water Access Project',
          description: 'Ensure clean water access for 500 households',
          community_id: communities[0].community_id,
          created_by: currentUser.user_id,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          program_type: 'infrastructure',
          participant_count: 0,
        },
        {
          name: 'Coding Bootcamp for Youth',
          description: 'Free coding education for 100 students',
          community_id: communities[1].community_id,
          created_by: currentUser.user_id,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          program_type: 'education',
          participant_count: 0,
        },
        {
          name: 'Digital Literacy Workshops',
          description: 'Basic computer skills for seniors',
          community_id: communities[1].community_id,
          created_by: currentUser.user_id,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          program_type: 'education',
          participant_count: 0,
        },
      ];

      for (const prog of programData) {
        const { data: newProg, error } = await supabase
          .from('programs')
          .insert(prog)
          .select()
          .single();

        if (error) throw error;
        programs.push(newProg);
      }

      const milestoneTemplates = [
        { title: 'Plant 50 trees', reward: 100 },
        { title: 'Plant 100 trees', reward: 250 },
        { title: 'Plant 250 trees', reward: 500 },
        { title: 'Organize planting event', reward: 300 },
        { title: 'Train 10 volunteers', reward: 200 },
        { title: 'Install water filter', reward: 400 },
        { title: 'Water quality test', reward: 150 },
        { title: 'Community water meeting', reward: 100 },
        { title: 'Water conservation workshop', reward: 200 },
        { title: 'Emergency water supply setup', reward: 350 },
        { title: 'Complete HTML/CSS module', reward: 100 },
        { title: 'Build first website', reward: 200 },
        { title: 'JavaScript fundamentals', reward: 150 },
        { title: 'Create portfolio project', reward: 300 },
        { title: 'Mentor junior student', reward: 250 },
        { title: 'Attend computer basics', reward: 50 },
        { title: 'Email and internet safety', reward: 75 },
        { title: 'Social media workshop', reward: 100 },
        { title: 'Online banking tutorial', reward: 125 },
        { title: 'Help another senior', reward: 150 },
      ];

      for (let i = 0; i < programs.length; i++) {
        const programMilestones = milestoneTemplates.slice(i * 5, (i + 1) * 5);

        for (const template of programMilestones) {
          const { data: newMilestone, error } = await supabase
            .from('milestones')
            .insert({
              title: template.title,
              description: `Complete ${template.title.toLowerCase()}`,
              program_id: programs[i].program_id,
              reward_amount: template.reward,
              reward_token: 'IMPACT',
              verification_type: 'admin',
              evidence_type: 'url',
              min_evidence_items: 1,
              verification_mode: 'admin',
              status: 'active',
              weight: 1.0,
              sequence_order: milestones.length + 1,
            })
            .select()
            .single();

          if (error) throw error;
          milestones.push(newMilestone);
        }
      }

      const { data: demoUsers, error: usersError } = await supabase
        .from('users')
        .select('user_id, community_id')
        .limit(10);

      if (usersError) throw usersError;

      const usersByCommunity = {
        [communities[0].community_id]: demoUsers?.filter(u => u.community_id === communities[0].community_id) || [],
        [communities[1].community_id]: demoUsers?.filter(u => u.community_id === communities[1].community_id) || [],
      };

      if (usersByCommunity[communities[0].community_id].length === 0) {
        usersByCommunity[communities[0].community_id].push({ user_id: currentUser.user_id, community_id: communities[0].community_id });
      }
      if (usersByCommunity[communities[1].community_id].length === 0) {
        usersByCommunity[communities[1].community_id].push({ user_id: currentUser.user_id, community_id: communities[1].community_id });
      }

      for (let i = 0; i < 20 && i < milestones.length; i++) {
        const milestone = milestones[i];
        const program = programs.find(p => p.program_id === milestone.program_id);
        if (!program) continue;

        const communityUsers = usersByCommunity[program.community_id] || [];
        if (communityUsers.length === 0) continue;

        const user = communityUsers[i % communityUsers.length];

        const verificationStatus = i < 10 ? 'pending' : (i < 15 ? 'verified' : 'rejected');
        const status = verificationStatus === 'verified' ? 'completed' : (verificationStatus === 'pending' ? 'submitted' : 'available');

        const { data: newAchievement, error } = await supabase
          .from('achievements')
          .insert({
            user_id: user.user_id,
            milestone_id: milestone.milestone_id,
            completed_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            evidence_url: `https://example.com/evidence/${i + 1}`,
            verification_status: verificationStatus,
            status: status,
            progress: verificationStatus === 'verified' ? 100 : (verificationStatus === 'pending' ? 100 : 50),
            risk_score: Math.random() * 0.3,
            source: 'web',
            community_id: program.community_id,
            verified_by: verificationStatus !== 'pending' ? currentUser.user_id : undefined,
            verified_at: verificationStatus !== 'pending' ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : undefined,
            rejection_reason: verificationStatus === 'rejected' ? 'Insufficient evidence provided' : undefined,
          })
          .select()
          .single();

        if (error) throw error;
        achievements.push(newAchievement);

        if (verificationStatus === 'verified' || i < 20) {
          const rewardStatus = i < 12 ? 'pending' : (i < 18 ? 'confirmed' : 'failed');

          const { data: newReward, error: rewardError } = await supabase
            .from('rewards')
            .insert({
              user_id: user.user_id,
              achievement_id: newAchievement.achievement_id,
              token_amount: milestone.reward_amount,
              token_type: milestone.reward_token,
              status: rewardStatus,
              description: `Reward for: ${milestone.title}`,
              approved_by: currentUser.user_id,
              approved_at: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
              paid_at: rewardStatus === 'confirmed' ? new Date().toISOString() : undefined,
              tx_hash: rewardStatus === 'confirmed' ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined,
              error_message: rewardStatus === 'failed' ? 'Insufficient funds in wallet' : undefined,
              retry_count: rewardStatus === 'failed' ? 1 : 0,
              community_id: program.community_id,
            })
            .select()
            .single();

          if (rewardError) throw rewardError;
          rewards.push(newReward);
        }
      }

      setResult({
        success: true,
        message: 'Demo data seeded successfully!',
        details: {
          communities: communities.length,
          programs: programs.length,
          milestones: milestones.length,
          achievements: achievements.length,
          rewards: rewards.length,
        },
      });
    } catch (error: any) {
      console.error('Seed error:', error);
      setResult({
        success: false,
        message: error.message || 'Failed to seed data',
      });
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Seed Demo Data
        </h1>
        <p className="text-slate-600">
          Populate the database with demo data for testing and demonstrations
        </p>
      </div>

      <Card className="mb-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Development/Testing Only
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              This utility creates demo data for testing purposes. It will create:
            </p>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>2 Communities (Green Valley Initiative, Tech for Good Alliance)</li>
              <li>4 Programs (2 per community)</li>
              <li>20 Milestones (5 per program)</li>
              <li>20 Achievements (various statuses: pending, verified, rejected)</li>
              <li>20 Rewards (various statuses: pending, confirmed, failed)</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-center py-8">
          <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-blue-600" />
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Ready to Seed Data
          </h3>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            Click the button below to populate the database with demo data. This action can be run multiple times.
          </p>

          <Button
            onClick={handleSeedData}
            disabled={seeding}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {seeding ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Seeding Data...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Seed Demo Data
              </>
            )}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className={`mt-6 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`text-sm font-semibold mb-1 ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.success ? 'Success' : 'Error'}
              </h3>
              <p className={`text-sm mb-3 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.message}
              </p>
              {result.details && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.details.communities}</div>
                    <div className="text-xs text-slate-600">Communities</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{result.details.programs}</div>
                    <div className="text-xs text-slate-600">Programs</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">{result.details.milestones}</div>
                    <div className="text-xs text-slate-600">Milestones</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">{result.details.achievements}</div>
                    <div className="text-xs text-slate-600">Achievements</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{result.details.rewards}</div>
                    <div className="text-xs text-slate-600">Rewards</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

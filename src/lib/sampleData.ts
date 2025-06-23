import { supabase } from './supabase';
import { databaseService } from './database';

export async function createSampleData() {
  try {
    console.log('Creating sample data...');

    // Create a sample user (this would normally be done during auth signup)
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      console.log('No authenticated user found');
      return;
    }

    // Check if user already exists
    const existingUser = await databaseService.getCurrentUser();
    if (existingUser) {
      console.log('User already exists, skipping sample data creation');
      return existingUser;
    }

    // Create user record
    const user = await databaseService.createUser({
      email: authUser.user.email || 'demo@example.com',
      name: 'Demo User',
      auth_user_id: authUser.user.id,
      avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
    });

    if (!user) {
      console.error('Failed to create user');
      return;
    }

    // Create a sample community
    const community = await databaseService.createCommunity({
      name: 'Green Valley Community',
      description: 'A sustainable community focused on environmental and social impact',
      admin_id: user.user_id
    });

    if (!community) {
      console.error('Failed to create community');
      return;
    }

    // Update user to be part of the community
    await supabase
      .from('users')
      .update({ community_id: community.community_id })
      .eq('user_id', user.user_id);

    // Create a sample program
    const { data: program } = await supabase
      .from('programs')
      .insert({
        name: 'Environmental Action Initiative',
        description: 'Community-driven environmental sustainability program',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        community_id: community.community_id,
        total_budget: 10000,
        token_allocation: 5000,
        status: 'active'
      })
      .select()
      .single();

    if (!program) {
      console.error('Failed to create program');
      return;
    }

    // Create sample milestones
    const milestones = [
      {
        title: 'Organize Community Clean-up',
        description: 'Lead a neighborhood clean-up initiative with at least 10 participants',
        reward_amount: 150,
        verification_type: 'photo_evidence',
        program_id: program.program_id,
        category: 'Environment',
        difficulty: 'medium' as const,
        deadline: '2024-04-15T00:00:00Z',
        requirements: [
          'Minimum 10 participants',
          'Document before/after photos',
          'Submit participant list',
          'Provide waste collection summary'
        ]
      },
      {
        title: 'Food Bank Volunteer',
        description: 'Volunteer for 20 hours at local food bank',
        reward_amount: 80,
        verification_type: 'coordinator_verification',
        program_id: program.program_id,
        category: 'Social Support',
        difficulty: 'easy' as const,
        deadline: '2024-04-30T00:00:00Z',
        requirements: [
          'Complete 20 volunteer hours',
          'Submit volunteer coordinator verification',
          'Document impact photos'
        ]
      },
      {
        title: 'Digital Literacy Workshop',
        description: 'Teach basic computer skills to seniors',
        reward_amount: 200,
        verification_type: 'completion_certificate',
        program_id: program.program_id,
        category: 'Education',
        difficulty: 'medium' as const,
        requirements: [
          'Conduct 4-week workshop series',
          'Minimum 5 participants',
          'Submit curriculum and attendance records'
        ]
      },
      {
        title: 'Youth Mentorship Program',
        description: 'Provide guidance to 3 youth in starting their businesses',
        reward_amount: 300,
        verification_type: 'progress_reports',
        program_id: program.program_id,
        category: 'Education',
        difficulty: 'hard' as const,
        deadline: '2024-05-30T00:00:00Z',
        requirements: [
          'Meet with 3 different youth',
          'Provide business plan feedback',
          'Document progress reports',
          'Submit mentorship completion certificates'
        ]
      }
    ];

    for (const milestoneData of milestones) {
      await databaseService.createMilestone(milestoneData);
    }

    // Create some sample achievements
    const createdMilestones = await databaseService.getMilestones();
    if (createdMilestones.length > 0) {
      // Complete one milestone
      const completedMilestone = createdMilestones[2]; // Digital Literacy Workshop
      const achievement = await databaseService.createAchievement({
        user_id: user.user_id,
        milestone_id: completedMilestone.milestone_id,
        evidence_url: 'https://example.com/workshop-certificate.pdf',
        progress: 100,
        status: 'completed'
      });

      if (achievement) {
        // Create a reward for the completed achievement
        await databaseService.createReward({
          user_id: user.user_id,
          achievement_id: achievement.achievement_id,
          token_amount: completedMilestone.reward_amount,
          description: `Completed: ${completedMilestone.title}`,
          status: 'confirmed'
        });
      }

      // Create an in-progress achievement
      if (createdMilestones.length > 1) {
        await databaseService.createAchievement({
          user_id: user.user_id,
          milestone_id: createdMilestones[0].milestone_id, // Community Clean-up
          progress: 75,
          status: 'in-progress'
        });
      }
    }

    console.log('Sample data created successfully!');
    return user;

  } catch (error) {
    console.error('Error creating sample data:', error);
    throw error;
  }
}

export async function ensureSampleDataExists() {
  try {
    const user = await databaseService.getCurrentUser();
    if (!user) {
      return await createSampleData();
    }
    return user;
  } catch (error) {
    console.error('Error ensuring sample data exists:', error);
    return null;
  }
}
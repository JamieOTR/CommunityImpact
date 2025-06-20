import { User, Milestone, Transaction, Program, ImpactMetrics, Badge } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'Sarah Chen',
  email: 'sarah.chen@example.com',
  avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
  walletAddress: '0x742d35Cc6634C0532925a3b8D8C9D2E9e2cF3456',
  totalImpactScore: 2850,
  badges: [
    {
      id: '1',
      name: 'Community Leader',
      description: 'Led 5+ community initiatives',
      icon: '👑',
      earnedAt: new Date('2024-01-15'),
      rarity: 'epic'
    },
    {
      id: '2',
      name: 'Environmental Champion',
      description: 'Completed 10 environmental milestones',
      icon: '🌱',
      earnedAt: new Date('2024-02-20'),
      rarity: 'rare'
    },
    {
      id: '3',
      name: 'Education Advocate',
      description: 'Supported 3 educational programs',
      icon: '📚',
      earnedAt: new Date('2024-03-10'),
      rarity: 'common'
    }
  ],
  joinedAt: new Date('2023-12-01'),
};

export const mockMilestones: Milestone[] = [
  {
    id: '1',
    title: 'Organize Community Clean-up',
    description: 'Lead a neighborhood clean-up initiative with at least 10 participants',
    category: 'Environment',
    difficulty: 'medium',
    rewardAmount: 150,
    rewardToken: 'IMPACT',
    progress: 75,
    status: 'in-progress',
    deadline: new Date('2024-04-15'),
    requirements: [
      'Minimum 10 participants',
      'Document before/after photos',
      'Submit participant list',
      'Provide waste collection summary'
    ]
  },
  {
    id: '2',
    title: 'Mentor Young Entrepreneurs',
    description: 'Provide guidance to 3 youth in starting their businesses',
    category: 'Education',
    difficulty: 'hard',
    rewardAmount: 300,
    rewardToken: 'IMPACT',
    progress: 30,
    status: 'in-progress',
    deadline: new Date('2024-05-30'),
    requirements: [
      'Meet with 3 different youth',
      'Provide business plan feedback',
      'Document progress reports',
      'Submit mentorship completion certificates'
    ]
  },
  {
    id: '3',
    title: 'Food Bank Volunteer',
    description: 'Volunteer for 20 hours at local food bank',
    category: 'Social Support',
    difficulty: 'easy',
    rewardAmount: 80,
    rewardToken: 'IMPACT',
    progress: 0,
    status: 'available',
    deadline: new Date('2024-04-30'),
    requirements: [
      'Complete 20 volunteer hours',
      'Submit volunteer coordinator verification',
      'Document impact photos'
    ]
  },
  {
    id: '4',
    title: 'Digital Literacy Workshop',
    description: 'Teach basic computer skills to seniors',
    category: 'Education',
    difficulty: 'medium',
    rewardAmount: 200,
    rewardToken: 'IMPACT',
    progress: 100,
    status: 'completed',
    requirements: [
      'Conduct 4-week workshop series',
      'Minimum 5 participants',
      'Submit curriculum and attendance records'
    ]
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'reward',
    amount: 200,
    token: 'IMPACT',
    timestamp: new Date('2024-03-15'),
    status: 'confirmed',
    txHash: '0xabcd1234...',
    description: 'Completed Digital Literacy Workshop milestone'
  },
  {
    id: '2',
    type: 'reward',
    amount: 150,
    token: 'IMPACT',
    timestamp: new Date('2024-03-10'),
    status: 'confirmed',
    txHash: '0xefgh5678...',
    description: 'Community garden project completion'
  },
  {
    id: '3',
    type: 'reward',
    amount: 100,
    token: 'IMPACT',
    timestamp: new Date('2024-03-05'),
    status: 'pending',
    description: 'Senior tech support volunteer hours'
  }
];

export const mockPrograms: Program[] = [
  {
    id: '1',
    title: 'Green Neighborhoods Initiative',
    description: 'Transform communities through environmental action and sustainable practices',
    organization: 'EcoCity Foundation',
    category: 'Environment',
    totalReward: 5000,
    participantCount: 234,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-30'),
    milestones: [],
    status: 'active'
  },
  {
    id: '2',
    title: 'Youth Entrepreneurship Program',
    description: 'Empowering young people to start and grow their own businesses',
    organization: 'Future Leaders Network',
    category: 'Education',
    totalReward: 8000,
    participantCount: 156,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-08-31'),
    milestones: [],
    status: 'active'
  },
  {
    id: '3',
    title: 'Digital Inclusion Project',
    description: 'Bridging the digital divide through education and access',
    organization: 'TechForGood',
    category: 'Technology',
    totalReward: 3500,
    participantCount: 89,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-07-31'),
    milestones: [],
    status: 'active'
  }
];

export const mockImpactMetrics: ImpactMetrics = {
  totalScore: 2850,
  milestonesCompleted: 12,
  tokensEarned: 1420,
  communityRank: 23,
  thisMonth: {
    score: 380,
    milestones: 3,
    tokens: 280
  },
  growth: {
    score: 15.2,
    milestones: 25.0,
    tokens: 22.8
  }
};

export const mockLeaderboard = [
  { rank: 1, name: 'Alex Rodriguez', score: 4250, change: 'up' },
  { rank: 2, name: 'Maya Patel', score: 3890, change: 'same' },
  { rank: 3, name: 'Jordan Kim', score: 3654, change: 'up' },
  { rank: 4, name: 'Sam Johnson', score: 3420, change: 'down' },
  { rank: 5, name: 'Riley Chen', score: 3180, change: 'up' },
];
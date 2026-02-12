import { describe, it, expect, vi } from 'vitest';
import { AIService } from '../../lib/aiService';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null })),
    })),
  },
}));

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
  });

  it('processes milestone-related queries', async () => {
    const response = await aiService.processMessage('user123', 'show me available milestones');
    
    expect(response.message).toContain('milestone');
    expect(response.suggestions).toBeDefined();
  });

  it('processes progress queries', async () => {
    const response = await aiService.processMessage('user123', 'what is my progress?');
    
    expect(response.message).toContain('progress');
    expect(response.suggestions).toBeDefined();
  });

  it('detects voice milestone submissions', async () => {
    const response = await aiService.processMessage('user123', 'I completed the community clean-up milestone');
    
    expect(response.message).toContain('logged your milestone submission');
    expect(response.actions).toBeDefined();
    expect(response.actions?.[0].type).toBe('milestone');
  });

  it('handles wallet-related queries', async () => {
    const response = await aiService.processMessage('user123', 'how do I connect my wallet?');
    
    expect(response.message).toContain('wallet');
    expect(response.suggestions).toBeDefined();
  });

  it('provides default response for unrecognized queries', async () => {
    const response = await aiService.processMessage('user123', 'random question');
    
    expect(response.message).toContain('help');
    expect(response.suggestions).toBeDefined();
  });
});
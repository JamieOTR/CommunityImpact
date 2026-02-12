import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AIChat from '../../components/Chat/AIChat';
import { aiService } from '../../lib/aiService';

// Mock the AI service
vi.mock('../../lib/aiService', () => ({
  aiService: {
    processMessage: vi.fn(),
    generateSpeechResponse: vi.fn(),
  },
}));

describe('AIChat', () => {
  it('renders chat toggle button', () => {
    render(<AIChat />);
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });

  it('opens chat window when toggle button is clicked', async () => {
    render(<AIChat />);
    const toggleButton = screen.getByRole('button');
    
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });
  });

  it('sends message when send button is clicked', async () => {
    const mockResponse = {
      message: 'Test response',
      suggestions: ['Test suggestion'],
    };
    
    vi.mocked(aiService.processMessage).mockResolvedValue(mockResponse);
    
    render(<AIChat />);
    
    // Open chat
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/ask me anything/i);
      const sendButton = screen.getByRole('button', { name: /send/i });
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);
    });
    
    await waitFor(() => {
      expect(aiService.processMessage).toHaveBeenCalledWith('1', 'Test message');
    });
  });

  it('displays initial welcome message', async () => {
    render(<AIChat />);
    
    // Open chat
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(screen.getByText(/Hi! I'm your AI assistant/)).toBeInTheDocument();
    });
  });
});
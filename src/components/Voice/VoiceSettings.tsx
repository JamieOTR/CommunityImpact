import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Settings, Play, Pause, RefreshCw } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { elevenLabsService, type ElevenLabsVoice } from '../../services/elevenLabsService';

interface VoiceSettingsProps {
  onVoiceChange?: (voiceId: string) => void;
  currentVoiceId?: string;
}

export default function VoiceSettings({ onVoiceChange, currentVoiceId }: VoiceSettingsProps) {
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(currentVoiceId || '');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    if (!elevenLabsService.isAvailable()) {
      setError('ElevenLabs API key not configured');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const voiceList = await elevenLabsService.getVoices();
      setVoices(voiceList);
      
      if (!selectedVoice && voiceList.length > 0) {
        setSelectedVoice(voiceList[0].voice_id);
      }
    } catch (err: any) {
      console.error('Failed to load voices:', err);
      setError(err.message || 'Failed to load voices');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    onVoiceChange?.(voiceId);
  };

  const playVoicePreview = async (voiceId: string, voiceName: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }

    try {
      setPlayingVoice(voiceId);
      const previewText = `Hello! This is ${voiceName} speaking. I'm here to help you with your community impact journey.`;
      await elevenLabsService.playText(previewText, voiceId);
    } catch (err) {
      console.error('Failed to play voice preview:', err);
    } finally {
      setPlayingVoice(null);
    }
  };

  if (!elevenLabsService.isAvailable()) {
    return (
      <Card>
        <div className="text-center py-8">
          <Volume2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Voice Features Unavailable</h3>
          <p className="text-gray-600 mb-4">
            ElevenLabs API key is not configured. Voice features are currently disabled.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              To enable voice features, add your ElevenLabs API key to the environment variables.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Voice Settings</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadVoices}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Choose a voice for AI responses and milestone announcements:
          </p>
          
          {voices.map((voice) => (
            <motion.div
              key={voice.voice_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedVoice === voice.voice_id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleVoiceSelect(voice.voice_id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedVoice === voice.voice_id
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedVoice === voice.voice_id && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{voice.name}</h4>
                      <p className="text-sm text-gray-600">{voice.category}</p>
                      {voice.description && (
                        <p className="text-xs text-gray-500 mt-1">{voice.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    playVoicePreview(voice.voice_id, voice.name);
                  }}
                  disabled={playingVoice !== null}
                >
                  {playingVoice === voice.voice_id ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedVoice && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Voice Selected</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Your AI assistant will now use the selected voice for responses and announcements.
          </p>
        </div>
      )}
    </Card>
  );
}
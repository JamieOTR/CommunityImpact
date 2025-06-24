import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Play, Download, RefreshCw, User, MessageSquare } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { tavusService, type TavusVideoResponse, type TavusAvatar } from '../../lib/tavusService';

interface VideoGeneratorProps {
  userName?: string;
  milestoneTitle?: string;
  rewardAmount?: number;
  onVideoGenerated?: (video: TavusVideoResponse) => void;
}

export default function VideoGenerator({ 
  userName = 'Community Member',
  milestoneTitle = 'Amazing Achievement',
  rewardAmount = 100,
  onVideoGenerated 
}: VideoGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<TavusVideoResponse | null>(null);
  const [avatars, setAvatars] = useState<TavusAvatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [customScript, setCustomScript] = useState('');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    loadAvatars();
  }, []);

  const loadAvatars = async () => {
    if (!tavusService.isAvailable()) return;

    try {
      const avatarList = await tavusService.getAvatars();
      setAvatars(avatarList);
      if (avatarList.length > 0) {
        setSelectedAvatar(avatarList[0].avatar_id);
      }
    } catch (err) {
      console.error('Failed to load avatars:', err);
    }
  };

  const generateMilestoneVideo = async () => {
    if (!tavusService.isAvailable()) {
      setError('Tavus API key not configured');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const video = await tavusService.generateMilestoneVideo(
        userName,
        milestoneTitle,
        rewardAmount,
        selectedAvatar
      );

      setGeneratedVideo(video);
      onVideoGenerated?.(video);

      // Poll for completion
      pollVideoStatus(video.video_id);
    } catch (err: any) {
      console.error('Failed to generate video:', err);
      setError(err.message || 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCustomVideo = async () => {
    if (!tavusService.isAvailable() || !customScript.trim()) {
      setError('Please enter a script for the video');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const video = await tavusService.generateVideo({
        script: customScript,
        avatar_id: selectedAvatar,
        video_name: 'Custom_Community_Video'
      });

      setGeneratedVideo(video);
      onVideoGenerated?.(video);

      // Poll for completion
      pollVideoStatus(video.video_id);
    } catch (err: any) {
      console.error('Failed to generate video:', err);
      setError(err.message || 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const pollVideoStatus = async (videoId: string) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const video = await tavusService.getVideo(videoId);
        setGeneratedVideo(video);

        if (video.status === 'completed' || video.status === 'failed') {
          return;
        }

        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 10000); // Poll every 10 seconds
        }
      } catch (err) {
        console.error('Failed to poll video status:', err);
      }
    };

    poll();
  };

  if (!tavusService.isAvailable()) {
    return (
      <Card>
        <div className="text-center py-8">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Video Generation Unavailable</h3>
          <p className="text-gray-600 mb-4">
            Tavus API key is not configured. Video generation features are currently disabled.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              To enable video generation, add your Tavus API key to the environment variables.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar Selection */}
      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Select Avatar</h3>
        </div>

        {avatars.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {avatars.map((avatar) => (
              <div
                key={avatar.avatar_id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedAvatar === avatar.avatar_id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedAvatar(avatar.avatar_id)}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2">
                    {avatar.preview_url ? (
                      <img
                        src={avatar.preview_url}
                        alt={avatar.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{avatar.name}</p>
                  <p className="text-xs text-gray-500">{avatar.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600">Loading avatars...</p>
          </div>
        )}
      </Card>

      {/* Video Generation Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestone Video */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Milestone Celebration</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Video Preview:</h4>
              <p className="text-sm text-gray-600">
                "Congratulations {userName}! You have successfully completed the "{milestoneTitle}" 
                milestone. You've earned {rewardAmount} IMPACT tokens for your amazing contribution 
                to the community. Keep up the great work making a positive difference!"
              </p>
            </div>

            <Button
              onClick={generateMilestoneVideo}
              loading={isGenerating}
              disabled={!selectedAvatar}
              className="w-full"
            >
              <Video className="w-4 h-4 mr-2" />
              Generate Milestone Video
            </Button>
          </div>
        </Card>

        {/* Custom Video */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Custom Message</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="customScript" className="block text-sm font-medium text-gray-700 mb-2">
                Video Script
              </label>
              <textarea
                id="customScript"
                value={customScript}
                onChange={(e) => setCustomScript(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your custom message for the video..."
              />
            </div>

            <Button
              onClick={generateCustomVideo}
              loading={isGenerating}
              disabled={!selectedAvatar || !customScript.trim()}
              className="w-full"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Generate Custom Video
            </Button>
          </div>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Generated Video Display */}
      {generatedVideo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Generated Video</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    generatedVideo.status === 'completed' ? 'bg-green-100 text-green-700' :
                    generatedVideo.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                    generatedVideo.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {generatedVideo.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Video ID:</span>
                  <span className="text-sm text-gray-600 font-mono">{generatedVideo.video_id}</span>
                </div>

                {generatedVideo.estimated_completion_time && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Estimated completion:</span>
                    <span className="text-sm text-gray-600">{generatedVideo.estimated_completion_time}</span>
                  </div>
                )}
              </div>

              {generatedVideo.status === 'processing' && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Video is being generated...</span>
                </div>
              )}

              {generatedVideo.video_url && (
                <div className="space-y-3">
                  <video
                    controls
                    className="w-full rounded-lg"
                    poster={generatedVideo.thumbnail_url}
                  >
                    <source src={generatedVideo.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(generatedVideo.video_url, '_blank')}
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Open Video
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = generatedVideo.video_url!;
                        a.download = `milestone_video_${generatedVideo.video_id}.mp4`;
                        a.click();
                      }}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
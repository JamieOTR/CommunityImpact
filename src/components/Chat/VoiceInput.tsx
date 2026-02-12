import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import Button from '../UI/Button';
import { aiService } from '../../services/aiService';

interface VoiceInputProps {
  onVoiceMessage: (message: string, isVoice: boolean) => void;
  userId: string;
}

export default function VoiceInput({ onVoiceMessage, userId }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Microphone access is required for voice input. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const response = await aiService.processVoiceInput(audioBlob, userId);
      
      // Extract the transcription from the response
      const transcriptionMatch = response.message.match(/I heard: "(.+?)"\./);
      const transcription = transcriptionMatch ? transcriptionMatch[1] : 'Voice input processed';
      
      // Send the voice message
      onVoiceMessage(transcription, true);
      
      // Optionally speak the response
      if (response.message) {
        await aiService.generateSpeechResponse(response.message);
      }
    } catch (error) {
      console.error('Voice processing failed:', error);
      onVoiceMessage('Sorry, I couldn\'t process your voice input. Please try again.', false);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={toggleRecording}
          disabled={isProcessing}
          variant={isRecording ? 'secondary' : 'outline'}
          size="sm"
          className={`relative ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
          
          {isRecording && (
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-red-400"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </Button>
      </motion.div>

      {isRecording && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2 text-red-600"
        >
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium">Recording...</span>
        </motion.div>
      )}

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2 text-blue-600"
        >
          <Volume2 className="w-4 h-4" />
          <span className="text-xs font-medium">Processing...</span>
        </motion.div>
      )}
    </div>
  );
}
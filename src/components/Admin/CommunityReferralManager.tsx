import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Users, QrCode, Mail, MessageSquare, TrendingUp } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

interface CommunityReferralManagerProps {
  communityId: string;
  referralCode: string;
}

export default function CommunityReferralManager({ communityId, referralCode }: CommunityReferralManagerProps) {
  const { user } = useAuth();
  const [memberCount, setMemberCount] = useState(0);
  const [recentJoins, setRecentJoins] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCommunityStats();
  }, [communityId]);

  const fetchCommunityStats = async () => {
    try {
      // Get member count
      const { count } = await supabase
        .from('users')
        .select('user_id', { count: 'exact', head: true })
        .eq('community_id', communityId);

      setMemberCount(count || 0);

      // Get recent joins
      const { data: recentMembers } = await supabase
        .from('users')
        .select('name, created_at')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentJoins(recentMembers || []);
    } catch (error) {
      console.error('Failed to fetch community stats:', error);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralLink = () => {
    const shareUrl = `${window.location.origin}/join?code=${referralCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateQRCode = () => {
    const shareUrl = `${window.location.origin}/join?code=${referralCode}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
    window.open(qrUrl, '_blank');
  };

  const shareViaEmail = () => {
    const shareUrl = `${window.location.origin}/join?code=${referralCode}`;
    const subject = 'Join Our Community Impact Initiative';
    const body = `Hi there!\n\nI'd like to invite you to join our community impact initiative. We're working together to make a positive difference in our community.\n\nJoin us here: ${shareUrl}\n\nUse referral code: ${referralCode}\n\nLooking forward to having you on board!`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const shareViaSMS = () => {
    const shareUrl = `${window.location.origin}/join?code=${referralCode}`;
    const message = `Join our community impact initiative! Use code ${referralCode} or visit: ${shareUrl}`;
    
    window.open(`sms:?body=${encodeURIComponent(message)}`);
  };

  return (
    <div className="space-y-6">
      {/* Referral Code Display */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Referral Code</h3>
        
        <div className="text-center mb-6">
          <div className="bg-primary-50 border-2 border-dashed border-primary-200 rounded-lg p-6 mb-4">
            <p className="text-sm text-gray-600 mb-2">Share this code with new members</p>
            <p className="text-3xl font-bold text-primary-600 font-mono tracking-wider">
              {referralCode}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={copyReferralCode}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
            <Button
              onClick={shareReferralLink}
              size="sm"
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </Button>
          </div>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={generateQRCode}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <QrCode className="w-4 h-4 mr-2" />
            QR Code
          </Button>
          <Button
            onClick={shareViaEmail}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button
            onClick={shareViaSMS}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            SMS
          </Button>
          <Button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Join Our Community',
                  text: `Use referral code: ${referralCode}`,
                  url: `${window.location.origin}/join?code=${referralCode}`
                });
              } else {
                shareReferralLink();
              }
            }}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Share2 className="w-4 h-4 mr-2" />
            More
          </Button>
        </div>
      </Card>

      {/* Community Stats */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Growth</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Total Members</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{memberCount}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Growth Rate</span>
            </div>
            <p className="text-2xl font-bold text-green-700">+12%</p>
          </div>
        </div>

        {/* Recent Joins */}
        {recentJoins.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recent Members</h4>
            <div className="space-y-2">
              {recentJoins.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-sm font-semibold">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{member.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
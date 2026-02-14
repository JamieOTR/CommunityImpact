import { useEffect, useState, useRef } from 'react';
import { Bell, X, Check, ExternalLink, AlertCircle, Info, Award, Coins } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { Notification } from '../../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
      setupRealtimeSubscription();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  async function loadNotifications() {
    if (!user) return;

    try {
      setLoading(true);

      const { data: userData } = await supabase
        .from('users')
        .select('user_id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!userData?.user_id) return;

      currentUserIdRef.current = userData.user_id;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userData.user_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const typedNotifications = (data || []).map(n => ({
        ...n,
        created_at: new Date(n.created_at),
        read_at: n.read_at ? new Date(n.read_at) : undefined,
        expires_at: n.expires_at ? new Date(n.expires_at) : undefined,
      }));

      setNotifications(typedNotifications);
      setUnreadCount(typedNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  function setupRealtimeSubscription() {
    if (!user || !currentUserIdRef.current) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`notifications-${currentUserIdRef.current}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserIdRef.current}`,
        },
        async () => {
          await loadNotifications();
        }
      )
      .subscribe();

    channelRef.current = channel;
  }

  async function markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('notification_id', notificationId);

      if (error) throw error;

      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async function markAllAsRead() {
    if (!currentUserIdRef.current) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', currentUserIdRef.current)
        .eq('is_read', false);

      if (error) throw error;

      await loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  async function dismissNotification(notificationId: string) {
    await markAsRead(notificationId);
  }

  function getNotificationIcon(type: string, priority: string) {
    if (priority === 'urgent') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }

    switch (type) {
      case 'achievement':
        return <Award className="w-5 h-5 text-green-600" />;
      case 'reward':
        return <Coins className="w-5 h-5 text-yellow-600" />;
      case 'verification':
        return <Check className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-slate-600" />;
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50';
      default:
        return 'border-l-4 border-slate-300';
    }
  }

  function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const hasUnread = unreadCount > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-[600px] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <p className="text-xs text-slate-500">
                  {unreadCount} unread
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className={`p-4 hover:bg-slate-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    } ${getPriorityColor(notification.priority)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className={`text-sm font-medium ${
                            !notification.is_read ? 'text-slate-900' : 'text-slate-700'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1.5 flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-sm text-slate-600 mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {formatTimeAgo(notification.created_at)}
                          </span>

                          <div className="flex items-center space-x-2">
                            {notification.action_url && (
                              <a
                                href={notification.action_url}
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                                onClick={() => {
                                  if (!notification.is_read) {
                                    markAsRead(notification.notification_id);
                                  }
                                  setIsOpen(false);
                                }}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View
                              </a>
                            )}

                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.notification_id)}
                                className="text-xs text-slate-600 hover:text-slate-900"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => dismissNotification(notification.notification_id)}
                              className="text-xs text-slate-400 hover:text-slate-600"
                              title="Dismiss"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

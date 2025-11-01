"use client";

import {
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  Gift,
  Package,
  RefreshCw,
  Settings,
  ShoppingBag,
  Trash2,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/hooks";
import type { TranslationKey } from "@/lib/i18n/translations";

interface Notification {
  id: number;
  type: "purchase" | "ticket" | "review" | "system";
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  userId: string;
}

interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "order_placed":
    case "purchase":
      return ShoppingBag;
    case "order_updated":
      return Package;
    case "product_sold":
      return Gift;
    case "settings":
      return Settings;
    case "urgent":
      return Zap;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "purchase":
      return "text-green-400";
    case "ticket":
      return "text-blue-400";
    case "review":
      return "text-yellow-400";
    case "system":
      return "text-purple-400";
    default:
      return "text-gray-400";
  }
};

const getNotificationBgColor = (type: string) => {
  switch (type) {
    case "order_placed":
    case "purchase":
      return "bg-green-500/10";
    case "order_updated":
      return "bg-blue-500/10";
    case "product_sold":
      return "bg-emerald-500/10";
    case "ticket":
      return "bg-cyan-500/10";
    case "review":
      return "bg-yellow-500/10";
    case "system":
    case "general":
      return "bg-purple-500/10";
    case "payment":
      return "bg-indigo-500/10";
    case "message":
      return "bg-rose-500/10";
    case "promotion":
      return "bg-pink-500/10";
    case "settings":
      return "bg-slate-500/10";
    case "urgent":
      return "bg-red-500/10";
    default:
      return "bg-gray-500/10";
  }
};

const getRelativeTime = (dateString: string, t: (key: TranslationKey) => string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months} ${months > 1 ? t('monthsAgo') : t('monthAgo')}`;
  if (weeks > 0) return `${weeks} ${weeks > 1 ? t('weeksAgo') : t('weekAgo')}`;
  if (days > 0) return `${days} ${days > 1 ? t('daysAgo') : t('dayAgo')}`;
  if (hours > 0) return `${hours} ${hours > 1 ? t('hoursAgo') : t('hourAgo')}`;
  if (minutes > 0) return `${minutes} ${minutes > 1 ? t('minutesAgo') : t('minuteAgo')}`;
  if (seconds > 30) return `${seconds} ${t('secondsAgo')}`;
  return t('justNow');
};

const getNotificationTypeText = (type: string, t: (key: TranslationKey) => string) => {
  const typeMap: { [key: string]: string } = {
    purchase: t('purchase'),
    ticket: t('ticket'),
    review: t('review'),
    system: t('system'),
    order: t('order'),
    payment: t('payment'),
    message: t('message'),
    promotion: t('promotion'),
    settings: t('settings'),
    urgent: t('urgent'),
  };
  
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | string | null>(
    null
  );

  // Translation cache for notification content - removed since using proper translation system

  // Function to translate notification content - removed since using proper translation system

  // Function to translate notification content based on common patterns
  const translateNotificationContent = (title: string, message: string) => {
    // Translate common notification titles
    if (title.includes('New Order Received')) {
      return {
        translatedTitle: t('newOrderReceived'),
        translatedMessage: message.replace('You have received a new order', t('orderReceivedMessage'))
          .replace('for your products', t('forYourProducts'))
          .replace('Total value', t('totalValue'))
      };
    }
    
    if (title.includes('New Review Received')) {
      return {
        translatedTitle: t('newReviewReceived'),
        translatedMessage: message.replace('A customer left a review for your product', t('customerLeftReview'))
      };
    }
    
    if (title.includes('New Message Received')) {
      return {
        translatedTitle: t('newMessageReceived'),
        translatedMessage: message.replace('A customer sent you a message', t('customerSentMessage'))
      };
    }
    
    if (title.includes('Payment Received')) {
      return {
        translatedTitle: t('paymentReceived'),
        translatedMessage: message.replace('Payment has been processed for order', t('paymentProcessed'))
      };
    }
    
    if (title.includes('Product Viewed')) {
      return {
        translatedTitle: t('productViewed'),
        translatedMessage: message.replace('Someone viewed your product', t('someoneViewedProduct'))
      };
    }
    
    if (title.includes('System Notification')) {
      return {
        translatedTitle: t('systemNotification'),
        translatedMessage: message.replace('Important system update', t('importantUpdate'))
      };
    }
    
    // Return original if no translation pattern matches
    return {
      translatedTitle: title,
      translatedMessage: message
    };
  };

  // Fetch notifications function
  const fetchNotifications = async (silent = false) => {
    if (!silent) {
      setRefreshing(true);
    }

    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data: NotificationResponse = await response.json();
        if (data.success) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
          setTotalCount(data.totalCount);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    setActionLoading(notificationId);

    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "markAsRead",
          notificationId,
        }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    setActionLoading("all");

    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "markAllRead",
        }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    setActionLoading("clear");

    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "clearAll",
        }),
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter and sort notifications based on show unread only and timestamp
  const filteredNotifications = (
    showUnreadOnly ? notifications.filter((n) => !n.isRead) : notifications
  ).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-400">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>
            {t('loadingNotifications')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 rounded-lg p-3">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {t('notifications')}
                </h1>
                <p className="text-slate-400">
                  {totalCount} {t('total')} • {unreadCount}{" "}
                  {t('unread')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchNotifications()}
                disabled={refreshing}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <RefreshCw
                  className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>

              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showUnreadOnly
                    ? "bg-orange-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}>
                {showUnreadOnly ? (
                  <div className="flex items-center space-x-2">
                    <EyeOff className="h-4 w-4" />
                    <span>{t('showAll')}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>{t('unreadOnly')}</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || actionLoading === "all"}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
              {actionLoading === "all" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>
                {t('markAllRead')}
              </span>
            </button>

            <button
              onClick={clearAllNotifications}
              disabled={totalCount === 0 || actionLoading === "clear"}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
              {actionLoading === "clear" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span>{t('clearAll')}</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">
                {showUnreadOnly
                  ? t('noUnreadNotifications')
                  : t('noNotificationsFound')}
              </h3>
              <p className="text-slate-500">
                {showUnreadOnly
                  ? t('allCaughtUp')
                  : t('notificationsWillAppear')}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);
              const bgColor = getNotificationBgColor(notification.type);

              return (
                <div
                  key={notification.id}
                  className={`relative bg-slate-800 rounded-lg p-4 border transition-all duration-200 hover:bg-slate-750 cursor-pointer group ${
                    notification.isRead
                      ? "border-slate-700"
                      : "border-orange-500/30 bg-slate-800/80"
                  }`}
                  onClick={() =>
                    !notification.isRead && markAsRead(notification.id)
                  }>
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-lg ${bgColor}`}>
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`text-sm font-medium ${
                            notification.isRead
                              ? "text-slate-300"
                              : "text-white"
                          }`}>
                          {translateNotificationContent(notification.title, notification.message).translatedTitle}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-500">
                            {getRelativeTime(notification.createdAt, t)}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          )}
                        </div>
                      </div>

                      <p
                        className={`text-sm mt-1 ${
                          notification.isRead
                            ? "text-slate-400"
                            : "text-slate-300"
                        }`}>
                        {translateNotificationContent(notification.title, notification.message).translatedMessage}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500">
                          {getNotificationTypeText(notification.type, t)}
                        </span>

                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            disabled={actionLoading === notification.id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-orange-400 hover:text-orange-300 flex items-center space-x-1">
                            {actionLoading === notification.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                            <span>
                              {t('markAsRead')}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

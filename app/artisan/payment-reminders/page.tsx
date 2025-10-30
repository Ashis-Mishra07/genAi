'use client';

import {
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    Filter,
    IndianRupee,
    Mail, MessageSquare,
    Package,
    Plus,
    RefreshCw,
    Send,
    TrendingDown,
    TrendingUp,
    XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PaymentReminder {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderAmount: number;
  dueDate: string;
  daysPastDue: number;
  reminderType: 'gentle' | 'urgent' | 'final';
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  sendMethods: ('email' | 'sms')[];
  scheduledDate?: string;
  executedAt?: string;
  createdAt: string;
}

interface ReminderStats {
  scheduled: number;
  completed: number;
  sent: number;
  failed: number;
  cancelled: number;
  byType: {
    gentle: number;
    urgent: number;
    final: number;
  };
}

export default function PaymentRemindersPage() {
  const router = useRouter();
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'scheduled' | 'history' | 'send' | 'stats'>('scheduled');
  const [filter, setFilter] = useState<'all' | 'gentle' | 'urgent' | 'final'>('all');
  const [showSendModal, setShowSendModal] = useState(false);
  
  // Send reminder form state
  const [sendForm, setSendForm] = useState({
    customerEmail: '',
    customerName: '',
    customerPhone: '',
    orderId: '',
    orderAmount: '',
    dueDate: '',
    reminderType: 'gentle' as 'gentle' | 'urgent' | 'final',
    sendMethods: ['email'] as ('email' | 'sms')[],
    paymentUrl: '',
    scheduleDate: '',
    sendImmediately: true
  });
  
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchReminders();
    fetchStats();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/payment-reminders/service');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const allReminders = [...(data.scheduled || []), ...(data.recent || [])];
          setReminders(allReminders);
        }
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/payment-reminders/service?action=stats');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSendReminder = async () => {
    setSending(true);
    try {
      const requestData = {
        action: sendForm.sendImmediately ? 'send' : 'schedule',
        customerEmail: sendForm.customerEmail,
        customerName: sendForm.customerName,
        customerPhone: sendForm.customerPhone || undefined,
        orderId: sendForm.orderId,
        orderAmount: parseFloat(sendForm.orderAmount),
        dueDate: sendForm.dueDate,
        reminderType: sendForm.reminderType,
        sendMethods: sendForm.sendMethods,
        paymentUrl: sendForm.paymentUrl || undefined,
        scheduleDate: sendForm.sendImmediately ? undefined : sendForm.scheduleDate
      };

      const response = await fetch('/api/payment-reminders/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Payment reminder ${sendForm.sendImmediately ? 'sent' : 'scheduled'} successfully!`);
        setSendForm({
          customerEmail: '',
          customerName: '',
          customerPhone: '',
          orderId: '',
          orderAmount: '',
          dueDate: '',
          reminderType: 'gentle',
          sendMethods: ['email'],
          paymentUrl: '',
          scheduleDate: '',
          sendImmediately: true
        });
        setShowSendModal(false);
        fetchReminders();
        fetchStats();
      } else {
        alert(`Failed to ${sendForm.sendImmediately ? 'send' : 'schedule'} reminder: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const cancelReminder = async (reminderId: string) => {
    try {
      const response = await fetch('/api/payment-reminders/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          reminderId
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Reminder cancelled successfully!');
        fetchReminders();
        fetchStats();
      } else {
        alert(`Failed to cancel reminder: ${result.error}`);
      }
    } catch (error) {
      console.error('Error cancelling reminder:', error);
      alert('Failed to cancel reminder. Please try again.');
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'all') return true;
    return reminder.reminderType === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-blue-400 bg-blue-400/20';
      case 'sent': return 'text-green-400 bg-green-400/20';
      case 'failed': return 'text-red-400 bg-red-400/20';
      case 'cancelled': return 'text-slate-400 bg-slate-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  const getReminderTypeColor = (type: string) => {
    switch (type) {
      case 'gentle': return 'text-green-400 bg-green-400/20';
      case 'urgent': return 'text-yellow-400 bg-yellow-400/20';
      case 'final': return 'text-red-400 bg-red-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <IndianRupee className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Payment Reminders
              </h1>
              <p className="text-muted-foreground mt-1">Manage automated payment reminder system</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {fetchReminders(); fetchStats();}}
              className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowSendModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-sm hover:shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Send Reminder
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Reminders</p>
                  <p className="text-2xl font-bold text-foreground">{stats.scheduled + stats.completed}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Successfully Sent</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.sent}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400 mr-1" />
                    <span className="text-green-400 text-xs">Active</span>
                  </div>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.scheduled}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 text-blue-400 mr-1" />
                    <span className="text-blue-400 text-xs">Pending</span>
                  </div>
                </div>
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Failed/Cancelled</p>
                  <p className="text-2xl font-bold text-red-400">{stats.failed + stats.cancelled}</p>
                  <div className="flex items-center mt-1">
                    <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
                    <span className="text-red-400 text-xs">Issues</span>
                  </div>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg mb-6 max-w-md">
          {[
            { key: 'scheduled', label: 'Scheduled', icon: Calendar },
            { key: 'history', label: 'History', icon: Clock },
            { key: 'stats', label: 'Analytics', icon: BarChart3 }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Filter and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="all">All Types</option>
                <option value="gentle">Gentle Reminders</option>
                <option value="urgent">Urgent Reminders</option>
                <option value="final">Final Notices</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="bg-slate-800 rounded-lg border border-slate-700">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading payment reminders...</p>
            </div>
          ) : (
            <>
              {(activeTab === 'scheduled' || activeTab === 'history') && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">
                      {activeTab === 'scheduled' ? 'Scheduled Reminders' : 'Reminder History'}
                    </h3>
                    <span className="text-slate-400 text-sm">
                      {filteredReminders.filter(r => activeTab === 'scheduled' ? r.status === 'pending' : r.status !== 'pending').length} reminders
                    </span>
                  </div>

                  {filteredReminders.length === 0 ? (
                    <div className="text-center py-8">
                      <IndianRupee className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No payment reminders</h3>
                      <p className="text-slate-400 mb-4">Get started by sending your first payment reminder</p>
                      <button
                        onClick={() => setShowSendModal(true)}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                      >
                        Send Reminder
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredReminders
                        .filter(r => activeTab === 'scheduled' ? r.status === 'pending' : r.status !== 'pending')
                        .map((reminder) => (
                        <div key={reminder.id} className="border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-white">Order #{reminder.orderId}</h4>
                                <p className="text-slate-400 text-sm">{reminder.customerName} • {reminder.customerEmail}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white">{formatCurrency(reminder.orderAmount)}</p>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getReminderTypeColor(reminder.reminderType)}`}>
                                  {reminder.reminderType.toUpperCase()}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(reminder.status)}`}>
                                  {reminder.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400">Due Date</p>
                              <p className="text-white">{formatDate(reminder.dueDate)}</p>
                              {reminder.daysPastDue > 0 && (
                                <p className="text-red-400">{reminder.daysPastDue} days overdue</p>
                              )}
                            </div>
                            <div>
                              <p className="text-slate-400">Send Methods</p>
                              <div className="flex items-center space-x-2">
                                {reminder.sendMethods.includes('email') && <Mail className="h-4 w-4 text-blue-400" />}
                                {reminder.sendMethods.includes('sms') && <MessageSquare className="h-4 w-4 text-green-400" />}
                              </div>
                            </div>
                            <div>
                              <p className="text-slate-400">
                                {reminder.status === 'pending' ? 'Scheduled For' : 'Executed At'}
                              </p>
                              <p className="text-white">
                                {reminder.status === 'pending' 
                                  ? (reminder.scheduledDate ? formatDate(reminder.scheduledDate) : 'Immediate')
                                  : (reminder.executedAt ? formatDate(reminder.executedAt) : 'N/A')
                                }
                              </p>
                            </div>
                          </div>

                          {reminder.status === 'pending' && (
                            <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-slate-700">
                              <button
                                onClick={() => cancelReminder(reminder.id)}
                                className="text-red-400 hover:text-red-300 text-sm font-medium"
                              >
                                Cancel
                              </button>
                              <button className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'stats' && stats && (
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-6">Analytics Overview</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-700 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-4">Reminder Types Distribution</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                            <span className="text-slate-300">Gentle</span>
                          </div>
                          <span className="text-white font-medium">{stats.byType.gentle}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                            <span className="text-slate-300">Urgent</span>
                          </div>
                          <span className="text-white font-medium">{stats.byType.urgent}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                            <span className="text-slate-300">Final</span>
                          </div>
                          <span className="text-white font-medium">{stats.byType.final}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-700 rounded-lg p-6">
                      <h4 className="font-medium text-white mb-4">Success Rate</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Success Rate</span>
                          <span className="text-green-400 font-medium">
                            {stats.completed > 0 ? Math.round((stats.sent / stats.completed) * 100) : 0}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Total Sent</span>
                          <span className="text-white font-medium">{stats.sent}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Failed</span>
                          <span className="text-red-400 font-medium">{stats.failed}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Send Reminder Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Send Payment Reminder</h2>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={sendForm.customerName}
                    onChange={(e) => setSendForm({ ...sendForm, customerName: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    placeholder="Customer full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                  <input
                    type="email"
                    value={sendForm.customerEmail}
                    onChange={(e) => setSendForm({ ...sendForm, customerEmail: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    placeholder="customer@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={sendForm.customerPhone}
                    onChange={(e) => setSendForm({ ...sendForm, customerPhone: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Order ID</label>
                  <input
                    type="text"
                    value={sendForm.orderId}
                    onChange={(e) => setSendForm({ ...sendForm, orderId: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    placeholder="ORD123456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Order Amount</label>
                  <input
                    type="number"
                    value={sendForm.orderAmount}
                    onChange={(e) => setSendForm({ ...sendForm, orderAmount: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    placeholder="2500.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Due Date</label>
                  <input
                    type="date"
                    value={sendForm.dueDate}
                    onChange={(e) => setSendForm({ ...sendForm, dueDate: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Reminder Type</label>
                  <select
                    value={sendForm.reminderType}
                    onChange={(e) => setSendForm({ ...sendForm, reminderType: e.target.value as any })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="gentle">Gentle Reminder</option>
                    <option value="urgent">Urgent Notice</option>
                    <option value="final">Final Warning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Send Methods</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sendForm.sendMethods.includes('email')}
                        onChange={(e) => {
                          const methods = sendForm.sendMethods.filter(m => m !== 'email');
                          if (e.target.checked) methods.push('email');
                          setSendForm({ ...sendForm, sendMethods: methods as ('email' | 'sms')[] });
                        }}
                        className="mr-2 text-orange-500"
                      />
                      <Mail className="h-4 w-4 mr-1 text-blue-400" />
                      <span className="text-white">Email</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sendForm.sendMethods.includes('sms')}
                        onChange={(e) => {
                          const methods = sendForm.sendMethods.filter(m => m !== 'sms');
                          if (e.target.checked) methods.push('sms');
                          setSendForm({ ...sendForm, sendMethods: methods as ('email' | 'sms')[] });
                        }}
                        className="mr-2 text-orange-500"
                      />
                      <MessageSquare className="h-4 w-4 mr-1 text-green-400" />
                      <span className="text-white">SMS</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Payment URL (Optional)</label>
                <input
                  type="url"
                  value={sendForm.paymentUrl}
                  onChange={(e) => setSendForm({ ...sendForm, paymentUrl: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  placeholder="https://payments.artisans.ai/pay/123456"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={sendForm.sendImmediately}
                    onChange={(e) => setSendForm({ ...sendForm, sendImmediately: e.target.checked })}
                    className="mr-2 text-orange-500"
                  />
                  <span className="text-white">Send Immediately</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!sendForm.sendImmediately}
                    onChange={(e) => setSendForm({ ...sendForm, sendImmediately: !e.target.checked })}
                    className="mr-2 text-orange-500"
                  />
                  <span className="text-white">Schedule for Later</span>
                </label>
              </div>

              {!sendForm.sendImmediately && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    value={sendForm.scheduleDate}
                    onChange={(e) => setSendForm({ ...sendForm, scheduleDate: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-700">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReminder}
                  disabled={sending || !sendForm.customerEmail || !sendForm.customerName || !sendForm.orderId || !sendForm.orderAmount || !sendForm.dueDate || sendForm.sendMethods.length === 0}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  {sending ? (
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {sendForm.sendImmediately ? 'Send Now' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
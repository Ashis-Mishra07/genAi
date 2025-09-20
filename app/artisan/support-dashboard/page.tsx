'use client';

import {
    BarChart3,
    Clock,
    FileText,
    Mail, MessageSquare,
    Phone,
    RefreshCw,
    Settings,
    Star,
    TrendingUp,
    User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

interface RefundRequest {
  id: string;
  orderId: string;
  reason: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

interface SupportStats {
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  refunds: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    processed: number;
  };
  avgResponseTime: string;
  customerSatisfaction: number;
}

export default function SupportDashboardPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tickets' | 'refunds' | 'stats'>('tickets');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved' | 'closed'>('all');
  const [refundFilter, setRefundFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'processed'>('all');
  
  // Update ticket/refund form states
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateType, setUpdateType] = useState<'ticket' | 'refund'>('ticket');

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    try {
      setLoading(true);
      
      // Load support tickets
      const ticketsResponse = await fetch('/api/support/ticket');
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        if (ticketsData.success) {
          setTickets(ticketsData.tickets || []);
        }
      }

      // Load refund requests
      const refundsResponse = await fetch('/api/support/refund');
      if (refundsResponse.ok) {
        const refundsData = await refundsResponse.json();
        if (refundsData.success) {
          setRefunds(refundsData.requests || []);
        }
      }

      // Calculate stats
      calculateStats();
    } catch (error) {
      console.error('Failed to load support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    // Mock stats for now - in real app, this would be calculated from actual data
    setStats({
      tickets: {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in-progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        closed: tickets.filter(t => t.status === 'closed').length,
      },
      refunds: {
        total: refunds.length,
        pending: refunds.filter(r => r.status === 'pending').length,
        approved: refunds.filter(r => r.status === 'approved').length,
        rejected: refunds.filter(r => r.status === 'rejected').length,
        processed: refunds.filter(r => r.status === 'processed').length,
      },
      avgResponseTime: '2.4 hours',
      customerSatisfaction: 4.8
    });
  };

  const handleUpdateTicket = async (ticketId: string, newStatus: string, adminNotes?: string) => {
    try {
      const response = await fetch('/api/support/ticket', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status: newStatus, adminNotes })
      });

      if (response.ok) {
        alert('Ticket updated successfully!');
        loadSupportData();
        setShowUpdateModal(false);
        setSelectedTicket(null);
      } else {
        throw new Error('Failed to update ticket');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket');
    }
  };

  const handleUpdateRefund = async (refundId: string, newStatus: string, adminNotes?: string) => {
    try {
      const response = await fetch('/api/support/refund', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refundId, status: newStatus, adminNotes })
      });

      if (response.ok) {
        alert('Refund request updated successfully!');
        loadSupportData();
        setShowUpdateModal(false);
        setSelectedRefund(null);
      } else {
        throw new Error('Failed to update refund request');
      }
    } catch (error) {
      console.error('Error updating refund request:', error);
      alert('Failed to update refund request');
    }
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/20';
      case 'closed': return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
    }
  };

  const getRefundStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/20';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/20';
      case 'processed': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (ticketFilter === 'all') return true;
    return ticket.status === ticketFilter;
  });

  const filteredRefunds = refunds.filter(refund => {
    if (refundFilter === 'all') return true;
    return refund.status === refundFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Loading support dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <MessageSquare className="h-8 w-8 text-orange-500 mr-3" />
              Support Dashboard
            </h1>
            <p className="text-slate-400">Manage customer support tickets and refund requests</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => loadSupportData()}
              className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Tickets</p>
                  <p className="text-2xl font-bold text-white">{stats.tickets.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-slate-400 text-xs mt-2">{stats.tickets.open} open, {stats.tickets.inProgress} in progress</p>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Refund Requests</p>
                  <p className="text-2xl font-bold text-white">{stats.refunds.total}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-slate-400 text-xs mt-2">{stats.refunds.pending} pending review</p>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Response</p>
                  <p className="text-2xl font-bold text-white">{stats.avgResponseTime}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-slate-400 text-xs mt-2">Target: &lt; 4 hours</p>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Satisfaction</p>
                  <p className="text-2xl font-bold text-white flex items-center">
                    {stats.customerSatisfaction}
                    <Star className="h-5 w-5 text-yellow-400 ml-1" />
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-slate-400 text-xs mt-2">Based on 124 responses</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg mb-8 max-w-md">
          {[
            { key: 'tickets', label: 'Support Tickets', icon: FileText },
            { key: 'refunds', label: 'Refund Requests', icon: RefreshCw },
            { key: 'stats', label: 'Analytics', icon: BarChart3 }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
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

        {/* Support Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Support Tickets</h3>
                <div className="flex items-center space-x-3">
                  <select
                    value={ticketFilter}
                    onChange={(e) => setTicketFilter(e.target.value as any)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No support tickets</h3>
                  <p className="text-slate-400">No tickets match the current filter</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-sm font-mono text-slate-400">#{ticket.id}</span>
                            <h4 className="font-medium text-white">{ticket.subject}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getTicketStatusColor(ticket.status)}`}>
                              {ticket.status.replace('-', ' ').toUpperCase()}
                            </span>
                            <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority.toUpperCase()}
                            </span>
                          </div>
                          
                          <p className="text-slate-300 text-sm mb-3 line-clamp-2">{ticket.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span>Category: {ticket.category}</span>
                            {ticket.customerEmail && (
                              <span className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {ticket.customerEmail}
                              </span>
                            )}
                            {ticket.customerPhone && (
                              <span className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {ticket.customerPhone}
                              </span>
                            )}
                            <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setUpdateType('ticket');
                              setShowUpdateModal(true);
                            }}
                            className="bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600 transition-colors flex items-center"
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Refund Requests Tab */}
        {activeTab === 'refunds' && (
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Refund Requests</h3>
                <div className="flex items-center space-x-3">
                  <select
                    value={refundFilter}
                    onChange={(e) => setRefundFilter(e.target.value as any)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="processed">Processed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6">
              {filteredRefunds.length === 0 ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No refund requests</h3>
                  <p className="text-slate-400">No requests match the current filter</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRefunds.map((refund) => (
                    <div key={refund.id} className="border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-sm font-mono text-slate-400">#{refund.id}</span>
                            <span className="font-medium text-white">Order: {refund.orderId}</span>
                            <span className="text-orange-400 font-medium">₹{refund.amount.toLocaleString()}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getRefundStatusColor(refund.status)}`}>
                              {refund.status.toUpperCase()}
                            </span>
                            <span className={`text-xs font-medium ${getPriorityColor(refund.priority)}`}>
                              {refund.priority.toUpperCase()}
                            </span>
                          </div>
                          
                          <p className="text-slate-300 text-sm mb-2">
                            <span className="font-medium">Reason:</span> {refund.reason.replace('_', ' ').toLowerCase()}
                          </p>
                          
                          <p className="text-slate-300 text-sm mb-3 line-clamp-2">{refund.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {refund.customerName}
                            </span>
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {refund.customerEmail}
                            </span>
                            {refund.customerPhone && (
                              <span className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {refund.customerPhone}
                              </span>
                            )}
                            <span>Created: {new Date(refund.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedRefund(refund);
                              setUpdateType('refund');
                              setShowUpdateModal(true);
                            }}
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors flex items-center"
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Ticket Breakdown</h3>
              <div className="space-y-4">
                {stats && Object.entries(stats.tickets).filter(([key]) => key !== 'total').map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-slate-300 capitalize">{status.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Refund Breakdown</h3>
              <div className="space-y-4">
                {stats && Object.entries(stats.refunds).filter(([key]) => key !== 'total').map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-slate-300 capitalize">{status}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">
                Update {updateType === 'ticket' ? 'Ticket' : 'Refund Request'}
              </h3>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">Status</label>
                <select
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  defaultValue={updateType === 'ticket' ? selectedTicket?.status : selectedRefund?.status}
                  id="update-status"
                >
                  {updateType === 'ticket' ? (
                    <>
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </>
                  ) : (
                    <>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="processed">Processed</option>
                    </>
                  )}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Admin Notes</label>
                <textarea
                  id="update-notes"
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  placeholder="Add notes for the customer..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedTicket(null);
                    setSelectedRefund(null);
                  }}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const status = (document.getElementById('update-status') as HTMLSelectElement).value;
                    const notes = (document.getElementById('update-notes') as HTMLTextAreaElement).value;
                    
                    if (updateType === 'ticket' && selectedTicket) {
                      handleUpdateTicket(selectedTicket.id, status, notes);
                    } else if (updateType === 'refund' && selectedRefund) {
                      handleUpdateRefund(selectedRefund.id, status, notes);
                    }
                  }}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
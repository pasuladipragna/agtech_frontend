import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { LifeBuoy, MessageSquare, CheckCircle2, Clock, AlertCircle, Send, Loader2, Filter } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: string;
  description: string;
  created_at: string;
  message_count: number;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support/tickets');
      setTickets(res.data || []);
      if (res.data && res.data.length > 0 && !selectedTicket) {
        setSelectedTicket(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setSendingReply(true);
    try {
      await api.post(`/support/tickets/${selectedTicket.id}/messages`, {
        message: replyText.trim(),
      });
      setReplyText('');
      await fetchTickets();
      alert('Reply sent to farmer.');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicket) return;
    setUpdatingStatus(true);
    try {
      await api.patch(`/admin/support/tickets/${selectedTicket.id}/status`, {
        status: newStatus,
      });
      setSelectedTicket(prev => prev ? { ...prev, status: newStatus as any } : null);
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: newStatus as any } : t));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update ticket status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Open</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">In Progress</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Resolved</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Closed</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div>
      <Head>
        <title>Farmer Support Desk - Admin - Smart AgriTech</title>
        <meta name="description" content="Manage and respond to farmer helpdesk inquiries and rover hardware issues." />
      </Head>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LifeBuoy className="h-7 w-7 text-agri-green" />
          Farmer Support Helpdesk
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Handle technical support requests, hardware diagnostics, and farmer inquiries.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s
                ? 'bg-agri-green text-white border-agri-green'
                : 'bg-white text-gray-600 border-gray-200 hover:border-agri-green'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading support tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-agri-beige">
          <CheckCircle2 className="h-12 w-12 mx-auto text-agri-green mb-3 opacity-80" />
          <h3 className="text-lg font-semibold text-gray-800">Support Queue is Clear</h3>
          <p className="text-sm text-gray-500 mt-1">No incoming support tickets from farmers at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-agri-beige p-4 shadow-sm space-y-2 max-h-[650px] overflow-y-auto">
            {filteredTickets.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  selectedTicket?.id === t.id
                    ? 'border-agri-green bg-green-50/50 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{t.subject}</h4>
                  {getStatusBadge(t.status)}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Category: {t.category}</span>
                  <span>{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Ticket Detail & Reply */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-agri-beige p-6 shadow-sm flex flex-col justify-between">
            {selectedTicket ? (
              <div>
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                  <div>
                    <span className="text-xs text-agri-green font-semibold uppercase tracking-wider">
                      {selectedTicket.category} • Priority: {selectedTicket.priority}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-1">{selectedTicket.subject}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Submitted on {new Date(selectedTicket.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Status:</span>
                    <select
                      value={selectedTicket.status}
                      disabled={updatingStatus}
                      onChange={e => handleUpdateStatus(e.target.value)}
                      className="text-xs border rounded-md px-2 py-1 bg-white font-medium"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>

                {/* Farmer description */}
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed mb-6 border border-gray-100">
                  <p className="font-medium text-xs text-gray-400 uppercase tracking-wider mb-1">Farmer Issue Description:</p>
                  {selectedTicket.description}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="mt-8 border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Send Admin Response</label>
                  <textarea
                    rows={4}
                    required
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type technical advice, troubleshooting steps, or resolution update..."
                    className="input-field mb-3"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    {sendingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Reply to Farmer
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">Select a ticket to view details</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

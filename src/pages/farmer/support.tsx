import React, { useState } from 'react';
import Head from 'next/head';
import { api } from '../../services/api';
import { TERMS } from '../../constants/terminology';
import { LifeBuoy, Send, MessageSquare, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface TicketForm {
  subject: string;
  category: string;
  message: string;
}

const CATEGORIES = ['Rover Hardware', 'App Issue', 'Field Setup', 'Spraying System', 'Account', 'Other'];

const FAQ_ITEMS = [
  {
    q: `How do I assign a ${TERMS.rover} to my ${TERMS.farm}?`,
    a: `A ${TERMS.rover} is assigned by the Administrator. Please contact support and we will link your hardware unit to your account within 24–48 hours.`
  },
  {
    q: `What do I do when the ${TERMS.rover} goes offline?`,
    a: `First check the battery level from the ${TERMS.rover} Control page. Ensure the rover is within Wi-Fi range. If the issue persists, power cycle the unit and press the reset button for 5 seconds.`
  },
  {
    q: `How do I run ${TERMS.spraying.toLowerCase()} on a specific ${TERMS.field.toLowerCase()}?`,
    a: `Go to ${TERMS.spraying} Operations, click 'Start New Session', select the ${TERMS.field.toLowerCase()} and product, then confirm. The rover will navigate autonomously.`
  },
  {
    q: `What AI models power ${TERMS.cropHealth} detection?`,
    a: `Our system uses vision-based AI trained on thousands of ${TERMS.crop.toLowerCase()} images. It detects pests, fungal infection, nutrient deficiency, and physical damage with confidence scoring.`
  },
  {
    q: 'How do I register another farmer?',
    a: `Each ${TERMS.farmer} must submit a Registration Request via the public registration page. The Administrator will review and approve it.`
  },
  {
    q: 'Can I export my farm data?',
    a: `Yes. Visit the ${TERMS.reports} page and generate a report for any date range. Completed reports are available for PDF download.`
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticketForm, setTicketForm] = useState<TicketForm>({ subject: '', category: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/farmer/support/tickets', ticketForm);
      setSubmitted(true);
      setTicketForm({ subject: '', category: '', message: '' });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Head>
        <title>{TERMS.support} - Smart AgriTech</title>
        <meta name="description" content="Get help with your Smart AgriTech Rover — FAQs, troubleshooting, and support ticket submission." />
      </Head>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LifeBuoy className="h-6 w-6 sm:h-7 sm:w-7 text-agri-green flex-shrink-0" />
          {TERMS.support} Center
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Find answers or contact our team for help with your Smart AgriTech system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FAQ */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-agri-green" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-agri-beige shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                  {openFaq === index
                    ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  }
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-4 border-t border-gray-50">
                    <p className="text-sm text-gray-600 leading-relaxed mt-3">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="mt-6 bg-agri-green/5 border border-agri-green/20 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Resources</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Rover Hardware Setup Guide', href: '/docs/rover-setup' },
                { label: 'Crop Detection User Manual', href: '/docs/crop-health' },
                { label: 'Field Management Tutorial', href: '/docs/fields' },
                { label: 'Safety Guidelines for Spraying', href: '/docs/safety' },
              ].map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-agri-green hover:underline flex items-center gap-1"
                  >
                    → {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Support Ticket Form */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-agri-green" />
            Contact {TERMS.support}
          </h2>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-lg font-bold text-green-900 mb-2">Ticket Submitted</h3>
              <p className="text-sm text-green-700">
                Our team will respond within 24 hours. You can track your ticket status through email.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-5 btn-outline"
              >
                Submit Another Ticket
              </button>
            </div>
          ) : (
            <form onSubmit={submitTicket} className="bg-white rounded-xl border border-agri-beige shadow-sm p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={ticketForm.category}
                  onChange={e => setTicketForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full input"
                  required
                >
                  <option value="">Select a category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={e => setTicketForm(p => ({ ...p, subject: e.target.value }))}
                  className="w-full input"
                  placeholder="Brief summary of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={ticketForm.message}
                  onChange={e => setTicketForm(p => ({ ...p, message: e.target.value }))}
                  rows={6}
                  className="w-full input"
                  placeholder="Please describe the issue in detail. Include any error messages, steps to reproduce, and what you expected to happen..."
                  required
                  minLength={30}
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <strong>⚠️ Safety Emergency?</strong> If your rover is acting unsafely, immediately press the physical Emergency Stop button on the unit, then contact support.
              </div>

              <button type="submit" className="w-full btn-primary" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Submitting Ticket...</>
                ) : (
                  <><Send className="h-4 w-4" />Submit Support Ticket</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

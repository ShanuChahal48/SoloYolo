"use client";
import { useState, FormEvent } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const emailOk = /.+@.+\..+/.test(email.trim());
  const allFilled = name.trim() && email.trim() && subject.trim() && message.trim();
  const formValid = Boolean(allFilled && emailOk);

  const resetForm = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValid || status === 'submitting') return;
    setStatus('submitting');
    const payload = { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || 'Failed to send');
      }
      setStatus('success');
      setFeedbackMessage('Thank you for your message! We will get back to you shortly.');
      resetForm();
    } catch (e: unknown) {
      setStatus('error');
      setFeedbackMessage(e instanceof Error ? e.message : 'Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="name" className="block text-gray-800 font-semibold mb-2">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-400"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-800 font-semibold mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400 text-gray-900 ${email && !emailOk ? 'border-rose-400 focus:ring-rose-400' : 'border-gray-300'}`}
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="subject" className="block text-gray-800 font-semibold mb-2">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-400"
            placeholder="Trip Inquiry"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="message" className="block text-gray-800 font-semibold mb-2">Message</label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder-gray-400 resize-y"
            placeholder="Tell us more about what you need..."
          ></textarea>
        </div>
        <div className="text-center">
          <button
            type="submit"
            disabled={status === 'submitting' || !formValid}
            className={`font-bold py-3 px-8 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50 shadow ${status === 'submitting' || !formValid ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
          >
            {status === 'submitting' ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>
      {status === 'success' && (
        <p className="mt-4 text-center text-green-600 bg-green-100 p-3 rounded-lg">{feedbackMessage}</p>
      )}
      {status === 'error' && (
        <p className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{feedbackMessage}</p>
      )}
      {status !== 'success' && !formValid && (
        <p className="mt-4 text-center text-xs text-gray-500">All fields required. Provide a valid email to enable Send Message.</p>
      )}
    </div>
  );
}
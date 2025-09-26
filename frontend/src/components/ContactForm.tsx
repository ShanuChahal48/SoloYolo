import { useState, FormEvent } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    
    // In a real application (Phase 2/3), you would send this data to an API endpoint.
    // For now, we'll simulate an API call.
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate a successful submission
    setStatus('success');
    setFeedbackMessage('Thank you for your message! We will get back to you shortly.');
    
    // To simulate an error, uncomment the following lines:
    // setStatus('error');
    // setFeedbackMessage('Something went wrong. Please try again later.');

    const form = event.target as HTMLFormElement;
    form.reset();
  };

  return (
    <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Full Name</label>
            <input type="text" id="name" name="name" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Email Address</label>
            <input type="email" id="email" name="email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="subject" className="block text-gray-700 font-semibold mb-2">Subject</label>
          <input type="text" id="subject" name="subject" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div className="mb-6">
          <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">Message</label>
          <textarea id="message" name="message" rows={5} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"></textarea>
        </div>
        <div className="text-center">
          <button 
            type="submit" 
            disabled={status === 'submitting'}
            className="bg-teal-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-teal-700 transition-colors duration-300 disabled:bg-gray-400"
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
    </div>
  );
}
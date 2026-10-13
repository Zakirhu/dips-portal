import React, { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  Clock 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CLASSES_LIST } from '../../data/curriculumData';
import { ClassLevel } from '../../types';
import { SEO } from '../SEO';

export const ContactView: React.FC = () => {
  const { studentProfile, submitDoubt } = useApp();

  const [studentName, setStudentName] = useState(studentProfile.name);
  const [studentClass, setStudentClass] = useState<ClassLevel>(studentProfile.classLevel);
  const [subject, setSubject] = useState('Information Technology (IT 402)');
  const [topic, setTopic] = useState('');
  const [query, setQuery] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !query.trim()) {
      alert('Please state the topic and your doubt query.');
      return;
    }

    submitDoubt({
      studentName: studentName || 'Student',
      studentClass,
      subject,
      topic,
      query
    });

    setIsSubmitted(true);
    setTopic('');
    setQuery('');
  };

  const faqs = [
    {
      q: 'Are all the study materials and quizzes on this portal free?',
      a: 'Yes, 100% free! Learn with Zakir is an educational initiative dedicated to providing accessible, high-quality CBSE CS and IT study materials to all school students.'
    },
    {
      q: 'Is the syllabus aligned with the latest CBSE 2025–2026 pattern?',
      a: 'Yes, all chapter notes, SQL functions, Python Pandas data structures, and practical guidelines are fully aligned with the latest CBSE curriculum prescribed for Code 402, Code 065, and Code 817.'
    },
    {
      q: 'Can I download the study notes as PDF?',
      a: 'Absolutely! Inside any study material reader, click the "Print / Save PDF" button to download a formatted, printer-friendly PDF file directly to your device.'
    },
    {
      q: 'Can school teachers use the Question Bank to create test papers?',
      a: 'Yes! Teachers can use the "Generate Printable Test Paper" tool in the Question Bank section to generate ready-to-print assessment papers with custom titles, instructions, and teacher answer keys.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEO
        title="Contact & Ask a Doubt"
        description="Have a question on Python code, SQL queries, or board exam preparation? Submit your doubt to Zakir Hussain."
      />
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Support & Guidance</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Contact Zakir Hussain & Clear Your Doubts
        </h1>
        <p className="text-sm text-slate-500">
          Have a question on Python code, SQL queries, or board exam preparation? Submit your query below for direct guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-lg font-bold">Instructor Direct Contact</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Feel free to reach out for curriculum questions, academic queries, or collaboration.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                  <a href="mailto:zakhu1099@gmail.com" className="font-semibold text-white hover:text-blue-300">
                    zakhu1099@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Doubt Response Hours</span>
                  <span className="font-semibold text-white">Monday – Saturday, within 24 hours</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600/30 text-purple-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                  <span className="font-semibold text-white">CBSE Computer Science & IT Hub</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-200 text-xs text-blue-900 space-y-2">
            <span className="font-bold flex items-center gap-1.5 text-blue-950">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Teacher Guidance Guarantee
            </span>
            <p className="leading-relaxed text-blue-800">
              Every query submitted through this form is reviewed directly by Zakir Hussain. Conceptual doubts and tricky SQL / Python errors receive step-by-step guidance.
            </p>
          </div>
        </div>

        {/* Ask a Doubt Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Submit an Academic Doubt / Query
              </h2>
            </div>

            {isSubmitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-950">
                  Doubt Successfully Submitted!
                </h3>
                <p className="text-xs text-emerald-800 max-w-sm mx-auto leading-relaxed">
                  Thank you, {studentName}. Your doubt has been delivered to Zakir Sir. You can check the reply in the teacher doubts inbox or via email at zakhu1099@gmail.com.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
                >
                  Submit Another Doubt
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Your Class
                    </label>
                    <select
                      value={studentClass}
                      onChange={e => setStudentClass(e.target.value as ClassLevel)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                    >
                      {CLASSES_LIST.map(c => (
                        <option key={c.level} value={c.level}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Subject
                    </label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="Information Technology (IT 402/802)">Information Technology (IT 402/802)</option>
                      <option value="Informatics Practices (IP 065)">Informatics Practices (IP 065)</option>
                      <option value="Typography & Computer Applications (817)">Typography & Computer Apps (817)</option>
                      <option value="Computer Applications (CA 165)">Computer Applications (CA 165)</option>
                      <option value="Middle School Coding (VI–VIII)">Middle School Coding (VI–VIII)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      Chapter / Topic of Doubt
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pandas loc vs iloc, SQL GROUP BY HAVING"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    Describe your doubt or question in detail
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type your question or copy-paste code you are stuck with..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Doubt to Zakir Hussain</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-6 pt-4 border-t border-slate-200">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Common Questions</span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((f, i) => (
            <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{f.q}</span>
              </h3>
              <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

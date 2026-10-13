import React from 'react';
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  Code, 
  CheckCircle, 
  Sparkles, 
  MessageSquare, 
  Heart, 
  Mail, 
  Laptop, 
  Database, 
  Keyboard,
  Globe,
  Terminal,
  Layers,
  ArrowRight,
  Cpu,
  Flame,
  CheckCircle2,
  FileText,
  HelpCircle,
  FolderGit2,
  Lightbulb
} from 'lucide-react';
import { Logo } from '../Logo';
import { SEO } from '../SEO';

interface AboutViewProps {
  setCurrentTab: (tab: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ setCurrentTab }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-200">
      <SEO
        title="About Zakir Hussain (PGT CS)"
        description="Learn more about Zakir Hussain, PGT Computer Science & IT Educator dedicated to high-school and middle-school computer education."
      />
      {/* 1. Hero Profile Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border border-slate-800">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 text-white flex flex-col items-center justify-center p-4 shadow-xl shrink-0 border-2 border-white/20 text-center relative group">
          <Logo className="w-20 h-20 mb-2 drop-shadow-md" />
          <span className="font-extrabold text-base tracking-wide">Mr. Zakir Hussain</span>
          <span className="text-[11px] text-blue-200 uppercase font-semibold">PGT CS & IT</span>
        </div>

        <div className="space-y-4 text-center md:text-left flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Computer Science Educator • Technology Enthusiast • Web Developer</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hello, I’m Zakir Hussain
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
            I am a Computer Science Educator, Technology Enthusiast, and Web Developer with a passion for teaching, technology, and creating meaningful digital solutions.
          </p>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            I have a background in Computer Applications and Computer Science, and I enjoy combining my teaching experience with my technical skills to create useful and practical learning resources for students.
          </p>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Currently, I work as a <strong className="text-white font-semibold">PGT Computer Science</strong>, where I teach and guide students in areas including Computer Science, Information Technology, programming, practical applications, and digital skills.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            <button
              onClick={() => setCurrentTab('materials')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Study Material</span>
            </button>
            <button
              onClick={() => setCurrentTab('contact')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask a Doubt / Connect</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. My Teaching Philosophy */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Pedagogical Core</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Teaching Philosophy
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            "I believe technology should make learning simpler, more interactive, and more accessible. My approach is not limited to explaining concepts from textbooks. I encourage students to understand the concept, apply it practically, practice through questions, and test their knowledge."
          </p>
        </div>

        {/* 5-Step Pipeline: Learn → Practice → Create → Test → Improve */}
        <div className="pt-4">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md">
            <span className="text-[11px] font-mono text-blue-300 uppercase tracking-widest block text-center mb-4">
              The Zakir Learning Cycle
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
              {/* Step 1: Learn */}
              <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex flex-col items-center justify-center space-y-1">
                <BookOpen className="w-6 h-6 text-blue-400 mb-1" />
                <span className="font-extrabold text-sm text-white">1. Learn</span>
                <span className="text-[10px] text-blue-200">Understand the core concept</span>
              </div>

              {/* Step 2: Practice */}
              <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex flex-col items-center justify-center space-y-1">
                <Terminal className="w-6 h-6 text-emerald-400 mb-1" />
                <span className="font-extrabold text-sm text-white">2. Practice</span>
                <span className="text-[10px] text-emerald-200">Apply practically in hands-on tasks</span>
              </div>

              {/* Step 3: Create */}
              <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex flex-col items-center justify-center space-y-1">
                <Code className="w-6 h-6 text-amber-400 mb-1" />
                <span className="font-extrabold text-sm text-white">3. Create</span>
                <span className="text-[10px] text-amber-200">Build real projects & programs</span>
              </div>

              {/* Step 4: Test */}
              <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex flex-col items-center justify-center space-y-1">
                <HelpCircle className="w-6 h-6 text-purple-400 mb-1" />
                <span className="font-extrabold text-sm text-white">4. Test</span>
                <span className="text-[10px] text-purple-200">Evaluate knowledge via MCQs & tests</span>
              </div>

              {/* Step 5: Improve */}
              <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex flex-col items-center justify-center space-y-1">
                <Sparkles className="w-6 h-6 text-pink-400 mb-1" />
                <span className="font-extrabold text-sm text-white">5. Improve</span>
                <span className="text-[10px] text-pink-200">Refine answers & achieve excellence</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. My Work & Projects */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
            <Layers className="w-3.5 h-3.5" />
            <span>Portfolio & Initiatives</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Work & Projects
          </h2>
          <p className="text-sm text-slate-500">
            Over the years, I have worked on various educational and technology-based projects designed to solve real-world problems and improve the learning experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Educational Learning Platform */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between hover:border-blue-300 transition-colors">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">
                💻 Educational Learning Platform
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                I am developing a centralized learning platform where students can access:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Class-wise study material</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Chapter-wise notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Information Technology resources</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Informatics Practices resources</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Typography material</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>MCQs and question banks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Online quizzes and tests</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Practical resources & Exam preparation</span>
                </li>
              </ul>
            </div>
            <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              The goal is to create a simple and organized digital learning environment where students can learn, practice, and evaluate their progress online.
            </p>
          </div>

          {/* Card 2: Educational Content & Resource Sharing */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between hover:border-emerald-300 transition-colors">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">
                🌐 Educational Content & Resource Sharing
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                I also work on web-based solutions for organizing and sharing educational resources. These projects focus on making teaching material easier to manage, discover, and access for both teachers and students.
              </p>
              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-2">
                <span className="text-[11px] font-bold text-emerald-900 block">Core Highlights:</span>
                <ul className="text-xs text-emerald-800 space-y-1">
                  <li>• Structured repository indexing</li>
                  <li>• Downloadable practical files & solutions</li>
                  <li>• Instant classroom doubt resolution portal</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('materials')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
            >
              View Curated Material
            </button>
          </div>

          {/* Card 3: Web Development Projects */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between hover:border-indigo-300 transition-colors">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">
                🧑‍💻 Web Development Projects
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                As a technology enthusiast, I enjoy developing websites and web applications using modern technologies. My technical interests include:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Full-stack web development',
                  'Frontend development',
                  'Backend development',
                  'Database management',
                  'Python programming',
                  'Educational technology',
                  'System and network solutions'
                ].map(tech => (
                  <span key={tech} className="px-2 py-1 bg-slate-100 text-slate-700 font-semibold text-[10px] rounded-lg border border-slate-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              I enjoy turning an idea into a functional digital product — from planning the interface and database to developing and testing the final application.
            </p>
          </div>
        </div>
      </div>

      {/* 4. My Vision */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white rounded-3xl p-8 sm:p-10 border border-blue-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-blue-700">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Future Outlook</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900">
          My Vision
        </h3>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          <p className="font-medium text-slate-900">
            "My vision is to use technology as a tool for better education."
          </p>
          <p>
            I want to continue building digital resources and educational platforms that help students learn independently, practice consistently, and develop stronger technical skills.
          </p>
          <p>
            This website is part of that journey — a place where I can share my knowledge, projects, teaching resources, and learning material with students.
          </p>
        </div>
      </div>

      {/* 5. Let's Learn and Build Together */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-4">
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
          Let's Learn and Build Together
        </h3>
        <p className="text-base sm:text-lg font-medium text-blue-200 italic max-w-xl mx-auto">
          "Learn something new. Build something useful. Keep improving."
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setCurrentTab('materials')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Start Learning Now
          </button>
          <button
            onClick={() => setCurrentTab('quiz')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Take an Assessment
          </button>
          <button
            onClick={() => setCurrentTab('contact')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Ask Zakir Sir a Question
          </button>
        </div>
      </div>
    </div>
  );
};

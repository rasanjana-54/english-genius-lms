import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  Bell, 
  User, 
  LogOut, 
  LayoutDashboard, 
  PlusCircle,
  ChevronRight,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { AuthProvider, useAuth } from './AuthContext';
import { Lesson, Paper, Announcement, Submission, UserProfile } from './types';

// --- Components ---

const Navbar = () => {
  const { profile, user, login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await login();
    } catch (error: any) {
      console.error("Login failed", error);
      alert("Login failed: " + error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
          <GraduationCap size={24} />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">
          English Genius <span className="text-indigo-600">LMS</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{profile?.displayName}</p>
              <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
            </div>
            <img 
              src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName}`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className={`bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <User size={18} />
              {isLoggingIn ? 'Logging in...' : 'Login with Google'}
            </button>
        )}
      </div>
    </nav>
  );
};

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const { isAdmin } = useAuth();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'papers', label: 'Exam Papers', icon: FileText },
    { id: 'announcements', label: 'Announcements', icon: Bell },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'submissions', label: 'Submissions', icon: CheckCircle2 });
  }

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-50 border-r border-slate-200 hidden md:block p-4">
      <div className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </div>
      
      <div className="absolute bottom-8 left-4 right-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">O/L English 2026</p>
        <p className="text-sm text-slate-700 font-medium">Targeting an 'A' grade together!</p>
      </div>
    </aside>
  );
};

// --- Views ---

const Dashboard = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { profile } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
    });
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Ayubowan, {profile?.displayName}! 👋</h1>
        <p className="text-slate-500 mt-1">Welcome back to your English Genius learning portal.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <BookOpen size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Lessons</h3>
          <p className="text-slate-500 text-sm mt-1">Access grammar, literature and writing materials.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <FileText size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Exam Papers</h3>
          <p className="text-slate-500 text-sm mt-1">Practice with past papers and model papers.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Progress</h3>
          <p className="text-slate-500 text-sm mt-1">Track your grades and teacher feedback.</p>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell size={20} className="text-indigo-600" />
            Latest Announcements
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {announcements.length > 0 ? announcements.slice(0, 3).map((ann) => (
            <div key={ann.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-900">{ann.title}</h4>
                <span className="text-xs text-slate-400 font-medium">
                  {ann.date?.toDate?.().toLocaleDateString() || 'Today'}
                </span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{ann.content}</p>
            </div>
          )) : (
            <div className="p-12 text-center">
              <p className="text-slate-400">No announcements yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const LessonsView = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const { isAdmin } = useAuth();
  
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Grammar',
    videoUrl: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'lessons'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setLessons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson)));
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'lessons'), {
        ...newLesson,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setNewLesson({ title: '', description: '', content: '', category: 'Grammar', videoUrl: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lessons Library</h1>
          <p className="text-slate-500">Master English with our curated materials.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Add Lesson
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg"
          >
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  placeholder="Lesson Title" 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newLesson.title}
                  onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                  required
                />
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newLesson.category}
                  onChange={e => setNewLesson({...newLesson, category: e.target.value as any})}
                >
                  <option>Grammar</option>
                  <option>Vocabulary</option>
                  <option>Literature</option>
                  <option>Writing</option>
                  <option>Speaking</option>
                </select>
              </div>
              <textarea 
                placeholder="Description" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                value={newLesson.description}
                onChange={e => setNewLesson({...newLesson, description: e.target.value})}
              />
              <textarea 
                placeholder="Lesson Content (Markdown supported)" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-40"
                value={newLesson.content}
                onChange={e => setNewLesson({...newLesson, content: e.target.value})}
                required
              />
              <input 
                placeholder="Video URL (YouTube)" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newLesson.videoUrl}
                onChange={e => setNewLesson({...newLesson, videoUrl: e.target.value})}
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium">Save Lesson</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <motion.div 
            layout
            key={lesson.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
          >
            <div className="h-2 bg-indigo-600" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-wider">
                  {lesson.category}
                </span>
                <Clock size={16} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{lesson.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-6">{lesson.description}</p>
              <button className="w-full py-3 bg-slate-50 text-slate-900 font-bold rounded-xl border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center gap-2">
                Start Learning
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const PapersView = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const { isAdmin } = useAuth();
  
  const [newPaper, setNewPaper] = useState({
    title: '',
    year: '2025',
    type: 'Past Paper',
    fileUrl: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'papers'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setPapers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paper)));
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'papers'), {
        ...newPaper,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setNewPaper({ title: '', year: '2025', type: 'Past Paper', fileUrl: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Exam Papers</h1>
          <p className="text-slate-500">Practice makes perfect. Download and submit your answers.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Add Paper
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg"
          >
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  placeholder="Paper Title" 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newPaper.title}
                  onChange={e => setNewPaper({...newPaper, title: e.target.value})}
                  required
                />
                <input 
                  placeholder="Year" 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newPaper.year}
                  onChange={e => setNewPaper({...newPaper, year: e.target.value})}
                  required
                />
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newPaper.type}
                  onChange={e => setNewPaper({...newPaper, type: e.target.value as any})}
                >
                  <option>Past Paper</option>
                  <option>Model Paper</option>
                  <option>Term Test</option>
                </select>
              </div>
              <input 
                placeholder="File URL (Drive/Dropbox link)" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newPaper.fileUrl}
                onChange={e => setNewPaper({...newPaper, fileUrl: e.target.value})}
                required
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium">Save Paper</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Paper Title</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Year</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {papers.map((paper) => (
              <tr key={paper.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <FileText size={18} />
                    </div>
                    <span className="font-bold text-slate-900">{paper.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    paper.type === 'Past Paper' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {paper.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">{paper.year}</td>
                <td className="px-6 py-4 text-right">
                  <a 
                    href={paper.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SubmissionsView = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission)));
    });
  }, []);

  if (!isAdmin) return <div className="p-12 text-center text-slate-400">Access Denied</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Student Submissions</h1>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Paper</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{sub.studentName}</td>
                <td className="px-6 py-4 text-slate-600">{sub.paperTitle}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    sub.status === 'graded' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">{sub.score !== undefined ? `${sub.score}%` : '-'}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 font-bold hover:underline">Grade</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AnnouncementsView = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const { isAdmin } = useAuth();
  
  const [newAnn, setNewAnn] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'announcements'), {
        ...newAnn,
        date: serverTimestamp()
      });
      setShowAdd(false);
      setNewAnn({ title: '', content: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
        {isAdmin && (
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Post Announcement
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg"
          >
            <form onSubmit={handleAdd} className="space-y-4">
              <input 
                placeholder="Announcement Title" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newAnn.title}
                onChange={e => setNewAnn({...newAnn, title: e.target.value})}
                required
              />
              <textarea 
                placeholder="Content" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                value={newAnn.content}
                onChange={e => setNewAnn({...newAnn, content: e.target.value})}
                required
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium">Post</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-slate-900">{ann.title}</h3>
              <span className="text-sm text-slate-400 font-medium">
                {ann.date?.toDate?.().toLocaleDateString() || 'Just now'}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">{ann.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading, login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await login();
    } catch (error: any) {
      console.error("Login failed", error);
      alert("Login failed: " + error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading English Genius...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-200">
              <GraduationCap size={48} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">English Genius LMS</h1>
              <p className="text-slate-500 mt-3 text-lg">The ultimate learning platform for O/L English students in Sri Lanka.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <p className="text-slate-600 text-sm">Access grammar & literature lessons</p>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <p className="text-slate-600 text-sm">Download O/L past papers</p>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={18} />
                  </div>
                  <p className="text-slate-600 text-sm">Get feedback from your teacher</p>
                </div>
              </div>
              <button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className={`w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <User size={24} />
                {isLoggingIn ? 'Starting Session...' : 'Get Started Now'}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="md:ml-64 pt-24 pb-12 px-4 sm:px-8 max-w-7xl mx-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'lessons' && <LessonsView />}
          {activeTab === 'papers' && <PapersView />}
          {activeTab === 'announcements' && <AnnouncementsView />}
          {activeTab === 'submissions' && <SubmissionsView />}
        </motion.div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

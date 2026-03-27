import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  Timer,
  AlertCircle,
  Code2,
  Zap,
  Shield,
  Skull,
  Lightbulb,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
  Medal,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { QUIZ_QUESTIONS } from './constants';
import { QuizState, Difficulty, LeaderboardEntry } from './types';

const INITIAL_STATE: QuizState = {
  difficulty: null,
  currentQuestionIndex: 0,
  score: 0,
  correctCount: 0,
  incorrectCount: 0,
  currentStreak: 0,
  maxStreak: 0,
  isFinished: false,
  userAnswers: [],
  startTime: null,
};

export default function App() {
  const [state, setState] = useState<QuizState>(INITIAL_STATE);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showHint, setShowHint] = useState(false);
  const [explanationData, setExplanationData] = useState<{ isCorrect: boolean; answer: string } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('score', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaderboardEntry[];
      setLeaderboard(entries);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const filteredQuestions = useMemo(() => {
    if (!state.difficulty) return [];
    return QUIZ_QUESTIONS.filter(q => q.difficulty === state.difficulty);
  }, [state.difficulty]);

  useEffect(() => {
    if (state.startTime && !state.isFinished && !explanationData) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            confirmAnswer('TIMEOUT');
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state.startTime, state.isFinished, state.currentQuestionIndex, explanationData]);

  const selectDifficulty = (difficulty: Difficulty) => {
    setState({ ...INITIAL_STATE, difficulty, startTime: Date.now() });
    setTimeLeft(30);
    setShowHint(false);
    setExplanationData(null);
    setSelectedAnswer(null);
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSelectOption = (answer: string) => {
    if (explanationData) return;
    setSelectedAnswer(answer);
    setInputValue(answer);
    setError(null);
  };

  const confirmAnswer = (answer: string) => {
    if (explanationData) return;
    const currentQuestion = filteredQuestions[state.currentQuestionIndex];
    const isCorrect = answer.toUpperCase() === currentQuestion.correctAnswer;
    
    setExplanationData({ isCorrect, answer });
    
    setState((prev) => {
      const newStreak = isCorrect ? prev.currentStreak + 1 : 0;
      const newMaxStreak = Math.max(prev.maxStreak, newStreak);
      
      let bonus = 0;
      if (isCorrect) {
        if (newStreak === 3) bonus = 5;
        else if (newStreak === 5) bonus = 10;
        else if (newStreak === 10) bonus = 25;
      }

      return {
        ...prev,
        score: isCorrect ? prev.score + 10 + bonus : prev.score,
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
        incorrectCount: isCorrect ? prev.incorrectCount : prev.incorrectCount + 1,
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        userAnswers: [...prev.userAnswers, answer],
      };
    });
  };

  const nextQuestion = () => {
    const nextIndex = state.currentQuestionIndex + 1;
    const isFinished = nextIndex >= filteredQuestions.length;

    setState((prev) => ({
      ...prev,
      currentQuestionIndex: nextIndex,
      isFinished,
    }));

    setInputValue('');
    setSelectedAnswer(null);
    setError(null);
    setTimeLeft(30);
    setShowHint(false);
    setExplanationData(null);

    if (isFinished && state.score >= (filteredQuestions.length * 7)) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    if (isFinished && user) {
      saveScore(state.score, state.difficulty!);
    }
  };

  const saveScore = async (score: number, difficulty: Difficulty) => {
    if (!user) return;
    setIsSavingScore(true);
    try {
      await addDoc(collection(db, 'leaderboard'), {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        score,
        difficulty,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error saving score:", err);
    } finally {
      setIsSavingScore(false);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (explanationData) return;
    const normalizedInput = inputValue.trim().toUpperCase();
    
    if (!['A', 'B', 'C', 'D'].includes(normalizedInput)) {
      setError('Please enter a valid option: A, B, C, or D');
      return;
    }

    confirmAnswer(normalizedInput);
  };

  const getResultMessage = () => {
    const percentage = (state.score / (filteredQuestions.length * 10)) * 100;
    if (percentage >= 80) return { text: "Excellent!", color: "text-green-400" };
    if (percentage >= 50) return { text: "Good job!", color: "text-blue-400" };
    return { text: "Try again!", color: "text-red-400" };
  };

  if (!state.difficulty && !state.isFinished) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0a0a0a] text-[#e0e0e0]' : 'bg-gray-50 text-gray-900'} font-mono flex items-center justify-center p-4`}>
        <div className="absolute top-4 right-4 flex gap-2">
          {user ? (
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${theme === 'dark' ? 'border-[#333] bg-[#151515]' : 'border-gray-200 bg-white'}`}>
                <User size={14} className="text-yellow-500" />
                <span className="text-xs font-bold">{user.displayName?.split(' ')[0]}</span>
              </div>
              <button 
                onClick={handleLogout}
                className={`p-2 rounded-full border transition-all ${theme === 'dark' ? 'border-[#333] bg-[#151515] text-red-500 hover:bg-[#222]' : 'border-gray-200 bg-white text-red-600 hover:bg-gray-100'}`}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all font-bold text-xs ${theme === 'dark' ? 'border-[#333] bg-[#151515] text-yellow-500 hover:bg-[#222]' : 'border-gray-200 bg-white text-yellow-600 hover:bg-gray-100'}`}
            >
              <LogIn size={16} />
              LOGIN_TO_SAVE_SCORES
            </button>
          )}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-full border transition-all ${theme === 'dark' ? 'border-[#333] bg-[#151515] text-yellow-500 hover:bg-[#222]' : 'border-gray-200 bg-white text-yellow-600 hover:bg-gray-100'}`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-2xl w-full border rounded-lg p-8 shadow-2xl ${theme === 'dark' ? 'bg-[#151515] border-[#333]' : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center gap-3 mb-6 text-yellow-500">
            <Terminal size={32} />
            <h1 className="text-3xl font-bold tracking-tighter">PYTHON_QUIZ_MASTER v2.0</h1>
          </div>
          
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-8 border-l-2 border-yellow-500 pl-4 italic`}>
            Select your challenge level to begin the simulation...
          </p>

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => selectDifficulty('EASY')}
              className={`group flex items-center justify-between p-6 border rounded transition-all ${
                theme === 'dark' 
                  ? 'bg-[#1a1a1a] border-[#333] hover:border-green-500 hover:bg-[#1e2a1e]' 
                  : 'bg-gray-50 border-gray-200 hover:border-green-500 hover:bg-green-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <Zap className="text-green-500" />
                <div className="text-left">
                  <h3 className="font-bold text-lg">EASY_MODE</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Fundamental syntax and basic concepts.</p>
                </div>
              </div>
              <ChevronRight className="group-hover:translate-x-1 transition-transform text-green-500" />
            </button>

            <button 
              onClick={() => selectDifficulty('MEDIUM')}
              className={`group flex items-center justify-between p-6 border rounded transition-all ${
                theme === 'dark' 
                  ? 'bg-[#1a1a1a] border-[#333] hover:border-blue-500 hover:bg-[#1e222a]' 
                  : 'bg-gray-50 border-gray-200 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <Shield className="text-blue-500" />
                <div className="text-left">
                  <h3 className="font-bold text-lg">MEDIUM_MODE</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Data structures and built-in methods.</p>
                </div>
              </div>
              <ChevronRight className="group-hover:translate-x-1 transition-transform text-blue-500" />
            </button>

            <button 
              onClick={() => selectDifficulty('HARD')}
              className={`group flex items-center justify-between p-6 border rounded transition-all ${
                theme === 'dark' 
                  ? 'bg-[#1a1a1a] border-[#333] hover:border-red-500 hover:bg-[#2a1e1e]' 
                  : 'bg-gray-50 border-gray-200 hover:border-red-500 hover:bg-red-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <Skull className="text-red-500" />
                <div className="text-left">
                  <h3 className="font-bold text-lg">HARD_MODE</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Advanced logic, decorators, and lambdas.</p>
                </div>
              </div>
              <ChevronRight className="group-hover:translate-x-1 transition-transform text-red-500" />
            </button>
          </div>

          <div className="mt-12">
            <div className="flex items-center gap-2 mb-6 text-yellow-500">
              <Medal size={20} />
              <h2 className="text-xl font-bold tracking-tighter uppercase">Global_Leaderboard</h2>
            </div>
            
            <div className={`border rounded overflow-hidden ${theme === 'dark' ? 'border-[#333] bg-[#1a1a1a]' : 'border-gray-200 bg-gray-50'}`}>
              {leaderboard.length > 0 ? (
                <div className="divide-y divide-[#333]">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 text-xs font-bold ${index < 3 ? 'text-yellow-500' : 'text-gray-500'}`}>
                          {index + 1}.
                        </span>
                        <span className="font-bold">{entry.displayName}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          entry.difficulty === 'HARD' ? 'border-red-500/30 text-red-500' :
                          entry.difficulty === 'MEDIUM' ? 'border-blue-500/30 text-blue-500' :
                          'border-green-500/30 text-green-500'
                        }`}>
                          {entry.difficulty}
                        </span>
                      </div>
                      <span className="font-bold text-yellow-500">{entry.score} pts</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-gray-500 italic">
                  No records found in the database...
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (state.isFinished) {
    const result = getResultMessage();
    return (
      <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0a0a0a] text-[#e0e0e0]' : 'bg-gray-50 text-gray-900'} font-mono flex items-center justify-center p-4`}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`max-w-2xl w-full border rounded-lg p-8 shadow-2xl text-center ${theme === 'dark' ? 'bg-[#151515] border-[#333]' : 'bg-white border-gray-200'}`}
        >
          <Trophy className="mx-auto mb-6 text-yellow-500" size={64} />
          <h2 className={`text-4xl font-bold mb-2 ${result.color}`}>{result.text}</h2>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Quiz Session Terminated Successfully</p>
          <div className={`inline-block px-3 py-1 border rounded text-xs text-yellow-500 mb-8 ${theme === 'dark' ? 'bg-[#222] border-[#333]' : 'bg-gray-100 border-gray-200'}`}>
            LEVEL: {state.difficulty}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded border ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-xs uppercase mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Final Score</p>
              <p className="text-2xl font-bold text-yellow-500">{state.score}</p>
            </div>
            <div className={`p-4 rounded border ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-xs uppercase mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Max Streak</p>
              <p className="text-2xl font-bold text-orange-500">{state.maxStreak}</p>
            </div>
            <div className={`p-4 rounded border ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-xs uppercase mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Correct</p>
              <p className="text-2xl font-bold text-green-500">{state.correctCount}</p>
            </div>
            <div className={`p-4 rounded border ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-xs uppercase mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Incorrect</p>
              <p className="text-2xl font-bold text-red-500">{state.incorrectCount}</p>
            </div>
          </div>

          {isSavingScore && (
            <div className="flex items-center justify-center gap-2 mb-6 text-yellow-500 text-xs animate-pulse">
              <Loader2 size={14} className="animate-spin" />
              UPLOADING_SCORE_TO_DATABASE...
            </div>
          )}

          {!user && (
            <div className={`p-4 rounded border mb-6 text-xs ${theme === 'dark' ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500/70' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
              <AlertCircle size={14} className="inline mr-2" />
              Login to save your score to the global leaderboard!
            </div>
          )}

          <button 
            onClick={() => setState(INITIAL_STATE)}
            className="w-full py-4 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold rounded transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            MAIN_MENU()
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = filteredQuestions[state.currentQuestionIndex];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0a0a0a] text-[#e0e0e0]' : 'bg-gray-50 text-gray-900'} font-mono p-4 md:p-8`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 text-black p-2 rounded">
              <Code2 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">QUIZ_ENGINE <span className={`text-xs ml-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>[{state.difficulty}]</span></h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Question {state.currentQuestionIndex + 1} of {filteredQuestions.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-full border transition-all ${theme === 'dark' ? 'border-[#333] bg-[#151515] text-yellow-500 hover:bg-[#222]' : 'border-gray-200 bg-white text-yellow-600 hover:bg-gray-100'}`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex items-center gap-2">
              <Timer className={timeLeft < 10 ? "text-red-500 animate-pulse" : (theme === 'dark' ? "text-gray-500" : "text-gray-400")} size={18} />
              <span className={`text-xl font-bold ${timeLeft < 10 ? "text-red-500" : "text-yellow-500"}`}>
                {timeLeft.toString().padStart(2, '0')}s
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Score:</span>
              <span className="text-xl font-bold text-yellow-500">{state.score.toString().padStart(3, '0')}</span>
            </div>
            {state.currentStreak > 1 && (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-500 rounded text-orange-500"
              >
                <Zap size={14} className="fill-orange-500" />
                <span className="text-xs font-bold">{state.currentStreak} STREAK</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`w-full h-1 rounded-full mb-12 overflow-hidden ${theme === 'dark' ? 'bg-[#222]' : 'bg-gray-200'}`}>
          <motion.div 
            className="h-full bg-yellow-500"
            initial={{ width: 0 }}
            animate={{ width: `${((state.currentQuestionIndex) / filteredQuestions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`border rounded-lg p-6 md:p-10 shadow-xl mb-8 relative overflow-hidden ${theme === 'dark' ? 'bg-[#151515] border-[#333]' : 'bg-white border-gray-200'}`}
          >
            {/* Progress Badge */}
            <div className="absolute top-0 right-0 bg-yellow-500 text-black px-4 py-1 text-[10px] font-bold tracking-widest uppercase">
              Question {state.currentQuestionIndex + 1} of {filteredQuestions.length}
            </div>

            <h2 className="text-xl md:text-2xl font-bold mb-8 leading-relaxed mt-4">
              <span className="text-yellow-500 mr-3">{">>>"}</span>
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {Object.entries(currentQuestion.options).map(([key, value]) => {
                const isCorrect = key === currentQuestion.correctAnswer;
                const isSelected = explanationData?.answer === key || selectedAnswer === key;
                
                let buttonStyle = theme === 'dark' ? "bg-[#1a1a1a] border-[#333]" : "bg-gray-50 border-gray-200";
                if (explanationData) {
                  if (isCorrect) buttonStyle = "bg-green-900/30 border-green-500 text-green-400";
                  else if (isSelected) buttonStyle = "bg-red-900/30 border-red-500 text-red-400";
                  else buttonStyle = theme === 'dark' ? "bg-[#1a1a1a] border-[#222] opacity-50" : "bg-gray-50 border-gray-100 opacity-50";
                } else {
                  if (isSelected) {
                    buttonStyle = theme === 'dark' ? "bg-yellow-500/10 border-yellow-500 text-yellow-500" : "bg-yellow-50 border-yellow-500 text-yellow-700";
                  } else {
                    buttonStyle += " hover:border-yellow-500 " + (theme === 'dark' ? "hover:bg-[#222]" : "hover:bg-yellow-50/50");
                  }
                }

                return (
                  <button
                    key={key}
                    disabled={!!explanationData}
                    onClick={() => handleSelectOption(key)}
                    className={`group flex items-center gap-4 p-4 border rounded transition-all text-left ${buttonStyle}`}
                  >
                    <span className={`w-8 h-8 flex items-center justify-center rounded font-bold transition-colors ${
                      explanationData 
                        ? (isCorrect ? "bg-green-500 text-black" : isSelected ? "bg-red-500 text-black" : (theme === 'dark' ? "bg-[#222] text-gray-600" : "bg-gray-200 text-gray-400"))
                        : (isSelected 
                            ? "bg-yellow-500 text-black" 
                            : (theme === 'dark' ? "bg-[#222] border border-[#444] text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black" : "bg-gray-100 border border-gray-200 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-black"))
                    }`}>
                      {key}
                    </span>
                    <span className={explanationData ? "" : (isSelected ? "font-bold" : (theme === 'dark' ? "text-gray-300 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900"))}>{value}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation Section */}
            <AnimatePresence>
              {explanationData && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-10 overflow-hidden"
                >
                  <div className={`p-6 rounded border ${explanationData.isCorrect ? "bg-green-900/10 border-green-500/30" : "bg-red-900/10 border-red-500/30"}`}>
                    <div className="flex items-center gap-2 mb-4">
                      {explanationData.isCorrect ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="text-green-500" size={20} />
                          {state.currentStreak >= 3 && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-[10px] bg-orange-500 text-black px-2 py-0.5 rounded font-bold"
                            >
                              {state.currentStreak === 3 ? '+5 BONUS' : state.currentStreak === 5 ? '+10 BONUS' : state.currentStreak === 10 ? '+25 BONUS' : ''}
                            </motion.span>
                          )}
                        </div>
                      ) : (
                        <XCircle className="text-red-500" size={20} />
                      )}
                      <span className={`font-bold uppercase tracking-widest text-sm ${explanationData.isCorrect ? "text-green-500" : "text-red-500"}`}>
                        {explanationData.isCorrect ? "CORRECT_EXECUTION" : "EXECUTION_ERROR"}
                      </span>
                    </div>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm leading-relaxed mb-6`}>
                      {currentQuestion.explanation}
                    </p>
                    <button
                      onClick={nextQuestion}
                      className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded transition-colors flex items-center justify-center gap-2 group"
                    >
                      CONTINUE_SIMULATION()
                      <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint Section (only if not showing explanation) */}
            {!explanationData && (
              <div className="mb-10">
                {!showHint ? (
                  <button
                    onClick={() => setShowHint(true)}
                    className={`flex items-center gap-2 text-xs transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-yellow-500' : 'text-gray-400 hover:text-yellow-600'}`}
                  >
                    <Lightbulb size={14} />
                    NEED_A_HINT?
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border-l-2 border-yellow-500 rounded text-sm italic flex items-start gap-3 ${theme === 'dark' ? 'bg-[#1a1a1a] text-gray-400' : 'bg-gray-50 text-gray-500'}`}
                  >
                    <Lightbulb size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                    <span>{currentQuestion.hint}</span>
                  </motion.div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
              <div className={`flex items-center gap-4 p-4 border rounded focus-within:border-yellow-500 transition-colors ${theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-gray-50 border-gray-200'}`}>
                <span className="text-yellow-500 font-bold">input_answer:</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type A, B, C, or D..."
                  className={`bg-transparent border-none outline-none flex-1 ${theme === 'dark' ? 'text-white placeholder:text-gray-700' : 'text-gray-900 placeholder:text-gray-300'}`}
                  maxLength={1}
                />
                <button 
                  type="submit"
                  className="px-4 py-1 bg-yellow-500 text-black text-xs font-bold rounded hover:bg-yellow-400 transition-colors"
                >
                  SUBMIT
                </button>
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-8 left-0 flex items-center gap-2 text-red-500 text-xs"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
            </form>
          </motion.div>
        </AnimatePresence>

        {/* Stats Footer */}
        <div className={`flex justify-center gap-8 text-xs uppercase tracking-widest ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-500" />
            <span>Correct: {state.correctCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle size={14} className="text-red-500" />
            <span>Incorrect: {state.incorrectCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Keyboard, 
  RotateCcw, 
  FileText, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Languages, 
  Sliders, 
  Clock, 
  Maximize, 
  Type as FontIcon, 
  History as HistoryIcon,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Award,
  Calendar,
  X,
  LayoutGrid,
  List,
  BookOpen,
  Boxes,
  Rows,
  Tv,
  Grid3X3,
  Minimize2,
  Columns,
  Camera,
  RefreshCw,
  GraduationCap,
  MessageSquare,
  MoreVertical,
  Settings,
  Zap,
  Bookmark,
  Users,
  Globe,
  Activity,
  Focus,
  Smile,
  Info,
  ShieldCheck,
  Scale,
  Mail,
  LogIn,
  LogOut,
  User,
  UserCheck
} from 'lucide-react';

import { TestMode, TimerPreset, TestState, CustomText, UserProfile } from './types';
import { WordItem, KeystrokeSoundSelector, SoundPreset, playKeystrokeSound } from './components/TypingArea';
import { COMMON_WORDS, SENTENCES, PARAGRAPHS, TIME_CHALLENGES } from './data/words';
import { getFallbackTranslation, FALLBACK_DICTIONARY } from './data/fallbackTranslations';

// Custom components
import Logo from './components/Logo';
import ThemeSelector from './components/ThemeSelector';
import ModeSelector from './components/ModeSelector';
import StatsPanel from './components/StatsPanel';
import TypingArea from './components/TypingArea';
import CustomTextModal from './components/CustomTextModal';
import CameraScannerModal from './components/CameraScannerModal';
import AboutModal from './components/AboutModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import TermsModal from './components/TermsModal';
import ContactModal from './components/ContactModal';
import AuthModal from './components/AuthModal';
import ShowcaseTourModal from './components/ShowcaseTourModal';
import { StudentChatWidget } from './components/StudentChatWidget';
import { KidsModeView } from './components/KidsModeView';
import { DailyGoalProgress } from './components/DailyGoalProgress';

import ResultsDashboard from './components/ResultsDashboard';
import { VisualKeyboard, KeyHeatmapData } from './components/VisualKeyboard';
import { SoundSettingsModal } from './components/SoundSettingsModal';
import { unlockSpeechSynthesis } from './utils/speech';

const LANGUAGES = [
  // Popular Languages
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'zh', name: 'Chinese (Simplified)', native: '中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', native: '繁體中文' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  
  // Asian & South Asian
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'ne', name: 'Nepali', native: 'नेपाली' },
  { code: 'si', name: 'Sinhala', native: 'සිංහල' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'fa', name: 'Persian (Farsi)', native: 'فارسی' },
  { code: 'ps', name: 'Pashto', native: 'پښتو' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
  { code: 'tl', name: 'Filipino (Tagalog)', native: 'Tagalog' },
  { code: 'my', name: 'Burmese', native: 'မြန်မာ' },
  { code: 'km', name: 'Khmer', native: 'ខ្មែរ' },

  // European
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά' },
  { code: 'he', name: 'Hebrew', native: 'עברית' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'no', name: 'Norwegian', native: 'Norsk' },
  { code: 'da', name: 'Danish', native: 'Dansk' },
  { code: 'fi', name: 'Finnish', native: 'Suomi' },
  { code: 'ro', name: 'Romanian', native: 'Română' },
  { code: 'hu', name: 'Hungarian', native: 'Magyar' },
  { code: 'cs', name: 'Czech', native: 'Čeština' },
  { code: 'sk', name: 'Slovak', native: 'Slovenčina' },
  { code: 'bg', name: 'Bulgarian', native: 'Български' },
  { code: 'hr', name: 'Croatian', native: 'Hrvatski' },
  { code: 'sr', name: 'Serbian', native: 'Српски' },
  { code: 'ca', name: 'Catalan', native: 'Català' },
  { code: 'lt', name: 'Lithuanian', native: 'Lietuvių' },
  { code: 'lv', name: 'Latvian', native: 'Latviešu' },
  { code: 'et', name: 'Estonian', native: 'Eesti' },
  { code: 'hy', name: 'Armenian', native: 'Հայերեն' },
  { code: 'ka', name: 'Georgian', native: 'ქართული' },
  { code: 'az', name: 'Azerbaijani', native: 'Azərbaycan' },
  { code: 'kk', name: 'Kazakh', native: 'Қазақша' },
  { code: 'uz', name: 'Uzbek', native: 'Oʻzbekcha' },

  // African & Others
  { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
  { code: 'am', name: 'Amharic', native: 'አማርኛ' },
  { code: 'ha', name: 'Hausa', native: 'Hausa' },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá' },
  { code: 'ig', name: 'Igbo', native: 'Asụsụ Igbo' },
  { code: 'zu', name: 'Zulu', native: 'isiZulu' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans' }
];

const PRESET_TIMES = [60, 120, 300, 500, 1000];

const BRAND_TITLES = [
  { name: 'TYPE & TRANSLATE', tagline: 'Practice Typing & Translate As You Go in 50+ Languages' },
  { name: 'TYPETRANSLATE', tagline: 'Multilingual Speed Typing & Live Translation' },
  { name: 'LINGOTYPE', tagline: 'Type Speed Test with Instant Multilingual Translation' },
  { name: 'POLYGLOT KEYS', tagline: 'Real-Time Speed Typing & Live Translation' },
  { name: 'TYPEWELL', tagline: 'Practice Speed Typing. Translate as You Type.' },
  { name: 'LEXIKEY', tagline: 'Smart Multilingual Speed Typing Studio' },
  { name: 'KEYLINGO', tagline: 'Precision Speed Typing Across 50+ Languages' },
  { name: 'TYPEFLOW', tagline: 'Type Speed Test & Live Sentence Translation' },
];

export default function App() {
  // Brand title choice
  const [brandIndex, setBrandIndex] = useState<number>(() => {
    const saved = localStorage.getItem('typewell_brand_title_index');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const currentBrand = BRAND_TITLES[brandIndex] || BRAND_TITLES[0];

  // Core test states
  const [testMode, setTestMode] = useState<TestMode>('words');
  const [timePreset, setTimePreset] = useState<TimerPreset>(60);
  const [customTimeValue, setCustomTimeValue] = useState<number>(120);
  const [testState, setTestState] = useState<TestState>('idle');

  // Interactive controls
  const [targetLang, setTargetLang] = useState<string>(() => {
    return localStorage.getItem('typewell_target_lang') || 'hi';
  });
  const [isTranslateActive, setIsTranslateActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('typewell_is_translate');
    return saved !== null ? saved === 'true' : true;
  });
  const [isAudioActive, setIsAudioActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('typewell_is_audio');
    return saved !== null ? saved === 'true' : true;
  });
  const [isAutoReadActive, setIsAutoReadActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('typewell_is_auto_read');
    return saved !== null ? saved === 'true' : true;
  });
  const [speechRate, setSpeechRate] = useState<number>(() => {
    return parseFloat(localStorage.getItem('typewell_speech_rate') || '1.0');
  });
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'>(() => {
    return (localStorage.getItem('typewell_font_size') as any) || 'xl';
  });
  const [isTranslationCollapsed, setIsTranslationCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('typewell_is_translation_collapsed');
    return saved !== null ? saved === 'true' : false;
  });
  const [translationViewMode, setTranslationViewMode] = useState<'full' | 'native' | 'cards' | 'dual' | 'active'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typewell_translation_view_mode');
      if (saved && ['full', 'native', 'cards', 'dual', 'active'].includes(saved)) {
        return saved as any;
      }
    }
    return 'full';
  });
  const [translationHeight, setTranslationHeight] = useState<'normal' | 'tall'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typewell_translation_height');
      return (saved as any) || 'normal';
    }
    return 'normal';
  });

  useEffect(() => {
    localStorage.setItem('typewell_translation_view_mode', translationViewMode);
  }, [translationViewMode]);

  useEffect(() => {
    localStorage.setItem('typewell_translation_height', translationHeight);
  }, [translationHeight]);

  // Workspace Focus, Kids Mode, and Layout Mode state
  const [isKidsMode, setIsKidsMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('typewell_is_kids_mode');
    return saved !== null ? saved === 'true' : false;
  });
  const [isSixWordsFocusMode, setIsSixWordsFocusMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('typewell_is_six_words_focus');
    return saved !== null ? saved === 'true' : true;
  });
  const [isCompactMode, setIsCompactMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('typewell_is_compact_mode');
    return saved !== null ? saved === 'true' : false;
  });

  useEffect(() => {
    localStorage.setItem('typewell_is_kids_mode', String(isKidsMode));
    if (!targetText) {
      initNewTest();
    }
  }, [isKidsMode]);

  useEffect(() => {
    localStorage.setItem('typewell_is_six_words_focus', String(isSixWordsFocusMode));
  }, [isSixWordsFocusMode]);

  useEffect(() => {
    localStorage.setItem('typewell_is_compact_mode', String(isCompactMode));
  }, [isCompactMode]);

  // Persistent Keyboard Heatmap & Visual Keyboard state
  const [heatmapData, setHeatmapData] = useState<KeyHeatmapData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typewell_key_heatmap_stats');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }
    }
    return {};
  });

  const [isVisualKeyboardVisible, setIsVisualKeyboardVisible] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typewell_is_visual_keyboard_visible');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typewell_key_heatmap_stats', JSON.stringify(heatmapData));
    }
  }, [heatmapData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('typewell_is_visual_keyboard_visible', String(isVisualKeyboardVisible));
    }
  }, [isVisualKeyboardVisible]);

  const handleResetHeatmap = () => {
    setHeatmapData({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('typewell_key_heatmap_stats');
    }
  };

  // Texts & Translation
  const [targetText, setTargetText] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');
  const [translationData, setTranslationData] = useState<any>(null);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState<boolean>(false);

  // Sound effect preset state
  const [soundPreset, setSoundPreset] = useState<SoundPreset>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('typing_sound_preset');
      if (saved) return saved as SoundPreset;
    }
    return 'cherry_blue';
  });
  const [lastSoundPreset, setLastSoundPreset] = useState<SoundPreset>(() => {
    return soundPreset !== 'off' ? soundPreset : 'cherry_blue';
  });

  const toggleMuteSound = () => {
    if (soundPreset === 'off') {
      const restorePreset = lastSoundPreset !== 'off' ? lastSoundPreset : 'cherry_blue';
      setSoundPreset(restorePreset);
      if (typeof window !== 'undefined') {
        localStorage.setItem('typing_sound_preset', restorePreset);
      }
      playKeystrokeSound(restorePreset, ' ');
    } else {
      setLastSoundPreset(soundPreset);
      setSoundPreset('off');
      if (typeof window !== 'undefined') {
        localStorage.setItem('typing_sound_preset', 'off');
      }
    }
  };

  // Active word tracking for Live Translation mapping
  const [currentWordIdx, setCurrentWordIdx] = useState<number>(0);
  const [currentWordsList, setCurrentWordsList] = useState<WordItem[]>([]);

  // Auto-scrolling refs for translation full view
  const translationContainerRef = useRef<HTMLDivElement>(null);
  const activeTranslationWordRef = useRef<HTMLSpanElement>(null);

  // Smooth auto-scroll translation passage as currentWordIdx changes
  useEffect(() => {
    if (testState === 'running') return;
    if (activeTranslationWordRef.current && translationContainerRef.current) {
      const activeEl = activeTranslationWordRef.current;
      const containerEl = translationContainerRef.current;

      const activeTop = activeEl.offsetTop;

      // Scroll so active word is positioned near top of translation viewport
      if (activeTop > 25) {
        containerEl.scrollTop = activeTop - 25;
      } else {
        containerEl.scrollTop = 0;
      }
    }
  }, [currentWordIdx, testState]);

  // Timing states
  const [elapsedTime, setElapsedTime] = useState<number>(0); 
  const [startTime, setStartTime] = useState<number | null>(null); 
  const [timeLimit, setTimeLimit] = useState<number>(60);
  const [testCompletedAt, setTestCompletedAt] = useState<number>(0);

  // Mistake tracking
  const [totalMistakes, setTotalMistakes] = useState<number>(0);

  // User Auth & Session state
  const DEFAULT_USER: UserProfile = {
    id: 'guest',
    name: 'Guest Typist',
    email: 'guest@typist.io',
    avatar: '👤',
    joinedDate: 'July 2026',
    isLoggedIn: false,
    bestWpm: 0,
    testsCompleted: 0,
  };

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('typewell_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse user session', e);
    }
    return DEFAULT_USER;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogin = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    try {
      localStorage.setItem('typewell_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  };

  const handleLogout = () => {
    setUser(DEFAULT_USER);
    try {
      localStorage.removeItem('typewell_user');
    } catch (e) {
      console.error('Failed to clear user session', e);
    }
  };

  // Modals & Menus
  const [isShowcaseTourOpen, setIsShowcaseTourOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('typesmart_showcase_seen');
      return !seen;
    }
    return false;
  });
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isStudentChatOpen, setIsStudentChatOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [selectedCustomText, setSelectedCustomText] = useState<string>('');
  const [customTimeInput, setCustomTimeInput] = useState<string>('180');

  // Mobile Web Speech API unlocker on any initial user gesture
  useEffect(() => {
    const handleInitialUserGesture = () => {
      unlockSpeechSynthesis();
    };
    window.addEventListener('pointerdown', handleInitialUserGesture, { once: true });
    window.addEventListener('touchstart', handleInitialUserGesture, { once: true });
    window.addEventListener('keydown', handleInitialUserGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleInitialUserGesture);
      window.removeEventListener('touchstart', handleInitialUserGesture);
      window.removeEventListener('keydown', handleInitialUserGesture);
    };
  }, []);

  // Active Online Users tracking & Community Stats
  const [activeUserCount, setActiveUserCount] = useState<number>(() => {
    return Math.floor(Math.random() * 180) + 1280;
  });
  const [totalPassagesToday, setTotalPassagesToday] = useState<number>(18432);
  const [isActiveUsersModalOpen, setIsActiveUsersModalOpen] = useState(false);
  const activeUsersControlRef = useRef<HTMLDivElement>(null);

  // Periodic active online users fluctuation (simulating real-time users joining & completing tests)
  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 9) - 3;
      setActiveUserCount((prev) => Math.max(850, prev + change));
      if (Math.random() > 0.35) {
        setTotalPassagesToday((prev) => prev + 1);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const optionsMenuControlRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || !document.body.contains(target)) return;

      if (
        optionsMenuControlRef.current && 
        !optionsMenuControlRef.current.contains(target) &&
        !target.closest('#controls-options-menu')
      ) {
        setIsOptionsMenuOpen(false);
      }
      if (
        activeUsersControlRef.current && 
        !activeUsersControlRef.current.contains(target) &&
        !target.closest('#active-users-modal')
      ) {
        setIsActiveUsersModalOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleCameraTextSelect = (text: string, title?: string) => {
    const newEntry: CustomText = {
      id: `custom_${Date.now()}`,
      title: title || `Scanned Script #${Date.now().toString().slice(-4)}`,
      content: text,
      createdAt: new Date().toLocaleDateString(),
    };

    const saved = localStorage.getItem('typing-custom-passages');
    let customTexts: CustomText[] = [];
    if (saved) {
      try {
        customTexts = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing custom texts:', e);
      }
    }
    const updatedList = [newEntry, ...customTexts];
    localStorage.setItem('typing-custom-passages', JSON.stringify(updatedList));

    setTestMode('custom');
    setSelectedCustomText(text);
    setTargetText(text);
    setTypedText('');
    setTestState('idle');
    setElapsedTime(0);
    setStartTime(null);
    setCurrentWordIdx(0);
    setTotalMistakes(0);

    if (isTranslateActive) {
      fetchTranslation(text, targetLang);
    }
  };

  // Real-time calculated metrics
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    wpm: 0,
    cpm: 0,
    accuracy: 100,
    correctChars: 0,
    wrongChars: 0,
  });

  const [lastTestWords, setLastTestWords] = useState<number>(0);
  const [lastTestWpm, setLastTestWpm] = useState<number>(0);

  // Refs
  const translationScrollRef = useRef<HTMLDivElement>(null);

  // Persist settings locally
  useEffect(() => {
    localStorage.setItem('typewell_target_lang', targetLang);
    localStorage.setItem('typewell_is_translate', isTranslateActive.toString());
    localStorage.setItem('typewell_is_audio', isAudioActive.toString());
    localStorage.setItem('typewell_is_auto_read', isAutoReadActive.toString());
    localStorage.setItem('typewell_speech_rate', speechRate.toString());
    localStorage.setItem('typewell_font_size', fontSize);
    localStorage.setItem('typewell_is_translation_collapsed', isTranslationCollapsed.toString());
    localStorage.setItem('typewell_translation_view_mode', translationViewMode);
  }, [targetLang, isTranslateActive, isAudioActive, isAutoReadActive, speechRate, fontSize, isTranslationCollapsed, translationViewMode]);

  // Handle preset calculations
  useEffect(() => {
    const limit = timePreset === 'custom' ? customTimeValue : timePreset;
    setTimeLimit(limit);
  }, [timePreset, customTimeValue]);

  // Fetch contextual translation from server
  const fetchTranslation = async (text: string, lang: string) => {
    if (!text || !lang) {
      console.warn("[Translation UI] Skipping fetchTranslation - text or targetLang missing.");
      return;
    }
    setIsLoadingTranslation(true);
    console.log(`[Translation UI] 1. Calling fetchTranslation for language '${lang}', text: "${text}"`);

    try {
      console.log("[Translation UI] 2. Sending request to API endpoint /api/translate...");
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: lang })
      });

      if (res.ok) {
        const data = await res.json();
        console.log("[Translation UI] 3. API response received successfully:", data);
        if (data.error) {
          console.error("[Translation UI] API error response:", data.error);
        }
        setTranslationData(data);
      } else {
        const errorText = await res.text();
        console.error(`[Translation UI] API request failed with HTTP status ${res.status}:`, errorText);
        const fallback = getFallbackTranslation(text, lang);
        setTranslationData(fallback);
      }
    } catch (err: any) {
      console.error("[Translation UI] Network or API connection error:", err.message || err);
      const fallback = getFallbackTranslation(text, lang);
      setTranslationData(fallback);
    } finally {
      setIsLoadingTranslation(false);
    }
  };

  // Trigger translation fetch when text or target language changes
  useEffect(() => {
    if (targetText && isTranslateActive) {
      fetchTranslation(targetText, targetLang);
    }
  }, [targetText, targetLang, isTranslateActive]);

  // Initialize new test passage
  const initNewTest = (mode = testMode, customPassage = selectedCustomText) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setTypedText('');
    setElapsedTime(0);
    setStartTime(null);
    setTestState('idle');
    setTotalMistakes(0);
    setTestCompletedAt(0);
    setCurrentWordIdx(0);
    setTranslationData(null);
    setRealTimeMetrics({
      wpm: 0,
      cpm: 0,
      accuracy: 100,
      correctChars: 0,
      wrongChars: 0,
    });

    if (mode === 'custom') {
      if (customPassage) {
        setTargetText(customPassage);
      } else {
        setIsCustomModalOpen(true);
        const fbPassage = generatePassage('words');
        setTargetText(fbPassage);
        setTestMode('words');
      }
    } else {
      setTargetText(generatePassage(mode));
    }
  };

  const generatePassage = (mode: TestMode): string => {
    switch (mode) {
      case 'words': {
        const shuffled = [...COMMON_WORDS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 30).join(' '); // standard clean set
      }
      case 'sentence': {
        return SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
      }
      case 'paragraph': {
        return PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)];
      }
      case 'time_challenge': {
        return TIME_CHALLENGES[Math.floor(Math.random() * TIME_CHALLENGES.length)];
      }
      default:
        return 'Standard typing speed test text.';
    }
  };

  // Init test on load or mode switch
  useEffect(() => {
    initNewTest();
  }, [testMode]);

  // Timer Tick Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (testState === 'running') {
      interval = setInterval(() => {
        setElapsedTime((prev) => {
          const nextTime = prev + 1;
          if (nextTime >= timeLimit) {
            handleCompleteTest(nextTime);
            return timeLimit;
          }
          return nextTime;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [testState, timeLimit]);

  // Compute live real-time metrics
  useEffect(() => {
    if (typedText.length === 0) {
      setRealTimeMetrics({
        wpm: 0,
        cpm: 0,
        accuracy: 100,
        correctChars: 0,
        wrongChars: 0,
      });
      return;
    }

    let correct = 0;
    let wrong = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === targetText[i]) {
        correct++;
      } else {
        wrong++;
      }
    }

    let elapsedSecs = elapsedTime;
    if (testState === 'running' && startTime !== null) {
      elapsedSecs = (Date.now() - startTime) / 1000;
    } else if (testState === 'completed' && testCompletedAt > 0) {
      elapsedSecs = testCompletedAt;
    }

    const elapsedMins = elapsedSecs / 60 || 0.0001;
    const calculatedWpm = (correct / 5) / elapsedMins;
    const calculatedCpm = correct / elapsedMins;
    const calculatedAccuracy = (correct / (correct + wrong || 1)) * 100;

    setRealTimeMetrics({
      wpm: Math.max(0, calculatedWpm),
      cpm: Math.round(calculatedCpm),
      accuracy: Math.min(100, calculatedAccuracy),
      correctChars: correct,
      wrongChars: wrong,
    });
  }, [typedText, targetText, elapsedTime, testState, startTime, testCompletedAt]);

  // Scroll live translation list to bottom automatically
  useEffect(() => {
    if (testState === 'running') return;
    if (translationScrollRef.current) {
      translationScrollRef.current.scrollTop = translationScrollRef.current.scrollHeight;
    }
  }, [currentWordIdx, testState]);

  const handleTypedTextChange = (newVal: string, isMistake: boolean) => {
    if (testState === 'completed') return;

    // Track keystroke heatmap statistics
    if (newVal.length > typedText.length) {
      const addedIdx = newVal.length - 1;
      const expectedChar = targetText[addedIdx] ? targetText[addedIdx].toLowerCase() : null;
      const typedChar = newVal[addedIdx] ? newVal[addedIdx].toLowerCase() : null;

      if (expectedChar) {
        setHeatmapData((prev) => {
          const prevStat = prev[expectedChar] || { attempts: 0, misses: 0 };
          const isMatch = typedChar === expectedChar;
          const nextStat = {
            attempts: prevStat.attempts + 1,
            misses: isMatch ? prevStat.misses : prevStat.misses + 1,
          };

          const updated = { ...prev, [expectedChar]: nextStat };
          if (!isMatch && typedChar) {
            const typedStat = prev[typedChar] || { attempts: 0, misses: 0 };
            updated[typedChar] = {
              attempts: typedStat.attempts + 1,
              misses: typedStat.misses + 1,
            };
          }
          return updated;
        });
      }
    }

    if (isMistake) {
      setTotalMistakes((m) => m + 1);
    }
    setTypedText(newVal);

    let currentStartTime = startTime;
    if (startTime === null && newVal.length > 0) {
      currentStartTime = Date.now();
      setStartTime(currentStartTime);
      setTestState('running');
    }

    if (newVal.length >= targetText.length) {
      const actualDuration = currentStartTime ? (Date.now() - currentStartTime) / 1000 : 1;
      handleCompleteTest(actualDuration);
    }
  };

  const handleStartTest = () => {
    setStartTime(Date.now());
    setTestState('running');
  };

  const handleCompleteTest = (finalDuration: number) => {
    setTestCompletedAt(finalDuration);
    setTestState('completed');

    // Calculate completed words for daily goal progress
    const wordsCount = typedText.trim().split(/\s+/).filter(Boolean).length;
    const finalWpm = Math.round(realTimeMetrics.wpm || (wordsCount / (finalDuration / 60 || 1)));
    
    setLastTestWords(wordsCount);
    setLastTestWpm(finalWpm);
  };

  const handleCustomTextSelect = (text: string) => {
    setSelectedCustomText(text);
    setTestMode('custom');
    initNewTest('custom', text);
  };

  // Font size cycling helper
  const handleCycleFontSize = () => {
    const sizes: ('sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl')[] = ['sm', 'base', 'lg', 'xl', '2xl', '3xl'];
    const currentIdx = sizes.indexOf(fontSize);
    const nextIdx = (currentIdx + 1) % sizes.length;
    setFontSize(sizes[nextIdx]);
  };

  // Speech rate cycling helper
  const handleCycleSpeechRate = () => {
    const rates = [0.8, 1.0, 1.2, 1.5];
    const currentIdx = rates.indexOf(speechRate);
    const nextIdx = (currentIdx + 1) % rates.length;
    setSpeechRate(rates[nextIdx]);
  };

  // Custom time setter
  const handleSetCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customTimeInput);
    if (!isNaN(val) && val >= 5 && val <= 3600) {
      setCustomTimeValue(val);
      setTimePreset('custom');
    }
  };

  // Fullscreen helper
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Word-by-word dynamic lookup helper
  const getWordTranslation = (original: string, index: number) => {
    if (translationData && translationData.words && translationData.words[index]) {
      const w = translationData.words[index];
      const origClean = original.replace(/[^a-zA-Z0-9']/g, "").toLowerCase().trim();
      const transClean = (w.translated || "").replace(/[^a-zA-Z0-9']/g, "").toLowerCase().trim();

      // Ensure that translated is not empty or equal to original English word unless it's a number
      if (w.translated && w.translated !== "—" && (transClean !== origClean || /^\d+$/.test(origClean))) {
        return w;
      }
      if (w.pronunciation && w.pronunciation !== "—" && w.pronunciation.toLowerCase() !== origClean) {
        return w;
      }
    }

    const clean = original.replace(/[^a-zA-Z']/g, "").toLowerCase().trim();
    const langDict = FALLBACK_DICTIONARY[targetLang];
    if (langDict && langDict[clean]) {
      const item = langDict[clean];
      return {
        original,
        translated: item.translated,
        pronunciation: item.pronunciation
      };
    }

    // Do NOT display the original text if translation fails!
    return {
      original,
      translated: "—",
      pronunciation: "—"
    };
  };

  const currentLanguageDetails = LANGUAGES.find(l => l.code === targetLang) || LANGUAGES[0];

  if (isKidsMode) {
    return <KidsModeView onExitKidsMode={() => setIsKidsMode(false)} />;
  }

  return (
    <div className={`min-h-screen bg-theme-bg text-theme-text font-sans selection:bg-theme-accent/25 selection:text-theme-correct transition-colors duration-300 flex flex-col justify-between ${isKidsMode ? 'kids-mode' : ''}`} id="app-root">
      
      {/* Typewell Header */}
      <header className="border-b border-theme-muted/15 bg-[#090c15]/90 backdrop-blur-md sticky top-0 z-40 py-2.5 sm:py-5 w-full max-w-full" id="app-header">
        <div className="max-w-6xl mx-auto px-2 sm:px-6 flex items-center justify-between gap-1 sm:gap-3 w-full min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-3 shrink min-w-0 overflow-hidden" id="brand-container">
            <Logo 
              size="md" 
              onClick={() => initNewTest()}
            />
            <span className="hidden lg:inline-block text-xs text-theme-muted font-mono border-l border-theme-muted/30 pl-3 truncate">
              Speed Typing & Live Translation in 50+ Languages
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Kids Mode Header Toggle Button */}
            <button
              onClick={() => setIsKidsMode((prev) => !prev)}
              id="header-kids-mode-toggle"
              className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-xl border-2 text-[10px] sm:text-xs font-black transition-all cursor-pointer shadow-sm transform hover:scale-105 active:scale-95 shrink-0 ${
                isKidsMode
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 border-amber-200 text-slate-950 ring-2 ring-amber-400/40 shadow-md scale-105'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-400/60 hover:border-amber-400 text-amber-300 hover:text-amber-200 shadow-sm'
              }`}
              title="Toggle Kids Mode (Child-friendly layout, larger text & simplified controls)"
            >
              <Smile className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isKidsMode ? 'text-slate-950 animate-bounce' : 'text-amber-300 animate-pulse'}`} />
              <span className="tracking-wide whitespace-nowrap">{isKidsMode ? '🎈 Kids ON' : '🎈 Kids Mode'}</span>
            </button>

            {/* User Account / Auth Button */}
            {!isKidsMode && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                id="header-auth-btn"
                className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm ${
                  user.isLoggedIn
                    ? 'border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
                    : 'border-theme-accent/40 bg-theme-accent/15 hover:bg-theme-accent/25 text-theme-accent'
                }`}
                title={user.isLoggedIn ? `Account: ${user.name} (${user.bestWpm || 0} WPM)` : 'Sign In or Register Account'}
              >
                {user.isLoggedIn ? (
                  <>
                    <span className="text-sm leading-none">{user.avatar || '⚡'}</span>
                    <span className="hidden sm:inline max-w-[90px] truncate">{user.name}</span>
                    {user.bestWpm ? (
                      <span className="hidden md:inline-block px-1.5 py-0.5 rounded-md bg-emerald-400/20 text-[10px] font-mono text-emerald-300">
                        {user.bestWpm} WPM
                      </span>
                    ) : null}
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign In</span>
                  </>
                )}
              </button>
            )}

            {/* 3-Dots Options & Settings Menu */}
            {!isKidsMode && (
              <div className="relative shrink-0" ref={optionsMenuControlRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOptionsMenuOpen((prev) => !prev);
                  }}
                  id="controls-options-three-dots-btn"
                  className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                    isOptionsMenuOpen
                      ? 'bg-theme-accent text-theme-bg border-theme-accent shadow-md'
                      : 'border-theme-muted/20 hover:border-theme-accent/40 bg-theme-card/60 hover:bg-theme-card text-theme-muted hover:text-theme-accent'
                  }`}
                  title="More Options & Theme Settings"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* 3-Dots Dropdown Menu Popover */}
                {isOptionsMenuOpen && (
                  <React.Fragment>
                    <div 
                      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden" 
                      onClick={() => setIsOptionsMenuOpen(false)} 
                    />
                    <div id="controls-options-menu" className="fixed top-14 right-2 left-2 sm:left-auto sm:right-0 sm:absolute sm:top-full sm:mt-2 w-auto sm:w-80 max-w-sm bg-[#090d1d] border border-theme-accent/30 rounded-2xl shadow-2xl p-3 sm:p-3.5 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl max-h-[80vh] sm:max-h-[85vh] overflow-y-auto">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-theme-muted/15 px-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-theme-accent tracking-wide uppercase font-mono">
                          <Zap className="w-3.5 h-3.5 text-theme-accent" />
                          <span>Options & Workspace Controls</span>
                        </div>
                        <button
                          onClick={() => setIsOptionsMenuOpen(false)}
                          className="p-1 text-theme-muted hover:text-theme-text rounded-md cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    <div className="space-y-3 text-xs max-h-[75vh] overflow-y-auto pr-1">
                      {/* Interactive Showcase Tour Feature Item */}
                      <button
                        onClick={() => {
                          setIsOptionsMenuOpen(false);
                          setIsShowcaseTourOpen(true);
                        }}
                        id="menu-showcase-tour-btn"
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/40 transition-all cursor-pointer font-sans bg-cyan-950/40 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                          <span>🎬 Interactive Showcase Tour</span>
                        </div>
                        <span className="text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded-md text-cyan-300 border border-cyan-400/30 font-mono">Walkthrough</span>
                      </button>

                      {/* Theme Selector embedded in 3-dots bar */}
                      <div className="pb-2.5 border-b border-theme-muted/15">
                        <ThemeSelector inline />
                      </div>

                      {/* Keystroke Audio & Sound Mute Toggle */}
                      <div className="space-y-1.5 pb-2.5 border-b border-theme-muted/15">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] uppercase font-bold text-theme-accent tracking-wider font-mono flex items-center gap-1">
                            {soundPreset === 'off' ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-theme-accent" />}
                            <span>Keystroke Sound</span>
                          </span>
                          <button
                            onClick={toggleMuteSound}
                            id="menu-mute-toggle-btn"
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-all ${
                              soundPreset === 'off'
                                ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-xs'
                                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-xs'
                            }`}
                          >
                            {soundPreset === 'off' ? '🔇 UNMUTE SOUND' : '🔊 MUTE SOUND'}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                          {[
                            { id: 'cherry_blue', name: 'Cherry Blue ⌨️' },
                            { id: 'cherry_brown', name: 'Cherry Brown 🪵' },
                            { id: 'typewriter', name: 'Typewriter 📜' },
                            { id: 'bubble_pop', name: 'Bubble Pop 🫧' },
                          ].map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() => {
                                setSoundPreset(preset.id as SoundPreset);
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('typing_sound_preset', preset.id);
                                }
                                playKeystrokeSound(preset.id as SoundPreset, ' ');
                              }}
                              className={`px-2 py-1.5 rounded-xl text-left text-[11px] font-mono transition-all cursor-pointer ${
                                soundPreset === preset.id
                                  ? 'bg-theme-accent/20 text-theme-accent border border-theme-accent/40 font-bold shadow-xs'
                                  : 'bg-theme-card/50 hover:bg-theme-card text-theme-muted border border-theme-muted/15'
                              }`}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Practice Text Mode Selection */}
                      <div className="space-y-1.5 pb-2.5 border-b border-theme-muted/15">
                        <span className="text-[10px] uppercase font-bold text-theme-accent tracking-wider font-mono px-1 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-theme-accent" />
                            <span>Practice Text Mode</span>
                          </div>
                          <span className="text-[9px] text-theme-correct font-mono font-semibold uppercase bg-theme-correct/10 border border-theme-correct/20 px-1.5 py-0.5 rounded">
                            {testMode === 'time_challenge' ? 'Challenge' : testMode}
                          </span>
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                          {(['words', 'sentence', 'paragraph', 'time_challenge'] as TestMode[]).map((m) => (
                            <button
                              key={m}
                              disabled={testState !== 'idle'}
                              onClick={() => {
                                setTestMode(m);
                                if (m !== 'custom') setSelectedCustomText('');
                              }}
                              className={`px-2.5 py-1.5 rounded-xl text-left transition-all capitalize cursor-pointer flex items-center justify-between ${
                                testMode === m
                                  ? 'bg-theme-accent/20 text-theme-accent border border-theme-accent/40 font-bold shadow-xs'
                                  : 'bg-theme-card/50 hover:bg-theme-card text-theme-muted hover:text-theme-text border border-theme-muted/15'
                              }`}
                            >
                              <span className="text-[11px]">{m === 'time_challenge' ? 'Challenge' : m}</span>
                              {testMode === m && <span className="w-1.5 h-1.5 rounded-full bg-theme-accent" />}
                            </button>
                          ))}
                          <button
                            disabled={testState !== 'idle'}
                            onClick={() => {
                              setIsCustomModalOpen(true);
                              setIsOptionsMenuOpen(false);
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between ${
                              testMode === 'custom'
                                ? 'bg-theme-accent/20 text-theme-accent border border-theme-accent/40 font-bold shadow-xs'
                                : 'bg-theme-card/50 hover:bg-theme-card text-theme-muted hover:text-theme-text border border-theme-muted/15'
                            }`}
                          >
                            <span className="text-[11px]">Custom Text</span>
                            {testMode === 'custom' && <span className="w-1.5 h-1.5 rounded-full bg-theme-accent" />}
                          </button>
                        </div>
                      </div>

                      {/* Timer Presets */}
                      <div className="space-y-1.5 pb-2.5 border-b border-theme-muted/15">
                        <span className="text-[10px] uppercase font-bold text-theme-muted tracking-wider font-mono px-1">Timer Presets</span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[15, 30, 60, 120].map((sec) => (
                            <button
                              key={sec}
                              disabled={testState !== 'idle'}
                              onClick={() => {
                                setTimePreset(sec as any);
                                setTestMode('time');
                                setIsOptionsMenuOpen(false);
                              }}
                              className={`py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                                testMode === 'time' && timePreset === sec
                                  ? 'bg-theme-accent text-theme-bg shadow-sm'
                                  : 'bg-theme-card/60 hover:bg-theme-card text-theme-muted border border-theme-muted/15'
                              }`}
                            >
                              {sec}s
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Language Selection */}
                      <div className="space-y-1.5 pb-2.5 border-b border-theme-muted/15">
                        <span className="text-[10px] uppercase font-bold text-theme-muted tracking-wider font-mono px-1">Target Translation Language</span>
                        <select
                          value={targetLang}
                          onChange={(e) => setTargetLang(e.target.value)}
                          className="w-full bg-theme-card/80 border border-theme-muted/20 text-theme-text text-xs rounded-xl p-2 font-semibold cursor-pointer focus:outline-none focus:border-theme-accent"
                        >
                          {LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code} className="bg-[#090d1d] text-slate-100">
                              {lang.name} ({lang.native})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Focus & Workspace Display Options */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-theme-accent tracking-wider font-mono px-1 flex items-center gap-1">
                          <Maximize className="w-3 h-3 text-theme-accent" />
                          <span>User Session & Focus Display</span>
                        </span>

                        {/* Scores & Logs History Button in 3-Dots Menu */}
                        <button
                          onClick={() => {
                            setIsHistoryModalOpen(true);
                            setIsOptionsMenuOpen(false);
                          }}
                          id="header-history-btn"
                          className="w-full text-left px-2.5 py-2.5 rounded-xl bg-theme-accent/10 hover:bg-theme-accent/20 border border-theme-accent/30 text-theme-text flex items-center justify-between transition-all cursor-pointer shadow-xs"
                        >
                          <div className="flex items-center gap-2">
                            <HistoryIcon className="w-3.5 h-3.5 text-theme-accent shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-bold text-[11px] text-theme-accent">Scores & Logs History</span>
                              <span className="text-[10px] text-theme-muted">View WPM performance & past tests</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-theme-accent/20 border-theme-accent/40 text-theme-accent">
                            OPEN
                          </span>
                        </button>

                        {/* Account Profile / Login Button in Menu */}
                        <button
                          onClick={() => {
                            setIsAuthModalOpen(true);
                            setIsOptionsMenuOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent hover:from-emerald-500/20 hover:to-cyan-500/20 border border-emerald-500/30 text-theme-text flex items-center justify-between transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base leading-none">{user.avatar || '👤'}</span>
                            <div className="flex flex-col">
                              <span className="font-bold text-[11px] text-theme-text">{user.isLoggedIn ? user.name : 'Account Profile'}</span>
                              <span className="text-[10px] text-theme-muted">{user.isLoggedIn ? user.email : 'Sign In or Register Account'}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            user.isLoggedIn 
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                              : 'bg-theme-accent/20 border-theme-accent/40 text-theme-accent'
                          }`}>
                            {user.isLoggedIn ? 'LOG OUT' : 'SIGN IN'}
                          </span>
                        </button>
                        
                        {/* 10 Words Focus Mode Toggle */}
                        <button
                          onClick={() => setIsSixWordsFocusMode(!isSixWordsFocusMode)}
                          className="w-full text-left px-2.5 py-2 rounded-xl bg-theme-card/60 hover:bg-theme-card border border-theme-muted/15 hover:border-theme-accent/30 text-theme-text flex items-center justify-between transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse" />
                            <div className="flex flex-col">
                              <span className="font-medium text-[11px]">10 Words Focus Mode</span>
                              <span className="text-[10px] text-theme-muted">Shows 10 words at a time in word boxes</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            isSixWordsFocusMode 
                              ? 'bg-theme-accent/20 border-theme-accent/40 text-theme-accent' 
                              : 'bg-theme-card border border-theme-muted/20 text-theme-muted'
                          }`}>
                            {isSixWordsFocusMode ? 'ON' : 'OFF'}
                          </span>
                        </button>

                        {/* Compact Workspace Layout Toggle */}
                        <button
                          onClick={() => setIsCompactMode(!isCompactMode)}
                          className="w-full text-left px-2.5 py-2 rounded-xl bg-theme-card/60 hover:bg-theme-card border border-theme-muted/15 hover:border-theme-accent/30 text-theme-text flex items-center justify-between transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <LayoutGrid className="w-3.5 h-3.5 text-theme-accent shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium text-[11px]">Compact Workspace</span>
                              <span className="text-[10px] text-theme-muted">Narrower card view</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            isCompactMode 
                              ? 'bg-theme-accent/20 border-theme-accent/40 text-theme-accent' 
                              : 'bg-theme-card border border-theme-muted/20 text-theme-muted'
                          }`}>
                            {isCompactMode ? 'ON' : 'OFF'}
                          </span>
                        </button>

                        {/* Sound & Voice Settings */}
                        <button
                          onClick={() => {
                            setIsSoundModalOpen(true);
                            setIsOptionsMenuOpen(false);
                          }}
                          id="menu-sound-voice-btn"
                          className="w-full text-left px-2.5 py-2 rounded-xl bg-theme-card/60 hover:bg-theme-card border border-theme-muted/15 hover:border-theme-accent/30 text-theme-text flex items-center justify-between transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-3.5 h-3.5 text-theme-accent shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium text-[11px]">Sound & Speech Settings</span>
                              <span className="text-[10px] text-theme-muted">Read aloud, voice test & keystrokes</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-theme-accent/20 border-theme-accent/40 text-theme-accent">
                            CONFIG
                          </span>
                        </button>

                        {/* Visual Keyboard & Heatmap Toggle */}
                        <button
                          onClick={() => setIsVisualKeyboardVisible(!isVisualKeyboardVisible)}
                          className="w-full text-left px-2.5 py-2 rounded-xl bg-theme-card/60 hover:bg-theme-card border border-theme-muted/15 hover:border-theme-accent/30 text-theme-text flex items-center justify-between transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Keyboard className="w-3.5 h-3.5 text-theme-accent shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-medium text-[11px]">On-Screen Keyboard</span>
                              <span className="text-[10px] text-theme-muted">Visual layout & error heatmap</span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            isVisualKeyboardVisible 
                              ? 'bg-theme-accent/20 border-theme-accent/40 text-theme-accent' 
                              : 'bg-theme-card border border-theme-muted/20 text-theme-muted'
                          }`}>
                            {isVisualKeyboardVisible ? 'ON' : 'OFF'}
                          </span>
                        </button>

                        {/* Information Pages & Support Links */}
                        <div className="pt-2 border-t border-theme-muted/15 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-theme-muted tracking-wider font-mono px-1">App Info & Legal</span>
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            <button
                              onClick={() => {
                                setIsAboutModalOpen(true);
                                setIsOptionsMenuOpen(false);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-theme-card/50 hover:bg-theme-card border border-theme-muted/15 text-theme-text text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <Info className="w-3.5 h-3.5 text-theme-accent shrink-0" />
                              <span>About</span>
                            </button>
                            <button
                              onClick={() => {
                                setIsContactModalOpen(true);
                                setIsOptionsMenuOpen(false);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-theme-card/50 hover:bg-theme-card border border-theme-muted/15 text-theme-text text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span>Contact</span>
                            </button>
                            <button
                              onClick={() => {
                                setIsPrivacyModalOpen(true);
                                setIsOptionsMenuOpen(false);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-theme-card/50 hover:bg-theme-card border border-theme-muted/15 text-theme-muted hover:text-theme-text text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>Privacy</span>
                            </button>
                            <button
                              onClick={() => {
                                setIsTermsModalOpen(true);
                                setIsOptionsMenuOpen(false);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-theme-card/50 hover:bg-theme-card border border-theme-muted/15 text-theme-muted hover:text-theme-text text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Terms</span>
                            </button>
                          </div>
                        </div>

                        {/* Quick Restart Test Button */}
                        <button
                          onClick={() => {
                            initNewTest();
                            setIsOptionsMenuOpen(false);
                          }}
                          className="w-full text-left px-2.5 py-2 rounded-xl bg-theme-accent/10 hover:bg-theme-accent/20 border border-theme-accent/30 text-theme-accent flex items-center justify-between transition-all cursor-pointer font-medium text-[11px] mt-1"
                        >
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5 text-theme-accent shrink-0" />
                            <span>New Practice Text</span>
                          </div>
                          <span className="text-[10px] font-mono">Reset</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col justify-center gap-6" id="app-main-content">

        {testState !== 'completed' ? (
          /* Active typing screen */
          <div className="space-y-6 animate-in fade-in duration-300" id="active-test-container">

            {/* Layout: Typing Area on Top, Live Translation Panel below */}
            <div className="flex flex-col gap-4" id="typing-layout-vertical">
              
              {/* Top Column: TYPING Workspace */}
              <div className="space-y-2.5 min-w-0" id="typing-workspace-panel">
                {/* Primary Typing Component */}
                <TypingArea
                  targetText={targetText}
                  typedText={typedText}
                  onTypedTextChange={handleTypedTextChange}
                  testState={testState}
                  onStartTest={handleStartTest}
                  onResetTest={() => initNewTest()}
                  onOpenCustomModal={() => setIsCustomModalOpen(true)}
                  onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
                  onOpenSoundModal={() => setIsSoundModalOpen(true)}
                  onActiveWordIndexChange={(idx, words) => {
                    setCurrentWordIdx(idx);
                    setCurrentWordsList(words);
                  }}
                  isAudioActive={isAudioActive}
                  isAutoReadActive={isAutoReadActive}
                  speechRate={speechRate}
                  fontSize={fontSize}
                  soundPreset={soundPreset}
                  onSoundPresetChange={setSoundPreset}
                  onToggleMuteSound={toggleMuteSound}
                  isSixWordsFocusMode={isSixWordsFocusMode}
                  onSixWordsFocusModeChange={setIsSixWordsFocusMode}
                  isCompactMode={isCompactMode}
                  onCompactModeChange={setIsCompactMode}
                  isKidsMode={isKidsMode}
                />
              </div>

              {/* Bottom Column: LIVE TRANSLATION Panel */}
              {!isKidsMode && isTranslateActive && (
                <div className="space-y-2.5 min-w-0" id="translation-workspace-panel">
                  <div className="flex flex-wrap justify-between items-center gap-2 px-1 text-xs text-theme-muted font-mono" id="translation-workspace-header">
                    <span className="flex items-center gap-1.5 uppercase tracking-wider font-bold truncate text-theme-text font-sans">
                      <Languages className="w-3.5 h-3.5 text-theme-accent shrink-0 animate-pulse" />
                      LIVE TRANSLATION • <span className="text-theme-correct font-semibold">{currentLanguageDetails.name}</span>
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      {isLoadingTranslation && (
                        <span className="text-[10px] text-theme-accent animate-bounce font-sans bg-theme-accent/10 px-2 py-0.5 rounded-full border border-theme-accent/20">
                          Translating...
                        </span>
                      )}

                      <button
                        onClick={() => setIsTranslationCollapsed(!isTranslationCollapsed)}
                        className="p-1 hover:text-theme-accent hover:bg-theme-muted/15 rounded transition-all cursor-pointer flex items-center justify-center text-theme-muted"
                        title={isTranslationCollapsed ? "Expand live translation" : "Collapse live translation"}
                        id="translation-collapse-btn"
                        aria-label={isTranslationCollapsed ? "Expand live translation" : "Collapse live translation"}
                      >
                        {isTranslationCollapsed ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Word-by-word matching translation list viewport matching typing box */}
                  <AnimatePresence initial={false}>
                    {!isTranslationCollapsed && (
                      <motion.div 
                        id="live-translation-panel"
                        initial={{ opacity: 0, scaleY: 0, originY: 0 }}
                        animate={{ opacity: 1, scaleY: 1, originY: 0 }}
                        exit={{ opacity: 0, scaleY: 0, originY: 0 }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                        className="w-full rounded-xl bg-theme-card/30 border border-theme-muted/10 p-4 sm:p-6 min-h-[135px] sm:min-h-[160px] relative overflow-hidden select-none cursor-default transition-all duration-300"
                      >
                        <div 
                          ref={translationContainerRef}
                          className="h-full max-h-[140px] sm:max-h-[180px] overflow-y-auto scrollbar-none pr-1 flex flex-wrap font-mono leading-relaxed gap-1 sm:gap-1.5 scroll-smooth content-start items-start justify-start" 
                          id="translation-full-container"
                        >
                          {currentWordsList.length === 0 ? (
                            <div className="h-full w-full min-h-[100px] flex flex-col items-center justify-center text-center text-xs text-theme-muted p-4 select-none space-y-1.5" id="translation-empty-state">
                              <Languages className="w-6 h-6 text-theme-accent/50 animate-pulse mb-0.5" />
                              <p className="font-semibold text-theme-text text-xs sm:text-sm">Live Word Translation</p>
                              <p className="text-[11px] text-theme-muted">Start typing to see translations flowing in {currentLanguageDetails.name} ({currentLanguageDetails.native}).</p>
                            </div>
                          ) : (
                            currentWordsList.slice(currentWordIdx, currentWordIdx + 12).map((wordItem, offset) => {
                              const idx = currentWordIdx + offset;
                              const trans = getWordTranslation(wordItem.text, idx);
                              const isActive = idx === currentWordIdx;

                              return (
                                <div
                                  key={idx}
                                  ref={isActive ? activeTranslationWordRef : null}
                                  className={`relative flex flex-col items-start rounded-lg border transition-all duration-200 py-1 px-2 sm:px-2.5 cursor-default group shadow-xs ${
                                    isActive 
                                      ? 'bg-theme-accent text-slate-950 border-theme-accent scale-[1.03] shadow-md ring-2 ring-theme-accent/50 font-bold' 
                                      : 'bg-theme-card/40 border-theme-muted/20 text-theme-text font-medium'
                                  }`}
                                  id={`translation-word-${idx}`}
                                  title={`Source word: ${wordItem.text}`}
                                >
                                  <span className={`font-sans text-xs sm:text-sm font-extrabold leading-tight ${
                                    isActive ? 'text-slate-950' : 'text-theme-text'
                                  }`}>
                                    {trans.translated !== '—' ? trans.translated : (trans.pronunciation !== '—' ? trans.pronunciation : wordItem.text)}
                                  </span>
                                  {trans.pronunciation && trans.pronunciation !== '—' && trans.pronunciation !== trans.translated && (
                                    <span className={`text-[9px] sm:text-[10px] font-mono tracking-wide mt-0.5 ${
                                      isActive ? 'text-slate-900 font-bold' : 'text-theme-muted/80'
                                    }`}>
                                      {trans.pronunciation}
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>

                        {currentWordsList.length > 0 && (
                          <div className="mt-2 pt-2 text-[10px] text-theme-muted flex items-center justify-between font-mono border-t border-theme-muted/10">
                            <span>Words {currentWordIdx + 1}–{Math.min(currentWordsList.length, currentWordIdx + 12)} of {currentWordsList.length}</span>
                            <span>{currentLanguageDetails.name} ({currentLanguageDetails.native})</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Target Language selector placed below translation panel */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 px-1 text-xs text-theme-muted font-mono" id="translation-workspace-footer">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider font-bold shrink-0 text-theme-text font-sans">
                        <Globe className="w-4 h-4 text-theme-accent shrink-0" />
                        Target Language:
                      </span>

                      {/* Main Interface Language Selector */}
                      <div className="relative flex items-center shrink-0">
                        <select
                          value={targetLang}
                          onChange={(e) => setTargetLang(e.target.value)}
                          id="main-interface-language-selector"
                          className="bg-theme-card/90 hover:bg-theme-card border border-theme-accent/40 hover:border-theme-accent text-theme-accent font-bold text-xs rounded-xl px-3 py-1 pr-8 focus:outline-none focus:ring-2 focus:ring-theme-accent/40 cursor-pointer transition-all shadow-sm font-sans"
                          title="Change target translation language"
                        >
                          {LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code} className="bg-[#090d1d] text-slate-100 font-sans">
                              {lang.name} ({lang.native})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-theme-accent absolute right-2.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Mode & Timer Presets Control Bar at the Bottom */}
            {!isKidsMode && (
              <ModeSelector
                currentMode={testMode}
                onModeChange={setTestMode}
                currentTimePreset={timePreset}
                onTimePresetChange={(preset, customVal) => {
                  setTimePreset(preset);
                  setTestMode('time');
                  if (customVal) setCustomTimeValue(customVal);
                }}
                customSecondsValue={customTimeValue}
                testState={testState}
                onOpenCustomModal={() => setIsCustomModalOpen(true)}
                onOpenCameraModal={() => setIsCameraModalOpen(true)}
              />
            )}

            {/* Horizontal real-time metrics telemetry row */}
            {!isKidsMode && (
              <StatsPanel
                wpm={realTimeMetrics.wpm}
                cpm={realTimeMetrics.cpm}
                accuracy={realTimeMetrics.accuracy}
                totalMistakes={totalMistakes}
                correctChars={realTimeMetrics.correctChars}
                wrongChars={realTimeMetrics.wrongChars}
                elapsedTime={elapsedTime}
                totalTime={timeLimit}
              />
            )}

            {/* Keystroke Sound Selector at the base below both boxes */}
            {!isKidsMode && (
              <KeystrokeSoundSelector
                soundPreset={soundPreset}
                setSoundPreset={setSoundPreset}
              />
            )}

            {/* On-Screen Visual Keyboard with Live Heatmap */}
            {!isKidsMode && (
              <VisualKeyboard
                typedText={typedText}
                targetText={targetText}
                testState={testState}
                heatmapData={heatmapData}
                onResetHeatmap={handleResetHeatmap}
                isVisible={isVisualKeyboardVisible}
                onToggleVisibility={() => setIsVisualKeyboardVisible(!isVisualKeyboardVisible)}
              />
            )}

          </div>
        ) : (
          /* Results Jumbotron & persistent history scorecard */
          <ResultsDashboard
            wpm={realTimeMetrics.wpm}
            cpm={realTimeMetrics.cpm}
            accuracy={realTimeMetrics.accuracy}
            totalMistakes={totalMistakes}
            correctChars={realTimeMetrics.correctChars}
            wrongChars={realTimeMetrics.wrongChars}
            duration={testCompletedAt}
            mode={testMode}
            passageSnippet={targetText}
            onRestart={() => initNewTest()}
            isAutoReadActive={isAutoReadActive}
            speechRate={speechRate}
          />
        )}

      </main>

      {/* Floating Action Pill Utility Box at the very bottom center */}
      {!isKidsMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40" id="floating-actions-bar">
          <div className="bg-[#0b0f1e]/90 backdrop-blur-md px-4 py-2.5 rounded-full border border-theme-muted/20 shadow-2xl flex items-center gap-4 text-theme-muted">
            
            {/* Custom Text Pencil button */}
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="hover:text-theme-accent transition-colors cursor-pointer"
              title="Create Custom Passage"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Camera Scan button */}
            <button
              onClick={() => setIsCameraModalOpen(true)}
              className="hover:text-theme-accent transition-colors cursor-pointer"
              title="Scan Photo or Document with Camera (AI OCR)"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* History Logs button */}
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              id="floating-history-btn"
              className="hover:text-theme-accent transition-colors cursor-pointer flex items-center gap-1.5 hover:bg-theme-card/60 px-2.5 py-1 rounded-full border border-theme-muted/15"
              title="Scores & Logs History"
            >
              <HistoryIcon className="w-3.5 h-3.5 text-theme-accent" />
              <span className="text-xs font-semibold text-theme-text hidden sm:inline">History</span>
            </button>

            <span className="w-px h-4 bg-theme-muted/20" />

            {/* Floating Action Button for Student Chat - Compact Messenger Icon */}
            <button
              onClick={() => setIsStudentChatOpen((prev) => !prev)}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                isStudentChatOpen
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'hover:text-blue-400 text-slate-400 hover:bg-theme-card/60'
              }`}
              title="Toggle Student AI Messenger"
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
            </button>

            <span className="w-px h-4 bg-theme-muted/20" />

            {/* Floating Action Button for Keystroke Sound Mute/Unmute */}
            <button
              onClick={toggleMuteSound}
              id="floating-sound-mute-btn"
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                soundPreset === 'off'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-md'
                  : 'hover:text-theme-accent text-slate-400 hover:bg-theme-card/60'
              }`}
              title={soundPreset === 'off' ? 'Unmute Keystroke Audio' : `Mute Audio (${soundPreset.replace('_', ' ')})`}
            >
              {soundPreset === 'off' ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-theme-accent" />}
            </button>

            <span className="w-px h-4 bg-theme-muted/20" />

            {/* Fullscreen Toggle */}
            <button
              onClick={handleToggleFullscreen}
              className="hover:text-theme-accent transition-colors cursor-pointer"
              title="Toggle Clean Immersive Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>

          </div>
        </div>
      )}

      {/* Bottom Action Bar for Camera OCR & Custom Script Tools */}
      {!isKidsMode && (
        <div className="w-full max-w-6xl mx-auto px-4 mt-8" id="bottom-action-toolbar">
          <div className="flex flex-wrap items-center justify-center gap-3 p-3.5 rounded-2xl bg-[#090d1f]/80 border border-theme-muted/20 backdrop-blur-md shadow-lg">
            <span className="text-xs font-bold text-theme-muted uppercase font-mono tracking-wider mr-1 hidden sm:inline-block">
              Tools & Practices:
            </span>

            {/* Camera OCR Scanner Button */}
            <button
              onClick={() => setIsCameraModalOpen(true)}
              id="header-camera-ocr-btn"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-extrabold transition-all cursor-pointer shadow-md active:scale-95"
              title="Scan document text using Camera OCR"
            >
              <Camera className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Camera OCR Scanner</span>
            </button>
          </div>
        </div>
      )}

      {/* Persistent Metadata Footnote with Live Typists Counter & Legal Links */}
      {!isKidsMode && (
        <footer className="py-5 px-4 text-center text-[11px] text-theme-muted/80 tracking-wide font-sans border-t border-theme-muted/10 bg-[#060812]/50 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-6xl mx-auto w-full mt-8" id="metadata-footnote">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsActiveUsersModalOpen(true)}
              className="flex items-center gap-1.5 text-theme-correct font-bold hover:underline cursor-pointer font-mono text-[10px] uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-theme-correct animate-pulse" />
              <span>{activeUserCount.toLocaleString()} TYPISTS ONLINE</span>
            </button>
            <span className="text-theme-muted/30">•</span>
            <span className="text-theme-muted/70 text-[10px] font-mono">50+ LANGUAGES</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button 
              onClick={() => setIsAboutModalOpen(true)}
              className="hover:text-theme-accent transition-colors cursor-pointer"
            >
              About
            </button>
            <button 
              onClick={() => setIsPrivacyModalOpen(true)}
              className="hover:text-theme-accent transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setIsTermsModalOpen(true)}
              className="hover:text-theme-accent transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button 
              onClick={() => setIsContactModalOpen(true)}
              className="hover:text-theme-accent transition-colors cursor-pointer text-cyan-400 font-medium"
            >
              Contact Support
            </button>
          </div>

          <div className="text-[10px] text-theme-muted/60 font-mono">
            © 2026 Type & Translate. All rights reserved.
          </div>
        </footer>
      )}

      {/* Modals */}
      <CustomTextModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSelectCustomText={handleCustomTextSelect}
        onOpenCameraModal={() => setIsCameraModalOpen(true)}
      />

      <CameraScannerModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onSelectExtractedText={handleCameraTextSelect}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <SoundSettingsModal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
        isAudioActive={isAudioActive}
        onToggleAudioActive={setIsAudioActive}
        isAutoReadActive={isAutoReadActive}
        onToggleAutoRead={setIsAutoReadActive}
        speechRate={speechRate}
        onSpeechRateChange={setSpeechRate}
        soundPreset={soundPreset}
        onSoundPresetChange={setSoundPreset}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Interactive Showcase Feature Tour Component */}
      <ShowcaseTourModal
        isOpen={isShowcaseTourOpen}
        onClose={() => setIsShowcaseTourOpen(false)}
      />

      {/* Student AI Assistant Chat Drawer Widget */}
      {!isKidsMode && (
        <StudentChatWidget
          isOpen={isStudentChatOpen}
          onClose={() => setIsStudentChatOpen(false)}
          onOpen={() => setIsStudentChatOpen(true)}
          currentContext={{
            targetText,
            targetLang,
            wpm: realTimeMetrics.wpm,
            accuracy: realTimeMetrics.accuracy,
          }}
        />
      )}

      {/* Scores History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="history-modal-overlay">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsHistoryModalOpen(false)} />

            {/* Content card container (styled similarly to other modals) */}
            <div className="relative bg-theme-card border border-theme-muted/30 rounded-2xl w-full max-w-3xl p-6 shadow-2xl z-10 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
              
              {/* Modal header */}
              <div className="flex items-center justify-between pb-3 border-b border-theme-muted/20 mb-4">
                <div className="flex items-center gap-2">
                  <HistoryIcon className="w-5 h-5 text-theme-accent" />
                  <h3 className="text-lg font-bold text-theme-correct">Practice Metrics & Scores Logs</h3>
                </div>
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="text-theme-muted hover:text-theme-correct hover:bg-theme-muted/20 p-1.5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable logs content */}
              <div className="flex-1 overflow-y-auto">
                <ResultsDashboard
                  wpm={realTimeMetrics.wpm}
                  cpm={realTimeMetrics.cpm}
                  accuracy={realTimeMetrics.accuracy}
                  totalMistakes={totalMistakes}
                  correctChars={realTimeMetrics.correctChars}
                  wrongChars={realTimeMetrics.wrongChars}
                  duration={testCompletedAt || 1}
                  mode={testMode}
                  passageSnippet={targetText}
                  onRestart={() => {
                    setIsHistoryModalOpen(false);
                    initNewTest();
                  }}
                />
              </div>

              {/* Close button footer */}
              <div className="mt-4 pt-3 border-t border-theme-muted/20 text-right">
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="px-4 py-2 border border-theme-muted/30 text-theme-text/80 hover:text-theme-text rounded-lg text-sm hover:bg-theme-muted/10 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

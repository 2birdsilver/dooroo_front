import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DiaryTab from "../features/diary/components/DiaryTab";
import { DIARY_ENTRIES } from "../mocks/mockData";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  BrowserRouter,
} from "react-router-dom";
import MySpacePage from "../features/home/pages/SpacePage";
import LoginPage from "../features/user/pages/LoginPage";
import LandingPage from "../features/user/pages/LandingPage";
import SignupPage from "../features/user/pages/SignupPage";
import { AuthProvider, useAuth } from "../features/user/context/AuthContext";
import SpacePage from "../features/home/pages/SpacePage";

// type Tab = "home" | "memo" | "diary" | "guestbook";
type Tab = "home" | "diary" | "guestbook";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDday(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setFullYear(today.getFullYear());
  if (target < today) target.setFullYear(today.getFullYear() + 1);
  const diff = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "D-day";
  return `D-${diff}`;
}

function getHeatmapWeeks() {
  const today = new Date(2026, 5, 30);
  // Start from Jan 1 of current year, anchored to the Sunday of that week
  const jan1 = new Date(today.getFullYear(), 0, 1);
  const start = new Date(jan1);
  start.setDate(start.getDate() - start.getDay()); // rewind to Sunday
  // End at the Saturday of the week containing today
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay()));
  const weeks: Date[][] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

// ── static data ───────────────────────────────────────────────────────────────

const ANNIVERSARIES = [
  { label: "우리 만난 날 💑", date: "2022-03-14" },
  { label: "생일 🎂", date: "1998-07-15" },
  { label: "졸업기념일 🎓", date: "2021-02-19" },
];

const DIARY_DATES = new Set([
  "2025-12-01",
  "2025-12-05",
  "2025-12-10",
  "2025-12-15",
  "2025-12-20",
  "2026-01-03",
  "2026-01-08",
  "2026-01-15",
  "2026-01-22",
  "2026-02-02",
  "2026-02-10",
  "2026-02-14",
  "2026-02-20",
  "2026-03-01",
  "2026-03-05",
  "2026-03-15",
  "2026-03-20",
  "2026-03-25",
  "2026-04-01",
  "2026-04-08",
  "2026-04-15",
  "2026-04-22",
  "2026-04-28",
  "2026-05-01",
  "2026-05-05",
  "2026-05-10",
  "2026-05-15",
  "2026-05-20",
  "2026-05-25",
  "2026-06-01",
  "2026-06-05",
  "2026-06-10",
  "2026-06-15",
  "2026-06-20",
  "2026-06-25",
  "2026-06-30",
]);

const MEMOS = [
  {
    id: 1,
    color: "#fff3b0",
    title: "오늘의 할 일",
    text: "- 운동하기\n- 책 읽기 📚\n- 일기 쓰기\n- 산책 30분",
  },
  {
    id: 2,
    color: "#b5ead7",
    title: "좋아하는 것들",
    text: "☁️ 구름 구경\n🍵 따뜻한 차\n📚 독서\n🎵 잔잔한 음악",
  },
  {
    id: 3,
    color: "#ffd6a5",
    title: "이번 달 목표",
    text: "✅ 매일 일기 쓰기\n✅ 물 2L 마시기\n⬜ 새 취미 찾기\n⬜ 운동 10회",
  },
  {
    id: 4,
    color: "#c9c9ff",
    title: "독서 리스트",
    text: "- 채식주의자\n- 아몬드\n- 82년생 김지영\n- 달러구트 꿈 백화점",
  },
  {
    id: 5,
    color: "#ffc8dd",
    title: "버킷리스트",
    text: "🗾 일본 교토\n🌊 제주도\n🏔️ 설악산\n🎡 놀이공원",
  },
  {
    id: 6,
    color: "#ffcfd2",
    title: "플레이리스트",
    text: "🎵 밤편지 - 아이유\n🎵 Blueming\n🎵 가을아침\n🎵 어떻게 이별까지 사랑하겠어",
  },
  {
    id: 7,
    color: "#a0ced9",
    title: "감사일기",
    text: "오늘도 건강하게\n지낼 수 있어서\n감사합니다 🙏\n작은 것에도 감사",
  },
  {
    id: 8,
    color: "#dde5b6",
    title: "요리 메모",
    text: "🍳 계란밥 - 간장+참기름\n🍜 된장찌개 - 두부+버섯\n🍚 김치볶음밥\n🥗 샐러드 드레싱",
  },
  {
    id: 9,
    color: "#fec89a",
    title: "시청 리스트",
    text: "⭐ 이상한 변호사 우영우\n⭐ 응답하라 1988\n⬜ 나의 해방일지\n⬜ 슬기로운 의사생활",
  },
  {
    id: 10,
    color: "#e2ced0",
    title: "오늘의 생각",
    text: "아무것도 하지 않는\n시간도 필요해.\n쉬어가도 괜찮아 💜\n천천히 가도 돼",
  },
];

const INITIAL_GUESTBOOK = [
  {
    id: 1,
    author: "봄햇살🌸",
    avatar: "🐱",
    message:
      "오늘도 행복한 하루 보내세요! 여기 자주 놀러올게요 ㅎㅎ 공간이 너무 예뻐요~",
    date: "2026.06.28",
    color: "#fff3b0",
  },
  {
    id: 2,
    author: "민들레씨",
    avatar: "🌼",
    message:
      "안녕하세요! 처음 방문했는데 분위기가 너무 따뜻해서 좋아요. 앞으로도 자주 올게요!",
    date: "2026.06.25",
    color: "#b5ead7",
  },
  {
    id: 3,
    author: "하늘별★",
    avatar: "🐰",
    message: "일기 항상 잘 읽고 있어요. 오늘도 힘내세요! 파이팅!! ✨",
    date: "2026.06.22",
    color: "#c9c9ff",
  },
  {
    id: 4,
    author: "초코무스",
    avatar: "🐻",
    message:
      "메모 모아두신 거 보니까 저도 해보고 싶어졌어요. 오늘 맛있는 거 드세요~",
    date: "2026.06.20",
    color: "#ffc8dd",
  },
  {
    id: 5,
    author: "구름조각",
    avatar: "🦊",
    message: "공간이 아기자기하고 너무 귀여워요!! 자주 방문할게요 :)",
    date: "2026.06.15",
    color: "#ffd6a5",
  },
];

const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "홈" },
  { id: "diary", label: "일기" },
  { id: "guestbook", label: "방명록" },
];

const TODAY = new Date(2026, 5, 30);

// ── main component ────────────────────────────────────────────────────────────

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [calMonth, setCalMonth] = useState(
    new Date(TODAY.getFullYear(), TODAY.getMonth(), 1),
  );
  const [guestbook, setGuestbook] = useState(INITIAL_GUESTBOOK);
  const [gbForm, setGbForm] = useState({ author: "", message: "" });
  const [bio, setBio] = useState(
    "안녕하세요! 일상을 기록하는 것을 좋아하는 사람입니다. 📝\n따뜻한 차 한 잔과 함께하는 독서를 즐기고,\n오늘도 소소하지만 행복한 하루를 보내고 있어요. ☀️",
  );
  const [editingBio, setEditingBio] = useState(false);
  const [memoPage, setMemoPage] = useState(0);
  const [gbPage, setGbPage] = useState(0);

  const MEMOS_PER_PAGE = 10; // 5 per row × 2 rows
  const GB_PER_PAGE = 5;

  const heatmapWeeks = getHeatmapWeeks();

  // calendar helpers
  const daysInMonth = new Date(
    calMonth.getFullYear(),
    calMonth.getMonth() + 1,
    0,
  ).getDate();
  const firstDay = new Date(
    calMonth.getFullYear(),
    calMonth.getMonth(),
    1,
  ).getDay();

  const navigateDay = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d);
    setCalMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const formatDisplayDate = (date: Date) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`;
  };

  const selectedDiary = DIARY_ENTRIES[formatDate(selectedDate)];

  const submitGuestbook = () => {
    if (!gbForm.author.trim() || !gbForm.message.trim()) return;
    const avatars = ["🐱", "🐰", "🐻", "🦊", "🐼", "🐨", "🦁", "🐸"];
    const colors = [
      "#fff3b0",
      "#b5ead7",
      "#c9c9ff",
      "#ffc8dd",
      "#ffd6a5",
      "#a0ced9",
      "#dde5b6",
      "#fec89a",
    ];
    const d = new Date();
    setGuestbook([
      {
        id: Date.now(),
        author: gbForm.author,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        message: gbForm.message,
        date: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`,
        color: colors[Math.floor(Math.random() * colors.length)],
      },
      ...guestbook,
    ]);
    setGbForm({ author: "", message: "" });
  };

  useEffect(() => {
    // 💡 앱이 켜질 때 브라우저에 저장된 토큰이 있는지 확인해서 로그인 유지
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        로딩 중...
      </div>
    );

  return (
    <Routes>
      {/* 🌟 핵심 조건문 라우팅 
          이제 전역 로그인 상태(isAuthenticated)에 따라 실시간으로 화면이 바뀝니다.
      */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/space" replace /> // 이미 로그인했다면 메인(스페이스)으로 튕겨내기
          ) : (
            <LandingPage />
          )
        }
      />

      {/* 로그인 및 회원가입 페이지 */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace /> // 이미 로그인했다면 메인(스페이스)으로 튕겨내기
          ) : (
            <LoginPage />
          )
        }
      />
      <Route path="/signup" element={<SignupPage />} />

      {/* 두 경로 모두 하나의 컴포넌트(SpaceMainPage)로 통합 */}
      <Route path="/space" element={<SpacePage />} />
      <Route path="/space/:spaceId" element={<SpacePage />} />

      {/* 잘못된 경로 접근 시 루트로 이동 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// ── small helper components ───────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-xs font-semibold uppercase tracking-widest mb-3"
      style={{ color: "var(--muted-foreground)" }}
    >
      {children}
    </h3>
  );
}

function Pagination({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (p: number) => void;
}) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 mt-5">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
        style={{ background: "var(--secondary)" }}
      >
        <ChevronLeft size={14} style={{ color: "var(--muted-foreground)" }} />
      </button>
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
          style={{
            background: i === page ? "var(--primary)" : "var(--secondary)",
            color:
              i === page
                ? "var(--primary-foreground)"
                : "var(--muted-foreground)",
          }}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === total - 1}
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
        style={{ background: "var(--secondary)" }}
      >
        <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

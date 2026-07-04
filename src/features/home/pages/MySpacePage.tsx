import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DIARY_ENTRIES } from "../../../mocks/mockData";
import DiaryTab from "../../diary/components/DiaryTab";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../user/context/AuthContext";

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

interface MySpacePageProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

// ── main component ────────────────────────────────────────────────────────────

const MySpacePage = () => {
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // 💡 로그아웃 시 토큰 지우고 상태값 변경
    localStorage.removeItem("token");
    logout();
    navigate("/"); // 첫 페이지로 튕겨내기
  };

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

  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <h2 className="text-xl font-bold">Dooroo</h2>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 bg-muted text-xs font-medium rounded-lg hover:bg-destructive hover:text-white transition-colors"
        >
          로그아웃
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex gap-6 items-start">
          {/* ── Left sidebar: Profile ── */}
          <aside className="w-56 flex-shrink-0 sticky top-10">
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-3 shadow-inner"
                  style={{
                    background: "linear-gradient(135deg, #f0e4d4, #e8b49a)",
                  }}
                >
                  🌸
                </div>
                <h2
                  className="text-sm font-semibold text-foreground"
                  style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
                >
                  <span className="">{user?.nickname}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user?.email}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {[
                  ["36", "일기"],
                  // ["10", "메모"],
                  ["5", "방명록"],
                ].map(([v, l]) => (
                  <div
                    key={l}
                    className="bg-secondary rounded-xl py-1.5 text-center"
                  >
                    <div className="text-xs font-bold text-foreground">{v}</div>
                    <div className="text-[10px] text-muted-foreground">{l}</div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {["#일상기록", "#독서", "#홈카페", "#감성"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-accent/50 text-foreground/70 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <hr className="border-border mb-4" />

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>📍</span> 서울, 대한민국
                </div>
                <div className="flex items-center gap-2">
                  <span>🎂</span> 1998년생
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span> 2022년 가입
                </div>
              </div>
            </div>
          </aside>

          {/* ── Right content area ── */}
          <div className="flex-1 min-w-0">
            {/* Bookmark-style tabs */}
            <div className="flex gap-0.5 pl-1">
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative px-5 py-2 text-sm rounded-t-xl border border-border transition-all duration-150"
                    style={{
                      background: active ? "var(--card)" : "var(--secondary)",
                      color: active
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                      fontWeight: active ? 600 : 400,
                      borderBottom: active
                        ? "1px solid var(--card)"
                        : "1px solid var(--border)",
                      marginBottom: active ? "-1px" : "0",
                      zIndex: active ? 10 : 1,
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content panel */}
            <div
              className="bg-card border border-border rounded-b-2xl rounded-tr-2xl p-6 shadow-sm"
              style={{ position: "relative", zIndex: 5 }}
            >
              {/* ══ HOME ══ */}
              {activeTab === "home" && (
                <div className="space-y-7">
                  {/* Anniversaries */}
                  <section>
                    <SectionTitle>🎀 기념일</SectionTitle>
                    <div className="grid grid-cols-3 gap-3">
                      {ANNIVERSARIES.map((a) => (
                        <div
                          key={a.label}
                          className="bg-secondary rounded-xl p-3 text-center"
                        >
                          <div className="text-[11px] text-muted-foreground mb-1">
                            {a.label}
                          </div>
                          <div
                            className="text-lg font-bold"
                            style={{
                              color: "var(--primary)",
                              fontFamily: "'Gowun Batang', serif",
                            }}
                          >
                            {getDday(a.date)}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            {a.date}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Heatmap */}
                  <section>
                    <SectionTitle>📔 일기 기록</SectionTitle>
                    <div className="bg-secondary/60 rounded-xl p-4 overflow-x-auto">
                      {/* month labels */}
                      <div className="flex gap-[3px] mb-1 pl-0">
                        {heatmapWeeks.map((week, wi) => {
                          const first = week.find((d) => d.getDate() === 1);
                          return (
                            <div
                              key={wi}
                              className="w-[11px] text-[8px] text-muted-foreground text-center leading-none"
                            >
                              {first ? `${first.getMonth() + 1}` : ""}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex gap-[3px]">
                        {/* day-of-week labels */}
                        <div className="flex flex-col gap-[3px] mr-1">
                          {["일", "월", "화", "수", "목", "금", "토"].map(
                            (d) => (
                              <div
                                key={d}
                                className="w-[11px] h-[11px] text-[8px] text-muted-foreground flex items-center justify-center leading-none"
                              >
                                {d === "월" || d === "수" || d === "금"
                                  ? d
                                  : ""}
                              </div>
                            ),
                          )}
                        </div>
                        {heatmapWeeks.map((week, wi) => (
                          <div key={wi} className="flex flex-col gap-[3px]">
                            {week.map((day, di) => {
                              const key = formatDate(day);
                              const has = DIARY_DATES.has(key);
                              const future = day > TODAY;
                              const outOfYear =
                                day.getFullYear() !== TODAY.getFullYear();
                              return (
                                <div
                                  key={di}
                                  title={outOfYear ? "" : key}
                                  className="w-[11px] h-[11px] rounded-[2px] transition-colors cursor-default"
                                  style={{
                                    backgroundColor: outOfYear
                                      ? "transparent"
                                      : future
                                        ? "rgba(180,140,110,0.06)"
                                        : has
                                          ? "var(--primary)"
                                          : "var(--muted)",
                                    opacity: future && !outOfYear ? 0.3 : 1,
                                  }}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Bio */}
                  <section>
                    <div className="flex items-center justify-between mb-2">
                      <SectionTitle>✍️ 소개글</SectionTitle>
                      <button
                        onClick={() => setEditingBio(!editingBio)}
                        className="text-xs transition-colors hover:opacity-70"
                        style={{ color: "var(--primary)" }}
                      >
                        {editingBio ? "저장 ✓" : "수정하기"}
                      </button>
                    </div>
                    {editingBio ? (
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-colors"
                        style={{
                          background: "var(--secondary)",
                          border: "1px solid var(--primary)",
                          color: "var(--foreground)",
                        }}
                        rows={4}
                      />
                    ) : (
                      <div
                        className="rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line"
                        style={{
                          background: "var(--secondary)",
                          color: "var(--foreground)",
                        }}
                      >
                        {bio}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* ══ MEMO ══ */}
              {/* {activeTab === "memo" && (
                <div>
                  <SectionTitle>📌 메모 목록</SectionTitle>
                  <div className="grid grid-cols-5 gap-3 mt-3">
                    {MEMOS.slice(
                      memoPage * MEMOS_PER_PAGE,
                      (memoPage + 1) * MEMOS_PER_PAGE,
                    ).map((memo) => (
                      <div
                        key={memo.id}
                        className="rounded-xl p-3 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                        style={{
                          backgroundColor: memo.color,
                          boxShadow: "2px 2px 6px rgba(0,0,0,0.08)",
                          minHeight: "130px",
                        }}
                      >
                        <div
                          className="w-8 h-2.5 rounded-sm mx-auto -mt-1 mb-2 opacity-60"
                          style={{
                            backgroundColor: memo.color,
                            filter: "brightness(0.85)",
                          }}
                        />
                        <div className="text-[11px] font-bold text-gray-700 mb-1.5 truncate">
                          {memo.title}
                        </div>
                        <div className="text-[11px] text-gray-600 whitespace-pre-line leading-relaxed line-clamp-6">
                          {memo.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination
                    page={memoPage}
                    total={Math.ceil(MEMOS.length / MEMOS_PER_PAGE)}
                    onChange={setMemoPage}
                  />
                </div>
              )} */}

              {/* ══ DIARY ══ */}
              {activeTab === "diary" && <DiaryTab />}

              {/* ══ GUESTBOOK ══ */}
              {activeTab === "guestbook" && (
                <div className="space-y-5">
                  {/* Header banner */}
                  <div
                    className="rounded-xl p-4 text-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #fff3b0 0%, #ffc8dd 50%, #c9c9ff 100%)",
                    }}
                  >
                    <div className="text-2xl mb-1">💌</div>
                    <h2
                      className="text-base font-bold text-foreground/80"
                      style={{ fontFamily: "'Gowun Batang', serif" }}
                    >
                      봄이네 방명록
                    </h2>
                    <p className="text-xs text-foreground/60 mt-0.5">
                      따뜻한 한마디 남겨주세요 🌸
                    </p>
                  </div>

                  {/* Write form */}
                  <div
                    className="rounded-xl p-4 border border-border"
                    style={{ background: "var(--secondary)" }}
                  >
                    <h4 className="text-sm font-semibold text-foreground mb-3">
                      ✏️ 글 남기기
                    </h4>
                    <input
                      type="text"
                      placeholder="이름 또는 닉네임"
                      value={gbForm.author}
                      onChange={(e) =>
                        setGbForm({ ...gbForm, author: e.target.value })
                      }
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors mb-2"
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        color: "var(--foreground)",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "var(--primary)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "var(--border)")
                      }
                    />
                    <textarea
                      placeholder="방명록을 남겨주세요 🌸"
                      value={gbForm.message}
                      onChange={(e) =>
                        setGbForm({ ...gbForm, message: e.target.value })
                      }
                      className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none transition-colors"
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        color: "var(--foreground)",
                      }}
                      rows={3}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "var(--primary)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "var(--border)")
                      }
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={submitGuestbook}
                        className="px-4 py-1.5 text-sm rounded-lg transition-opacity hover:opacity-85"
                        style={{
                          background: "var(--primary)",
                          color: "var(--primary-foreground)",
                        }}
                      >
                        남기기
                      </button>
                    </div>
                  </div>

                  {/* Entries */}
                  <div className="space-y-3">
                    {guestbook
                      .slice(gbPage * GB_PER_PAGE, (gbPage + 1) * GB_PER_PAGE)
                      .map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-xl p-4 border border-border/40"
                          style={{ background: entry.color + "55" }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                              style={{ background: entry.color }}
                            >
                              {entry.avatar}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-foreground">
                                {entry.author}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {entry.date}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed pl-10">
                            {entry.message}
                          </p>
                        </div>
                      ))}
                  </div>
                  <Pagination
                    page={gbPage}
                    total={Math.ceil(guestbook.length / GB_PER_PAGE)}
                    onChange={setGbPage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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

export default MySpacePage;

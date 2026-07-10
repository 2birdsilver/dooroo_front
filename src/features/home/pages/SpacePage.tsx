import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DIARY_ENTRIES } from "../../../mocks/mockData";
import DiaryTab from "../../diary/components/DiaryTab";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../user/context/AuthContext";

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

const SpacePage = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const mySpaceId = localStorage.getItem("spaceId");
  const numericSpaceId = Number(spaceId || mySpaceId || 0);
  const isOwner = numericSpaceId == Number(mySpaceId);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    logout();
    navigate("/");
  };

  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [guestbook, setGuestbook] = useState(INITIAL_GUESTBOOK);
  const [gbForm, setGbForm] = useState({ author: "", message: "" });
  const [bio, setBio] = useState(
    "안녕하세요! 일상을 기록하는 것을 좋아하는 사람입니다. 📝\n따뜻한 차 한 잔과 함께하는 독서를 즐기고,\n오늘도 소소하지만 행복한 하루를 보내고 있어요. ☀️",
  );
  const [editingBio, setEditingBio] = useState(false);
  const [gbPage, setGbPage] = useState(0);

  const GB_PER_PAGE = 5;

  const getYearWeeks = () => {
    const currentYear = new Date().getFullYear();
    const weeks = [];
    let startDate = new Date(currentYear, 0, 1);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(currentYear, 11, 31);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    let current = new Date(startDate);
    while (current <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  };

  const yearlyHeatmapWeeks = getYearWeeks();

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
      className="min-h-screen bg-background px-4 py-6 md:py-10"
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
    >
      {/* Header max-w 매칭 및 패딩 처리 */}
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-6 md:mb-8 pb-4 border-b">
        <h2
          className="text-xl font-CloudsofaNamgim text-brown-800 cursor-pointer"
          onClick={() => navigate(`/`)}
        >
          Dooroo
        </h2>
        <h2
          className="text-xl font-GriunCocochoitoon cursor-pointer hover:text-[#b87a52] transition-colors inline-block"
          onClick={() => navigate(`/space/${spaceId}`)} // 👈 route에서 정의한 경로로 수정해 주세요!
        >
          {user?.nickname}님의 스페이스
        </h2>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 bg-muted text-xs font-medium rounded-lg hover:bg-destructive hover:text-white transition-colors"
        >
          로그아웃
        </button>
      </header>

      <div className="max-w-5xl mx-auto">
        {/* 모바일에서는 세로(flex-col), md(768px) 이상에서는 가로(flex-row) 배치 */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* ── Left sidebar: Profile ── */}
          {/* 모바일에서는 너비 전체(w-full), md 이상에선 기존 고정 크기(md:w-56) */}
          <aside className="w-full md:w-56 flex-shrink-0 md:sticky md:top-10">
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex flex-col items-center mb-4">
                <div
                  className="w-30 h-30 rounded-full flex items-center justify-center mb-3 shadow-inner overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #111111, #111111)", // 그라데이션 색상 예시
                  }}
                >
                  <img
                    src="https://pub-c0e8866a02a44dfcbd0c0806ce372413.r2.dev/uploads/free-icon-dog-194177.png"
                    alt="이미지"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  <span>{user?.nickname}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user?.email}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {[
                  ["36", "일기"],
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

              <div className="flex flex-wrap justify-center md:justify-start gap-1 mb-4">
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

              <div className="space-y-2 text-xs text-muted-foreground grid grid-cols-3 gap-2 md:block md:space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span>📍</span> 서울, 대한민국
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span>🎂</span> 1998년생
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span>📅</span> 2022년 가입
                </div>
              </div>
            </div>
          </aside>

          {/* ── Right content area ── */}
          <div className="flex-1 min-w-0 w-full">
            {/* Bookmark-style tabs */}
            <div className="flex gap-0.5 pl-1">
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative px-4 py-2 text-xs md:text-sm rounded-t-xl border border-border transition-all duration-150"
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
              className="bg-card border border-border rounded-b-2xl rounded-tr-2xl p-4 md:p-6 shadow-sm"
              style={{ position: "relative", zIndex: 5 }}
            >
              {/* ══ HOME ══ */}
              {activeTab === "home" && (
                <div className="space-y-6 md:space-y-7">
                  {/* Anniversaries */}
                  <section>
                    <SectionTitle>🎀 기념일</SectionTitle>
                    {/* 모바일에서는 1열 혹은 3열이 좁을 수 있으므로 grid-cols-1에서 md:grid-cols-3으로 변경 가능하지만, 항목이 작으므로 grid-cols-3 유지하되 모바일 패딩 축소 */}
                    <div className="grid grid-cols-3 gap-2 md:grid-cols-3 md:gap-3">
                      {ANNIVERSARIES.map((a) => (
                        <div
                          key={a.label}
                          className="bg-secondary rounded-xl p-2 md:p-3 text-center"
                        >
                          <div className="text-[10px] md:text-[11px] text-muted-foreground mb-1 truncate">
                            {a.label}
                          </div>
                          <div
                            className="text-base md:text-lg font-bold"
                            style={{
                              color: "var(--primary)",
                              fontFamily: "'Gowun Batang', serif",
                            }}
                          >
                            {getDday(a.date)}
                          </div>
                          <div className="text-[9px] md:text-[10px] text-muted-foreground mt-1 hidden sm:block">
                            {a.date}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Heatmap */}
                  <section>
                    <SectionTitle>📔 일기 기록</SectionTitle>
                    {/* 모바일에서 365일 잔디는 다 들어갈 수 없으므로 가로 스크롤(overflow-x-auto)과 터치 스크롤 지원 스냅을 유지합니다 */}
                    <div className="bg-secondary/60 rounded-xl p-3 md:p-4 overflow-x-auto whitespace-nowrap scrollbar-thin">
                      <div className="inline-block min-w-max">
                        {/* month labels */}
                        <div className="flex gap-[3px] mb-1 pl-[15px]">
                          {yearlyHeatmapWeeks.map((week, wi) => {
                            const first = week.find((d) => d.getDate() === 1);
                            return (
                              <div
                                key={wi}
                                className="w-[11px] text-[8px] text-muted-foreground text-center leading-none shrink-0"
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

                          {yearlyHeatmapWeeks.map((week, wi) => (
                            <div
                              key={wi}
                              className="flex flex-col gap-[3px] shrink-0"
                            >
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
                                          ? "rgba(180,140,110,0.15)"
                                          : has
                                            ? "var(--primary)"
                                            : "var(--muted)",
                                    }}
                                  />
                                );
                              })}
                            </div>
                          ))}
                        </div>
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

              {/* ══ DIARY ══ */}
              {activeTab === "diary" && (
                <DiaryTab isOwner={isOwner} spaceId={numericSpaceId} />
              )}

              {/* ══ GUESTBOOK ══ */}
              {activeTab === "guestbook" && (
                <div className="space-y-5">
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
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none border border-border bg-card text-foreground focus:border-primary transition-colors mb-2"
                    />
                    <textarea
                      placeholder="방명록을 남겨주세요 🌸"
                      value={gbForm.message}
                      onChange={(e) =>
                        setGbForm({ ...gbForm, message: e.target.value })
                      }
                      className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none border border-border bg-card text-foreground focus:border-primary transition-colors"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={submitGuestbook}
                        className="px-4 py-1.5 text-sm rounded-lg text-primary-foreground bg-primary transition-opacity hover:opacity-85"
                      >
                        남기기
                      </button>
                    </div>
                  </div>

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
    <h3 className="text-xs font-semibold uppercase tracking-widest mb-3 text-muted-foreground">
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
        className="w-7 h-7 rounded-lg flex items-center justify-center bg-secondary transition-colors disabled:opacity-30"
      >
        <ChevronLeft size={14} className="text-muted-foreground" />
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
        className="w-7 h-7 rounded-lg flex items-center justify-center bg-secondary transition-colors disabled:opacity-30"
      >
        <ChevronRight size={14} className="text-muted-foreground" />
      </button>
    </div>
  );
}

export default SpacePage;

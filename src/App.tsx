import { useEffect, useMemo, useState } from 'react';

type SectionFilter = 'All' | 'Listening' | 'Reading' | 'Writing' | 'Speaking';

interface TestItem {
  id: number;
  title: string;
  type: Exclude<SectionFilter, 'All'>;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  completed: boolean;
  score: number;
  time: string;
  accent: string;
}

interface ChatMessage {
  id: number;
  sender: 'bot' | 'user';
  text: string;
}

const filters: SectionFilter[] = ['All', 'Listening', 'Reading', 'Writing', 'Speaking'];

const testBank: TestItem[] = Array.from({ length: 160 }, (_, index) => {
  const sectionMap: Array<Exclude<SectionFilter, 'All'>> = ['Listening', 'Reading', 'Writing', 'Speaking'];
  const type = sectionMap[index % sectionMap.length];
  const difficulty = ['Foundation', 'Intermediate', 'Advanced'][index % 3] as TestItem['difficulty'];
  return {
    id: index + 1,
    title: `Practice Test ${index + 1}`,
    type,
    difficulty,
    completed: index % 4 === 0,
    score: 62 + ((index * 7) % 38),
    time: `${35 + (index % 8) * 10} min`,
    accent: ['#6366f1', '#14b8a6', '#f97316', '#ec4899'][index % 4],
  };
});

const dashboardCards = [
  { label: 'Tests completed', value: '142 / 160', trend: '+8%', icon: '✓' },
  { label: 'Current band', value: '7.5', trend: '+0.5', icon: '◎' },
  { label: 'Avg. WPM', value: '38.4', trend: '+6.2', icon: '⏱' },
  { label: 'Speaking score', value: '8.0', trend: '+0.3', icon: '🎙' },
];

const starterMessages: ChatMessage[] = [
  { id: 1, sender: 'bot', text: 'Hi! I can help with IELTS reading, writing, speaking, and listening strategies. Ask me anything.' },
  { id: 2, sender: 'user', text: 'Give me a quick speaking plan for a Band 8 answer.' },
  { id: 3, sender: 'bot', text: 'Use PAR: Point, Answer, Reason. Keep your answer 1–2 minutes, include examples, and connect ideas logically.' },
];

const sampleTypingText =
  'The most effective IELTS study plan combines focused practice, review, and consistent speaking drills. Aim to improve one skill at a time while tracking progress every week.';

function getBotResponse(question: string) {
  const normalized = question.toLowerCase();

  if (normalized.includes('reading')) {
    return 'For reading, scan headings first, identify keywords, and eliminate impossible options before finalizing your answer.';
  }
  if (normalized.includes('writing')) {
    return 'In writing task 2, use a clear thesis, 2–3 body paragraphs, and a conclusion that repeats your main idea with supportive examples.';
  }
  if (normalized.includes('speaking')) {
    return 'For speaking, answer directly, extend with examples, and use linking phrases like “in my view”, “for instance”, and “on the other hand”.';
  }
  if (normalized.includes('listening')) {
    return 'Listening works best when you predict answers before hearing them, focus on keywords, and avoid getting stuck on one missed word.';
  }
  if (normalized.includes('band 8') || normalized.includes('band 8')) {
    return 'Band 8 answers are clear, coherent, and developed. Use topic-specific vocabulary and support ideas with examples and reasons.';
  }
  if (normalized.includes('wpm') || normalized.includes('typing')) {
    return 'For WPM improvement, focus on rhythm, correct finger placement, and accuracy before speed. Ten minutes of deliberate practice is more effective than rushing.';
  }

  return 'A strong IELTS strategy is to practice with a timer, review mistakes, and build vocabulary in context. I can also help you plan a daily study routine.';
}

function CharacterMascot() {
  return (
    <div className="mascot-wrap" aria-label="Speaking coach mascot">
      <div className="mascot-shadow" />
      <div className="mascot-shell">
        <div className="mascot-ear left" />
        <div className="mascot-ear right" />
        <div className="mascot-head">
          <div className="mascot-face">
            <div className="eye left" />
            <div className="eye right" />
            <div className="smile" />
          </div>
        </div>
      </div>
      <div className="mascot-edit">
        <span>Edit</span>
        <button type="button" aria-label="Upload speaking image">
          ↑
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState<SectionFilter>('All');
  const [showAll, setShowAll] = useState(false);
  const [typingText, setTypingText] = useState(sampleTypingText);
  const [typedText, setTypedText] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [input, setInput] = useState('');

  const filteredTests = useMemo(() => {
    if (activeFilter === 'All') return testBank;
    return testBank.filter((test) => test.type === activeFilter);
  }, [activeFilter]);

  const visibleTests = showAll ? filteredTests : filteredTests.slice(0, 9);

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) {
      setIsRunning(false);
      return;
    }

    const timer = window.setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [isRunning, timeLeft]);

  const wpm = useMemo(() => {
    const words = typedText.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(0, Math.round((words / Math.max(1, 60 - timeLeft)) * 60));
  }, [typedText, timeLeft]);

  const accuracy = useMemo(() => {
    if (!typedText.length) return 100;
    const typedChars = typedText.split('');
    const sampleChars = typingText.split('');
    let correct = 0;

    typedChars.forEach((char, index) => {
      if (sampleChars[index] === char) correct += 1;
    });

    return Math.max(0, Math.round((correct / typedChars.length) * 100));
  }, [typedText, typingText]);

  const handleTyping = (value: string) => {
    if (!isRunning && value.length > 0) setIsRunning(true);
    setTypedText(value);
  };

  const resetTyping = () => {
    setTypedText('');
    setTimeLeft(60);
    setIsRunning(false);
  };

  const handleChatSubmit = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { id: Date.now(), sender: 'user', text: input.trim() };
    const botText = getBotResponse(input.trim());
    const botMessage: ChatMessage = { id: Date.now() + 1, sender: 'bot', text: botText };

    setMessages((current) => [...current, userMessage, botMessage]);
    setInput('');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="logo-mark">I</div>
          <div>
            <p className="eyebrow">IELTS</p>
            <h2>Storage</h2>
          </div>
        </div>

        <nav className="nav">
          {['Overview', 'Library', 'WPM', 'Practice', 'Results'].map((item, index) => (
            <button key={item} className={`nav-item ${index === 0 ? 'active' : ''}`} type="button">
              {item}
            </button>
          ))}
        </nav>

        <div className="mini-card">
          <span className="mini-label">Current streak</span>
          <strong>12 days</strong>
          <small>Goal: 3 hours / week</small>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow muted">Good morning</p>
            <h1>IELTS Coach Dashboard</h1>
          </div>
          <button type="button" className="primary-btn">Upgrade plan</button>
        </header>

        <section className="hero-grid">
          <div className="hero-copy">
            <span className="tag">AI-powered IELTS</span>
            <h2>Train smarter with 160 mock tests, live WPM drills, and speaking feedback.</h2>
            <p>
              Practice with realistic IELTS tasks, study anywhere, and build confidence with personalized guidance.
            </p>
            <div className="cta-row">
              <button type="button" className="primary-btn">Start test</button>
              <button type="button" className="secondary-btn">View library</button>
            </div>
          </div>

          <div className="hero-visual">
            <CharacterMascot />
          </div>
        </section>

        <section className="stats-grid">
          {dashboardCards.map((card) => (
            <article key={card.label} className="stat-card">
              <div className="stat-icon">{card.icon}</div>
              <div>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.trend}</small>
              </div>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel tests-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow muted">Practice library</p>
                <h3>Complete test bank</h3>
              </div>
              <div className="filter-group">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={filter === activeFilter ? 'chip active' : 'chip'}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="test-grid">
              {visibleTests.map((test) => (
                <article key={test.id} className="test-card" style={{ ['--card-accent' as string]: test.accent }}>
                  <div className="test-topline">
                    <span className="type-pill">{test.type}</span>
                    <span className={`status ${test.completed ? 'done' : 'open'}`}>{test.completed ? 'Done' : 'Open'}</span>
                  </div>
                  <h4>{test.title}</h4>
                  <div className="meta-row">
                    <span>{test.difficulty}</span>
                    <span>{test.time}</span>
                  </div>
                  <div className="score-bar">
                    <span style={{ width: `${test.score}%` }} />
                  </div>
                  <div className="test-footer">
                    <strong>{test.score}%</strong>
                    <button type="button">Start</button>
                  </div>
                </article>
              ))}
            </div>

            <div className="panel-action">
              <button type="button" className="secondary-btn" onClick={() => setShowAll((value) => !value)}>
                {showAll ? 'Show fewer' : `Show all ${filteredTests.length}`} 
              </button>
            </div>
          </div>

          <div className="panel wpm-panel">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow muted">Typing lab</p>
                <h3>WPM test</h3>
              </div>
              <span className="timer-pill">{timeLeft}s</span>
            </div>

            <div className="wpm-stats">
              <div>
                <span>WPM</span>
                <strong>{wpm}</strong>
              </div>
              <div>
                <span>Accuracy</span>
                <strong>{accuracy}%</strong>
              </div>
            </div>

            <textarea
              value={typedText}
              onChange={(event) => handleTyping(event.target.value)}
              placeholder="Start typing here..."
            />

            <p className="typing-text">{typingText}</p>

            <div className="wpm-actions">
              <button type="button" className="primary-btn" onClick={() => setIsRunning((value) => !value)}>
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button type="button" className="secondary-btn" onClick={resetTyping}>Reset</button>
            </div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel chat-panel">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow muted">AI tutor</p>
                <h3>Ask anything</h3>
              </div>
            </div>

            <div className="chat-box">
              {messages.map((message) => (
                <div key={message.id} className={message.sender === 'user' ? 'chat-bubble user' : 'chat-bubble bot'}>
                  {message.text}
                </div>
              ))}
            </div>

            <div className="chat-input-row">
              <input
                type="text"
                value={input}
                placeholder="Ask about IELTS strategies..."
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleChatSubmit();
                }}
              />
              <button type="button" className="primary-btn" onClick={handleChatSubmit}>Send</button>
            </div>
          </div>

          <div className="panel speaking-panel">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow muted">Speaking coach</p>
                <h3>Prompt of the day</h3>
              </div>
            </div>

            <div className="speaking-card">
              <strong>Describe a time you learned something useful from a classmate.</strong>
              <p>
                Speak for 1–2 minutes. Include a clear example, explain why it was useful, and finish with a short conclusion.
              </p>
              <button type="button" className="secondary-btn">Play sample answer</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

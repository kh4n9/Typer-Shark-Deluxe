import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Hud from './components/Hud.jsx';
import OceanScene from './components/OceanScene.jsx';
import Overlay from './components/Overlay.jsx';

const MAX_LIVES = 5;
const LANES = [-10, 0, 10];

const WORD_BANK = {
  easy: [
    'san hô',
    'cá mập',
    'thợ lặn',
    'biển sâu',
    'bong bóng',
    'đại dương',
    'vỏ sò',
    'tàu đắm',
    'ngọc trai',
    'sóng xanh',
    'mỏ neo',
    'cát vàng',
    'cánh buồm',
    'giáp xác',
    'bạch tuộc',
    'sứa biển',
  ],
  medium: [
    'đầm phá',
    'lớp vảy',
    'định vị âm',
    'hải lưu',
    'cá mập đầu búa',
    'kho báu cổ',
    'truyền thuyết',
    'đảo san hô',
    'bão tố',
    'lấp lánh',
    'hơi thở cuối',
    'đoàn thuyền',
    'mũi giáo',
    'làn gió lạnh',
    'vùng nước xoáy',
  ],
  hard: [
    'bí ẩn đại dương',
    'khoang điều áp',
    'ánh trăng bạc',
    'hải tặc truyền kỳ',
    'trường sa ký ức',
    'vệt sáng phù du',
    'độ sâu nghìn trượng',
    'mỏ neo rỉ sét',
    'giai thoại thần long',
    'dòng chảy ngầm',
  ],
};

const normalize = (value) => value.toLocaleLowerCase('vi-VN');

const pickWordForLevel = (level) => {
  if (level < 3) {
    return WORD_BANK.easy[Math.floor(Math.random() * WORD_BANK.easy.length)];
  }
  if (level < 6) {
    return WORD_BANK.medium[Math.floor(Math.random() * WORD_BANK.medium.length)];
  }
  return WORD_BANK.hard[Math.floor(Math.random() * WORD_BANK.hard.length)];
};

const initialStats = () => ({
  score: 0,
  lives: MAX_LIVES,
  level: 1,
  combo: 0,
});

export default function App() {
  const [gamePhase, setGamePhase] = useState('start');
  const [stats, setStats] = useState(initialStats);
  const [targetId, setTargetId] = useState(null);
  const [sharks, setSharks] = useState([]);
  const defeatsRef = useRef(0);
  const sharksRef = useRef([]);
  const spawnTimerRef = useRef(0);
  const rafRef = useRef();
  const lastTimeRef = useRef();
  const idCounterRef = useRef(1);

  const resetGame = useCallback(() => {
    defeatsRef.current = 0;
    sharksRef.current = [];
    setSharks([]);
    setTargetId(null);
    setStats(initialStats());
    spawnTimerRef.current = 0;
    lastTimeRef.current = undefined;
  }, []);

  const updateSharksState = useCallback((updater) => {
    const next = typeof updater === 'function' ? updater(sharksRef.current) : updater;
    sharksRef.current = next;
    setSharks(next);
  }, []);

  const spawnShark = useCallback((level) => {
    const word = pickWordForLevel(level);
    const lane = LANES[Math.floor(Math.random() * LANES.length)];
    const wobbleSeed = Math.random() * Math.PI * 2;
    const newShark = {
      id: idCounterRef.current++,
      word,
      typed: '',
      lane,
      wobbleSeed,
      progress: 0,
      speed: 0.18 + level * 0.03 + Math.random() * 0.04,
    };
    updateSharksState((current) => [...current, newShark]);
    spawnTimerRef.current = Math.max(1.65 - level * 0.15, 0.6) + Math.random() * 0.4;
  }, [updateSharksState]);

  const handleSharkEscape = useCallback((escapedId) => {
    setStats((prev) => {
      const nextLives = prev.lives - 1;
      const next = {
        ...prev,
        lives: nextLives,
        combo: 0,
      };
      if (nextLives <= 0) {
        setGamePhase('gameover');
      }
      return next;
    });
    if (targetId === escapedId) {
      setTargetId(null);
    }
  }, [targetId]);

  const handleSharkDefeated = useCallback((defeatedId, wordLength) => {
    defeatsRef.current += 1;
    setStats((prev) => {
      const gained = 75 + wordLength * 15 + prev.level * 20 + prev.combo * 10;
      const score = prev.score + gained;
      const combo = prev.combo + 1;
      let level = prev.level;
      if (defeatsRef.current % 6 === 0) {
        level = prev.level + 1;
      }
      return {
        score,
        combo,
        level,
        lives: prev.lives,
      };
    });
    if (targetId === defeatedId) {
      setTargetId(null);
    }
  }, [targetId]);

  const focusSharkForKey = useCallback((char) => {
    const sorted = [...sharksRef.current].sort((a, b) => b.progress - a.progress);
    return sorted.find((shark) => normalize(shark.word).startsWith(char));
  }, []);

  const finishGame = useCallback(() => {
    setGamePhase('gameover');
  }, []);

  useEffect(() => {
    if (gamePhase !== 'playing') {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      lastTimeRef.current = undefined;
      return undefined;
    }

    const step = (timestamp) => {
      if (lastTimeRef.current === undefined) {
        lastTimeRef.current = timestamp;
      }
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      spawnTimerRef.current -= delta;
      if (spawnTimerRef.current <= 0) {
        spawnShark(stats.level);
      }

      const remaining = [];
      sharksRef.current.forEach((shark) => {
        const nextProgress = Math.min(1, shark.progress + shark.speed * delta);
        if (nextProgress >= 1) {
          handleSharkEscape(shark.id);
        } else {
          remaining.push({ ...shark, progress: nextProgress });
        }
      });
      updateSharksState(remaining);

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [gamePhase, handleSharkEscape, spawnShark, stats.level, updateSharksState]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (gamePhase === 'start' && event.key === 'Enter') {
        event.preventDefault();
        resetGame();
        setGamePhase('playing');
        return;
      }

      if (gamePhase === 'gameover' && event.key === 'Enter') {
        event.preventDefault();
        resetGame();
        setGamePhase('playing');
        return;
      }

      if (gamePhase === 'paused' && event.key === 'Escape') {
        event.preventDefault();
        setGamePhase('playing');
        return;
      }

      if (gamePhase !== 'playing') {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setGamePhase('paused');
        return;
      }

      if (event.key === 'Backspace') {
        event.preventDefault();
        if (!targetId) {
          return;
        }
        const target = sharksRef.current.find((shark) => shark.id === targetId);
        if (!target) {
          return;
        }
        target.typed = target.typed.slice(0, -1);
        updateSharksState([...sharksRef.current]);
        return;
      }

      if (event.key === ' ') {
        event.preventDefault();
      }

      if (event.key.length !== 1) {
        return;
      }

      const inputChar = normalize(event.key);
      let target = sharksRef.current.find((shark) => shark.id === targetId);

      if (!target) {
        target = focusSharkForKey(inputChar);
        if (!target) {
          return;
        }
        setTargetId(target.id);
      }

      const expectedChar = normalize(target.word[target.typed.length] || '');
      if (inputChar === expectedChar) {
        target.typed += event.key;
        updateSharksState([...sharksRef.current]);
        if (target.typed.length === target.word.length) {
          updateSharksState(sharksRef.current.filter((shark) => shark.id !== target.id));
          handleSharkDefeated(target.id, target.word.length);
        }
      } else {
        target.typed = '';
        setStats((prev) => ({ ...prev, combo: 0 }));
        updateSharksState([...sharksRef.current]);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusSharkForKey, gamePhase, handleSharkDefeated, resetGame, targetId, updateSharksState]);

  useEffect(() => {
    if (gamePhase === 'playing' && sharksRef.current.length === 0) {
      spawnTimerRef.current = 0;
    }
  }, [gamePhase]);

  useEffect(() => {
    if (gamePhase === 'gameover') {
      updateSharksState([]);
    }
  }, [gamePhase, updateSharksState]);

  const targetShark = useMemo(
    () => sharks.find((shark) => shark.id === targetId) ?? null,
    [sharks, targetId]
  );

  const typedPreview = useMemo(() => {
    if (!targetShark) {
      return { completed: '', remaining: '' };
    }
    return {
      completed: targetShark.typed,
      remaining: targetShark.word.slice(targetShark.typed.length),
    };
  }, [targetShark]);

  const startGame = useCallback(() => {
    resetGame();
    setGamePhase('playing');
  }, [resetGame]);

  const resumeGame = useCallback(() => {
    setGamePhase('playing');
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Hud
        stats={stats}
        typedPreview={typedPreview}
        isPaused={gamePhase !== 'playing'}
      />
      <main className="relative flex flex-1 flex-col">
        <OceanScene sharks={sharks} targetId={targetId} />
        <section className="relative z-10 bg-black/20 px-6 py-12 backdrop-blur-lg">
          <div className="mx-auto max-w-4xl space-y-6 text-base leading-relaxed">
            <h2 className="font-heading text-3xl font-bold text-kelp">
              Nhiệm vụ thợ săn kho báu
            </h2>
            <p>
              Gõ chính xác từng từ tiếng Việt để phóng lao âm thanh vào bầy cá mập
              3D đang lao đến. Càng nhiều combo, điểm thưởng càng lớn và tốc độ ra
              quân càng nhanh!
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-hud">
                <h3 className="font-heading text-xl font-semibold text-coral">
                  Điều khiển
                </h3>
                <ul className="mt-3 space-y-1 text-sm">
                  <li>Gõ ký tự có dấu chính xác.</li>
                  <li>Backspace để xóa, Esc để tạm dừng.</li>
                  <li>Enter để bắt đầu hoặc chơi lại.</li>
                </ul>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-hud">
                <h3 className="font-heading text-xl font-semibold text-coral">
                  Lưu ý</h3>
                <ul className="mt-3 space-y-1 text-sm">
                  <li>Combo cao mở khóa cấp độ mới.</li>
                  <li>Đừng để cá mập chạm vào tàu!</li>
                  <li>Chế độ giảm chuyển động được hỗ trợ.</li>
                </ul>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-hud">
                <h3 className="font-heading text-xl font-semibold text-coral">
                  Bối cảnh</h3>
                <p className="mt-3 text-sm">
                  Hành trình lấy cảm hứng từ Typer Shark Deluxe, nay tái sinh với giao
                  diện React, Three.js và Tailwind CSS để mang đại dương vào trình
                  duyệt của bạn.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>

      {gamePhase === 'start' && (
        <Overlay
          title="Typer Shark Deluxe 3D"
          description="Thợ săn kho báu Việt Nam đã sẵn sàng? Gõ đúng từng từ để đánh bại lũ cá mập 3D trước khi chúng phá hủy tàu lặn."
          actions={[{ label: 'Bắt đầu cuộc lặn', onClick: startGame }]}
        />
      )}

      {gamePhase === 'paused' && (
        <Overlay
          title="Tạm dừng"
          description="Nghỉ tay đôi chút và nhấn tiếp tục để trở lại đại dương."
          actions={[
            { label: 'Tiếp tục', onClick: resumeGame },
            { label: 'Kết thúc', onClick: finishGame },
          ]}
        />
      )}

      {gamePhase === 'gameover' && (
        <Overlay
          title="Hết hơi rồi!"
          description={`Bạn đã săn được ${defeatsRef.current} cá mập với ${stats.score.toLocaleString('vi-VN')} điểm.`}
          actions={[{ label: 'Chơi lại', onClick: startGame }]}
        />
      )}

      <footer className="relative z-10 border-t border-white/10 bg-black/40 py-6 text-center text-xs tracking-wide text-white/70">
        Dự án demo: Typer Shark Deluxe 3D tiếng Việt xây dựng bằng React, Three.js và Tailwind CSS.
      </footer>
    </div>
  );
}

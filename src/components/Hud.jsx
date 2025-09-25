import PropTypes from 'prop-types';

const hearts = (count) =>
  Array.from({ length: count }, (_, index) => (
    <span key={index} className="text-lg text-coral">
      ❤
    </span>
  ));


export default function Hud({ stats, typedPreview, gamePhase }) {

  return (
    <header className="relative z-20 border-b border-white/10 bg-black/40 px-6 py-5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-white/60">
            Typer Shark Deluxe 3D
          </p>
          <h1 className="font-heading text-3xl font-bold">Chuyến lặn săn kho báu</h1>
          <p className="text-xs text-white/60">
            Gõ tiếng Việt thật chuẩn để dập tắt bầy cá mập hung hãn dưới đại dương.
          </p>
        </div>
        <dl className="grid flex-1 grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div className="rounded-2xl bg-white/10 p-3 text-center shadow-hud">
            <dt className="text-xs uppercase tracking-wide text-white/60">Điểm</dt>
            <dd className="mt-1 text-2xl font-semibold text-kelp">
              {stats.score.toLocaleString('vi-VN')}
            </dd>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center shadow-hud">
            <dt className="text-xs uppercase tracking-wide text-white/60">Mạng</dt>
            <dd className="mt-1 flex items-center justify-center gap-1 text-lg font-semibold">
              {hearts(stats.lives)}
            </dd>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center shadow-hud">
            <dt className="text-xs uppercase tracking-wide text-white/60">Cấp độ</dt>
            <dd className="mt-1 text-2xl font-semibold text-coral">{stats.level}</dd>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-center shadow-hud">
            <dt className="text-xs uppercase tracking-wide text-white/60">Combo</dt>
            <dd className="mt-1 text-2xl font-semibold text-coral">x{stats.combo}</dd>
          </div>
        </dl>
      </div>
      <div className="mx-auto mt-4 flex max-w-4xl items-center justify-between rounded-2xl border border-white/10 bg-ocean-800/70 px-4 py-3">
        <div className="text-sm">
          <p className="font-heading text-xs uppercase tracking-[0.2em] text-white/50">
            Bạn đang gõ
          </p>
          {typedPreview.completed || typedPreview.remaining ? (
            <p className="mt-1 font-mono text-lg">
              <span className="text-kelp">
                {typedPreview.completed || '\u200B'}
              </span>
              <span className="text-white/50">{typedPreview.remaining}</span>
            </p>
          ) : (

            <div className="mt-3 h-6" aria-hidden="true" />
          )}
        </div>
        <div className="hidden text-right text-xs text-white/50 sm:block">
          {gamePhase === 'paused' && <p className="text-kelp">Đang tạm dừng…</p>}

        </div>
      </div>
    </header>
  );
}

Hud.propTypes = {
  stats: PropTypes.shape({
    score: PropTypes.number.isRequired,
    lives: PropTypes.number.isRequired,
    level: PropTypes.number.isRequired,
    combo: PropTypes.number.isRequired,
  }).isRequired,
  typedPreview: PropTypes.shape({
    completed: PropTypes.string.isRequired,
    remaining: PropTypes.string.isRequired,
  }).isRequired,

  gamePhase: PropTypes.oneOf(['start', 'playing', 'paused', 'gameover']).isRequired,

};

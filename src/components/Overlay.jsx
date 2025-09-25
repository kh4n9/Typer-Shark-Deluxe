import PropTypes from 'prop-types';
import clsx from 'clsx';

export default function Overlay({ title, description, actions }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-6 w-full max-w-xl rounded-3xl border border-white/15 bg-ocean-800/90 p-10 text-center shadow-hud">
        <h2 className="font-heading text-3xl font-bold text-kelp">{title}</h2>
        <p className="mt-4 text-sm leading-relaxed text-white/80">{description}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {actions.map(({ label, onClick, variant = 'primary' }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className={clsx(
                'rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-kelp focus-visible:ring-offset-2 focus-visible:ring-offset-ocean-900',
                variant === 'primary'
                  ? 'bg-kelp text-ocean-900 hover:bg-kelp/90'
                  : 'bg-white/10 text-white hover:bg-white/20'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Overlay.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.oneOf(['primary', 'ghost']),
    })
  ).isRequired,
};

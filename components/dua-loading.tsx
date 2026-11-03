/**
 * DUA+ loading indicator. Server-safe (no hooks, plain JSX).
 *
 * The character art lives only in `.dua-loading__runner` (see styles/components.css);
 * the running sprite can replace it later without changing this API.
 */
export type DuaLoadingSize = 'sm' | 'md' | 'lg';

export type DuaLoadingProps = {
  /** Screen-reader text; shown visually only when `inline`. */
  label?: string;
  /** sm ≈ 28px (inside buttons), md ≈ 72px, lg ≈ 120px. */
  size?: DuaLoadingSize;
  /** Lay out horizontally with the label visible (e.g. inside a button). */
  inline?: boolean;
};

/** Single place for the loading art; swap for the sprite sheet later. */
export const DUA_LOADING_ART = '/assets/characters/dua.1.png';

export function DuaLoading({label = '載入中…', size = 'md', inline = false}: DuaLoadingProps = {}) {
  const className = 'dua-loading dua-loading--' + size + (inline ? ' dua-loading--inline' : '');
  return (
    <span className={className} role="status" aria-live="polite">
      <span className="dua-loading__stage" aria-hidden="true">
        <span className="dua-loading__shadow" />
        <img className="dua-loading__runner" src={DUA_LOADING_ART} alt="" aria-hidden="true" decoding="async" />
      </span>
      <span className="dua-loading__text" aria-hidden="true">Loading...</span>
      <span className="dua-loading__static" aria-hidden="true">載入中…</span>
      <span className={inline ? 'dua-loading__label' : 'dua-loading__label dua-visually-hidden'}>{label}</span>
    </span>
  );
}

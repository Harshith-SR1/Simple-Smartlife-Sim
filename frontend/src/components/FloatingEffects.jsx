export default function FloatingEffects({ effects = [] }) {
  if (!effects.length) return null;

  return (
    <div className="floating-effects" aria-live="polite">
      {effects.map((effect) => (
        <div key={effect.id} className={`floating-effect ${effect.tone || 'neutral'}`}>
          {effect.text}
        </div>
      ))}
    </div>
  );
}

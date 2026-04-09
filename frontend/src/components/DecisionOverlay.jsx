import { useEffect, useState } from 'react';

export default function DecisionOverlay({ event }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!event) return undefined;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(timer);
  }, [event]);

  if (!event || !visible) return null;

  return (
    <div className="decision-overlay" role="status" aria-live="polite">
      <div><span>Reason</span><p>{event.reason}</p></div>
      <div><span>Action</span><p>{event.action}</p></div>
      <div><span>Effect</span><p>{event.effect}</p></div>
    </div>
  );
}

import { Billboard, Text } from '@react-three/drei';

const COLORS = {
  morning: '#ffd58f',
  afternoon: '#fff2bf',
  evening: '#ffb36b',
  night: '#dbeafe',
};

export default function TimeSystem({ timeOfDay = 'morning', day = 1 }) {
  const isNight = timeOfDay === 'night';
  const bodyColor = COLORS[timeOfDay] || COLORS.morning;
  const bodyPosition = timeOfDay === 'morning'
    ? [18, 20, -26]
    : timeOfDay === 'afternoon'
      ? [0, 28, -36]
      : timeOfDay === 'evening'
        ? [-20, 16, -26]
        : [18, 24, -30];

  return (
    <group>
      <mesh position={bodyPosition}>
        <sphereGeometry args={[2.8, 24, 24]} />
        <meshStandardMaterial color={bodyColor} emissive={bodyColor} emissiveIntensity={isNight ? 0.4 : 0.2} />
      </mesh>
      {isNight ? (
        <>
          <mesh position={[-20, 23, -35]}>
            <sphereGeometry args={[1.7, 18, 18]} />
            <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.35} />
          </mesh>
          {Array.from({ length: 18 }, (_, index) => (
            <mesh key={`star-${index}`} position={[-26 + (index % 6) * 8, 18 + Math.floor(index / 6) * 4, -32 - (index % 3) * 3]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.65} />
            </mesh>
          ))}
        </>
      ) : null}

      <Billboard position={[-22, 8, 18]}>
        <Text fontSize={0.9} color="#f8fafc" anchorX="left" anchorY="middle" outlineColor="#0f172a" outlineWidth={0.04}>
          {`Day ${day} - ${timeOfDay}`}
        </Text>
      </Billboard>
    </group>
  );
}

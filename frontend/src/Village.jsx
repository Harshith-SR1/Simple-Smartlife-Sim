import { snap } from './systems/navigation';

// CENTRAL CITY (at 0, 0)
const CENTRAL_CITY_HUTS = [
  [-25, -15], [0, -15], [25, -15],
  [-25, 0], [0, 0], [25, 0],
  [-25, 15], [0, 15], [25, 15],
  [-40, -30], [40, -30], [-40, 30], [40, 30],
];

// NORTH VILLAGE (at 0, -220)
const NORTH_VILLAGE_HUTS = [
  // Main settlement ring
  [-60, -220], [-30, -220], [0, -220], [30, -220], [60, -220],
  [-60, -200], [-30, -200], [0, -200], [30, -200], [60, -200],
  [-80, -240], [-40, -240], [0, -240], [40, -240], [80, -240],
  [-50, -180], [0, -180], [50, -180],
  [-70, -260], [35, -260],
  [-40, -170], [40, -170],
  // Expand north - additional rings
  [-75, -280], [-45, -280], [-15, -280], [15, -280], [45, -280], [75, -280],
  [-75, -300], [-45, -300], [-15, -300], [15, -300], [45, -300], [75, -300],
  [-75, -320], [-45, -320], [-15, -320], [15, -320], [45, -320], [75, -320],
  [-60, -340], [0, -340], [60, -340],
  // East-west expansion
  [-90, -220], [90, -220],
  [-95, -240], [95, -240],
  [-90, -260], [90, -260],
  [-85, -300], [85, -300],
  // Fill middle
  [-20, -270], [20, -270],
  [-30, -310], [30, -310],
];

// SOUTH VILLAGE (at 0, 220)
const SOUTH_VILLAGE_HUTS = [
  // Main settlement ring
  [-60, 220], [-30, 220], [0, 220], [30, 220], [60, 220],
  [-60, 200], [-30, 200], [0, 200], [30, 200], [60, 200],
  [-80, 240], [-40, 240], [0, 240], [40, 240], [80, 240],
  [-50, 180], [0, 180], [50, 180],
  [-70, 260], [35, 260],
  [-40, 170], [40, 170],
  // Expand south - additional rings
  [-75, 280], [-45, 280], [-15, 280], [15, 280], [45, 280], [75, 280],
  [-75, 300], [-45, 300], [-15, 300], [15, 300], [45, 300], [75, 300],
  [-75, 320], [-45, 320], [-15, 320], [15, 320], [45, 320], [75, 320],
  [-60, 340], [0, 340], [60, 340],
  // East-west expansion
  [-90, 220], [90, 220],
  [-95, 240], [95, 240],
  [-90, 260], [90, 260],
  [-85, 300], [85, 300],
  // Fill middle
  [-20, 270], [20, 270],
  [-30, 310], [30, 310],
];

// EAST VILLAGE (at 220, 0)
const EAST_VILLAGE_HUTS = [
  [220, -60], [220, -30], [220, 0], [220, 30], [220, 60],
  [200, -60], [200, -30], [200, 0], [200, 30], [200, 60],
  [240, -80], [240, -40], [240, 0], [240, 40], [240, 80],
  [180, -50], [180, 0], [180, 50],
  [260, -70], [260, 35],
  [170, -40], [170, 40],
  // Expand east - additional rings
  [280, -70], [280, -40], [280, -10], [280, 20], [280, 50], [280, 80],
  [300, -70], [300, -40], [300, -10], [300, 20], [300, 50], [300, 80],
  [320, -70], [320, -40], [320, -10], [320, 20], [320, 50], [320, 80],
  [340, -50], [340, 0], [340, 50],
  // North-south expansion
  [220, -100], [220, 100],
  [240, -110], [240, 110],
  [260, -90], [260, 90],
  [300, -90], [300, 90],
  // Fill middle
  [270, -30], [270, 30],
  [310, -60], [310, 60],
];

// WEST VILLAGE (at -220, 0)
const WEST_VILLAGE_HUTS = [
  [-220, -60], [-220, -30], [-220, 0], [-220, 30], [-220, 60],
  [-200, -60], [-200, -30], [-200, 0], [-200, 30], [-200, 60],
  [-240, -80], [-240, -40], [-240, 0], [-240, 40], [-240, 80],
  [-180, -50], [-180, 0], [-180, 50],
  [-260, -70], [-260, 35],
  [-170, -40], [-170, 40],
  // Expand west - additional rings
  [-280, -70], [-280, -40], [-280, -10], [-280, 20], [-280, 50], [-280, 80],
  [-300, -70], [-300, -40], [-300, -10], [-300, 20], [-300, 50], [-300, 80],
  [-320, -70], [-320, -40], [-320, -10], [-320, 20], [-320, 50], [-320, 80],
  [-340, -50], [-340, 0], [-340, 50],
  // North-south expansion
  [-220, -100], [-220, 100],
  [-240, -110], [-240, 110],
  [-260, -90], [-260, 90],
  [-300, -90], [-300, 90],
  // Fill middle
  [-270, -30], [-270, 30],
  [-310, -60], [-310, 60],
];

const HUT_LAYOUT = [
  ...CENTRAL_CITY_HUTS,
  ...NORTH_VILLAGE_HUTS,
  ...SOUTH_VILLAGE_HUTS,
  ...EAST_VILLAGE_HUTS,
  ...WEST_VILLAGE_HUTS,
];

// FIELDS distributed around villages
const FIELD_LAYOUT = [
  // Central fields (expanded)
  [-70, -60, 22, 16, '#8b5d2a'],
  [-70, 60, 22, 16, '#a16207'],
  [70, -60, 22, 16, '#92400e'],
  [70, 60, 22, 16, '#8b5d2a'],
  [-50, -40, 18, 12, '#a16207'],
  [-50, 40, 18, 12, '#92400e'],
  [50, -40, 18, 12, '#7c4a24'],
  [50, 40, 18, 12, '#8b5d2a'],
  
  // North village fields (expanded)
  [-90, -290, 28, 20, '#8b5d2a'],
  [-40, -290, 28, 20, '#a16207'],
  [10, -290, 28, 20, '#92400e'],
  [60, -290, 28, 20, '#7c4a24'],
  [-90, -150, 28, 20, '#8b5d2a'],
  [-40, -150, 28, 20, '#a16207'],
  [10, -150, 28, 20, '#92400e'],
  [60, -150, 28, 20, '#7c4a24'],
  [-65, -315, 20, 15, '#8b5d2a'],
  [35, -315, 20, 15, '#a16207'],
  
  // Extra north fields to fill upper area
  [-85, -360, 30, 22, '#92400e'],
  [0, -360, 30, 22, '#8b5d2a'],
  [85, -360, 30, 22, '#a16207'],
  [-50, -340, 24, 18, '#7c4a24'],
  [50, -340, 24, 18, '#8b5d2a'],
  [-85, -380, 28, 20, '#a16207'],
  [15, -380, 28, 20, '#92400e'],
  
  // South village fields (greatly expanded)
  [-90, 290, 28, 20, '#92400e'],
  [-40, 290, 28, 20, '#8b5d2a'],
  [10, 290, 28, 20, '#a16207'],
  [60, 290, 28, 20, '#7c4a24'],
  [-90, 150, 28, 20, '#8b5d2a'],
  [-40, 150, 28, 20, '#a16207'],
  [10, 150, 28, 20, '#92400e'],
  [60, 150, 28, 20, '#7c4a24'],
  [-65, 315, 20, 15, '#92400e'],
  [35, 315, 20, 15, '#8b5d2a'],
  // Extra south fields to fill lower area
  [-85, 360, 30, 22, '#8b5d2a'],
  [0, 360, 30, 22, '#a16207'],
  [85, 360, 30, 22, '#92400e'],
  [-50, 340, 24, 18, '#7c4a24'],
  [50, 340, 24, 18, '#a16207'],
  [-85, 380, 28, 20, '#92400e'],
  [15, 380, 28, 20, '#8b5d2a'],
  
  // East village fields (expanded)
  [290, -90, 28, 20, '#a16207'],
  [290, -40, 28, 20, '#92400e'],
  [290, 10, 28, 20, '#8b5d2a'],
  [290, 60, 28, 20, '#7c4a24'],
  [150, -90, 28, 20, '#8b5d2a'],
  [150, -40, 28, 20, '#a16207'],
  [150, 10, 28, 20, '#92400e'],
  [150, 60, 28, 20, '#7c4a24'],
  [315, -65, 20, 15, '#a16207'],
  [315, 35, 20, 15, '#92400e'],
    // Extra east fields to fill right area
    [360, -80, 30, 22, '#8b5d2a'],
    [360, 0, 30, 22, '#a16207'],
    [360, 80, 30, 22, '#92400e'],
    [340, -50, 24, 18, '#7c4a24'],
    [340, 50, 24, 18, '#8b5d2a'],
    [380, -70, 28, 20, '#a16207'],
    [380, 20, 28, 20, '#92400e'],
  
  // West village fields (expanded)
  [-290, -90, 28, 20, '#92400e'],
  [-290, -40, 28, 20, '#8b5d2a'],
  [-290, 10, 28, 20, '#a16207'],
  [-290, 60, 28, 20, '#7c4a24'],
  [-150, -90, 28, 20, '#8b5d2a'],
  [-150, -40, 28, 20, '#a16207'],
  [-150, 10, 28, 20, '#92400e'],
  [-150, 60, 28, 20, '#7c4a24'],
  [-315, -65, 20, 15, '#92400e'],
  [-315, 35, 20, 15, '#8b5d2a'],
  // Extra west fields to fill left area
  [-360, -80, 30, 22, '#92400e'],
  [-360, 0, 30, 22, '#8b5d2a'],
  [-360, 80, 30, 22, '#a16207'],
  [-340, -50, 24, 18, '#7c4a24'],
  [-340, 50, 24, 18, '#a16207'],
  [-380, -70, 28, 20, '#92400e'],
  [-380, 20, 28, 20, '#8b5d2a'],
];

const LAKE_LAYOUT = [
  // Central lakes
  [-90, 0, 16, 12],
  [90, 0, 16, 12],
  [0, -270, 16, 12],     // North
  [0, 270, 16, 12],      // South
  [270, 0, 16, 12],      // East
  [-270, 0, 16, 12],     // West
  // Additional lakes in villages
  [-80, -260, 12, 9],
  [80, -260, 12, 9],
  [-80, 260, 12, 9],
  [80, 260, 12, 9],
  [260, -80, 12, 9],
  [260, 80, 12, 9],
  [-260, -80, 12, 9],
  [-260, 80, 12, 9],
];

// Main roads connecting all villages through center city
const MUD_ROADS = [
  // Primary inter-village roads (cross-shaped backbone)
  [0, 0, 780, 6.2, 0],
  [0, 0, 780, 6.2, Math.PI / 2],

  // Connect city center to each village cluster and farm belt
  [0, -120, 240, 5.0, Math.PI / 2],
  [0, 120, 240, 5.0, Math.PI / 2],
  [120, 0, 240, 5.0, 0],
  [-120, 0, 240, 5.0, 0],
  [0, -40, 140, 4.6, Math.PI / 2],

  // North village internal network (house-to-house)
  [0, -200, 190, 4.2, 0],
  [0, -240, 210, 4.0, 0],
  [0, -280, 220, 3.8, 0],
  [0, -320, 200, 3.6, 0],
  [-60, -255, 180, 3.6, Math.PI / 2],
  [-20, -255, 180, 3.6, Math.PI / 2],
  [20, -255, 180, 3.6, Math.PI / 2],
  [60, -255, 180, 3.6, Math.PI / 2],

  // South village internal network (house-to-house)
  [0, 200, 190, 4.2, 0],
  [0, 240, 210, 4.0, 0],
  [0, 280, 220, 3.8, 0],
  [0, 320, 200, 3.6, 0],
  [-60, 255, 180, 3.6, Math.PI / 2],
  [-20, 255, 180, 3.6, Math.PI / 2],
  [20, 255, 180, 3.6, Math.PI / 2],
  [60, 255, 180, 3.6, Math.PI / 2],

  // East village internal network (house-to-house)
  [220, -80, 230, 4.0, Math.PI / 2],
  [260, -80, 230, 3.8, Math.PI / 2],
  [300, -80, 230, 3.6, Math.PI / 2],
  [220, 0, 190, 4.2, 0],
  [260, 0, 190, 4.0, 0],
  [300, 0, 170, 3.8, 0],

  // West village internal network (house-to-house)
  [-220, -80, 230, 4.0, Math.PI / 2],
  [-260, -80, 230, 3.8, Math.PI / 2],
  [-300, -80, 230, 3.6, Math.PI / 2],
  [-220, 0, 190, 4.2, 0],
  [-260, 0, 190, 4.0, 0],
  [-300, 0, 170, 3.8, 0],
];

const TREE_LAYOUT = [
  // Central city trees
  [-70, -40], [70, -40], [-70, 40], [70, 40],
  [-50, -60], [50, -60], [-50, 60], [50, 60],
  
  // North village trees (greatly expanded)
  [-100, -280], [-50, -290], [0, -300], [50, -290], [100, -280],
  [-80, -260], [0, -260], [80, -260],
  [-100, -150], [-50, -145], [0, -140], [50, -145], [100, -150],
  // Extra north trees
  [-110, -320], [-60, -330], [0, -340], [60, -330], [110, -320],
  [-90, -310], [30, -310], [90, -310],
  [-70, -360], [0, -370], [70, -360],
  [-110, -380], [-40, -390], [30, -390], [100, -380],
  [-80, -350], [80, -350],
  
  // South village trees (greatly expanded)
  [-100, 280], [-50, 290], [0, 300], [50, 290], [100, 280],
  [-80, 260], [0, 260], [80, 260],
  [-100, 150], [-50, 145], [0, 140], [50, 145], [100, 150],
  // Extra south trees
  [-110, 320], [-60, 330], [0, 340], [60, 330], [110, 320],
  [-90, 310], [30, 310], [90, 310],
  [-70, 360], [0, 370], [70, 360],
  [-110, 380], [-40, 390], [30, 390], [100, 380],
  [-80, 350], [80, 350],
  
  // East village trees
  [280, -100], [290, -50], [300, 0], [290, 50], [280, 100],
  [260, -80], [260, 0], [260, 80],
  [150, -100], [145, -50], [140, 0], [145, 50], [150, 100],
    // Extra east trees
    [320, -110], [330, -60], [340, 0], [330, 60], [320, 110],
    [310, -85], [310, 0], [310, 85],
    [350, -95], [360, -40], [360, 40], [350, 95],
    [370, -70], [375, 0], [370, 70],
    [340, -50], [300, 0], [340, 50],
  
  // West village trees
  [-280, -100], [-290, -50], [-300, 0], [-290, 50], [-280, 100],
  [-260, -80], [-260, 0], [-260, 80],
  [-150, -100], [-145, -50], [-140, 0], [-145, 50], [-150, 100],
    // Extra west trees
    [-320, -110], [-330, -60], [-340, 0], [-330, 60], [-320, 110],
    [-310, -85], [-310, 0], [-310, 85],
    [-350, -95], [-360, -40], [-360, 40], [-350, 95],
    [-370, -70], [-375, 0], [-370, 70],
    [-340, -50], [-300, 0], [-340, 50],
  
  // Central area scattered trees
  [-45, -70], [45, -70], [-45, 70], [45, 70],
  [-120, -30], [120, -30], [-120, 30], [120, 30],
  [-30, -120], [30, -120], [-30, 120], [30, 120],
];

const EXTRA_TREE_LAYOUT = (() => {
  const points = [];

  for (let x = -420; x <= 420; x += 32) {
    for (let z = -420; z <= 420; z += 32) {
      const inCentralCity = Math.abs(x) < 130 && Math.abs(z) < 130;
      const inInnerCorridor = Math.abs(x) < 70 && Math.abs(z) < 240;
      const inHorizontalCorridor = Math.abs(z) < 70 && Math.abs(x) < 240;

      if (inCentralCity || inInnerCorridor || inHorizontalCorridor) {
        continue;
      }

      const jitterX = Math.round(Math.sin(x * 0.13 + z * 0.07) * 6);
      const jitterZ = Math.round(Math.cos(z * 0.11 - x * 0.05) * 6);
      points.push([x + jitterX, z + jitterZ]);
    }
  }

  return points;
})();

const BUSH_LAYOUT = [
  [-120, -260], [-90, -250], [-60, -240], [-30, -245], [0, -250], [30, -245], [60, -240], [90, -250], [120, -260],
  [-120, 260], [-90, 250], [-60, 240], [-30, 245], [0, 250], [30, 245], [60, 240], [90, 250], [120, 260],
  [260, -120], [250, -90], [240, -60], [245, -30], [250, 0], [245, 30], [240, 60], [250, 90], [260, 120],
  [-260, -120], [-250, -90], [-240, -60], [-245, -30], [-250, 0], [-245, 30], [-240, 60], [-250, 90], [-260, 120],
  [-180, -180], [180, -180], [-180, 180], [180, 180],
  [-60, -80], [60, -80], [-60, 80], [60, 80],
];

const VILLAGER_LAYOUT = [
  [-70, -220], [-35, -250], [20, -230], [65, -210],
  [-60, 220], [-25, 250], [30, 235], [70, 215],
  [210, -60], [240, 20], [285, 65],
  [-210, -50], [-245, 30], [-280, -10],
  [0, -300], [0, 300], [300, 0], [-300, 0],
];

const VILLAGE_CATTLE_LAYOUT = [
  [-90, -200], [-75, -235], [95, -210], [80, -250],
  [-85, 200], [-70, 240], [90, 210], [75, 250],
  [220, -100], [260, 80],
  [-220, 95], [-260, -70],
];

const VILLAGE_HOTSPOTS = [
  [0, -250, 220, 4, 220],
  [0, 250, 220, 4, 220],
  [250, 0, 220, 4, 220],
  [-250, 0, 220, 4, 220],
];

const EXTRA_VILLAGER_LAYOUT = HUT_LAYOUT
  .filter(([x, z], index) => (Math.abs(x) > 120 || Math.abs(z) > 120) && index % 3 === 0)
  .map(([x, z], index) => [x + (index % 2 === 0 ? 3 : -3), z + (index % 4 < 2 ? 2 : -2)]);

const EXTRA_CATTLE_LAYOUT = FIELD_LAYOUT
  .filter(([x, z], index) => (Math.abs(x) > 140 || Math.abs(z) > 140) && index % 8 === 0)
  .map(([x, z], index) => [x + (index % 2 === 0 ? 4 : -4), z + (index % 3 === 0 ? 3 : -3)]);

const DENSE_VILLAGER_LAYOUT = HUT_LAYOUT
  .filter(([x, z], index) => (Math.abs(x) > 140 || Math.abs(z) > 140) && index % 2 === 0)
  .map(([x, z], index) => [
    x + (index % 4 < 2 ? 2 : -2),
    z + (index % 3 === 0 ? 2 : -2),
  ]);

const DENSE_CATTLE_LAYOUT = FIELD_LAYOUT
  .filter(([x, z], index) => (Math.abs(x) > 160 || Math.abs(z) > 160) && index % 5 === 0)
  .map(([x, z], index) => [
    x + (index % 2 === 0 ? 6 : -6),
    z + (index % 3 === 0 ? 5 : -5),
  ]);

const POND_LAYOUT = [
  // Larger ponds placed in open land near villages (outside core settlements)
  [-220, -370, 34, 24], [0, -390, 40, 28], [220, -370, 34, 24],
  [-220, 370, 34, 24], [0, 390, 40, 28], [220, 370, 34, 24],
  [390, -220, 28, 20], [410, 0, 42, 30], [390, 220, 28, 20],
  [-390, -220, 28, 20], [-410, 0, 42, 30], [-390, 220, 28, 20],
  [-320, -320, 26, 18], [320, -320, 26, 18],
  [-320, 320, 26, 18], [320, 320, 26, 18],
];

function Hut({ x, z }) {
  return (
    <group position={[snap(x), 0, snap(z)]}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[6, 2.4, 6]} />
        <meshStandardMaterial color="#b8854f" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.0, 0]} castShadow>
        <coneGeometry args={[4.8, 1.8, 4]} />
        <meshStandardMaterial color="#7c4a24" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.7, 3.1]}>
        <boxGeometry args={[1.4, 1.4, 0.2]} />
        <meshStandardMaterial color="#4a2f1a" roughness={0.86} />
      </mesh>
    </group>
  );
}

function BambooFence({ width, depth }) {
  const color = '#8b6a43';
  return (
    <group>
      <mesh position={[0, 0.55, -depth / 2]} castShadow>
        <boxGeometry args={[width, 0.15, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.95, -depth / 2]} castShadow>
        <boxGeometry args={[width, 0.12, 0.18]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.55, depth / 2]} castShadow>
        <boxGeometry args={[width, 0.15, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.95, depth / 2]} castShadow>
        <boxGeometry args={[width, 0.12, 0.18]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[-width / 2, 0.55, 0]} castShadow>
        <boxGeometry args={[0.22, 0.15, depth]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[-width / 2, 0.95, 0]} castShadow>
        <boxGeometry args={[0.18, 0.12, depth]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[width / 2, 0.55, 0]} castShadow>
        <boxGeometry args={[0.22, 0.15, depth]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[width / 2, 0.95, 0]} castShadow>
        <boxGeometry args={[0.18, 0.12, depth]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  );
}

function MudRoad({ position, size, rotation = 0 }) {
  return (
    <mesh position={[position[0], position[1], position[2]]} rotation={[0, rotation, 0]} receiveShadow>
      <boxGeometry args={[size[0], 0.06, size[1]]} />
      <meshStandardMaterial color="#6f4b2f" roughness={1} />
    </mesh>
  );
}

function Tree({ x, z, scale = 1 }) {
  return (
    <group position={[snap(x), 0, snap(z)]} scale={scale}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.26, 2.2, 8]} />
        <meshStandardMaterial color="#5b4631" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.8, 0]} castShadow>
        <sphereGeometry args={[1.15, 12, 12]} />
        <meshStandardMaterial color="#2f6d33" roughness={0.84} />
      </mesh>
      <mesh position={[0.45, 2.4, -0.15]} castShadow>
        <sphereGeometry args={[0.7, 10, 10]} />
        <meshStandardMaterial color="#356f38" roughness={0.84} />
      </mesh>
    </group>
  );
}

function Lake({ position, size }) {
  return (
    <group position={position} scale={[size[0] / 10, 1, size[1] / 10]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial color="#2a6f8f" roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.2, 32]} />
        <meshStandardMaterial color="#4aa3c7" roughness={0.25} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function Bush({ x, z }) {
  return (
    <group position={[snap(x), 0, snap(z)]}>
      <mesh position={[0, 0.46, 0]} castShadow>
        <sphereGeometry args={[0.55, 10, 10]} />
        <meshStandardMaterial color="#2f7a34" roughness={0.9} />
      </mesh>
      <mesh position={[0.38, 0.36, -0.16]} castShadow>
        <sphereGeometry args={[0.34, 8, 8]} />
        <meshStandardMaterial color="#2d6e30" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Villager({ x, z, color = '#2563eb' }) {
  return (
    <group position={[snap(x), 0, snap(z)]}>
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.7, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.78} />
      </mesh>
      <mesh position={[0, 1.56, 0]} castShadow>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#efc7a8" roughness={0.82} />
      </mesh>
    </group>
  );
}

function VillageCattle({ x, z, rotation = 0 }) {
  return (
    <group position={[snap(x), 0, snap(z)]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.4, 0.8, 0.56]} />
        <meshStandardMaterial color="#d4b08b" roughness={0.9} />
      </mesh>
      <mesh position={[0.78, 0.56, 0]} castShadow>
        <boxGeometry args={[0.42, 0.44, 0.38]} />
        <meshStandardMaterial color="#c79f77" roughness={0.9} />
      </mesh>
      {[-0.42, 0.42].flatMap((lx) => [-0.18, 0.18].map((lz) => (
        <mesh key={`leg-${lx}-${lz}`} position={[lx, 0.18, lz]} castShadow>
          <boxGeometry args={[0.12, 0.34, 0.12]} />
          <meshStandardMaterial color="#7a5738" roughness={0.92} />
        </mesh>
      )))}
    </group>
  );
}

export default function Village({ position = [0, 0, 0], onVillageSelect = () => {} }) {
  const basePosition = [snap(position[0]), 0, snap(position[2])];

  return (
    <group position={basePosition}>
      {VILLAGE_HOTSPOTS.map(([x, z, w, h, d], index) => (
        <mesh
          key={`village-hotspot-${index}`}
          position={[x, h / 2, z]}
          onClick={(event) => {
            onVillageSelect({
              id: 'VILLAGE',
              target: [basePosition[0] + x, 0, basePosition[2] + z],
            });
          }}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default';
          }}
        >
          <boxGeometry args={[w, h, d]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}

      {/* Main base terrain - green village landscape */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[920, 920]} />
        <meshStandardMaterial color="#7aa35c" roughness={0.99} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0]} receiveShadow>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial color="#86ad64" roughness={0.99} transparent opacity={0.75} />
      </mesh>

      {POND_LAYOUT.map(([x, z, width, depth], index) => (
        <Lake key={`pond-${index}`} position={[x, 0.018, z]} size={[width, depth]} />
      ))}

      {MUD_ROADS.map(([x, z, width, depth, rotation], index) => (
        <MudRoad
          key={`mud-road-${index}`}
          position={[x, 0.028, z]}
          size={[width, depth]}
          rotation={rotation}
        />
      ))}

      {HUT_LAYOUT.map(([x, z], index) => (
        <Hut key={`hut-${index}`} x={x} z={z} />
      ))}

      {LAKE_LAYOUT.map(([x, z, width, depth], index) => (
        <Lake key={`lake-${index}`} position={[x, 0.02, z]} size={[width, depth]} />
      ))}

      {[-42, -20, 0, 22, 44].map((x) => (
        <group key={`tractor-${x}`} position={[x, 0, 34]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[2.2, 0.7, 1.3]} />
            <meshStandardMaterial color="#dc2626" roughness={0.8} />
          </mesh>
          <mesh position={[0.7, 0.85, 0]} castShadow>
            <boxGeometry args={[0.9, 0.6, 0.9]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.8} />
          </mesh>
          <mesh position={[-0.95, 0.2, 0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.28, 12]} />
            <meshStandardMaterial color="#111827" roughness={0.95} />
          </mesh>
          <mesh position={[0.9, 0.2, 0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.22, 12]} />
            <meshStandardMaterial color="#111827" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {[-42, -22, -6, 10, 26, 42].map((x) => (
        <mesh key={`cattle-${x}`} position={[x, 0, -6]} castShadow>
          <boxGeometry args={[1.4, 1, 0.55]} />
          <meshStandardMaterial color="#d6b18c" roughness={0.92} />
        </mesh>
      ))}

      {TREE_LAYOUT.map(([x, z], index) => (
        <Tree key={`tree-${index}`} x={x} z={z} scale={index % 4 === 0 ? 1.25 : 1} />
      ))}

      {EXTRA_TREE_LAYOUT.map(([x, z], index) => (
        <Tree key={`extra-tree-${index}`} x={x} z={z} scale={index % 5 === 0 ? 1.2 : index % 2 === 0 ? 1.0 : 0.9} />
      ))}

      {BUSH_LAYOUT.map(([x, z], index) => (
        <Bush key={`bush-${index}`} x={x} z={z} />
      ))}

      {VILLAGER_LAYOUT.map(([x, z], index) => (
        <Villager key={`villager-${index}`} x={x} z={z} color={index % 2 === 0 ? '#1d4ed8' : '#b45309'} />
      ))}

      {VILLAGE_CATTLE_LAYOUT.map(([x, z], index) => (
        <VillageCattle key={`village-cattle-${index}`} x={x} z={z} rotation={index % 2 === 0 ? 0.5 : -0.45} />
      ))}

      {EXTRA_VILLAGER_LAYOUT.map(([x, z], index) => (
        <Villager key={`extra-villager-${index}`} x={x} z={z} color={index % 2 === 0 ? '#0f766e' : '#7c2d12'} />
      ))}

      {EXTRA_CATTLE_LAYOUT.map(([x, z], index) => (
        <VillageCattle key={`extra-village-cattle-${index}`} x={x} z={z} rotation={index % 2 === 0 ? 0.3 : -0.35} />
      ))}

      {DENSE_VILLAGER_LAYOUT.map(([x, z], index) => (
        <Villager key={`dense-villager-${index}`} x={x} z={z} color={index % 2 === 0 ? '#0e7490' : '#9a3412'} />
      ))}

      {DENSE_CATTLE_LAYOUT.map(([x, z], index) => (
        <VillageCattle key={`dense-cattle-${index}`} x={x} z={z} rotation={index % 2 === 0 ? 0.22 : -0.22} />
      ))}

      {FIELD_LAYOUT.map(([x, z, width, depth, color], index) => (
        <mesh key={`field-${index}`} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial color={color} roughness={0.97} />
        </mesh>
      ))}

      {[-58, -30, -2, 26, 54].map((x) => (
        <mesh key={`field-strip-top-${x}`} position={[x, 0.02, -44]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[16, 8]} />
          <meshStandardMaterial color="#6d9f52" roughness={0.97} />
        </mesh>
      ))}

      {[-58, -30, -2, 26, 54].map((x) => (
        <mesh key={`field-strip-bottom-${x}`} position={[x, 0.02, 50]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[16, 8]} />
          <meshStandardMaterial color="#74a85a" roughness={0.97} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * SimulatedDataEngine — VenueIQ
 * Single source of truth for all simulated venue sensor data.
 * Replace the functions below with real sensor API calls when hardware is deployed.
 * UI code does NOT need to change — it only consumes the exported functions.
 */

// ── LIVE MATCH CONTEXT ─────────────────────────────────────────────────────
const MATCH_CONTEXT = {
  venue: 'Narendra Modi Stadium',
  city: 'Ahmedabad',
  capacity: 132000,
  matchPhase: 'SECOND_INNINGS',
  team1: 'Gujarat Titans',
  team2: 'Mumbai Indians',
  tournament: 'IPL 2026',
  matchNumber: 'Match 30 of 70',
  expectedOccupancy: 0.91,
  inningsBreakActive: false,
  nextBreakInMinutes: null,
};

// ── GT vs MI LIVE SCORECARD ────────────────────────────────────────────────
const LIVE_CRICKET_MATCH = {
  matchId: 'gt-vs-mi-apr20-2026',
  status: 'LIVE',
  tournament: 'Indian Premier League 2026',
  venue: 'Narendra Modi Stadium, Ahmedabad',
  matchNumber: 'Match 30 of 70',
  weather: { sky: 'Clear', temp: 'Hot', wind: 'None' },
  toss: 'GT won toss, elected to bowl',
  innings: [
    {
      number: 1,
      battingTeam: 'Mumbai Indians',
      bowlingTeam: 'Gujarat Titans',
      score: '199/5',
      overs: '20',
      runRate: '9.95',
      topBatters: [
        { name: 'Tilak Varma', runs: 101, balls: 45, fours: 8, sixes: 7, strikeRate: 224.44, status: 'not out' },
        { name: 'Naman Dhir', runs: 45, balls: 32, fours: 6, sixes: 1, strikeRate: 140.63, status: 'caught' },
        { name: 'Rohit Sharma', runs: 22, balls: 18, fours: 3, sixes: 0, strikeRate: 122.22, status: 'caught' },
        { name: 'Suryakumar Yadav', runs: 18, balls: 11, fours: 1, sixes: 2, strikeRate: 163.63, status: 'caught' },
        { name: 'Hardik Pandya', runs: 9, balls: 7, fours: 1, sixes: 0, strikeRate: 128.57, status: 'lbw' },
      ],
      topBowlers: [
        { name: 'Kagiso Rabada', overs: '4', runs: 33, wickets: 3, economy: '8.25' },
        { name: 'Mohammed Siraj', overs: '4', runs: 25, wickets: 1, economy: '6.25' },
        { name: 'Rashid Khan', overs: '4', runs: 28, wickets: 1, economy: '7.00' },
        { name: 'Shivam Dube', overs: '2', runs: 24, wickets: 0, economy: '12.00' },
      ],
    },
    {
      number: 2,
      battingTeam: 'Gujarat Titans',
      bowlingTeam: 'Mumbai Indians',
      score: '88/8',
      overs: '13',
      runRate: '6.62',
      requiredRunRate: '16.32',
      target: 200,
      toWin: { runs: 112, balls: 42 },
      currentBatters: [
        { name: 'Washington Sundar', runs: 18, balls: 9, fours: 4, sixes: 0, strikeRate: 200.0 },
        { name: 'Glenn Phillips', runs: 2, balls: 2, fours: 0, sixes: 0, strikeRate: 100.0 },
      ],
      currentBowlers: [
        { name: 'Jasprit Bumrah', overs: '2', runs: 11, wickets: 1, economy: '5.50' },
        { name: 'Hardik Pandya', overs: '1', runs: 18, wickets: 1, economy: '18.00' },
        { name: 'Ashwani Kumar', overs: '1', runs: 6, wickets: 1, economy: '6.00' },
        { name: 'Krish Bhagat', overs: '1.1', runs: 7, wickets: 0, economy: '6.00' },
      ],
      dismissed: [
        { name: 'Sai Sudharsan', runs: 0, balls: 1, dismissal: 'c Bhagat b Bumrah' },
        { name: 'Shubman Gill', runs: 14, balls: 10, dismissal: 'c Dhir b Ashwani' },
        { name: 'Jos Buttler', runs: 5, balls: 4, dismissal: 'lbw b Pandya' },
      ],
    },
  ],
  winProbability: { MI: 77, GT: 23 },
};

// ── GLOBAL LIVE MATCHES (BAN vs NZ ODI Series + others) ───────────────────
const GLOBAL_LIVE_MATCHES = [
  {
    id: 'ban-nz-odi3-2026',
    name: 'Bangladesh vs New Zealand',
    homeTeam: 'Bangladesh',
    awayTeam: 'New Zealand',
    homeScore: '241/8',
    awayScore: '187/4',
    status: 'LIVE',
    statusDetail: '2nd innings, 35.2 overs',
    venue: 'Sher-e-Bangla National Cricket Stadium',
    venueCity: 'Dhaka',
    venueCountry: 'Bangladesh',
    time: '10:00',
    league: 'BAN vs NZ ODI Series 2026',
    sport: 'Cricket',
    matchNumber: 'Match 3 of 3',
    seriesInfo: '3rd ODI — NZ trail by 54 runs (15 wkts in hand)',
    capacity: 25000,
    zones: [
      { zoneId: 'north', name: 'North Stand', capacity: 7000, baseOccupancy: 0.82 },
      { zoneId: 'south', name: 'South Stand', capacity: 8000, baseOccupancy: 0.75 },
      { zoneId: 'east', name: 'East Stand', capacity: 5000, baseOccupancy: 0.70 },
      { zoneId: 'west', name: 'West Stand (VIP)', capacity: 5000, baseOccupancy: 0.91 },
    ],
  },
  {
    id: 'gt-mi-ipl-2026',
    name: 'Gujarat Titans vs Mumbai Indians',
    homeTeam: 'Gujarat Titans',
    awayTeam: 'Mumbai Indians',
    homeScore: '42/3',
    awayScore: '199/5',
    status: 'LIVE',
    statusDetail: '2nd innings, 5.1 overs — GT chasing 200',
    venue: 'Narendra Modi Stadium',
    venueCity: 'Ahmedabad',
    venueCountry: 'India',
    time: '19:30',
    league: 'IPL 2026',
    sport: 'Cricket',
    matchNumber: 'Match 30 of 70',
    seriesInfo: 'MI 199/5 (20 ov) | GT 42/3 (5.1 ov) | Need 158 off 89 balls',
    capacity: 132000,
    zones: [
      { zoneId: 'north', name: 'Adani Pavilion', capacity: 35000, baseOccupancy: 0.89 },
      { zoneId: 'south', name: 'Reliance Stand', capacity: 32000, baseOccupancy: 0.93 },
      { zoneId: 'east', name: 'BCCI Stand', capacity: 35000, baseOccupancy: 0.88 },
      { zoneId: 'west', name: 'Pavilion End', capacity: 30000, baseOccupancy: 0.91 },
    ],
  },
];

// ── UPCOMING MATCHES ───────────────────────────────────────────────────────
const UPCOMING_MATCHES = [
  {
    id: 'srh-dc-ipl-2026',
    name: 'SRH vs DC',
    homeTeam: 'Sunrisers Hyderabad',
    awayTeam: 'Delhi Capitals',
    status: 'Upcoming',
    date: 'Apr 21, 2026',
    time: '19:30 IST',
    venue: 'Rajiv Gandhi International Stadium',
    city: 'Hyderabad',
    league: 'IPL 2026',
    sport: 'Cricket',
    matchNumber: 'Match 31 of 70',
  },
  {
    id: 'lq-qg-psl-2026',
    name: 'Lahore vs Quetta',
    homeTeam: 'Lahore Qalandars',
    awayTeam: 'Quetta Gladiators',
    status: 'Upcoming',
    date: 'Apr 21, 2026',
    time: '20:00 PKT',
    venue: 'Gaddafi Stadium',
    city: 'Lahore',
    league: 'PSL 2026',
    sport: 'Cricket',
    matchNumber: 'Match 22 of 34',
  },
  {
    id: 'rcb-csk-ipl-2026',
    name: 'RCB vs CSK',
    homeTeam: 'Royal Challengers Bengaluru',
    awayTeam: 'Chennai Super Kings',
    status: 'Upcoming',
    date: 'Apr 22, 2026',
    time: '19:30 IST',
    venue: 'M. Chinnaswamy Stadium',
    city: 'Bengaluru',
    league: 'IPL 2026',
    sport: 'Cricket',
    matchNumber: 'Match 32 of 70',
  },
  {
    id: 'ban-nz-t20-1-2026',
    name: 'BAN vs NZ T20',
    homeTeam: 'Bangladesh',
    awayTeam: 'New Zealand',
    status: 'Upcoming',
    date: 'Apr 23, 2026',
    time: '18:00 BST',
    venue: 'Zahur Ahmed Chowdhury Stadium',
    city: 'Chittagong',
    league: 'BAN vs NZ T20I Series 2026',
    sport: 'Cricket',
    matchNumber: '1st T20I of 3',
  },
  {
    id: 'ind-eng-test-2026',
    name: 'India vs England',
    homeTeam: 'India',
    awayTeam: 'England',
    status: 'Upcoming',
    date: 'Apr 25, 2026',
    time: '09:30 IST',
    venue: 'Eden Gardens',
    city: 'Kolkata',
    league: 'India vs England Test Series 2026',
    sport: 'Cricket',
    matchNumber: '2nd Test of 5',
  },
  {
    id: 'mi-dc-wpl-2026',
    name: 'MI-W vs DC-W',
    homeTeam: 'Mumbai Indians Women',
    awayTeam: 'Delhi Capitals Women',
    status: 'Upcoming',
    date: 'Apr 22, 2026',
    time: '15:00 IST',
    venue: 'DY Patil Stadium',
    city: 'Navi Mumbai',
    league: "Women's Premier League 2026",
    sport: 'Cricket',
    matchNumber: 'Qualifier 1',
  },
];

// ── ZONE DATA — NM Stadium (IPL) ───────────────────────────────────────────
const NM_STADIUM_ZONES = {
  north: { capacity: 35000, baseline: 0.89, name: 'Adani Pavilion' },
  south: { capacity: 32000, baseline: 0.93, name: 'Reliance Stand' },
  east: { capacity: 35000, baseline: 0.88, name: 'BCCI Stand' },
  west: { capacity: 30000, baseline: 0.91, name: 'Pavilion End' },
};

const CONCESSION_BASELINES = {
  'north-c1': { name: 'North Concourse C1', waitMin: 4, surge: false },
  'north-c2': { name: 'North Concourse C2', waitMin: 9, surge: true },
  'south-c1': { name: 'South Concourse C1', waitMin: 6, surge: false },
  'south-c2': { name: 'South Concourse C2', waitMin: 4, surge: false },
  'east-c1': { name: 'East Concourse C1', waitMin: 3, surge: false },
  'west-c1': { name: 'West Concourse C1', waitMin: 5, surge: false },
};

// ── NOISE HELPERS ──────────────────────────────────────────────────────────
function addNoise(base, range = 0.04) {
  return Math.min(1.0, Math.max(0.1, base + (Math.random() - 0.5) * range));
}

function zoneStatus(pct) {
  if (pct > 0.88) return 'HIGH';
  if (pct > 0.65) return 'MODERATE';
  return 'LOW';
}

function zoneColor(pct) {
  if (pct > 0.88) return '#FF4444';
  if (pct > 0.65) return '#FFB800';
  return '#22c55e';
}

// ── EXPORTED FUNCTIONS ─────────────────────────────────────────────────────
function getLiveZoneData(venueZones = NM_STADIUM_ZONES) {
  return Object.entries(venueZones).map(([id, z]) => {
    const fillPct = addNoise(z.baseline);
    return {
      zoneId: id,
      name: z.name,
      capacity: z.capacity,
      fillPct: Math.round(fillPct * 100),
      personCount: Math.round(z.capacity * fillPct),
      status: zoneStatus(fillPct),
      color: zoneColor(fillPct),
      trend: Math.random() > 0.6 ? 'STABLE' : Math.random() > 0.5 ? 'INCREASING' : 'DECREASING',
      dataSource: 'SIMULATED',
    };
  });
}

function getLiveQueueData() {
  return Object.entries(CONCESSION_BASELINES).map(([id, q]) => {
    const noise = Math.round((Math.random() - 0.5) * 3);
    const wait = Math.max(1, q.waitMin + noise);
    return {
      queueId: id,
      name: q.name,
      estimatedWaitMinutes: wait,
      surge: q.surge || (noise > 1),
      trend: noise > 1 ? 'INCREASING' : noise < -1 ? 'DECREASING' : 'STABLE',
      confidence: 0.78,
      dataSource: 'SIMULATED',
    };
  });
}

function getOverallOccupancy() {
  const zones = getLiveZoneData();
  const totalCap = zones.reduce((s, z) => s + z.capacity, 0);
  const totalPpl = zones.reduce((s, z) => s + z.personCount, 0);
  return {
    totalCapacity: totalCap,
    personCount: totalPpl,
    fillPct: Math.round((totalPpl / totalCap) * 100),
    dataSource: 'SIMULATED',
  };
}

function getLiveCricketMatch() {
  // In production: replace with real API call to cricket data provider
  return LIVE_CRICKET_MATCH;
}

module.exports = {
  getLiveZoneData,
  getLiveQueueData,
  getOverallOccupancy,
  getLiveCricketMatch,
  MATCH_CONTEXT,
  GLOBAL_LIVE_MATCHES,
  UPCOMING_MATCHES,
  NM_STADIUM_ZONES,
};

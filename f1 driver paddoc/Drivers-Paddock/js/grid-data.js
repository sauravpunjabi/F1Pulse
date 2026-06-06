/* ───────────────────────────────────────────────────────────────────────────
   grid-data.js — /drivers roster (current-season sample).

   STATIC MOCK DATA for the F1Pulse "Paddock" grid prototype — this HTML is not
   wired to the live /api/standings/drivers endpoint, so a realistic 2026-style
   grid is hardcoded here. Field names mirror the codebase DTO
   (position, points, wins, givenName, familyName, code, permanentNumber,
   constructor, nationality) so swapping in the real API later is mechanical.

   teamColor values are tuned to read on the light paper background.
   ─────────────────────────────────────────────────────────────────────────── */

window.GRID = (function () {
  const drivers = [
    { id: 'norris',        position: 1,  points: 287, wins: 5, givenName: 'Lando',     familyName: 'Norris',     code: 'NOR', num: 4,  team: 'McLaren',        teamShort: 'McLaren',      teamColor: '#F47600', nat: 'British',   natCode: 'GBR' },
    { id: 'piastri',       position: 2,  points: 271, wins: 4, givenName: 'Oscar',     familyName: 'Piastri',    code: 'PIA', num: 81, team: 'McLaren',        teamShort: 'McLaren',      teamColor: '#F47600', nat: 'Australian',natCode: 'AUS' },
    { id: 'max_verstappen',position: 3,  points: 244, wins: 4, givenName: 'Max',       familyName: 'Verstappen', code: 'VER', num: 1,  team: 'Red Bull Racing',teamShort: 'Red Bull',     teamColor: '#2C56B8', nat: 'Dutch',     natCode: 'NED' },
    { id: 'leclerc',       position: 4,  points: 198, wins: 2, givenName: 'Charles',   familyName: 'Leclerc',    code: 'LEC', num: 16, team: 'Ferrari',        teamShort: 'Ferrari',      teamColor: '#E8002D', nat: 'Monégasque',natCode: 'MON' },
    { id: 'russell',       position: 5,  points: 187, wins: 1, givenName: 'George',    familyName: 'Russell',    code: 'RUS', num: 63, team: 'Mercedes',       teamShort: 'Mercedes',     teamColor: '#00A19C', nat: 'British',   natCode: 'GBR' },
    { id: 'hamilton',      position: 6,  points: 163, wins: 1, givenName: 'Lewis',     familyName: 'Hamilton',   code: 'HAM', num: 44, team: 'Ferrari',        teamShort: 'Ferrari',      teamColor: '#E8002D', nat: 'British',   natCode: 'GBR' },
    { id: 'antonelli',     position: 7,  points: 121, wins: 0, givenName: 'Andrea',    familyName: 'Antonelli',  code: 'ANT', num: 12, team: 'Mercedes',       teamShort: 'Mercedes',     teamColor: '#00A19C', nat: 'Italian',   natCode: 'ITA' },
    { id: 'alonso',        position: 8,  points: 94,  wins: 0, givenName: 'Fernando',  familyName: 'Alonso',     code: 'ALO', num: 14, team: 'Aston Martin',   teamShort: 'Aston Martin', teamColor: '#1F8A6B', nat: 'Spanish',   natCode: 'ESP' },
    { id: 'sainz',         position: 9,  points: 88,  wins: 0, givenName: 'Carlos',    familyName: 'Sainz',      code: 'SAI', num: 55, team: 'Williams',       teamShort: 'Williams',     teamColor: '#1868DB', nat: 'Spanish',   natCode: 'ESP' },
    { id: 'albon',         position: 10, points: 73,  wins: 0, givenName: 'Alexander', familyName: 'Albon',      code: 'ALB', num: 23, team: 'Williams',       teamShort: 'Williams',     teamColor: '#1868DB', nat: 'Thai',      natCode: 'THA' },
    { id: 'gasly',         position: 11, points: 56,  wins: 0, givenName: 'Pierre',    familyName: 'Gasly',      code: 'GAS', num: 10, team: 'Alpine',         teamShort: 'Alpine',       teamColor: '#0093CC', nat: 'French',    natCode: 'FRA' },
    { id: 'hadjar',        position: 12, points: 48,  wins: 0, givenName: 'Isack',     familyName: 'Hadjar',     code: 'HAD', num: 6,  team: 'Racing Bulls',   teamShort: 'Racing Bulls', teamColor: '#5E7BE0', nat: 'French',    natCode: 'FRA' },
    { id: 'stroll',        position: 13, points: 41,  wins: 0, givenName: 'Lance',     familyName: 'Stroll',     code: 'STR', num: 18, team: 'Aston Martin',   teamShort: 'Aston Martin', teamColor: '#1F8A6B', nat: 'Canadian',  natCode: 'CAN' },
    { id: 'hulkenberg',    position: 14, points: 37,  wins: 0, givenName: 'Nico',      familyName: 'Hülkenberg', code: 'HUL', num: 27, team: 'Audi',           teamShort: 'Audi',         teamColor: '#00876B', nat: 'German',    natCode: 'GER' },
    { id: 'lawson',        position: 15, points: 29,  wins: 0, givenName: 'Liam',      familyName: 'Lawson',     code: 'LAW', num: 30, team: 'Racing Bulls',   teamShort: 'Racing Bulls', teamColor: '#5E7BE0', nat: 'New Zealander',natCode: 'NZL' },
    { id: 'bearman',       position: 16, points: 24,  wins: 0, givenName: 'Oliver',    familyName: 'Bearman',    code: 'BEA', num: 87, team: 'Haas',           teamShort: 'Haas',         teamColor: '#5A5E62', nat: 'British',   natCode: 'GBR' },
    { id: 'ocon',          position: 17, points: 19,  wins: 0, givenName: 'Esteban',   familyName: 'Ocon',       code: 'OCO', num: 31, team: 'Haas',           teamShort: 'Haas',         teamColor: '#5A5E62', nat: 'French',    natCode: 'FRA' },
    { id: 'tsunoda',       position: 18, points: 16,  wins: 0, givenName: 'Yuki',      familyName: 'Tsunoda',    code: 'TSU', num: 22, team: 'Red Bull Racing',teamShort: 'Red Bull',     teamColor: '#2C56B8', nat: 'Japanese',  natCode: 'JPN' },
    { id: 'colapinto',     position: 19, points: 9,   wins: 0, givenName: 'Franco',    familyName: 'Colapinto',  code: 'COL', num: 43, team: 'Alpine',         teamShort: 'Alpine',       teamColor: '#0093CC', nat: 'Argentine', natCode: 'ARG' },
    { id: 'bortoleto',     position: 20, points: 6,   wins: 0, givenName: 'Gabriel',   familyName: 'Bortoleto',  code: 'BOR', num: 5,  team: 'Audi',           teamShort: 'Audi',         teamColor: '#00876B', nat: 'Brazilian', natCode: 'BRA' },
  ];

  const teams = [...new Set(drivers.map((d) => d.team))];
  const season = 2026;
  const round = 14;
  const totalRounds = 24;
  const leader = drivers[0];

  return { drivers, teams, season, round, totalRounds, leader };
})();

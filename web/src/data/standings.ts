export interface StandingItem {
    position: number;
    driverId: string;
    constructorId: string;
    name: string;
    team: string;
    points: number;
    wins: number;
    podiums: number;
    trend: 'UP' | 'DOWN' | 'SAME';
    trendPos?: number;
    avatarUrl: string;
    teamColor: string;
}

export interface ConstructorStandingItem {
    position: number;
    constructorId: string;
    name: string;
    points: number;
    wins: number;
    podiums: number;
    trend: 'UP' | 'DOWN' | 'SAME';
    logoUrl: string;
    teamColor: string;
    drivers: string[];
}

export const DRIVER_STANDINGS_2024: StandingItem[] = [
    {
        "position": 1,
        "driverId": "max_verstappen",
        "constructorId": "red_bull",
        "name": "Max Verstappen",
        "team": "Red Bull Racing",
        "points": 437.0,
        "wins": 9,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/M/VER01_Max_Verstappen/ver01.png",
        "teamColor": "#3671C6"
    },
    {
        "position": 2,
        "driverId": "norris",
        "constructorId": "mclaren",
        "name": "Lando Norris",
        "team": "McLaren",
        "points": 374.0,
        "wins": 4,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/L/NOR01_Lando_Norris/nor01.png",
        "teamColor": "#FF8700"
    },
    {
        "position": 3,
        "driverId": "leclerc",
        "constructorId": "ferrari",
        "name": "Charles Leclerc",
        "team": "Ferrari",
        "points": 356.0,
        "wins": 3,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/C/LEC01_Charles_Leclerc/lec01.png",
        "teamColor": "#E8002D"
    },
    {
        "position": 4,
        "driverId": "piastri",
        "constructorId": "mclaren",
        "name": "Oscar Piastri",
        "team": "McLaren",
        "points": 292.0,
        "wins": 2,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/O/PIA01_Oscar_Piastri/pia01.png",
        "teamColor": "#FF8700"
    },
    {
        "position": 5,
        "driverId": "sainz",
        "constructorId": "ferrari",
        "name": "Carlos Sainz",
        "team": "Ferrari",
        "points": 290.0,
        "wins": 2,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/C/SAI01_Carlos_Sainz/sai01.png",
        "teamColor": "#E8002D"
    },
    {
        "position": 6,
        "driverId": "russell",
        "constructorId": "mercedes",
        "name": "George Russell",
        "team": "Mercedes",
        "points": 245.0,
        "wins": 2,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/G/RUS01_George_Russell/rus01.png",
        "teamColor": "#00D2BE"
    },
    {
        "position": 7,
        "driverId": "hamilton",
        "constructorId": "mercedes",
        "name": "Lewis Hamilton",
        "team": "Mercedes",
        "points": 223.0,
        "wins": 2,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/L/HAM01_Lewis_Hamilton/ham01.png",
        "teamColor": "#00D2BE"
    },
    {
        "position": 8,
        "driverId": "perez",
        "constructorId": "red_bull",
        "name": "Sergio P\u00e9rez",
        "team": "Red Bull Racing",
        "points": 152.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/S/PER01_Sergio_P\u00e9rez/per01.png",
        "teamColor": "#3671C6"
    },
    {
        "position": 9,
        "driverId": "alonso",
        "constructorId": "aston_martin",
        "name": "Fernando Alonso",
        "team": "Aston Martin",
        "points": 70.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/F/ALO01_Fernando_Alonso/alo01.png",
        "teamColor": "#006F62"
    },
    {
        "position": 10,
        "driverId": "gasly",
        "constructorId": "alpine",
        "name": "Pierre Gasly",
        "team": "Alpine",
        "points": 42.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/P/GAS01_Pierre_Gasly/gas01.png",
        "teamColor": "#0093CC"
    },
    {
        "position": 11,
        "driverId": "hulkenberg",
        "constructorId": "haas",
        "name": "Nico H\u00fclkenberg",
        "team": "Haas F1 Team",
        "points": 41.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/N/HUL01_Nico_H\u00fclkenberg/hul01.png",
        "teamColor": "#B6BABD"
    },
    {
        "position": 12,
        "driverId": "tsunoda",
        "constructorId": "rb",
        "name": "Yuki Tsunoda",
        "team": "RB",
        "points": 30.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/Y/TSU01_Yuki_Tsunoda/tsu01.png",
        "teamColor": "#6692FF"
    },
    {
        "position": 13,
        "driverId": "stroll",
        "constructorId": "aston_martin",
        "name": "Lance Stroll",
        "team": "Aston Martin",
        "points": 24.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/L/STR01_Lance_Stroll/str01.png",
        "teamColor": "#006F62"
    },
    {
        "position": 14,
        "driverId": "ocon",
        "constructorId": "alpine",
        "name": "Esteban Ocon",
        "team": "Alpine",
        "points": 23.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/E/OCO01_Esteban_Ocon/oco01.png",
        "teamColor": "#0093CC"
    },
    {
        "position": 15,
        "driverId": "kevin_magnussen",
        "constructorId": "haas",
        "name": "Kevin Magnussen",
        "team": "Haas F1 Team",
        "points": 16.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/K/MAG01_Kevin_Magnussen/mag01.png",
        "teamColor": "#B6BABD"
    },
    {
        "position": 16,
        "driverId": "albon",
        "constructorId": "williams",
        "name": "Alexander Albon",
        "team": "Williams",
        "points": 12.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/A/ALB01_Alexander_Albon/alb01.png",
        "teamColor": "#64C4FF"
    },
    {
        "position": 17,
        "driverId": "ricciardo",
        "constructorId": "rb",
        "name": "Daniel Ricciardo",
        "team": "RB",
        "points": 12.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/D/RIC01_Daniel_Ricciardo/ric01.png",
        "teamColor": "#6692FF"
    },
    {
        "position": 18,
        "driverId": "bearman",
        "constructorId": "ferrari",
        "name": "Oliver Bearman",
        "team": "Ferrari",
        "points": 7.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/O/BEA01_Oliver_Bearman/bea01.png",
        "teamColor": "#E8002D"
    },
    {
        "position": 19,
        "driverId": "colapinto",
        "constructorId": "williams",
        "name": "Franco Colapinto",
        "team": "Williams",
        "points": 5.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/F/COL01_Franco_Colapinto/col01.png",
        "teamColor": "#64C4FF"
    },
    {
        "position": 20,
        "driverId": "zhou",
        "constructorId": "sauber",
        "name": "Guanyu Zhou",
        "team": "Kick Sauber",
        "points": 4.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/G/ZHO01_Guanyu_Zhou/zho01.png",
        "teamColor": "#52E252"
    },
    {
        "position": 21,
        "driverId": "lawson",
        "constructorId": "rb",
        "name": "Liam Lawson",
        "team": "RB",
        "points": 4.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/L/LAW01_Liam_Lawson/law01.png",
        "teamColor": "#6692FF"
    },
    {
        "position": 22,
        "driverId": "bottas",
        "constructorId": "sauber",
        "name": "Valtteri Bottas",
        "team": "Kick Sauber",
        "points": 0.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/V/BOT01_Valtteri_Bottas/bot01.png",
        "teamColor": "#52E252"
    },
    {
        "position": 23,
        "driverId": "sargeant",
        "constructorId": "williams",
        "name": "Logan Sargeant",
        "team": "Williams",
        "points": 0.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/L/SAR01_Logan_Sargeant/sar01.png",
        "teamColor": "#64C4FF"
    },
    {
        "position": 24,
        "driverId": "doohan",
        "constructorId": "alpine",
        "name": "Jack Doohan",
        "team": "Alpine",
        "points": 0.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "avatarUrl": "https://media.formula1.com/content/dam/fom-website/drivers/J/DOO01_Jack_Doohan/doo01.png",
        "teamColor": "#0093CC"
    }
];

export const CONSTRUCTOR_STANDINGS_2024: ConstructorStandingItem[] = [
    {
        "position": 1,
        "constructorId": "mclaren",
        "name": "McLaren",
        "points": 666.0,
        "wins": 6,
        "podiums": 0,
        "trend": "SAME",
        "logoUrl": "https://media.formula1.com/content/dam/fom-website/teams/2024/mclaren-logo.png",
        "teamColor": "#FF8700",
        "drivers": []
    },
    {
        "position": 2,
        "constructorId": "ferrari",
        "name": "Ferrari",
        "points": 652.0,
        "wins": 5,
        "podiums": 0,
        "trend": "SAME",
        "logoUrl": "https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png",
        "teamColor": "#E8002D",
        "drivers": []
    },
    {
        "position": 3,
        "constructorId": "red_bull",
        "name": "Red Bull Racing",
        "points": 589.0,
        "wins": 9,
        "podiums": 0,
        "trend": "SAME",
        "logoUrl": "https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png",
        "teamColor": "#3671C6",
        "drivers": []
    },
    {
        "position": 4,
        "constructorId": "mercedes",
        "name": "Mercedes",
        "points": 468.0,
        "wins": 4,
        "podiums": 0,
        "trend": "SAME",
        "logoUrl": "https://media.formula1.com/content/dam/fom-website/teams/2024/mercedes-logo.png",
        "teamColor": "#00D2BE",
        "drivers": []
    },
    {
        "position": 5,
        "constructorId": "aston_martin",
        "name": "Aston Martin",
        "points": 94.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "logoUrl": "https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin-logo.png",
        "teamColor": "#006F62",
        "drivers": []
    },
    {
        "position": 6,
        "constructorId": "alpine",
        "name": "Alpine",
        "points": 65.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "logoUrl": "https://media.formula1.com/content/dam/fom-website/teams/2024/alpine-logo.png",
        "teamColor": "#0093CC",
        "drivers": []
    },
    {
        "position": 7,
        "constructorId": "haas",
        "name": "Haas F1 Team",
        "points": 58.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "logoUrl": "https://media.formula1.com/content/dam/fom-website/teams/2024/haas-f1-team-logo.png",
        "teamColor": "#B6BABD",
        "drivers": []
    },
    {
        "position": 8,
        "constructorId": "rb",
        "name": "RB",
        "points": 46.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "logoUrl": "https://media.formula1.com/content/dam/fom-website/teams/2024/rb-logo.png",
        "teamColor": "#6692FF",
        "drivers": []
    },
    {
        "position": 9,
        "constructorId": "williams",
        "name": "Williams",
        "points": 17.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "logoUrl": "https://media.formula1.com/content/dam/fom-website/teams/2024/williams-logo.png",
        "teamColor": "#64C4FF",
        "drivers": []
    },
    {
        "position": 10,
        "constructorId": "sauber",
        "name": "Kick Sauber",
        "points": 4.0,
        "wins": 0,
        "podiums": 0,
        "trend": "SAME",
        "logoUrl": "https://media.formula1.com/content/dam/fom-website/teams/2024/kick-sauber-logo.png",
        "teamColor": "#52E252",
        "drivers": []
    }
];

// Mock history data preserved for the graph until we build the rigorous history fetcher
export const POINTS_HISTORY_DATA = [
    { round: 'BHR', VER: 25, LEC: 12, NOR: 10, HAM: 8 },
    { round: 'SAU', VER: 50, LEC: 27, NOR: 18, HAM: 14 },
    { round: 'AUS', VER: 50, LEC: 45, NOR: 33, HAM: 20 },
    { round: 'JPN', VER: 76, LEC: 57, NOR: 45, HAM: 26 },
    { round: 'CHN', VER: 101, LEC: 72, NOR: 60, HAM: 36 },
    { round: 'MIA', VER: 120, LEC: 90, NOR: 85, HAM: 40 },
    { round: 'EMI', VER: 145, LEC: 108, NOR: 103, HAM: 50 },
    { round: 'MON', VER: 155, LEC: 133, NOR: 113, HAM: 60 },
    { round: 'CAN', VER: 180, LEC: 133, NOR: 128, HAM: 75 },
    { round: 'ESP', VER: 205, LEC: 145, NOR: 146, HAM: 85 }
];

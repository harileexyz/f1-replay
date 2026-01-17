export interface NewsArticle {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    description: string; // Short summary for cards
    content: string; // HTML content for the article
    image_url: string;
    category: "ANALYSIS" | "UPCOMING" | "HEADLINE" | "RACE WEEK" | "TECH" | "OFFICIAL";
    date: string;
    author: string;
    readTime: string;
    featured: boolean; // For carousel
    accent: string;
}

export const NEWS_ARTICLES: NewsArticle[] = [
    {
        id: '1',
        slug: 'season-overview-2024',
        title: "SEASON OVERVIEW",
        subtitle: "Comprehensive analysis of the 2024 championship battle",
        description: "As the paddock prepares for the longest season in history, we analyze the technical developments and team hierarchies emerging from pre-season testing.",
        content: `
            <p class="lead">The 2024 Formula 1 season promises to be a landmark year in the sport's history, with a record-breaking calendar and a grid that has stabilized into a fierce competitive order.</p>
            
            <h3>Red Bull's Radical Evolution</h3>
            <p>Despite the crushing dominance of the RB19, Red Bull Racing has not rested on their laurels. The RB20 features a radical departure in sidepod geometry, adopting a 'zero-pod' adjacent vertical inlet that has left the rest of the pit lane scratching their heads. Max Verstappen called the car "aggressive but predictable" during Bahrain testing.</p>

            <h3>The Chasing Pack</h3>
            <p>Ferrari's SF-24 has shown impressive one-lap pace, with Charles Leclerc praising the improved driveability. Meanwhile, Mercedes has completely overhauled their concept with the W15, moving the cockpit back and abandoning their previous sidepod philosophy entirely.</p>

            <h3>Midfield Battle</h3>
            <p>The gap between P6 and P10 is virtually non-existent. RB (formerly AlphaTauri) has forged a closer technical alliance with Red Bull, while Williams continues their resurgence under James Vowles. The battle for the final points positions will likely be decided by tenths of a second at every round.</p>
        `,
        image_url: "https://media.formula1.com/image/upload/t_16by9North/f_auto/q_auto/v1768531260/fom-website/2026/Red%20Bull/SI202601150722.jpg",
        category: "ANALYSIS",
        date: "TODAY",
        author: "Technical Staff",
        readTime: "5 MIN READ",
        featured: true,
        accent: "#ef4444"
    },
    {
        id: '2',
        slug: 'australian-gp-preview',
        title: "AUSTRALIAN GP",
        subtitle: "Albert Park Circuit preparation and strategy guide",
        description: "The Albert Park Circuit has evolved into one of the fastest street tracks on the calendar. We look at the tyre strategies and setup compromises teams must face.",
        content: `
            <p class="lead">Melbourne's Albert Park is a unique challenge – a street circuit that behaves like a permanent track, punishing errors while demanding high aerodynamic efficiency.</p>

            <h3>Circuit Characteristics</h3>
            <p>With four DRS zones, top speed is critical. However, the flowing middle sector requires a responsive front end. Teams will be bringing medium-downforce packages, similar to what we see in Jeddah, but with slightly softer suspension settings to handle the bumps.</p>

            <h3>Strategy Calls</h3>
            <p>Pirelli has nominated the softest compounds in their range (C3, C4, C5). Historically, this race can be a one-stopper, but high degradation on the softs might open up aggressive two-stop sprint strategies for those willing to attack.</p>
        `,
        image_url: "https://media.formula1.com/image/upload/t_16by9North/f_auto/q_auto/v1747918358/trackside-images/2025/F1_Grand_Prix_of_Monaco___Previews/2216476821.jpg",
        category: "UPCOMING",
        date: "MAR 24",
        author: "Race Control",
        readTime: "3 MIN READ",
        featured: true,
        accent: "#22c55e"
    },
    {
        id: '3',
        slug: 'hamilton-ferrari-shock',
        title: "HAMILTON AT FERRARI",
        subtitle: "Historical data suggests a massive shift in team dynamics",
        description: "The move of the decade has sent shockwaves through the sport. We analyze the historical precedent of world champions moving to Maranello and what it means for 2025.",
        content: `
            <p class="lead">It is the transfer that no one saw coming, yet makes perfect sense. Lewis Hamilton, statistically the greatest driver of all time, will join the sport's most successful team.</p>

            <h3>The Schumacher Parallel</h3>
            <p>Michael Schumacher joined a struggling Ferrari in 1996 and built it into a juggernaut. Hamilton joins a Ferrari team that is fast but operationally inconsistent. His experience in building Mercedes into a winning machine will be invaluable to Fred Vasseur's project.</p>

            <h3>The Tifosi Factor</h3>
            <p>Driving for Ferrari is unlike any other team. The pressure is immense, but the rewards are legendary. Hamilton has always spoken of his admiration for the Prancing Horse; closing his career in red is a narrative fit for Hollywood.</p>
        `,
        image_url: "https://media.formula1.com/image/upload/t_16by9Centre/f_auto/q_auto/v1768531364/fom-website/2026/Racing%20Bulls%20(VCARB)/SI202601151081.jpg",
        category: "HEADLINE",
        date: "BREAKING",
        author: "Senior Editor",
        readTime: "4 MIN READ",
        featured: true,
        accent: "#fbbf24"
    },
    {
        id: '4',
        slug: 'chinese-gp-return',
        title: "CHINESE GP RETURN",
        subtitle: "The Shanghai International Circuit is back on the calendar",
        description: "Formula 1 returns to Shanghai for the first time since 2019. The technical challenge of the snail curve and the massive back straight awaits a new generation of ground-effect cars.",
        content: `
            <p class="lead">Shanghai returns. For many drivers on the grid, this will be their first time tackling the monumental Shanghai International Circuit in a Formula 1 car.</p>

            <h3>The Unknowns</h3>
            <p>The track surface has likely evolved significantly over five years. Without recent data, teams are going in blind. The Sprint format adds to the pressure – only one practice session to dial in the car before competitive sessions begin.</p>

            <h3>The Long Straight</h3>
            <p>The 1.2km back straight is one of the longest in F1. Low-drag setups will be king, but the technical infield demands downforce. It's a classic engineering compromise that often produces spectacular racing.</p>
        `,
        image_url: "https://media.formula1.com/image/upload/t_16by9North/f_auto/q_auto/v1765108873/trackside-images/2025/F1_Grand_Prix_of_Abu_Dhabi/2250506612.jpg",
        category: "RACE WEEK",
        date: "APR 21",
        author: "Track Guide",
        readTime: "6 MIN READ",
        featured: true,
        accent: "#ef4444"
    },
    {
        id: '5',
        slug: 'tech-talk-ground-effect',
        title: "TECH: FLOOR WARS",
        subtitle: "Why the floor edge is the most critical area of the 2024 cars",
        description: "We dive deep into the aerodynamics of the current generation. It's not just about the wing anymore; the war is being won underneath the car.",
        content: `
            <p class="lead">Ground effect is back, and it's more complex than ever. The visible aerodynamic surfaces are just the tip of the iceberg.</p>
            <h3>Sealing the Deal</h3>
            <p>The primary goal is to seal the floor edges to the track surface using air vortices. This mimics the effect of physical 'skirts' used in the 80s. Red Bull's mastery of this area allows them to run a higher ride height without losing downforce.</p>
        `,
        image_url: "https://media.formula1.com/image/upload/t_16by9North/f_auto/q_auto/v1724318025/trackside-images/2024/F1_Grand_Prix_of_Netherlands___Previews/2167878791.jpg",
        category: "TECH",
        date: "YESTERDAY",
        author: "Tech Analyst",
        readTime: "8 MIN READ",
        featured: false,
        accent: "#3b82f6"
    }
];

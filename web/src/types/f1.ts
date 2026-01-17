// Types for F1 Drivers, Teams, and Cars

export interface DriverStats {
    championships: number;
    race_wins: number;
    podiums: number;
    poles: number;
}

export interface Driver {
    id: string;
    code: string;
    driver_number: number;
    full_name: string;
    first_name: string;
    last_name: string;
    team_id: string;
    team_name: string;
    team_color: string;
    country_code: string;
    headshot_url: string;
    bio: string;
    stats: DriverStats;
    season: number;
    updated_at?: Date;
}

export interface Team {
    id: string;
    name: string;
    full_name: string;
    base: string;
    team_principal: string;
    color: string;
    logo_url: string;
    season: number;
    updated_at?: Date;
}

export interface CarSpecs {
    engine: string;
    chassis: string;
    weight: string;
    power_unit: string;
    transmission?: string;
    brakes?: string;
    suspension?: string;
}

export interface Car {
    id: string;
    team_id: string;
    team_name: string;
    name: string;
    season: number;
    image_url: string;
    specs: CarSpecs;
    updated_at?: Date;
}

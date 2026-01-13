// otanSymbol.ts
export const ICON_CATALOG = [
    {
        main: { label: "Allié", sidc: "SFG------------" },
        subs: [
            { label: "Infanterie", sidc: "SFG-UCI-----FRG" },
            { label: "Reconnaissance blindée", sidc: "SFG-UCRRL------" },
            { label: "Infanterie motorisée", sidc: "SFG-UCIM----FRG" },
        ],
        subsMore: [
            { label: "Artillerie", sidc: "SFG-UCF-----FRG" },
            { label: "Génie", sidc: "SFG-UCE-----FRG" },
            { label: "Défense aérienne", sidc: "SFG-UCD-----FRG" },
            { label: "Drone", sidc: "SFAPMFQ---------" },
            { label: "Char", sidc: "SFGPEVATH-------" },
            { label: "Avion de Chasse", sidc: "SFAPMFF---------" },
            { label: "Helicoptere", sidc: "SFAPMH----------" },
        ],
    },
    {
        main: { label: "Ennemi", sidc: "SHG------------" },
        subs: [
            { label: "Infanterie", sidc: "SHG-UCI-----FRG" },
            { label: "Reconnaissance blindée", sidc: "SHG-UCRRL------" },
            { label: "Infanterie motorisée", sidc: "SHG-UCIM----FRG" },
        ],
        subsMore: [
            { label: "Artillerie", sidc: "SHG-UCF-----FRG" },
            { label: "Génie", sidc: "SHG-UCE-----FRG" },
            { label: "Défense aérienne", sidc: "SHG-UCD-----FRG" },
            { label: "Drone", sidc: "SHAPMFQ---------" },
            { label: "Char", sidc: "SHGPEVATH-------" },
            { label: "Avion de Chasse", sidc: "SHAPMFF---------" },
            { label: "Helicoptere", sidc: "SHAPMH----------" },
            { label: "Sous-marin nucléaire", sidc: "SHUPSNB--------G" },
            { label: "Torpille", sidc: "SHUPWT---------G" },

        ],
    },
    {
        main: { label: "Neutre", sidc: "SNG------------" },
        subs: [
            { label: "Infanterie", sidc: "SNG-UCI-----FRG" },
            { label: "Reconnaissance blindée", sidc: "SNG-UCRRL------" },
            { label: "Infanterie motorisée", sidc: "SNG-UCIM----FRG" },
        ],
        subsMore: [
            { label: "Artillerie", sidc: "SNG-UCF-----FRG" },
            { label: "Génie", sidc: "SNG-UCE-----FRG" },
            { label: "Défense aérienne", sidc: "SNG-UCD-----FRG" },
            { label: "Drone", sidc: "SNAPMFQ---------" },
            { label: "Char", sidc: "SNGPEVATH-------" },
            { label: "Avion de Chasse", sidc: "SNAPMFF---------" },
            { label: "Helicoptere", sidc: "SNAPMH----------" },
            { label: "Civil", sidc: "SNGPEVC---------" },
        ],
    },
    {
        main: { label: "Inconnu", sidc: "SUG------------" },
        subs: [
            { label: "Infanterie", sidc: "SUG-UCI-----FRG" },
            { label: "Reconnaissance blindée", sidc: "SUG-UCRRL------" },
            { label: "Infanterie motorisée", sidc: "SUG-UCIM----FRG" },
        ],
        subsMore: [
            { label: "Artillerie", sidc: "SUG-UCF-----FRG" },
            { label: "Génie", sidc: "SUG-UCE-----FRG" },
            { label: "Défense aérienne", sidc: "SUG-UCD-----FRG" },
            { label: "Drone", sidc: "SUAPMFQ---------" },
            { label: "Char", sidc: "SUGPEVATH-------" },
            { label: "Avion de Chasse", sidc: "SUAPMFF---------" },
            { label: "Helicoptere", sidc: "SUAPMH----------" },
        ],
    },
    {
        main: { label: "Obstacle", sidc: "GUM-OAOF-------" },
        subs: [
            { label: "Risque", sidc: "GUGPDPO--------" },
            { label: "Mine", sidc: "GFMPOFS--------" },
            { label: "Mine (anti-personnel)", sidc: "GFMPOME--------" },
        ],
        subsMore: [

        ],
    },
] as const;

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  sizes: string[];
  colors: string[];
}

export interface EventTicketTier {
  id: string;
  name: string;
  price: number;
  available: number;
}

export interface FashionEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  description: string;
  ticketTiers: EventTicketTier[];
}

export const mockProducts: Product[] = [
  {
    id: "prod-01",
    name: "Robe Magenta Éclat",
    price: 1250,
    category: "Robes",
    description: "Une robe de soirée haute couture avec notre couleur signature. Parfaite pour vos galas.",
    image: "/robe_magenta_1784381070836.jpg",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Magenta", "Noir"]
  },
  {
    id: "prod-02",
    name: "Veste Tailleur Or",
    price: 980,
    category: "Prêt-à-porter",
    description: "Veste structurée avec finitions en fil d'or, inspirée du soleil d'Haïti.",
    image: "/veste_or_1784381080539.jpg",
    sizes: ["36", "38", "40", "42"],
    colors: ["Or", "Blanc"]
  },
  {
    id: "prod-03",
    name: "Sacoche Lotus Noir",
    price: 450,
    category: "Accessoires",
    description: "Sacoche en cuir de première qualité avec le motif lotus stylisé.",
    image: "/sacoche_lotus_1784381089608.jpg",
    sizes: ["Taille unique"],
    colors: ["Noir"]
  },
  {
    id: "prod-04",
    name: "Robe Soleil de Minuit",
    price: 2100,
    category: "Couture sur mesure",
    description: "Robe exclusive avec des broderies complexes, réalisée sur mesure.",
    image: "/robe_soleil_1784381099616.jpg",
    sizes: ["Sur mesure"],
    colors: ["Noir/Or"]
  },
  {
    id: "prod-05",
    name: "Manteau Oversize Caribéen",
    price: 850,
    category: "Prêt-à-porter",
    description: "Manteau léger pour les soirées fraîches, coupe élégante et fluide.",
    image: "/manteau_caribeen_1784381120619.jpg",
    sizes: ["S", "M", "L"],
    colors: ["Beige", "Blanc"]
  },
  {
    id: "prod-06",
    name: "Lunettes de soleil SJ",
    price: 320,
    category: "Accessoires",
    description: "Lunettes de soleil glamour pour un style audacieux.",
    image: "/lunettes_sj_1784381130943.jpg",
    sizes: ["Taille unique"],
    colors: ["Noir", "Écaille"]
  }
];

export const mockEvents: FashionEvent[] = [
  {
    id: "evt-2026-miami",
    title: "Sarje Spring Fashion Show 2026",
    date: "2026-04-15T19:00:00Z",
    location: "Art Deco District, Miami, FL",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1000",
    description: "Découvrez notre nouvelle collection Printemps 2026 dans un cadre spectaculaire au cœur de Miami.",
    ticketTiers: [
      { id: "tier-std", name: "Standard", price: 150, available: 200 },
      { id: "tier-vip", name: "VIP", price: 350, available: 50 },
      { id: "tier-front", name: "Front Row", price: 800, available: 20 }
    ]
  },
  {
    id: "evt-2026-pap",
    title: "Défilé Héritage Port-au-Prince",
    date: "2026-07-22T18:00:00Z",
    location: "Hôtel Karibe, Port-au-Prince, Haïti",
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=1000",
    description: "Une célébration de nos racines avec une collection exclusive inspirée par la culture haïtienne.",
    ticketTiers: [
      { id: "tier-std", name: "Admission Générale", price: 75, available: 300 },
      { id: "tier-vip", name: "VIP + Cocktail", price: 200, available: 100 }
    ]
  },
  {
    id: "evt-2026-nyc",
    title: "New York Gala",
    date: "2026-11-10T20:00:00Z",
    location: "The Plaza, New York, NY",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1000",
    description: "Notre événement de gala annuel présentant la collection d'hiver haute couture.",
    ticketTiers: [
      { id: "tier-std", name: "Standard", price: 250, available: 150 },
      { id: "tier-vip", name: "VIP", price: 600, available: 75 }
    ]
  }
];

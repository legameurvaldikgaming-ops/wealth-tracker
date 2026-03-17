/* ══════════════════════════════════════
   DATA.JS — Données statiques
   ══════════════════════════════════════ */

window.QUOTES = [
  { text: "La règle n°1 : ne jamais perdre d'argent. La règle n°2 : ne jamais oublier la règle n°1.", author: "Warren Buffett", role: "Président de Berkshire Hathaway" },
  { text: "Le risque vient de ne pas savoir ce que vous faites.", author: "Warren Buffett", role: "Président de Berkshire Hathaway" },
  { text: "La bourse est un dispositif pour transférer l'argent des impatients vers les patients.", author: "Warren Buffett", role: "Président de Berkshire Hathaway" },
  { text: "Un investissement dans la connaissance paie toujours les meilleurs intérêts.", author: "Benjamin Franklin", role: "Père fondateur des États-Unis" },
  { text: "Le temps sur le marché bat le timing du marché.", author: "Ken Fisher", role: "Fondateur de Fisher Investments" },
  { text: "Ne cherchez pas l'aiguille dans la botte de foin. Achetez juste la botte de foin.", author: "John Bogle", role: "Fondateur de Vanguard" },
  { text: "Les marchés boursiers à court terme sont un dispositif de vote, à long terme, une balance.", author: "Benjamin Graham", role: "Père de l'investissement value" },
  { text: "La patience est le principal ingrédient de la réussite en investissement.", author: "Charlie Munger", role: "Vice-Président de Berkshire Hathaway" },
  { text: "L'argent est un outil merveilleux. Il t'amènera où tu veux, mais il ne te remplacera pas comme conducteur.", author: "Ayn Rand", role: "Philosophe et auteure" },
  { text: "La richesse n'est pas de l'argent en banque, des maisons ou des voitures. La richesse est au-delà des besoins.", author: "Naval Ravikant", role: "Entrepreneur & philosophe" },
  { text: "Achète de la peur. Vends de la cupidité.", author: "Warren Buffett", role: "Président de Berkshire Hathaway" },
  { text: "Compound interest is the eighth wonder of the world.", author: "Albert Einstein", role: "Physicien, Prix Nobel" },
  { text: "Ne mets jamais tous tes œufs dans le même panier, mais surveille bien ce panier.", author: "Andrew Carnegie", role: "Industriel & philanthrope" },
  { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett", role: "Président de Berkshire Hathaway" },
  { text: "The stock market is filled with individuals who know the price of everything, but the value of nothing.", author: "Philip Fisher", role: "Investisseur légendaire" }
];

window.PRINCIPLES = [
  { num: "01", title: "DCA systématique", text: "Investis une somme fixe chaque mois, peu importe le marché. Tu achètes plus quand c'est bas, moins quand c'est haut. La discipline bat l'intelligence." },
  { num: "02", title: "Temps > Timing", text: "10 ans dans le marché valent mieux que 10 ans à essayer d'entrer au bon moment. Chaque mois hors marché est un mois de capitalisation perdu." },
  { num: "03", title: "La fiscalité est un actif", text: "Le PEA, le LMNP, le crédit Lombard — optimiser ta fiscalité légalement c'est autant que trouver un meilleur rendement. Un euro d'impôt évité est un euro investi." },
  { num: "04", title: "L'effet de levier discipliné", text: "Emprunter pour investir est légitime à condition que le rendement dépasse le coût. Max 40% de nantissement. Jamais au-delà — le margin call arrive toujours au pire moment." },
  { num: "05", title: "Sorties crypto = réel", text: "Un gain sur wallet n'existe pas. Un gain sur compte bancaire existe. Sors régulièrement. Provisionne 30% pour les impôts. La discipline de sortie vaut l'entrée." },
  { num: "06", title: "Patience pathologique", text: "Buffett détient certaines actions depuis 40 ans. La richesse intergénérationnelle se construit en décennies, pas en semaines. La patience est la stratégie." }
];

window.CATALOG_DATA = [
  { ticker: "CW8", name: "Amundi MSCI World", desc: "Exposition aux 1500 plus grandes entreprises mondiales. ETF de référence pour un portefeuille diversifié. Éligible PEA.", cat: "ETF", price: 420.50, change: +0.82 },
  { ticker: "PE500", name: "Amundi S&P 500", desc: "Les 500 plus grandes entreprises américaines. Moteur historique de croissance depuis 80 ans. Éligible PEA.", cat: "ETF", price: 62.30, change: +1.14 },
  { ticker: "PUST", name: "Lyxor Nasdaq 100", desc: "Exposition aux 100 leaders technologiques américains : Apple, Microsoft, Nvidia, Google. Éligible PEA.", cat: "ETF", price: 45.20, change: +1.87 },
  { ticker: "AEEM", name: "Amundi MSCI Emerging Markets", desc: "Exposition aux marchés émergents : Chine, Inde, Brésil, Taïwan. Fort potentiel, volatilité plus élevée. Éligible PEA.", cat: "ETF", price: 5.80, change: -0.34 },
  { ticker: "EWLD", name: "iShares MSCI World", desc: "Alternative au CW8, légèrement différente en composition. Bonne liquidité.", cat: "ETF", price: 75.40, change: +0.62 },
  { ticker: "BTC", name: "Bitcoin", desc: "La première et plus grande crypto-monnaie. Réserve de valeur numérique, liquidité maximale. Cycle de halving tous les 4 ans.", cat: "Crypto", price: 85200, change: +2.31 },
  { ticker: "ETH", name: "Ethereum", desc: "Plateforme de contrats intelligents. Infrastructure de la DeFi et des NFT. Passage au Proof of Stake.", cat: "Crypto", price: 3420, change: +3.14 },
  { ticker: "SOL", name: "Solana", desc: "Blockchain haute performance, concurrent d'Ethereum. Fort écosystème DeFi, vitesse de transaction élevée.", cat: "Crypto", price: 185, change: -1.20 },
  { ticker: "BNB", name: "Binance Coin", desc: "Token natif de Binance. Utilisé pour réduire les frais. Lié à l'écosystème BSC et BNB Chain.", cat: "Crypto", price: 610, change: +0.55 },
  { ticker: "AVAX", name: "Avalanche", desc: "Blockchain interopérable avec des sous-réseaux. Concurrent d'Ethereum sur la finance institutionnelle.", cat: "Crypto", price: 38, change: -2.10 },
  { ticker: "AAPL", name: "Apple", desc: "Leader mondial en produits électroniques et services. Marge nette >25%. Rachat massif d'actions. Valeur refuge tech.", cat: "Action", price: 178, change: +0.43 },
  { ticker: "NVDA", name: "Nvidia", desc: "Dominant sur les GPU pour l'IA et le data center. Croissance explosive. Centre de l'infrastructure IA mondiale.", cat: "Action", price: 875, change: +2.90 },
  { ticker: "MSFT", name: "Microsoft", desc: "Azure cloud, Office, LinkedIn, OpenAI. Machine à cash-flow. Dividende croissant depuis 20 ans.", cat: "Action", price: 415, change: +0.71 },
  { ticker: "AMZN", name: "Amazon", desc: "AWS leader du cloud, e-commerce mondial. Forte diversification des revenus. Croissance structurelle.", cat: "Action", price: 185, change: +1.22 },
  { ticker: "NOVO", name: "Novo Nordisk", desc: "Leader mondial des médicaments contre l'obésité et le diabète. Ozempic. Croissance exceptionnelle en Europe.", cat: "Action", price: 108, change: -0.88 }
];

window.ROADMAP_DATA = [
  { year: "2026", title: "Phase 0 — Fondations", desc: "Ouvrir PEA + CTO chez Fortuneo. Activer le Livret A. Commencer DCA 600€/mois.", status: "active" },
  { year: "2026-2029", title: "Phase 1 — Alternance", desc: "DCA 400€/mois PEA + 150€ Livret A + 50€ crypto. Objectif : 16 500€ en PEA, 10 000€ apport immo.", status: "" },
  { year: "2029", title: "CDI Cybersécurité", desc: "Premier CDI, salaire ~2 200€ net. Passage en freelance visé à 25-26 ans.", status: "" },
  { year: "2030-2031", title: "Phase 2 — Apport immo", desc: "Rester chez les parents 12-18 mois. Turbo sur le Livret A. Atteindre 10 000€ d'apport.", status: "" },
  { year: "2031", title: "Phase 3 — Premier bien locatif", desc: "Studio Toulon base navale ~60 000€, 10k€ apport, locataire militaire. LMNP au réel.", status: "" },
  { year: "2033", title: "Phase 4 — Deuxième bien", desc: "Deuxième bien immobilier. Patrimoine >200k€. Accès crédit Lombard possible.", status: "" },
  { year: "2031-2033", title: "Phase 5 — CTO & Lombard", desc: "CTO dépasse 150k€. Ouverture banque privée. Premier crédit Lombard 40% de nantissement.", status: "" },
  { year: "2035", title: "Phase 6 — Scale", desc: "Salaire senior cyber >5 000€ net. Freelance SASU. 3 biens. Patrimoine >500k€.", status: "" },
  { year: "2040", title: "Liberté financière", desc: "Patrimoine >1M€. Revenus passifs > dépenses. Option de ne plus travailler.", status: "" }
];

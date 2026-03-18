/* ══════════════════════════════════════
   DATA.JS — Static data
   ══════════════════════════════════════ */

window.QUOTES = [
  { text: 'Le secret pour devenir riche est simple : dépense moins que tu gagnes, investis la différence.', author: 'Warren Buffett', role: 'Investisseur légendaire' },
  { text: "L'intérêt composé est la huitième merveille du monde. Celui qui le comprend le gagne ; celui qui ne le comprend pas le paie.", author: 'Albert Einstein', role: 'Physicien et penseur' },
  { text: "Ne mets pas tous tes œufs dans le même panier. La diversification est la seule règle d'or.", author: 'Andrew Carnegie', role: 'Industriel milliardaire' },
  { text: "Investir dans la connaissance produit toujours les meilleurs intérêts.", author: 'Benjamin Franklin', role: 'Père fondateur américain' },
  { text: "La bourse est un moyen de transférer l'argent des impatients vers les patients.", author: 'Warren Buffett', role: 'Investisseur légendaire' },
  { text: "Le risque vient de ne pas savoir ce que vous faites.", author: 'Warren Buffett', role: 'Investisseur légendaire' },
  { text: "Il faut être curieux, apprendre et continuer à apprendre. Cela s'applique à tout.", author: 'Charlie Munger', role: 'Vice-président Berkshire' },
  { text: "La clé n'est pas de prédire l'avenir, mais d'être prêt pour lui.", author: 'Pericles', role: 'Homme d\'État grec' },
  { text: "Ne cherche pas à trouver la bonne occasion. Crée-la.", author: 'George Bernard Shaw', role: 'Écrivain irlandais' },
  { text: "Les opportunités ne disparaissent pas. Quelqu'un d'autre les prend.", author: 'Wayne Gretzky', role: 'Joueur de hockey légendaire' },
  { text: "Il ne s'agit pas de combien d'argent tu gagnes, mais de combien tu gardes.", author: 'Robert Kiyosaki', role: 'Auteur de Rich Dad Poor Dad' },
  { text: "Le meilleur moment pour investir, c'était hier. Le deuxième meilleur moment, c'est maintenant.", author: 'Proverbe chinois', role: 'Sagesse ancestrale' },
  { text: "La patience est le compagnon de la sagesse.", author: 'Saint Augustin', role: 'Philosophe et théologien' },
  { text: "Si tu ne trouves pas un moyen de gagner de l'argent en dormant, tu travailleras jusqu'à ta mort.", author: 'Warren Buffett', role: 'Investisseur légendaire' },
  { text: "Ce n'est pas votre salaire qui vous rend riche, c'est vos habitudes de dépenses.", author: 'Charles Jaffe', role: 'Journaliste financier' }
];

window.PRINCIPLES = [
  { num: '01', title: 'Investir tôt et régulièrement', text: "L'intérêt composé multiplie ta mise dans le temps. Même de petites sommes investies régulièrement créent une fortune sur le long terme. Le temps est ton plus grand atout." },
  { num: '02', title: 'Diversifier son patrimoine', text: "Répartis tes investissements entre ETF, actions, immobilier et crypto. La diversification réduit le risque sans sacrifier le rendement potentiel à long terme." },
  { num: '03', title: 'Garder une vision long terme', text: "Les marchés fluctuent à court terme mais montent sur le long terme. Ignore le bruit quotidien et reste concentré sur tes objectifs à 10-20 ans." },
  { num: '04', title: 'Automatiser son épargne', text: "Mets en place un virement automatique dès le jour de paie. Ce que tu ne vois pas, tu ne le dépenses pas. Le DCA automatique élimine les biais émotionnels." },
  { num: '05', title: 'Contrôler ses émotions', text: "Panique et euphorie sont les ennemis du rendement. Crée un plan d'investissement et respecte-le, quelles que soient les turbulences du marché." },
  { num: '06', title: 'Continuer à apprendre', text: "La finance évolue constamment. Lis, écoute des podcasts, suis les grands investisseurs. La connaissance est le meilleur investissement que tu puisses faire." }
];

window.READING_LIST = [
  { emoji: '📈', title: 'The Intelligent Investor', author: 'Benjamin Graham', desc: 'La bible de l\'investissement value. Indispensable pour tout investisseur sérieux.', badge: 'Classique' },
  { emoji: '🏠', title: 'Rich Dad Poor Dad', author: 'Robert Kiyosaki', desc: 'Comment penser comme les riches et bâtir des actifs qui génèrent des revenus passifs.', badge: 'Bestseller' },
  { emoji: '🧠', title: 'Psychology of Money', author: 'Morgan Housel', desc: 'Les comportements qui déterminent ton succès financier plus que n\'importe quelle formule.', badge: 'Essentiel' },
  { emoji: '🎯', title: 'A Random Walk Down Wall Street', author: 'Burton Malkiel', desc: 'Pourquoi les ETF indiciels battent la quasi-totalité des gérants actifs sur le long terme.', badge: 'Référence' },
  { emoji: '💡', title: 'The Millionaire Next Door', author: 'Thomas Stanley', desc: 'L\'étude des vrais millionnaires américains : frugalité, investissement et discipline.', badge: 'Étude' },
  { emoji: '🚀', title: 'Zero to One', author: 'Peter Thiel', desc: 'Comment construire des entreprises qui créent de la valeur durable. Vision entrepreneuriale.', badge: 'Croissance' }
];

window.CATALOG_DATA = [
  { ticker: 'CW8',   name: 'Amundi MSCI World',       desc: 'ETF monde développé — 1 600+ entreprises',  cat: 'ETF',    pea: true,  price: 420.50, change: 0.82 },
  { ticker: 'PE500', name: 'Amundi PEA S&P 500',      desc: 'Les 500 plus grandes entreprises US',        cat: 'ETF',    pea: true,  price: 62.30,  change: 1.12 },
  { ticker: 'PUST',  name: 'Lyxor PEA Nasdaq',        desc: 'Les 100 plus grandes tech US',              cat: 'ETF',    pea: true,  price: 45.20,  change: 1.34 },
  { ticker: 'AEEM',  name: 'Amundi Emerging Markets', desc: 'Marchés émergents : Asie, Amérique latine', cat: 'ETF',    pea: false, price: 5.80,   change: -0.43 },
  { ticker: 'EWLD',  name: 'iShares Core MSCI World', desc: 'Réplication physique, frais réduits',        cat: 'ETF',    pea: false, price: 75.40,  change: 0.67 },
  { ticker: 'AAPL',  name: 'Apple Inc.',               desc: 'Leader tech — iPhone, Mac, Services',      cat: 'Action', pea: false, price: 178.00, change: 0.45 },
  { ticker: 'NVDA',  name: 'NVIDIA Corporation',       desc: 'Puces IA, data centers et jeux vidéo',     cat: 'Action', pea: false, price: 875.00, change: 2.38 },
  { ticker: 'MSFT',  name: 'Microsoft Corporation',    desc: 'Cloud Azure, Office, IA avec OpenAI',      cat: 'Action', pea: false, price: 415.00, change: 0.91 },
  { ticker: 'AMZN',  name: 'Amazon.com Inc.',          desc: 'E-commerce, AWS, cloud computing',         cat: 'Action', pea: false, price: 185.00, change: -0.22 },
  { ticker: 'NOVO',  name: 'Novo Nordisk',             desc: 'Biotech danoise, leader Ozempic et diabète', cat: 'Action', pea: false, price: 108.00, change: -1.14 },
  { ticker: 'BTC',   name: 'Bitcoin',                  desc: 'Or numérique, réserve de valeur décentralisée', cat: 'Crypto', pea: false, price: 85200, change: 3.21 },
  { ticker: 'ETH',   name: 'Ethereum',                 desc: 'Plateforme smart contracts n°1',           cat: 'Crypto', pea: false, price: 3420,  change: 2.18 },
  { ticker: 'SOL',   name: 'Solana',                   desc: 'Blockchain haute performance, DeFi et NFT', cat: 'Crypto', pea: false, price: 185,   change: 4.56 },
  { ticker: 'BNB',   name: 'BNB',                      desc: 'Token Binance, frais et DeFi',             cat: 'Crypto', pea: false, price: 610,   change: 1.02 },
  { ticker: 'AVAX',  name: 'Avalanche',                desc: 'Réseau multi-chaînes rapide et scalable',  cat: 'Crypto', pea: false, price: 38,    change: -2.15 }
];

window.ROADMAP_DATA = [
  { year: '2024', title: 'Premiers pas', desc: 'Ouverture PEA, premiers ETF World, épargne d\'urgence constituée.', status: 'done' },
  { year: '2025', title: 'Montée en puissance', desc: 'DCA mensuel automatisé à 600€, diversification crypto (10%), suivi patrimonial régulier.', status: 'done' },
  { year: '2026', title: 'Accélération', desc: 'Augmentation DCA à 1 000€/mois, premier investissement immobilier SCPI, patrimoine > 50K€.', status: 'progress' },
  { year: '2027', title: 'Immobilier direct', desc: 'Acquisition d\'un bien locatif avec levier bancaire optimal, cash-flow positif dès l\'achat.', status: 'planned' },
  { year: '2028', title: 'Diversification avancée', desc: 'Private equity, obligations d\'entreprises, exploration actifs alternatifs (forêts, art).', status: 'planned' },
  { year: '2029', title: 'Revenus passifs 1K€/mois', desc: 'Dividendes + loyers + cryptos = 1 000€/mois de revenus passifs sans toucher au capital.', status: 'planned' },
  { year: '2030', title: 'Patrimoine 250K€', desc: 'Cap symbolique des 250 000€, mise en place d\'une holding familiale pour optimiser la fiscalité.', status: 'planned' },
  { year: '2033', title: 'Semi-retraite', desc: 'Revenus passifs couvrent 50% des dépenses. Possibilité de travailler par choix, pas par nécessité.', status: 'planned' },
  { year: '2040', title: 'Liberté Financière', desc: 'Revenus passifs > dépenses totales. La liberté de choisir sa vie, 100% de son temps.', status: 'planned' }
];

export function generateDemoData() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const entries = [];

  // Base monthly targets with slight variation
  const baseMonthlyCA = [
    8200, 9400, 7800, 10200, 11500, 9800,
    12300, 10900, 13200, 11800, 14100, 15600,
    9100, 10500, 11200, 13800, 12600, 14900,
  ];

  // Generate 15 months of history ending at current month
  for (let i = 14; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthIndex = (14 - i) % baseMonthlyCA.length;
    const base = baseMonthlyCA[monthIndex];

    // Number of entries per month: 3–8
    const numEntries = Math.floor(Math.random() * 6) + 3;
    let remaining = base * (0.9 + Math.random() * 0.2);

    for (let j = 0; j < numEntries; j++) {
      const isLast = j === numEntries - 1;
      const amount = isLast
        ? Math.round(remaining)
        : Math.round(remaining / (numEntries - j) * (0.7 + Math.random() * 0.6));
      remaining -= amount;

      const day = Math.floor(Math.random() * 26) + 1;
      const notes = [
        'Prestation conseil', 'Développement web', 'Mission freelance',
        'Audit technique', 'Formation client', 'Projet e-commerce',
        'Refonte site', 'Maintenance applicative', 'Consulting UX',
        'Intégration API', 'SEO & analytics', 'Développement mobile',
        'Dashboard client', 'Support prioritaire', 'Audit sécurité',
      ];
      entries.push({
        id: `demo-${year}-${month}-${j}`,
        amount: Math.max(amount, 500),
        note: notes[Math.floor(Math.random() * notes.length)],
        date: new Date(year, month, day).toISOString().split('T')[0],
      });
    }
  }

  return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
}

const { searchNotes } = require('../notes/search');

const notes = [
  {
    id: '1', owner: 'a', status: 'ready', createdAt: 1,
    title: 'Transitioning From Vim To NeoVim',
    summary: 'Moved from Vim to NeoVim and got Telescope working.',
    tags: ['editor', 'neovim'],
    keywords: ['Vim', 'NeoVim', 'Telescope', 'LSP'],
    text: 'Today I transitioned from Vim to NeoVim and I am pretty happy with it.',
  },
  {
    id: '2', owner: 'a', status: 'ready', createdAt: 2,
    title: 'Monthly Budget Review',
    summary: 'Reviewed spending and planned next month.',
    tags: ['finance', 'budget-2026'],
    keywords: ['budget', 'Excel'],
    text: 'I need to cut spending on food and track everything in the spreadsheet.',
  },
  {
    id: '3', owner: 'a', status: 'pending', createdAt: 3,
    title: null, summary: '', tags: [], keywords: [],
    text: 'I mentioned the telescope plugin for fuzzy finding files inside neovim.',
  },
];

const expected = {
  neovim: '1',
  'telescope fuzzy': '3',
  'what is my budget': '2',
  budg: '2',
};

for (const [q, winner] of Object.entries(expected)) {
  const top = searchNotes(notes, q)[0]?.id;
  console.log(top === winner ? 'PASS' : 'FAIL', `"${q}" -> top ${top}, expected ${winner}`);
}

// for (const q of ['neovim', 'telescope fuzzy', 'what is my budget', 'budg', 'the', 'zzzz']) {
//   console.log(`\n"${q}"`);
//   for (const r of searchNotes(notes, q)) console.log(' ', r.id, r.score, r.matched);
// }

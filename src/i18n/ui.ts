export const langues = { fr: 'Français', en: 'English' } as const;
export type Langue = keyof typeof langues;

export const ui = {
  fr: {
    'nav.approche': 'Approche',
    'nav.offres': 'Offres',
    'nav.devlog': 'Devlog',
    'nav.apropos': 'À propos',
    'nav.cta': 'Planifier un appel',
    'signature': 'Penser la tech pour durer',
    'pied.lieu': 'Québec, CA',
  },
  en: {
    'nav.approche': 'Approach',
    'nav.offres': 'Services',
    'nav.devlog': 'Devlog',
    'nav.apropos': 'About',
    'nav.cta': 'Book a call',
    'signature': 'Building tech that lasts',
    'pied.lieu': 'Quebec, CA',
  },
} as const;

export function t(lang: Langue) {
  return (cle: keyof (typeof ui)['fr']) => ui[lang][cle];
}

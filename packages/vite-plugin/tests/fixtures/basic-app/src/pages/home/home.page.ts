const homeCopy = {
  'home.title': 'Build with Vanrot',
  'home.summary': 'Start with named routes, page files, and a small runtime foundation.',
  'home.cta': 'Start building',
} as const;

type HomeCopyKey = keyof typeof homeCopy;

export class HomePage {
  t(key: HomeCopyKey): string {
    return homeCopy[key];
  }
}

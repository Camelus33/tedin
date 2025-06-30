import { createNavigation } from 'next-intl/navigation';

export const locales = ['ko', 'en'] as const;

export const { Link, redirect, usePathname, useRouter } =
  createNavigation({ locales }); 
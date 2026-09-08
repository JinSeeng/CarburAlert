import type { Link } from 'react-router-dom';

declare module '@codegouvfr/react-dsfr/link' {
  interface RegisterLink {
    Link: typeof Link;
  }
}

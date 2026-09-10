import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = "Page introuvable — Carbur'Alert";
  }, []);

  return (
    <>
      <h1>Page introuvable</h1>
      <p>Cette station ou cette page n'existe pas.</p>
      <Link to="/">Retour à la recherche</Link>
    </>
  );
}

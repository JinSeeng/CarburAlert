import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EtatErreur from './EtatErreur';

describe('EtatErreur', () => {
  it("affiche le message d'erreur transmis, sans détail technique ajouté", () => {
    render(
      <EtatErreur message="Impossible de contacter le service." onReessayer={() => {}} />,
    );

    const alerte = screen.getByRole('alert');
    expect(alerte).toHaveTextContent('Impossible de contacter le service.');
    expect(alerte).not.toHaveTextContent(/http|500|502|503|stack/i);
  });

  it('permet de relancer la recherche via le bouton "Réessayer"', async () => {
    const onReessayer = vi.fn();
    const utilisateur = userEvent.setup();

    render(<EtatErreur message="Erreur réseau." onReessayer={onReessayer} />);

    await utilisateur.click(screen.getByRole('button', { name: /réessayer/i }));

    expect(onReessayer).toHaveBeenCalledTimes(1);
  });

  it('active le bouton "Réessayer" au clavier (Tab puis Entrée), sans souris (US C4)', async () => {
    const onReessayer = vi.fn();
    const utilisateur = userEvent.setup();

    render(<EtatErreur message="Erreur réseau." onReessayer={onReessayer} />);

    await utilisateur.tab();
    expect(screen.getByRole('button', { name: /réessayer/i })).toHaveFocus();

    await utilisateur.keyboard('{Enter}');
    expect(onReessayer).toHaveBeenCalledTimes(1);
  });
});

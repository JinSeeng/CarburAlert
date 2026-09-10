import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EtatVide from './EtatVide';

describe('EtatVide', () => {
  it("affiche un message explicite d'absence de résultat", () => {
    render(<EtatVide onElargirRayon={() => {}} />);

    expect(screen.getByText(/aucune station trouvée/i)).toBeInTheDocument();
  });

  it('propose une action concrète : élargir le rayon', async () => {
    const onElargirRayon = vi.fn();
    const utilisateur = userEvent.setup();

    render(<EtatVide onElargirRayon={onElargirRayon} />);

    await utilisateur.click(screen.getByRole('button', { name: /élargir le rayon/i }));

    expect(onElargirRayon).toHaveBeenCalledTimes(1);
  });

  it('active le bouton "Élargir le rayon" au clavier (Tab puis Entrée), sans souris (US C4)', async () => {
    const onElargirRayon = vi.fn();
    const utilisateur = userEvent.setup();

    render(<EtatVide onElargirRayon={onElargirRayon} />);

    await utilisateur.tab();
    expect(screen.getByRole('button', { name: /élargir le rayon/i })).toHaveFocus();

    await utilisateur.keyboard('{Enter}');
    expect(onElargirRayon).toHaveBeenCalledTimes(1);
  });
});

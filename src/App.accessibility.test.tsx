import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('accessibilite de la page', () => {
  it('permet d aller directement au contenu principal', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    )

    const lien = screen.getByRole('link', {
      name: 'Aller au contenu principal',
    })
    const contenu = document.getElementById('contenu-principal')

    expect(lien.getAttribute('href')).toBe('#contenu-principal')
    expect(contenu?.getAttribute('tabindex')).toBe('-1')
  })
})
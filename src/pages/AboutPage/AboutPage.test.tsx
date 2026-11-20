import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import AboutPage from './AboutPage';

function renderAboutPage() {
  return render(
    <MemoryRouter>
      <AboutPage />
    </MemoryRouter>,
  );
}

describe('AboutPage', () => {
  it('introduces TableMate and links diners to restaurants', () => {
    renderAboutPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Good food deserves a great story.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /TableMate helps curious diners discover remarkable restaurants/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Explore restaurants' }),
    ).toHaveAttribute('href', '/restaurants');
  });

  it('renders the three TableMate values', () => {
    renderAboutPage();

    const values = screen.getByRole('region', {
      name: 'Dining with intention',
    });
    const cards = within(values).getAllByRole('article');

    expect(cards).toHaveLength(3);
    expect(
      within(values).getByRole('heading', {
        name: 'Thoughtfully curated',
      }),
    ).toBeInTheDocument();
    expect(
      within(values).getByRole('heading', {
        name: 'Details that delight',
      }),
    ).toBeInTheDocument();
    expect(
      within(values).getByRole('heading', {
        name: 'Hospitality first',
      }),
    ).toBeInTheDocument();
  });

  it('provides a closing discovery call to action', () => {
    renderAboutPage();

    const callToAction = screen.getByRole('region', {
      name: 'Come hungry. Leave inspired.',
    });

    expect(
      within(callToAction).getByText(
        'Browse our collection and find a table that feels just right.',
      ),
    ).toBeInTheDocument();
    expect(
      within(callToAction).getByRole('link', { name: 'Start exploring' }),
    ).toHaveAttribute('href', '/restaurants');
  });
});
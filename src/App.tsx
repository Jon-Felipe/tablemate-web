import { useEffect, useState } from 'react';
import './App.css';

import type { Restaurant } from './types/restaurant';
import { getRestaurants } from './api/restaurants';

function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const data = await getRestaurants();
        setRestaurants(data);
      } catch {
        setError('Unable to load restaurants. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    void loadRestaurants();
  }, []);

  return (
    <div className='app'>
      <header className='site-header'>
        <a href='/' className='brand'>
          TableMate <span>.</span>
        </a>

        <nav aria-label='Main navigation'>
          <a href='#restaurants'>Restaurants</a>
          <a href='#about'>About</a>
        </nav>
      </header>

      <main>
        <section className='hero'>
          <p className='eyebrow'>YOUR NEXT TABLE AWAITS</p>
          <h1>
            Good food.
            <br />
            Great company.
          </h1>

          <p className='hero-description'>
            Discover restaurants, explore new flavours, and find your next
            favourite place to eat.
          </p>

          <a href='#restaurants' className='primary-button'>
            Explore restaurants
          </a>
        </section>

        <section id='restaurants' className='restaurants-section'>
          <div className='section-heading'>
            <div>
              <p className='eyebrow'>FIND YOUR TABLE</p>
              <h2>Explore restaurants</h2>
            </div>

            <p className='section-description'>
              A great meal starts with a great place.
            </p>
          </div>

          {isLoading && <p role='status'>Loading restaurants...</p>}

          {!isLoading && error && <p role='alert'>{error}</p>}

          {!isLoading && !error && restaurants.length === 0 && (
            <div className='empty-state'>
              <h3>No restaurants yet</h3>
              <p>Check back soon to discover places to eat.</p>
            </div>
          )}

          {!isLoading && !error && restaurants.length > 0 && (
            <div className='restaurant-grid'>
              {restaurants.map((restaurant) => (
                <article className='restaurant-card' key={restaurant.id}>
                  <div className='restaurant-card-content'>
                    <p className='restaurant-cuisine'>{restaurant.cuisine}</p>
                    <h3>{restaurant.name}</h3>
                    <p className='restaurant-description'>
                      {restaurant.description}
                    </p>
                    <p className='restaurant-location'>
                      {restaurant.address}, {restaurant.city}
                    </p>
                    <p className='restaurant-rating'>
                      <span aria-hidden='true'>★</span>{' '}
                      {restaurant.rating.toFixed(1)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id='about' className='about-section'>
          <h2>Made for people who love good food.</h2>
          <p>TableMate makes discovering your next dining experience simple.</p>
        </section>
      </main>

      <footer className='site-footer'>
        <p>TableMate © 2026</p>
        <p>Find your next favourite table.</p>
      </footer>
    </div>
  );
}

export default App;

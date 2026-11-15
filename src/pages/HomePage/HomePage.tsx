import { useState } from 'react';
import { Link } from 'react-router';

// extras
import { useGetRestaurantsQuery } from '../../services/restaurantApi';
import './HomePage.css';
import { popularCuisines } from '../../constants/dummyData';

function HomePage() {
  const {
    data: restaurants = [],
    isLoading,
    isError,
  } = useGetRestaurantsQuery();

  const [favourites, setFavourites] = useState<string[]>([]);

  const toggleFavourite = (restaurantId: string) => {
    setFavourites((prev) =>
      prev.includes(restaurantId)
        ? prev.filter((id) => id !== restaurantId)
        : [...prev, restaurantId],
    );
  };

  return (
    <div>
      <section className='hero'>
        <p className='hero-badge'>
          <span aria-hidden='true'>●</span> DIRECT LIVE TABLE RESERVATIONS
        </p>

        <h1>
          Discover great restaurants
          <br />
          Make every meal memorable.
        </h1>

        <p className='hero-description'>
          Find your table. Discover and reserve tables at the best restaurants
          in your city.
        </p>

        <div className='hero-search'>
          <div className='hero-search-field'>
            <span aria-hidden='true'>🍴</span>
            <div>
              <label htmlFor='cuisine'>CUISINE OR VIBE</label>
              <input
                id='cuisine'
                type='text'
                placeholder='Osteria, omakase, natural wine...'
              />
            </div>
          </div>

          <div className='hero-search-field'>
            <span aria-hidden='true'>📍</span>
            <div>
              <label htmlFor='location'>LOCATION</label>
              <select id='location' defaultValue='SoHo & Downtown, NY'>
                <option value='SoHo & Downtown, NY'>SoHo & Downtown, NY</option>
                <option value='Midtown, NY'>Midtown, NY</option>
                <option value='Upper East Side, NY'>Upper East Side, NY</option>
                <option value='Upper West Side, NY'>Upper West Side, NY</option>
              </select>
            </div>
          </div>

          <div className='hero-search-field'>
            <span aria-hidden='true'>📅</span>
            <div>
              <label htmlFor='date'>DATE</label>
              <input id='date' type='date' />
            </div>
          </div>

          <div className='hero-search-field party-field'>
            <span aria-hidden='true'>👥</span>
            <div>
              <label htmlFor='party'>PARTY</label>
              <select id='party' defaultValue='2'>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type='button'
            className='hero-search-button'
            onClick={() => {}}
          >
            <span aria-hidden='true'>⌕</span> Find a Table
          </button>

          <div className='hero-trending'>
            <span>Trending Now:</span>
            {['Omakase', 'Natural Wine', 'Ramen', 'Vegan'].map((trend) => (
              <button key={trend} type='button' className='trending-tag'>
                {trend}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className='cuisines-section'>
        <div className='cuisines-heading'>
          <div>
            <p className='eyebrow'>GASTRONOMIC HORIZONS</p>
            <h2>Explore Popular Cuisines</h2>
          </div>

          <p className='cuisines-description'>
            Handpicked selections of the most popular cuisines for you to
            explore.
          </p>
        </div>

        <div className='cuisines-grid'>
          {popularCuisines.map((cuisine) => (
            <Link
              key={cuisine.id}
              to={`/restaurants?cuisine=${encodeURIComponent(cuisine.name)}`}
              className='cuisine-card'
            >
              <img
                src={cuisine.image}
                alt={`${cuisine.name} cuisine`}
                className='cuisine-image'
                loading='lazy'
              />

              <div className='cuisine-overlay' />

              <div className='cuisine-content'>
                <p>{cuisine.subtitle}</p>
                <h3>{cuisine.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Dining Rooms */}
      {!isLoading && !isError && restaurants.length > 0 && (
        <section className='featured-section'>
          <div className='featured-heading'>
            <div>
              <p className='eyebrow'>RESERVED BY FOOD LOVERS</p>
              <h2>Featured Dining Rooms</h2>
            </div>

            <Link to='/restaurants' className='featured-view-all'>
              View All venues <span>&rarr;</span>
            </Link>
          </div>

          <div className='featured-grid'>
            {restaurants.slice(0, 6).map((restaurant, index) => (
              <article key={restaurant.id} className='featured-card'>
                <div className='featured-image-wrapper'>
                  <img
                    src={restaurant.imageUrl}
                    alt={`Food and dining at ${restaurant.name}`}
                    loading='lazy'
                    className='featured-image'
                  />

                  <div className='featured-badges'>
                    <span className='featured-badge'>
                      {
                        [
                          'Michelin Guide',
                          '16-Course Tasting',
                          'Organic Wine List',
                          'Craft Menu',
                        ][index]
                      }
                    </span>

                    {index === 0 && (
                      <span className='featured-badge popular-badge'>
                        Popular Today
                      </span>
                    )}
                  </div>

                  <button
                    type='button'
                    className={`favorite-button ${favourites.includes(restaurant.id) ? 'is-favorite' : ''}`}
                    onClick={() => toggleFavourite(restaurant.id)}
                    aria-label={
                      favourites.includes(restaurant.id)
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                    }
                  >
                    {favourites.includes(restaurant.id) ? '★' : '☆'}
                  </button>
                </div>

                <div className='featured-content'>
                  <div className='featured-title-row'>
                    <h3>{restaurant.name}</h3>

                    <div className='featured-rating'>
                      <span>★</span>
                      {Number(restaurant.rating || 0).toFixed(1)}
                    </div>
                  </div>

                  <p className='featured-meta'>
                    {restaurant.cuisine}
                    {restaurant.city && ` • ${restaurant.city}`}
                  </p>

                  <div className='featured-availability'>
                    <p>AVAILABLE TODAY:</p>

                    <div className='time-slots'></div>
                  </div>

                  <div className='featured-actions'>
                    <Link
                      to={`/restaurants/${encodeURIComponent(restaurant.id)}`}
                      className='featured-details-button'
                    >
                      View Details
                    </Link>

                    <Link
                      to={`/restaurants/${encodeURIComponent(restaurant.id)}`}
                      className='featured-reserve-button'
                    >
                      Reserve Table
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Why Diners Trust Us */}
      <section className='trust-section'>
        <div className='trust-heading'>
          <p className='eyebrow'>THE TABLEMATE STANDARD</p>
          <h2>Why Discerning Diners Trust Us</h2>
          <p>
            Built for seamless discovery, instant certainty, and genuine
            hospitality.
          </p>
        </div>

        <div className='trust-grid'>
          <article className='trust-card'>
            <div className='trust-icon' aria-hidden='true'>
              ✥
            </div>

            <h3>Curated Excellence</h3>

            <p>
              Every dining room on TableMate is vetted by our culinary concierge
              team. Zero noise, zero sponsored low-tier eateries—only craft,
              consistency, and character.
            </p>

            <div className='trust-card-footer'>
              <span>⊙</span>
              Over 2,400 handpicked venues
            </div>
          </article>

          <article className='trust-card'>
            <div className='trust-icon' aria-hidden='true'>
              ⏱
            </div>

            <h3>Instant Confirmed Tables</h3>

            <p>
              Direct host-station syncing eliminates the dreaded waitlist limbo.
              When you book on TableMate, your party is firmly guaranteed in the
              restaurant's live book.
            </p>

            <div className='trust-card-footer'>
              <span>⏱</span>
              100% real-time synchronized seating
            </div>
          </article>

          <article className='trust-card'>
            <div className='trust-icon' aria-hidden='true'>
              🍽
            </div>

            <h3>Authentic Gastronomy</h3>

            <p>
              Read verified diner accounts, preview sommelier cellars, explore
              dietary accommodation indexes, and discover hidden signature
              dishes before you sit.
            </p>

            <div className='trust-card-footer'>
              <span>🍽</span>
              Full transparent menus & pairings
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

export default HomePage;

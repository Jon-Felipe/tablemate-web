import { useState } from 'react';
import { Link } from 'react-router';
import {
  FaAward,
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaGlobe,
  FaMapMarkerAlt,
  FaSearch,
  FaStar,
  FaUtensils,
  FaUsers,
  FaRegStar,
} from 'react-icons/fa';

// extras
import { useGetRestaurantsQuery } from '../../services/restaurantApi';
import styles from './HomePage.module.css';
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
      <section className={styles.hero}>
        <p className={styles.heroBadge}>
          <FaClock aria-hidden='true' /> DIRECT LIVE TABLE RESERVATIONS
        </p>

        <h1>
          Discover great restaurants
          <br />
          Make every meal memorable.
        </h1>

        <p className={styles.heroDescription}>
          Find your table. Discover and reserve tables at the best restaurants
          in your city.
        </p>

        <div className={styles.heroSearch}>
          <div className={styles.heroSearchField}>
            <FaUtensils aria-hidden='true' />
            <div>
              <label htmlFor='cuisine'>CUISINE OR VIBE</label>
              <input
                id='cuisine'
                type='text'
                placeholder='Osteria, omakase, natural wine...'
              />
            </div>
          </div>

          <div className={styles.heroSearchField}>
            <FaMapMarkerAlt aria-hidden='true' />
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

          <div className={styles.heroSearchField}>
            <FaCalendarAlt aria-hidden='true' />
            <div>
              <label htmlFor='date'>DATE</label>
              <input id='date' type='date' />
            </div>
          </div>

          <div className={styles.heroSearchField}>
            <FaUsers aria-hidden='true' />
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
            className={styles.heroSearchButton}
            onClick={() => {}}
          >
            <FaSearch aria-hidden='true' /> Find a Table
          </button>

          <div className={styles.heroTrending}>
            <span>Trending Now:</span>
            {['Omakase', 'Natural Wine', 'Ramen', 'Vegan'].map((trend) => (
              <button
                key={trend}
                type='button'
                className={styles.trendingTag}
              >
                {trend}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cuisinesSection}>
        <div className={styles.cuisinesHeading}>
          <div>
            <p className={styles.eyebrow}>GASTRONOMIC HORIZONS</p>
            <h2>Explore Popular Cuisines</h2>
          </div>

          <p className={styles.cuisinesDescription}>
            Handpicked selections of the most popular cuisines for you to
            explore.
          </p>
        </div>

        <div className={styles.cuisinesGrid}>
          {popularCuisines.map((cuisine) => (
            <Link
              key={cuisine.id}
              to={`/restaurants?cuisine=${encodeURIComponent(cuisine.name)}`}
              className={styles.cuisineCard}
            >
              <img
                src={cuisine.image}
                alt={`${cuisine.name} cuisine`}
                className={styles.cuisineImage}
                loading='lazy'
              />

              <div className={styles.cuisineOverlay} />

              <div className={styles.cuisineContent}>
                <p>{cuisine.subtitle}</p>
                <h3>{cuisine.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Dining Rooms */}
      {!isLoading && !isError && restaurants.length > 0 && (
        <section className={styles.featuredSection}>
          <div className={styles.featuredHeading}>
            <div>
              <p className={styles.eyebrow}>RESERVED BY FOOD LOVERS</p>
              <h2>Featured Dining Rooms</h2>
            </div>

            <Link to='/restaurants' className={styles.featuredViewAll}>
              View All venues <FaArrowRight aria-hidden='true' />
            </Link>
          </div>

          <div className={styles.featuredGrid}>
            {restaurants.slice(0, 6).map((restaurant, index) => (
              <article
                key={restaurant.id}
                className={styles.featuredCard}
              >
                <div className={styles.featuredImageWrapper}>
                  <img
                    src={restaurant.imageUrl}
                    alt={`Food and dining at ${restaurant.name}`}
                    loading='lazy'
                    className={styles.featuredImage}
                  />

                  <div className={styles.featuredBadges}>
                    <span className={styles.featuredBadge}>
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
                      <span
                        className={`${styles.featuredBadge} ${styles.popularBadge}`}
                      >
                        Popular Today
                      </span>
                    )}
                  </div>

                  <button
                    type='button'
                    className={`${styles.favoriteButton} ${favourites.includes(restaurant.id) ? styles.isFavorite : ''}`}
                    onClick={() => toggleFavourite(restaurant.id)}
                    aria-label={
                      favourites.includes(restaurant.id)
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                    }
                  >
                    {favourites.includes(restaurant.id) ? (
                      <FaStar aria-hidden='true' />
                    ) : (
                      <FaRegStar aria-hidden='true' />
                    )}
                  </button>
                </div>

                <div className={styles.featuredContent}>
                  <div className={styles.featuredTitleRow}>
                    <h3>{restaurant.name}</h3>

                    <div className={styles.featuredRating}>
                      <FaStar aria-hidden='true' />
                      {Number(restaurant.rating || 0).toFixed(1)}
                    </div>
                  </div>

                  <p className={styles.featuredMeta}>
                    {restaurant.cuisine}
                    {restaurant.city && ` • ${restaurant.city}`}
                  </p>

                  <div className={styles.featuredAvailability}>
                    <p>AVAILABLE TODAY:</p>

                    <div className={styles.timeSlots}></div>
                  </div>

                  <div className={styles.featuredActions}>
                    <Link
                      to={`/restaurants/${encodeURIComponent(restaurant.id)}`}
                      className={styles.featuredDetailsButton}
                    >
                      View Details
                    </Link>

                    <Link
                      to={`/restaurants/${encodeURIComponent(restaurant.id)}`}
                      className={styles.featuredReserveButton}
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
      <section className={styles.trustSection}>
        <div className={styles.trustHeading}>
          <p className={styles.eyebrow}>THE TABLEMATE STANDARD</p>
          <h2>Why Discerning Diners Trust Us</h2>
          <p>
            Built for seamless discovery, instant certainty, and genuine
            hospitality.
          </p>
        </div>

        <div className={styles.trustGrid}>
          <article className={styles.trustCard}>
            <div className={styles.trustIcon} aria-hidden='true'>
              <FaAward />
            </div>

            <h3>Curated Excellence</h3>

            <p>
              Every dining room on TableMate is vetted by our culinary concierge
              team. Zero noise, zero sponsored low-tier eateries—only craft,
              consistency, and character.
            </p>

            <div className={styles.trustCardFooter}>
              <FaGlobe aria-hidden='true' />
              Over 2,400 handpicked venues
            </div>
          </article>

          <article className={styles.trustCard}>
            <div className={styles.trustIcon} aria-hidden='true'>
              <FaClock />
            </div>

            <h3>Instant Confirmed Tables</h3>

            <p>
              Direct host-station syncing eliminates the dreaded waitlist limbo.
              When you book on TableMate, your party is firmly guaranteed in the
              restaurant's live book.
            </p>

            <div className={styles.trustCardFooter}>
              <FaClock aria-hidden='true' />
              100% real-time synchronized seating
            </div>
          </article>

          <article className={styles.trustCard}>
            <div className={styles.trustIcon} aria-hidden='true'>
              <FaUtensils />
            </div>

            <h3>Authentic Gastronomy</h3>

            <p>
              Read verified diner accounts, preview sommelier cellars, explore
              dietary accommodation indexes, and discover hidden signature
              dishes before you sit.
            </p>

            <div className={styles.trustCardFooter}>
              <FaUtensils aria-hidden='true' />
              Full transparent menus & pairings
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

export default HomePage;

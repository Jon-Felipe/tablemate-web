import { type SubmitEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { FaAward, FaClock, FaGlobe, FaUtensils } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  LuSearch,
  LuMapPin,
  LuUsers,
  LuChevronDown,
  LuCompass,
  LuBookmark,
  LuStar,
  LuArrowRight,
} from 'react-icons/lu';

// extras
import { useGetRestaurantsQuery } from '../../services/restaurantApi';
import styles from './HomePage.module.css';

const southAfricanCities = [
  'Johannesburg',
  'Cape Town',
  'Durban',
  'Pretoria',
  'Gqeberha',
  'Bloemfontein',
  'East London',
  'Polokwane',
  'Kimberley',
  'Mbombela',
];
const filters = ['All', 'Top Rated', 'New', 'Nearby'];

function HomePage() {
  const { data: restaurants = [] } = useGetRestaurantsQuery();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [guests, setGuests] = useState<string>('2');

  function handleDiscoverSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!searchQuery || !location || !guests) {
      toast.error('Please fill in all search fields.');
      return;
    }
    navigate(
      `/restaurants?search=${searchQuery}&location=${location}&guests=${guests}`,
    );
  }

  return (
    <div>
      <section className={styles.hero}>
        {/* Hero Heading */}
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Find your next <span>favourite place.</span>
          </h1>

          <p className={styles.description}>
            Curated dining destinations, neighborhood secrets, and celebrated
            culinary
            <br className={styles.desktopBreak} />
            rooms across the globe. Reviewed with candor, reserved with ease.
          </p>
        </div>

        {/* Search Bar */}
        <form
          className={styles.searchContainer}
          onSubmit={handleDiscoverSubmit}
          role='search'
        >
          {/* Cuisine or Spot */}
          <div className={`${styles.searchField} ${styles.cuisineField}`}>
            <LuSearch className={styles.fieldIcon} size={21} />

            <div className={styles.fieldContent}>
              <label htmlFor='restaurant-search'>Cuisine or Spot</label>
              <input
                id='restaurant-search'
                name='restaurant-search'
                className={styles.searchInput}
                type='text'
                placeholder='Search restaurant, district...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className={`${styles.searchField} ${styles.locationField}`}>
            <LuMapPin className={styles.fieldIcon} size={21} />

            <div className={styles.fieldContent}>
              <label htmlFor='location-search'>Location</label>
              <select
                id='location-search'
                name='location-search'
                className={`${styles.searchInput} ${styles.fieldSelect}`}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                defaultValue=''
              >
                <option value='' disabled>
                  Choose a city...
                </option>
                {southAfricanCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <LuChevronDown className={styles.fieldChevron} size={15} />
          </div>

          {/* Guests */}
          <div className={`${styles.searchField} ${styles.reservationField}`}>
            <LuUsers className={styles.fieldIcon} size={21} />

            <div className={styles.fieldContent}>
              <label htmlFor='guest-count'>Guests</label>
              <select
                id='guest-count'
                name='guest-count'
                className={`${styles.searchInput} ${styles.fieldSelect}`}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                defaultValue='2'
              >
                {Array.from({ length: 10 }, (_, index) => index + 1).map(
                  (count) => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? 'guest' : 'guests'}
                    </option>
                  ),
                )}
              </select>
            </div>

            <LuChevronDown className={styles.fieldChevron} size={15} />
          </div>

          {/* Discover Button */}
          <button type='submit' className={styles.discoverButton}>
            <LuCompass size={21} strokeWidth={2} />
            <span>Discover</span>
          </button>
        </form>
      </section>

      <section className={styles.featuredSection}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Explore restaurants</h2>

          <div className={styles.filters}>
            {filters.map((filter, index) => (
              <span
                key={filter}
                className={`${styles.filter} ${
                  index === 0 ? styles.activeFilter : ''
                }`}
              >
                {filter}
              </span>
            ))}
          </div>
        </div>

        {/* Restaurant Grid */}
        <div className={styles.restaurantGrid}>
          {restaurants.slice(0, 8).map((restaurant) => (
            <article className={styles.restaurantCard} key={restaurant.id}>
              {/* Restaurant Image */}
              <div className={styles.imageContainer}>
                <img
                  src={restaurant.coverImage.imageUrl}
                  alt={restaurant.name}
                  className={styles.restaurantImage}
                />

                {/* Badges */}
                {/* <div className={styles.imageBadges}>
                  <span className={styles.badge}>{restaurant.badge}</span>

                  {restaurant.badgeSecondary && (
                    <span className={styles.criticBadge}>
                      {restaurant.badgeSecondary}
                    </span>
                  )}
                </div> */}

                <span className={styles.locationBadge}>
                  <span>{'$'.repeat(restaurant.priceLevel)}</span> ·{' '}
                  {restaurant.city}
                </span>

                {/* Bookmark */}
                <div className={styles.bookmark}>
                  <LuBookmark size={17} />
                </div>
              </div>

              {/* Restaurant Information */}
              <div className={styles.cardContent}>
                {/* Name and Rating */}
                <div className={styles.cardHeader}>
                  <h3 className={styles.restaurantName}>{restaurant.name}</h3>

                  <div className={styles.rating}>
                    <LuStar size={13} fill='currentColor' strokeWidth={0} />
                    <span>4.8</span>
                    <span className={styles.reviews}>(420)</span>
                  </div>
                </div>

                {/* Cuisine */}
                <p className={styles.cuisine}>{restaurant.cuisine}</p>

                {/* Description */}
                <p className={styles.description}>{restaurant.description}</p>

                {/* Footer */}
                <div className={styles.cardFooter}>
                  <Link
                    to={`/restaurants/${restaurant.id}`}
                    className={styles.viewLink}
                  >
                    View restaurant
                    <LuArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

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

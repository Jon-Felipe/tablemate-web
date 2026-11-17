import { FaAward, FaClock, FaGlobe, FaUtensils } from 'react-icons/fa';
import {
  LuSearch,
  LuMapPin,
  LuCalendarDays,
  LuChevronDown,
  LuCompass,
  LuBookmark,
  LuStar,
  LuArrowRight,
} from 'react-icons/lu';

// extras
import { useGetRestaurantsQuery } from '../../services/restaurantApi';
import styles from './HomePage.module.css';

function HomePage() {
  const { data: restaurants = [] } = useGetRestaurantsQuery();
  const filters = ['All', 'Top Rated', 'New', 'Nearby'];

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
        <div className={styles.searchContainer}>
          {/* Cuisine or Spot */}
          <div className={`${styles.searchField} ${styles.cuisineField}`}>
            <LuSearch className={styles.fieldIcon} size={21} />

            <div className={styles.fieldContent}>
              <label>Cuisine or Spot</label>
              <span className={styles.placeholder}>
                Search restaurant, district...
              </span>
            </div>
          </div>

          {/* Location */}
          <div className={`${styles.searchField} ${styles.locationField}`}>
            <LuMapPin className={styles.fieldIcon} size={21} />

            <div className={styles.fieldContent}>
              <label>Location</label>
              <span className={styles.fieldValue}>New York City</span>
            </div>

            <LuChevronDown className={styles.fieldChevron} size={15} />
          </div>

          {/* Reservation */}
          <div className={`${styles.searchField} ${styles.reservationField}`}>
            <LuCalendarDays className={styles.fieldIcon} size={21} />

            <div className={styles.fieldContent}>
              <label>Reservation</label>
              <span className={styles.fieldValue}>Tonight, 2 guests</span>
            </div>

            <LuChevronDown className={styles.fieldChevron} size={15} />
          </div>

          {/* Discover Button */}
          <div className={styles.discoverButton}>
            <LuCompass size={21} strokeWidth={2} />
            <span>Discover</span>
          </div>
        </div>
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
                  src={restaurant.imageUrl}
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

                {/* Price and Location */}
                {/* <span className={styles.locationBadge}>
                  {restaurant.price} · {restaurant.location}
                </span> */}

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
                    <span>{restaurant.rating}</span>
                    {/* <span className={styles.reviews}>
                      ({restaurant.reviews})
                    </span> */}
                  </div>
                </div>

                {/* Cuisine */}
                <p className={styles.cuisine}>{restaurant.cuisine}</p>

                {/* Description */}
                <p className={styles.description}>{restaurant.description}</p>

                {/* Tags */}
                {/* <div className={styles.tags}>
                  {restaurant.tags.map((tag) => (
                    <span className={styles.tag} key={tag}>
                      {tag}
                    </span>
                  ))}
                </div> */}

                {/* Footer */}
                <div className={styles.cardFooter}>
                  <span className={styles.viewLink}>
                    View restaurant
                    <LuArrowRight size={14} />
                  </span>
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

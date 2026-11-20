import { Link } from 'react-router';
import { LuArrowRight, LuBookmark, LuStar } from 'react-icons/lu';

import type { RestaurantListItem } from '../types/restaurant';
import styles from './RestaurantGrid.module.css';

interface RestaurantGridProps {
  restaurants: RestaurantListItem[];
}

function RestaurantGrid({ restaurants }: RestaurantGridProps) {
  return (
    <div className={styles.restaurantGrid}>
      {restaurants.map((restaurant) => (
        <article className={styles.restaurantCard} key={restaurant.id}>
          <div className={styles.imageContainer}>
            <img
              src={restaurant.coverImage.imageUrl}
              alt={restaurant.name}
              className={styles.restaurantImage}
            />

            <span className={styles.locationBadge}>
              <span>{'$'.repeat(restaurant.priceLevel)}</span> ·{' '}
              {restaurant.city}
            </span>

            <div className={styles.bookmark}>
              <LuBookmark aria-hidden='true' size={17} />
            </div>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.cardHeader}>
              <h3 className={styles.restaurantName}>{restaurant.name}</h3>

              <div className={styles.rating}>
                <LuStar
                  aria-hidden='true'
                  size={13}
                  fill='currentColor'
                  strokeWidth={0}
                />
                <span>4.8</span>
                <span className={styles.reviews}>(420)</span>
              </div>
            </div>

            <p className={styles.cuisine}>{restaurant.cuisine}</p>
            <p className={styles.description}>{restaurant.description}</p>

            <div className={styles.cardFooter}>
              <Link
                to={`/restaurants/${restaurant.id}`}
                className={styles.viewLink}
              >
                View restaurant
                <LuArrowRight aria-hidden='true' size={14} />
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default RestaurantGrid;

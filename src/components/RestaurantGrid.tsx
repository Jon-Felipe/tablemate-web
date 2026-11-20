import type { RestaurantListItem } from '../types/restaurant';
import RestaurantCard from './RestaurantCard';
import styles from './RestaurantGrid.module.css';

interface RestaurantGridProps {
  restaurants: RestaurantListItem[];
}

function RestaurantGrid({ restaurants }: RestaurantGridProps) {
  return (
    <div className={styles.restaurantGrid}>
      {restaurants.map((restaurant) => (
        <RestaurantCard restaurant={restaurant} key={restaurant.id} />
      ))}
    </div>
  );
}

export default RestaurantGrid;

import type { RestaurantListItem } from '../types/restaurant';
import RestaurantCard from './RestaurantCard';
import styles from './RestaurantList.module.css';

interface RestaurantListProps {
  restaurants: RestaurantListItem[];
}

function RestaurantList({ restaurants }: RestaurantListProps) {
  return (
    <ul className={styles.restaurantList}>
      {restaurants.map((restaurant) => (
        <li key={restaurant.id}>
          <RestaurantCard restaurant={restaurant} layout='list' />
        </li>
      ))}
    </ul>
  );
}

export default RestaurantList;

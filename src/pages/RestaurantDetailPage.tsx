import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';

// extras
import type { Restaurant } from '../types/restaurant';
import { getRestaurantById, RestaurantNotFoundError } from '../api/restaurants';

function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadRestaurant() {
      if (!id) {
        setIsNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setRestaurant(null);
      setIsNotFound(false);
      setError(null);

      try {
        const data = await getRestaurantById(id);

        if (isCurrent) setRestaurant(data);
      } catch (error) {
        if (!isCurrent) return;

        if (error instanceof RestaurantNotFoundError) {
          setIsNotFound(true);
        } else {
          setError('Unable to load this restaurant. Please try again.');
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void loadRestaurant();

    return () => {
      isCurrent = false;
    };
  }, [id]);

  return (
    <main className='detail-section'>
      <Link to='/' className='back-link'>
        ← Back to restaurants
      </Link>

      {isLoading && <p role='status'>Loading restaurant...</p>}

      {!isLoading && isNotFound && (
        <div className='empty-state'>
          <h1>Restaurant not found</h1>
          <p>This restaurant may no longer be available.</p>
          <Link to='/' className='primary-button'>
            Browse restaurants
          </Link>
        </div>
      )}

      {!isLoading && error && <p role='alert'>{error}</p>}

      {!isLoading && !error && !isNotFound && restaurant && (
        <article className='restaurant-detail'>
          <p className='eyebrow'>{restaurant.cuisine}</p>
          <h1>{restaurant.name}</h1>
          <p className='detail-description'>{restaurant.description}</p>

          <div className='detail-information'>
            <div>
              <h2>Location</h2>
              <p>
                {restaurant.address}, {restaurant.city}
              </p>
            </div>

            <div>
              <h2>Rating</h2>
              <p className='restaurant-rating'>
                <span aria-hidden='true'>★</span> {restaurant.rating.toFixed(1)}
              </p>
            </div>
          </div>
        </article>
      )}
    </main>
  );
}

export default RestaurantDetailPage;

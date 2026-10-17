import { Link, useParams } from 'react-router';

// extras
import { useGetRestaurantByIdQuery } from '../services/restaurantApi';

function isFetchBaseQueryError(
  error: unknown,
): error is { status: number | string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (typeof error.status === 'number' || typeof error.status === 'string')
  );
}

function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: restaurant,
    isLoading,
    error,
  } = useGetRestaurantByIdQuery(id ?? '', { skip: !id });

  const isNotFound =
    !id || (isFetchBaseQueryError(error) && error.status === 404);

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

      {!isLoading && error && !isNotFound && (
        <p role='alert'>Unable to load this restaurant. Please try again.</p>
      )}

      {!isLoading && !error && !isNotFound && restaurant && (
        <article className='restaurant-detail'>
          <img
            src={restaurant.imageUrl}
            alt={`Food and dining at ${restaurant.imageUrl}`}
            className='restaurant-detail-image'
          />
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

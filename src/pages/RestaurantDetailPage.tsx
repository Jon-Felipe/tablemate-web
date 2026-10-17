import { Link, useParams } from 'react-router';

// extras
import {
  useGetRestaurantByIdQuery,
  useGetRestaurantMenuQuery,
} from '../services/restaurantApi';

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
    isLoading: isRestaurantLoading,
    error: restaurantError,
  } = useGetRestaurantByIdQuery(id ?? '', { skip: !id });

  const {
    data: menu,
    isLoading: isMenuLoading,
    error: menuError,
  } = useGetRestaurantMenuQuery(id ?? '', {
    skip:
      !id ||
      Boolean(
        restaurantError &&
        isFetchBaseQueryError(restaurantError) &&
        restaurantError.status === 404,
      ),
  });

  const isNotFound =
    !id ||
    (isFetchBaseQueryError(restaurantError) && restaurantError.status === 404);

  return (
    <main className='detail-section'>
      <Link to='/' className='back-link'>
        ← Back to restaurants
      </Link>

      {isRestaurantLoading && <p role='status'>Loading restaurant...</p>}

      {!isRestaurantLoading && isNotFound && (
        <div className='empty-state'>
          <h1>Restaurant not found</h1>
          <p>This restaurant may no longer be available.</p>
          <Link to='/' className='primary-button'>
            Browse restaurants
          </Link>
        </div>
      )}

      {!isRestaurantLoading && restaurantError && !isNotFound && (
        <p role='alert'>Unable to load this restaurant. Please try again.</p>
      )}

      {!isRestaurantLoading &&
        !restaurantError &&
        !isNotFound &&
        restaurant && (
          <>
            <article className='restaurant-detail'>
              <img
                src={restaurant.imageUrl}
                alt={`Food and dining at ${restaurant.name}`}
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
                    <span aria-hidden='true'>★</span>{' '}
                    {restaurant.rating.toFixed(1)}
                  </p>
                </div>
              </div>
            </article>

            <section className='restaurant-menu' aria-labelledby='menu-heading'>
              <h2 id='menu-heading'>Menu</h2>

              {isMenuLoading && <p role='status'>Loading menu...</p>}

              {menuError && (
                <p role='alert'>Unable to load this menu. Please try again.</p>
              )}

              {!isMenuLoading &&
                !menuError &&
                (!menu?.categories || menu.categories.length === 0) && (
                  <p>This restaurant's menu is coming soon.</p>
                )}

              {!isMenuLoading &&
                !menuError &&
                menu?.categories?.map((category) => (
                  <section
                    key={category.id}
                    className='menu-category'
                    aria-labelledby={`category-${category.id}`}
                  >
                    <h3 id={`category-${category.id}`}>{category.name}</h3>

                    <div className='menu-items'>
                      {category.items.map((item) => (
                        <article key={item.id} className='menu-item'>
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className='menu-item-image'
                            loading='lazy'
                          />
                          <div className='menu-item-details'>
                            <h4>{item.name}</h4>
                            <p>{item.description}</p>
                            <p className='menu-item-price'>
                              {new Intl.NumberFormat('en-ZA', {
                                style: 'currency',
                                currency: 'ZAR',
                              }).format(item.price)}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
            </section>
          </>
        )}
    </main>
  );
}

export default RestaurantDetailPage;

import { type SubmitEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import type { IconType } from 'react-icons';
import {
  FiCamera,
  FiChevronDown,
  FiGrid,
  FiInfo,
  FiMapPin,
  FiSun,
} from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import {
  LuAccessibility,
  LuChefHat,
  LuLeaf,
  LuShirt,
  LuSquareParking,
  LuStar,
  LuTrophy,
  LuUsers,
  LuUtensils,
  LuWine,
} from 'react-icons/lu';

// extras
import restaurantPlaceholder from '../../assets/hero.png';
import {
  useGetRestaurantByIdQuery,
  useGetRestaurantMenuQuery,
} from '../../services/restaurantApi';
import type { RootState } from '../../app/store';
import styles from './RestaurantDetailPage.module.css';

const restaurantIcons = {
  trophy: LuTrophy,
  leaf: LuLeaf,
  star: LuStar,
  shirt: LuShirt,
  parking: LuSquareParking,
  wine: LuWine,
  accessibility: LuAccessibility,
  'chef-hat': LuChefHat,
  users: LuUsers,
  utensils: LuUtensils,
  sun: FiSun,
} satisfies Record<string, IconType>;

const reservationTimes = ['6:00 PM', '7:15 PM', '8:30 PM', '9:00 PM'];

function getTodayDate() {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
}

function RestaurantIcon({ name }: { name: string }) {
  const Icon =
    name in restaurantIcons
      ? restaurantIcons[name as keyof typeof restaurantIcons]
      : FiInfo;

  return <Icon aria-hidden='true' />;
}

function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) =>
    Boolean(state.auth?.accessToken && state.auth?.user),
  );
  const {
    data: restaurant,
    isLoading: isRestaurantLoading,
    error: restaurantError,
  } = useGetRestaurantByIdQuery(id ?? '', { skip: !id });
  const {
    data: menu,
    isLoading: isMenuLoading,
    error: menuError,
  } = useGetRestaurantMenuQuery(id ?? '', { skip: !id });

  const [selectedGuests, setSelectedGuests] = useState<string>('2');
  const [minimumReservationDate] = useState<string>(getTodayDate());
  const [selectedDate, setSelectedDate] = useState<string>(
    minimumReservationDate,
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(
    reservationTimes[0],
  );

  function handleBookingSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to reserve a table.');
      navigate('/login');
      return;
    }

    if (!selectedGuests || !selectedDate || !selectedTime) {
      toast.error('Please fill in all reservation fields.');
      return;
    }

    if (selectedDate < minimumReservationDate) {
      toast.error('Please select today or a future date.');
      return;
    }

    toast.success('Your table has been reserved!');
  }

  if (isRestaurantLoading) {
    return (
      <div className={styles.page}>
        <div role='status'>Loading restaurant...</div>
        <Link to='/'>Back to restaurants</Link>
      </div>
    );
  }

  if (
    !id ||
    (restaurantError &&
      'status' in restaurantError &&
      restaurantError.status === 404)
  ) {
    return (
      <div className={styles.page}>
        <h1>Restaurant not found</h1>
        <Link to='/'>Browse restaurants</Link>
      </div>
    );
  }

  if (restaurantError || !restaurant) {
    return (
      <div className={styles.page} role='alert'>
        Unable to load this restaurant. Please try again.
      </div>
    );
  }

  const sortedImages = [...restaurant.images].sort(
    (first, second) => first.displayOrder - second.displayOrder,
  );
  const mainImage =
    sortedImages.find((image) => image.isPrimary) ??
    sortedImages.find((image) => image.type === 'MAIN') ??
    sortedImages[0];
  const sideImages = sortedImages
    .filter((image) => image.id !== mainImage?.id)
    .slice(0, 2);
  const awards = restaurant.awards.filter(
    (restaurantAward) => restaurantAward.award,
  );

  return (
    <div className={styles.page}>
      <section
        className={styles.gallery}
        style={{ gridTemplateColumns: sideImages.length ? undefined : '1fr' }}
      >
        <div className={styles.mainImage}>
          <img
            src={mainImage?.imageUrl ?? restaurantPlaceholder}
            alt={mainImage?.altText || mainImage?.caption || restaurant.name}
          />
          <div className={styles.imageLabel}>
            <FiCamera />
            {mainImage?.caption || mainImage?.altText || restaurant.name}
          </div>
        </div>

        {sideImages.length > 0 && (
          <div className={styles.sideGallery}>
            {sideImages.map((image, index) => (
              <div className={styles.sideImage} key={image.id}>
                <img
                  src={image.imageUrl}
                  alt={image.altText || image.caption || restaurant.name}
                />
                <div className={styles.imageLabel}>
                  {image.caption || image.altText || image.type}
                </div>
                {index === sideImages.length - 1 &&
                  restaurant.images.length > sideImages.length + 1 && (
                    <div className={styles.photoCount}>
                      <FiGrid />
                      All {restaurant.images.length} Photos
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className={styles.badges}>
        {awards.map(({ id: awardId, award, year }) => (
          <span className={`${styles.badge} ${styles.michelin}`} key={awardId}>
            <RestaurantIcon name={award?.icon ?? 'trophy'} />
            {award?.name}
            {year ? ` ${year}` : ''}
          </span>
        ))}
        <span className={styles.updated}>
          Updated {new Date(restaurant.updatedAt).toLocaleDateString()}
        </span>
      </div>

      <header className={styles.restaurantHeader}>
        <h1>{restaurant.name}</h1>
        <div className={styles.restaurantInfo}>
          <div className={styles.rating}>
            <FaStar />
            <strong>4.9</strong>
            <span className={styles.reviews}>(342 verified reviews)</span>
          </div>
          <span className={styles.dot}>•</span>
          <span>{restaurant.cuisine}</span>
          <span className={styles.dot}>•</span>
          <span className={styles.price}>
            {'$'.repeat(restaurant.priceLevel)}
          </span>
          <span className={styles.dot}>•</span>
          <span className={styles.address}>
            <FiMapPin />
            {[restaurant.address, restaurant.city, restaurant.country]
              .filter(Boolean)
              .join(', ')}
          </span>
          <span className={styles.dot}>•</span>
          <a href={`tel:${restaurant.phoneNumber}`}>{restaurant.phoneNumber}</a>
        </div>
      </header>

      <div className={styles.divider} />

      <section className={styles.contentGrid}>
        <div className={styles.leftColumn}>
          <section className={styles.story}>
            <h2>About {restaurant.name}</h2>
            <p className={styles.intro}>{restaurant.description}</p>
          </section>

          {restaurant.features.length > 0 && (
            <div className={styles.featureGrid}>
              {restaurant.features.map((feature) => (
                <article className={styles.featureCard} key={feature.id}>
                  <div className={styles.featureIcon}>
                    <RestaurantIcon name={feature.icon} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          )}

          <section className={styles.menuSection}>
            <div className={styles.menuHeader}>
              <div>
                <h2>Menu</h2>
                {menu?.description && <p>{menu.description}</p>}
              </div>
            </div>

            <div className={styles.menuDivider} />
            {isMenuLoading ? (
              <p role='status'>Loading menu...</p>
            ) : menuError ? (
              <p role='alert'>Unable to load this menu. Please try again.</p>
            ) : !menu?.categories.length ? (
              <p>This restaurant&apos;s menu is coming soon.</p>
            ) : (
              menu.categories.map((category) => (
                <div className={styles.menuCategory} key={category.id}>
                  <div className={styles.categoryHeading}>
                    <h3>{category.name}</h3>
                    <span />
                  </div>
                  <div className={styles.menuItems}>
                    {category.items.map((item) => (
                      <article className={styles.menuItem} key={item.id}>
                        <div className={styles.menuItemContent}>
                          <div className={styles.menuItemTitle}>
                            <h4>{item.name}</h4>
                            {!item.isAvailable && (
                              <span className={styles.menuTag}>
                                Unavailable
                              </span>
                            )}
                          </div>
                          <p>{item.description}</p>
                        </div>
                        <strong className={styles.menuPrice}>
                          {new Intl.NumberFormat('en-ZA', {
                            style: 'currency',
                            currency: item.currency,
                          }).format(item.price)}
                        </strong>
                      </article>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </div>

        <aside className={styles.rightColumn}>
          <form
            className={styles.bookingCard}
            onSubmit={handleBookingSubmit}
            noValidate
          >
            <div className={styles.bookingHeader}>
              <h2>Reserve a Table</h2>
              <span className={styles.confirmation}>
                <span className={styles.statusDot} />
                Instant confirmation
              </span>
            </div>
            <div className={styles.bookingDivider} />
            <div className={styles.formGroup}>
              <label htmlFor='reservation-guests'>GUESTS</label>
              <div className={styles.staticSelect}>
                <select
                  id='reservation-guests'
                  name='guests'
                  aria-label='Number of guests'
                  value={selectedGuests}
                  onChange={(e) => setSelectedGuests(e.target.value)}
                >
                  {Array.from({ length: 10 }, (_, index) => index + 1).map(
                    (guestCount) => (
                      <option key={guestCount} value={guestCount}>
                        {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ),
                  )}
                </select>
                <FiChevronDown />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor='reservation-date'>DATE</label>
              <div className={styles.staticInput}>
                <input
                  id='reservation-date'
                  name='date'
                  type='date'
                  aria-label='Reservation date'
                  min={minimumReservationDate}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.timeHeader}>
                <label>AVAILABLE TIMES</label>
                <span>Evening Service</span>
              </div>
              <div className={styles.timeGrid}>
                {reservationTimes.map((time) => (
                  <button
                    className={
                      selectedTime === time
                        ? styles.selectedTime
                        : styles.timeButton
                    }
                    key={time}
                    type='button'
                    aria-pressed={selectedTime === time}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <button className={styles.confirmButton} type='submit'>
              Confirm Booking
              <span aria-hidden='true'>→</span>
            </button>
          </form>

          {restaurant.information.length > 0 && (
            <div className={styles.practicalCard}>
              <h2>Practical Information</h2>
              <div className={styles.practicalList}>
                {restaurant.information.map((info) => (
                  <div className={styles.practicalItem} key={info.id}>
                    <div className={styles.practicalIcon}>
                      <RestaurantIcon name={info.icon} />
                    </div>
                    <div>
                      <h3>{info.title}</h3>
                      <p>{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

export default RestaurantDetailPage;

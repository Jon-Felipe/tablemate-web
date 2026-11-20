import { useMemo, useState } from 'react';
import {
  LuSlidersHorizontal,
  LuSearch,
  LuChevronDown,
  LuGrid2X2,
  LuList,
} from 'react-icons/lu';

// components
import RestaurantGrid from '../../components/RestaurantGrid';
import RestaurantList from '../../components/RestaurantList';

// extras
import styles from './RestaurantsPage.module.css';
import { useGetRestaurantsQuery } from '../../services/restaurantApi';
import type { RestaurantListItem } from '../../types/restaurant';

function getFilterOptions<T extends string | number>(
  restaurants: RestaurantListItem[],
  getValue: (restaurant: RestaurantListItem) => T,
  compare?: (a: T, b: T) => number,
): T[] {
  return [...new Set(restaurants.map(getValue).filter(Boolean))].sort(compare);
}

function RestaurantsPage() {
  const { data: restaurants = [] } = useGetRestaurantsQuery();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const cities = useMemo(
    () => getFilterOptions(restaurants, ({ city }) => city),
    [restaurants],
  );
  const cuisines = useMemo(
    () => getFilterOptions(restaurants, ({ cuisine }) => cuisine),
    [restaurants],
  );
  const priceLevels = useMemo(
    () =>
      getFilterOptions(
        restaurants,
        ({ priceLevel }) => priceLevel,
        (a, b) => a - b,
      ),
    [restaurants],
  );

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.filterHeader}>
          <div className={styles.filterTitle}>
            <LuSlidersHorizontal size={16} />
            <span>Filters</span>
          </div>

          <button className={styles.clearButton} type='button'>
            Clear all
          </button>
        </div>

        <section className={styles.filterSection}>
          <div className={styles.sectionHeading}>
            <h3>Cuisine</h3>
          </div>

          <div className={styles.checkboxList}>
            {cuisines.map((cuisine) => (
              <label className={styles.checkboxItem} key={cuisine}>
                <input type='checkbox' />
                <span className={styles.customCheckbox} />
                <span className={styles.checkboxLabel}>{cuisine}</span>
                <span className={styles.count}>
                  {
                    restaurants.filter(
                      (restaurant) => restaurant.cuisine === cuisine,
                    ).length
                  }
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className={styles.filterSection}>
          <div className={styles.sectionHeading}>
            <h3>City</h3>
          </div>

          <div className={styles.checkboxList}>
            {cities.map((city) => (
              <label className={styles.checkboxItem} key={city}>
                <input type='checkbox' />
                <span className={styles.customCheckbox} />
                <span className={styles.checkboxLabel}>{city}</span>
                <span className={styles.count}>
                  {
                    restaurants.filter((restaurant) => restaurant.city === city)
                      .length
                  }
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className={styles.filterSection}>
          <div className={styles.sectionHeading}>
            <h3>Price Level</h3>
          </div>

          <div className={styles.checkboxList}>
            {priceLevels.map((priceLevel) => (
              <label className={styles.checkboxItem} key={priceLevel}>
                <input type='checkbox' />
                <span className={styles.customCheckbox} />
                <span className={styles.checkboxLabel}>
                  {'$'.repeat(priceLevel)}
                </span>
              </label>
            ))}
          </div>
        </section>
      </aside>

      <section className={styles.mainContent}>
        <header className={styles.contentHeader}>
          <div className={styles.toolbar}>
            <div className={styles.searchContainer}>
              <LuSearch size={16} />
              <input
                type='search'
                placeholder='Search by restaurant, cuisine, address, or location...'
              />
            </div>

            <div className={styles.sortContainer}>
              <select defaultValue='name' aria-label='Sort restaurants'>
                <option value='name'>Name</option>
                <option value='cuisine'>Cuisine</option>
                <option value='city'>City</option>
                <option value='price-asc'>Price: Low to High</option>
                <option value='price-desc'>Price: High to Low</option>
              </select>
              <LuChevronDown size={16} />
            </div>

            <div className={styles.layoutOptions}>
              <button
                className={layout === 'grid' ? styles.activeLayout : undefined}
                type='button'
                aria-label='Grid layout'
                aria-pressed={layout === 'grid'}
                onClick={() => setLayout('grid')}
              >
                <LuGrid2X2 size={16} />
              </button>

              <button
                className={layout === 'list' ? styles.activeLayout : undefined}
                type='button'
                aria-label='List layout'
                aria-pressed={layout === 'list'}
                onClick={() => setLayout('list')}
              >
                <LuList size={16} />
              </button>
            </div>
          </div>
        </header>

        <div className={styles.results}>
          {layout === 'grid' ? (
            <RestaurantGrid restaurants={restaurants.slice(0, 8)} />
          ) : (
            <RestaurantList restaurants={restaurants.slice(0, 8)} />
          )}
        </div>

        <nav className={styles.pagination} aria-label='Restaurant pages'>
          <button type='button' disabled>
            Previous
          </button>
          <button
            type='button'
            className={styles.currentPage}
            aria-current='page'
            aria-label='Page 1'
          >
            1
          </button>
          <button type='button' aria-label='Page 2'>
            2
          </button>
          <button type='button' aria-label='Page 3'>
            3
          </button>
          <button type='button'>Next</button>
        </nav>
      </section>
    </div>
  );
}

export default RestaurantsPage;

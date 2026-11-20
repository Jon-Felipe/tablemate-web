import { Link } from 'react-router';
import {
  LuArrowRight,
  LuHeartHandshake,
  LuSearch,
  LuSparkles,
} from 'react-icons/lu';

import styles from './AboutPage.module.css';

const values = [
  {
    icon: LuSearch,
    title: 'Thoughtfully curated',
    description:
      'We look beyond the obvious to find distinctive dining rooms with a genuine point of view.',
  },
  {
    icon: LuSparkles,
    title: 'Details that delight',
    description:
      'From the atmosphere to the final course, we celebrate the details that turn dinner into a memory.',
  },
  {
    icon: LuHeartHandshake,
    title: 'Hospitality first',
    description:
      'Great restaurants make every guest feel welcome. We build that same care into every TableMate experience.',
  },
];

function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>OUR STORY</p>
          <h1>
            Good food deserves a <span>great story.</span>
          </h1>
          <p className={styles.intro}>
            TableMate helps curious diners discover remarkable restaurants and
            connect with the people, places, and plates behind them.
          </p>
          <Link className={styles.primaryLink} to='/restaurants'>
            Explore restaurants
            <LuArrowRight aria-hidden='true' />
          </Link>
        </div>

        <div
          className={styles.heroImage}
          role='img'
          aria-label='A warmly lit restaurant dining room'
        >
          <div className={styles.imageNote}>
            <span>Since 2024</span>
            <p>Bringing memorable tables within reach.</p>
          </div>
        </div>
      </section>

      <section className={styles.story} aria-labelledby='story-heading'>
        <div className={styles.storyHeading}>
          <p className={styles.eyebrow}>WHY TABLEMATE</p>
          <h2 id='story-heading'>A better way to find your next table</h2>
        </div>
        <div className={styles.storyCopy}>
          <p>
            The best meals are about more than what is on the plate. They are
            shaped by the welcome at the door, the rhythm of the room, and the
            stories shared around the table.
          </p>
          <p>
            We created TableMate to make those experiences easier to find. Our
            collection brings together neighborhood favorites, destination
            dining rooms, and hidden gems worth seeking out.
          </p>
        </div>
      </section>

      <section className={styles.values} aria-labelledby='values-heading'>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>WHAT GUIDES US</p>
          <h2 id='values-heading'>Dining with intention</h2>
          <p>
            Three ideas shape every restaurant we feature and every experience
            we build.
          </p>
        </div>

        <div className={styles.valueGrid}>
          {values.map(({ icon: Icon, title, description }) => (
            <article className={styles.valueCard} key={title}>
              <div className={styles.valueIcon}>
                <Icon aria-hidden='true' />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.cta} aria-labelledby='cta-heading'>
        <div>
          <p className={styles.eyebrow}>YOUR NEXT FAVOURITE AWAITS</p>
          <h2 id='cta-heading'>Come hungry. Leave inspired.</h2>
          <p>Browse our collection and find a table that feels just right.</p>
        </div>
        <Link className={styles.ctaLink} to='/restaurants'>
          Start exploring
          <LuArrowRight aria-hidden='true' />
        </Link>
      </section>
    </div>
  );
}

export default AboutPage;

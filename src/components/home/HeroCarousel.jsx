import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HERO_SLIDES } from '../../data/products';
import styles from './HeroCarousel.module.css';

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % HERO_SLIDES.length);
  }, []);

  const goPrev = () => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const goTo = (i) => {
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
  };

  useEffect(() => {
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [goNext]);

  const slide = HERO_SLIDES[current];

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? '30%' : '-30%', opacity: 0, scale: 1.05 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-30%' : '30%', opacity: 0, scale: 0.97 }),
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' },
    }),
  };

  return (
    <section className={styles.hero}>
      {/* Background Images */}
      <div className={styles.bgLayer}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={current}
            src={slide.image}
            alt={slide.title}
            className={styles.bgImage}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </AnimatePresence>
        <div className={`${styles.overlay} ${slide.theme === 'light' ? styles.overlayLight : ''}`} />
      </div>

      {/* Geometric decoration */}
      <div className={styles.decoration}>
        <div className={styles.decorCircle} />
        <div className={styles.decorLine} />
      </div>

      {/* Content */}
      <div className={`container ${styles.content}`}>
        <div className={`${styles.contentInner} ${styles[slide.align] || ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              className={styles.textBlock}
              initial="hidden"
              animate="visible"
            >
              {/* Tag */}
              <motion.div custom={0} variants={textVariants}>
                <span className={styles.slideTag}>{slide.tag}</span>
              </motion.div>

              {/* Subtitle */}
              <motion.p custom={1} variants={textVariants} className={styles.slideSubtitle}>
                {slide.subtitle}
              </motion.p>

              {/* Title */}
              <motion.h1 custom={2} variants={textVariants} className={styles.slideTitle}>
                {slide.title}
              </motion.h1>

              {/* Separator */}
              <motion.div custom={3} variants={textVariants} className={styles.separator}>
                <div className={styles.separatorLine} />
                <div className={styles.separatorIcon}>✦</div>
                <div className={styles.separatorLine} />
              </motion.div>

              {/* Description */}
              <motion.p custom={3} variants={textVariants} className={styles.slideDesc}>
                {slide.description}
              </motion.p>

              {/* CTAs */}
              <motion.div custom={4} variants={textVariants} className={styles.slideCtas}>
                <Link to={slide.ctaLink} className={styles.ctaPrimary}>
                  {slide.cta}
                  <ArrowRight size={18} />
                </Link>
                <Link to="/boutique" className={styles.ctaSecondary}>
                  <Play size={14} fill="currentColor" />
                  Voir toute la boutique
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <button
        className={`${styles.control} ${styles.controlPrev}`}
        onClick={goPrev}
        aria-label="Précédent"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        className={`${styles.control} ${styles.controlNext}`}
        onClick={goNext}
        aria-label="Suivant"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className={styles.dots}>
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <AnimatePresence>
          <motion.div
            key={current}
            className={styles.progressFill}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            exit={{ width: '100%' }}
            transition={{ duration: 6, ease: 'linear' }}
          />
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollMouse}>
          <div className={styles.scrollDot} />
        </div>
        <span>Défiler</span>
      </div>
    </section>
  );
}

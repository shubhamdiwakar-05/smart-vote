import React, { useEffect, useState } from 'react';

const slides = [
  {
    title: 'Secure Digital Voting',
    description: 'Vote safely from anywhere with complete transparency.',
    image: 'https://images.pexels.com/photos/593502/pexels-photo-593502.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    title: 'Real-Time Election Results',
    description: 'Track election results instantly as votes are counted.',
    image: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    title: 'Blockchain Security',
    description: 'Advanced security mechanisms protect every vote.',
    image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    title: 'Fast and Easy Voting',
    description: 'Cast your vote in just a few clicks.',
    image: 'https://images.pexels.com/photos/6801645/pexels-photo-6801645.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
];

export default function AuthSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="auth-slider">
      {slides.map((slide, index) => (
        <div
          key={slide.title}
          className={`auth-slide ${index === activeIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="auth-slide-overlay" />
          <div className="auth-slide-copy">
            <span>Smart Vote</span>
            <h3>{slide.title}</h3>
            <p>{slide.description}</p>
          </div>
        </div>
      ))}

      <div className="auth-slider-dots">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            className={index === activeIndex ? 'active' : ''}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

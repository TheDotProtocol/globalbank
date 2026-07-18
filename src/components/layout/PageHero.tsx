'use client';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  minHeight?: string;
  backgroundImage?: string;
  theme?: 'light' | 'dark';
}

export default function PageHero({
  title,
  subtitle,
  children,
  minHeight = '50vh',
  backgroundImage = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGJ1aWxkaW5nfGVufDB8fHx8MTc2MDA3NDcxOHww&ixlib=rb-4.1.0&q=85',
  theme = 'light',
}: PageHeroProps) {
  const overlay = theme === 'light' ? 'rgba(255, 255, 255, 0.92)' : 'rgba(0, 0, 0, 0.85)';

  return (
    <section
      className="hero-section"
      style={{
        backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${backgroundImage})`,
        minHeight,
      }}
    >
      <div className="hero-content">
        <h1 className="hero-headline">{title}</h1>
        {subtitle && (
          <p className="hero-subheadline" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

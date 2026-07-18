'use client';

import type { ComponentType } from 'react';
import { Linkedin, Twitter, Newspaper } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { bankData } from '@/lib/landing-data';

const iconMap: Record<string, ComponentType<{ size?: number }>> = {
  linkedin: Linkedin,
  twitter: Twitter,
  newspaper: Newspaper,
};

export default function MarketingFooter() {
  return (
    <footer className="footer-section">
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-about">
            <div className="footer-logo">
              <Image
                src="/logo.png"
                alt="Global Dot Bank"
                width={200}
                height={50}
                style={{ height: '50px', width: 'auto' }}
              />
            </div>
            {bankData.footer.title && (
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '1rem', marginBottom: '0.5rem' }}>
                {bankData.footer.title}
              </h3>
            )}
            <p className="footer-description">{bankData.footer.description}</p>
            {bankData.footer.tagline && (
              <p style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '0.95rem', opacity: 0.9 }}>
                <em>{bankData.footer.tagline}</em>
              </p>
            )}
          </div>

          <div className="footer-offices">
            <h4 className="footer-heading">Global Offices</h4>
            {bankData.footer.offices.map((office, index) => (
              <div key={index} className="office-item">
                <div className="office-city">{office.city}</div>
                <div className="office-address">{office.address}</div>
              </div>
            ))}
          </div>

          <div className="footer-legal">
            <h4 className="footer-heading">Legal</h4>
            {bankData.footer.legal.map((item, index) => (
              <Link key={index} href={item.link} className="footer-link">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="footer-social">
            <h4 className="footer-heading">Connect</h4>
            <div className="social-links">
              {bankData.footer.social.map((item, index) => {
                const IconComponent = iconMap[item.icon];
                return (
                  <a key={index} href={item.link} className="social-link" aria-label={item.platform}>
                    {IconComponent && <IconComponent size={20} />}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">{bankData.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

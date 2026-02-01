'use client';

import { useState, FormEvent } from 'react';

const footerLinks = [
  { label: 'Home', href: '#' },
  { label: 'About us', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Terms of service', href: '#' },
  { label: 'Privacy policy', href: '#' },
];

const socialLinks = [
  { icon: 'bi-twitter', href: '#', label: 'Twitter' },
  { icon: 'bi-facebook', href: '#', label: 'Facebook' },
  { icon: 'bi-instagram', href: '#', label: 'Instagram' },
  { icon: 'bi-linkedin', href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
    alert('Thank you for subscribing!');
  };

  return (
    <footer id="footer">
      <div className="footer-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-6 footer-info">
              <h3>DevCodeCare</h3>
              <p>
                We are a digital agency dedicated to the development of web solutions for
                your business. Your business objectives are at the heart of our priorities.
              </p>
            </div>

            <div className="col-lg-2 col-md-6 footer-links">
              <h4>Useful Links</h4>
              <ul>
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-lg-3 col-md-6 footer-contact">
              <h4>Contact Us</h4>
              <p>
                Rammurthy Nagar
                <br />
                Banglore, 560016
                <br />
                Karnataka
                <br />
                <strong>Phone:</strong> +1 5589 55488 55
                <br />
                <strong>Email:</strong> devcodecare@gmail.com
                <br />
              </p>

              <div className="social-links">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className={social.label.toLowerCase()}
                    aria-label={social.label}
                  >
                    <i className={`bi ${social.icon}`}></i>
                  </a>
                ))}
              </div>
            </div>

            <div className="col-lg-3 col-md-6 footer-newsletter">
              <h4>Our Newsletter</h4>
              <p>
                Subscribe to our newsletter to receive the latest updates and news about
                our services.
              </p>
              <form onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
                <input type="submit" value="Subscribe" />
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="copyright">
          &copy; Copyright <strong>DevCodeCare</strong>. All Rights Reserved
        </div>
        <div className="credits">
          Designed with care by DevCodeCare
        </div>
      </div>
    </footer>
  );
}

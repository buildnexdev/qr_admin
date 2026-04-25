import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, MonitorSmartphone, Layers, Printer, Users, CreditCard, FileText, Share2, LineChart, Check, Mail, Phone, MapPin, Globe, Camera, MessageCircle, Send, Play } from 'lucide-react';
import LandingNavbar from '../../components/LandingNavbar/LandingNavbar';
import './Landing.scss';

// Mockup Images (Using the generated ones from assets)
import heroMockup from '../../assets/mockups/dashboard_hero_mockup_1777098936548.png';
import orderMockup from '../../assets/mockups/dashboard_order_mockup_1777098962205.png';
import menuMockup from '../../assets/mockups/dashboard_menu_mockup_1777098976482.png';

const Landing: React.FC = () => {
  return (
    <div className="landing-page">
      <div className="bg-decorations">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <LandingNavbar />

      {/* Hero Section */}
      <section className="landing-hero" id="home">
        <div className="landing-hero__content">
          <h1>
            Elevate Your Business with Next-Gen QR Ordering Technology..!
          </h1>
          <p>
            Simplify Operations, Enhance Customer Satisfaction, and Scale Your Business
            with a Fast, Contactless Ordering System.
          </p>
          <div className="landing-hero__actions">
            <Link to="/register" className="btn-hero-cta">
              Join for Free ! <span className="arrow">→</span>
            </Link>
          </div>
        </div>
        <div className="landing-hero__image-wrapper">
          <img src={heroMockup} alt="Dashboard UI Mockup" className="hero-image" />
        </div>
      </section>

      {/* Feature Section 1 */}
      <section className="landing-feature-split">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0 feature-image-col">
              <img src={orderMockup} alt="Order Management" className="feature-mockup img-fluid" />
            </div>
            <div className="col-lg-6 feature-text-col">
              <h2>Take Control of Your Business Operations</h2>
              <h3>Streamline Order and Service Management Across Your Business</h3>
              <p>
                Never Lose Track of an Order Again. Keep All Customer Orders—Whether
                InPerson, Online, or Takeout—Organized and Accessible in One Place.
                Speed Up Service and Optimize Operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2 */}
      <section className="landing-feature-split reverse">
        <div className="container">
          <div className="row align-items-center flex-lg-row-reverse">
            <div className="col-lg-6 mb-4 mb-lg-0 feature-image-col">
              <img src={menuMockup} alt="Menu Management" className="feature-mockup img-fluid" />
            </div>
            <div className="col-lg-6 feature-text-col">
              <h2>Effortless Menu & Product Management</h2>
              <p>
                Easily update and manage your menus or product listings in real time.
                Whether you're in hospitality, retail, or services, our intuitive platform makes
                it simple to keep your offerings fresh, accurate, and accessible. Streamline
                your operations and ensure a smooth customer experience with just a few clicks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="landing-features-grid" id="features">
        <div className="container" style={{ maxWidth: '1440px' }}>
          <div className="section-header text-center">
            <h2>Everything You Need to Run and Grow Your Business — All in One Platform</h2>
          </div>

          <div className="row g-4 mt-4">
            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <QrCode size={24} className="feature-icon" />
                </div>
                <h4>Customizable Online Ordering</h4>
                <p>Complete online ordering system allows customers to browse products, place orders, and make payments seamlessly. You can also toggle online ordering on or off, giving you full control.</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <MonitorSmartphone size={24} className="feature-icon" />
                </div>
                <h4>Real-Time Order Management</h4>
                <p>Track every order, service, or request in real time, whether it's made online or in-store, ensuring seamless operations.</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Users size={24} className="feature-icon" />
                </div>
                <h4>Easy Menu & Product Management</h4>
                <p>Instantly update and organize your menus or product offerings with a userfriendly interface, keeping everything fresh and accurate.</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <CreditCard size={24} className="feature-icon" />
                </div>
                <h4>Direct Payment Processing</h4>
                <p>Simplify transactions with a range of secure payment method, making it easy for customers to pay and for you to process.</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Layers size={24} className="feature-icon" />
                </div>
                <h4>Customer Insights & Analytics</h4>
                <p>Leverage data to better understand customer behavior, track sales trends, and make informed decisions to grow your business</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <FileText size={24} className="feature-icon" />
                </div>
                <h4>. QR Code Ordering & Contactless Experience</h4>
                <p>Empower customers to view your menu, place orders, or make payments easily through a simple scan of a QR code—providing a fast, safe, and contactless experience.</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Printer size={24} className="feature-icon" />
                </div>
                <h4>Contact Page & Social Media Integration</h4>
                <p>Easily connect with your customers by integrating your contact page with social media platforms. This allows customers to reach out, ask questions, or engage with your brand through their preferred channels, streamlining communication and increasing your online presence.</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <LineChart size={24} className="feature-icon" />
                </div>
                <h4>Fast Performance</h4>
                <p>Experience seamless operation with a lightweight platform that ensures fast loading times and smooth functionality. This ensures that your business runs efficiently without lag, even during high-traffic periods, providing a hassle-free experience for both you and your customers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="landing-pricing" id="pricing">
        <div className="container">
          <div className="section-header text-center">
            <h2>Choose the Perfect Plan for Your Business</h2>
            <p>Simple, transparent pricing to help you scale your operations seamlessly.</p>
          </div>

          <div className="row g-4 mt-4 justify-content-center">
            {/* Silver Plan */}
            <div className="col-lg-4 col-md-6">
              <div className="pricing-card">
                <div className="pricing-header">
                  <h3>Silver Plan</h3>
                  <div className="price">
                    <span className="currency">$</span>
                    <span className="amount">19</span>
                    <span className="period">/mo</span>
                  </div>
                  <p>Essential features to get your business started.</p>
                </div>
                <ul className="pricing-features">
                  <li><Check size={20} className="icon-check" /> Unlimited Online Orders</li>
                  <li><Check size={20} className="icon-check" /> Menu/Product/Service Management</li>
                  <li><Check size={20} className="icon-check" /> QR Code Integration</li>
                  <li><Check size={20} className="icon-check" /> Responsive Design</li>
                  <li><Check size={20} className="icon-check" /> Lightweight & Fast</li>
                  <li><Check size={20} className="icon-check" /> Free Future Updates</li>
                </ul>
                <div className="pricing-footer">
                  <Link to="/register" className="btn-pricing">Get Started</Link>
                </div>
              </div>
            </div>

            {/* Gold Plan */}
            <div className="col-lg-4 col-md-6">
              <div className="pricing-card highlighted">
                <div className="popular-badge">Most Popular</div>
                <div className="pricing-header">
                  <h3>Gold Plan</h3>
                  <div className="price">
                    <span className="currency">$</span>
                    <span className="amount">49</span>
                    <span className="period">/mo</span>
                  </div>
                  <p>Advanced tools for growing businesses.</p>
                </div>
                <ul className="pricing-features">
                  <li><Check size={20} className="icon-check" /> Everything in Silver, plus:</li>
                  <li><Check size={20} className="icon-check" /> Unlimited Products & Variations</li>
                  <li><Check size={20} className="icon-check" /> Multiple Product Images</li>
                  <li><Check size={20} className="icon-check" /> Easy Payment Option</li>
                  <li><Check size={20} className="icon-check" /> Custom Business Logo & Colors</li>
                  <li><Check size={20} className="icon-check" /> Social Media Integration</li>
                  <li><Check size={20} className="icon-check" /> Customer Support</li>
                </ul>
                <div className="pricing-footer">
                  <Link to="/register" className="btn-pricing btn-primary">Get Started</Link>
                </div>
              </div>
            </div>

            {/* Diamond Plan */}
            <div className="col-lg-4 col-md-6">
              <div className="pricing-card">
                <div className="pricing-header">
                  <h3>Diamond Plan</h3>
                  <div className="price">
                    <span className="currency">$</span>
                    <span className="amount">99</span>
                    <span className="period">/mo</span>
                  </div>
                  <p>Premium features for high-volume operations.</p>
                </div>
                <ul className="pricing-features">
                  <li><Check size={20} className="icon-check" /> Everything in Gold, plus:</li>
                  <li><Check size={20} className="icon-check" /> Multilingual Support</li>
                  <li><Check size={20} className="icon-check" /> Google Maps Integration</li>
                  <li><Check size={20} className="icon-check" /> Export to Excel</li>
                  <li><Check size={20} className="icon-check" /> Reports & Analytics</li>
                  <li><Check size={20} className="icon-check" /> WhatsApp Integration</li>
                </ul>
                <div className="pricing-footer">
                  <Link to="/register" className="btn-pricing">Get Started</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer-agency">
        <div className="container">
          <div className="footer-top row g-5">
            <div className="col-lg-7">
              <div className="footer-brand-area">
                <h2 className="footer-brand-name">Namma<span>Qr</span></h2>
                <p className="footer-description">
                  Architecting digital excellence and building trust through 
                  superior code and innovative design solutions.
                </p>
                <div className="footer-social-icons">
                  <a href="#" className="social-icon" aria-label="LinkedIn"><MessageCircle size={20} /></a>
                  <a href="https://www.instagram.com/buildnexdev" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram"><Camera size={20} /></a>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="footer-contact-area">
                <h4 className="contact-heading">Get in Touch</h4>
                <div className="contact-list">
                  <div className="contact-item">
                    <div className="icon-wrapper"><MapPin size={18} /></div>
                    <span>Chennai, India</span>
                  </div>
                  <div className="contact-item">
                    <div className="icon-wrapper"><Phone size={18} /></div>
                    <span>+91 94441 71368</span>
                  </div>
                  <div className="contact-item">
                    <div className="icon-wrapper"><Mail size={18} /></div>
                    <span>buildnexdev@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-legal">
            <Link to="/terms">Terms & Conditions</Link>
            <span className="dot">•</span>
            <Link to="/privacy">Privacy Policy</Link>
          </div>

          <div className="footer-divider-line"></div>

          <div className="footer-bottom-row">
            <div className="copyright">
              © {new Date().getFullYear()} Nammaqr. All rights reserved.
            </div>
            <div className="credits">
              Made with <span className="heart">❤️</span> by <a href="https://buildnexdev.co.in/" target="_blank" rel="noopener noreferrer">BuildNexDev</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <a href="https://wa.me/919444171368" className="floating-chat-btn" target="_blank" rel="noopener noreferrer">
        <MessageCircle size={32} fill="white" />
      </a>
    </div>
  );
};

export default Landing;

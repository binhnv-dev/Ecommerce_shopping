import React from 'react';

import { Link } from 'react-router-dom';
import { Container } from 'reactstrap';

import { infoLinks } from '../../../constants';
import Newsletter from '../../../containers/Newsletter';

const Footer = () => {
  const footerLinks = infoLinks.map((item) => (
    <li key={item.id} className="footer-link">
      <Link key={item.id} to={item.to}>
        {item.name}
      </Link>
    </li>
  ));

  return (
    <footer className="footer">
      <Container>
        <div className="footer-content">
          <div className="footer-block">
            <div className="block-title">
              <h2>Dịch vu khách hàng</h2>
            </div>
            <div className="block-content">
              <ul>{footerLinks}</ul>
            </div>
          </div>
          <div className="footer-block">
            <div className="block-title">
              <h2>Links</h2>
            </div>
            <div className="block-content">
              <ul>{footerLinks}</ul>
            </div>
          </div>
          <div className="footer-block">
            <div className="block-title">
              <h2>Tin tức mới</h2>
              <Newsletter />
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          <span>© {new Date().getFullYear()} Mei Store</span>
        </div>
        <ul className="footer-social-item">
          <li>
            <a href="/#facebook" rel="noreferrer noopener" target="_blank">
              <span className="facebook-icon" />
            </a>
          </li>
          <li>
            <a href="/#instagram" rel="noreferrer noopener" target="_blank">
              <span className="instagram-icon" />
            </a>
          </li>
          <li>
            <a href="/#pinterest" rel="noreferrer noopener" target="_blank">
              <span className="pinterest-icon" />
            </a>
          </li>
          <li>
            <a href="/#twitter" rel="noreferrer noopener" target="_blank">
              <span className="twitter-icon" />
            </a>
          </li>
        </ul>
      </Container>
    </footer>
  );
};

export default Footer;

import React from 'react';
import styled from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';

const FooterContainer = styled.footer`
  background-color: #f6fdfd;
  color: #ffffff;
  padding: 40px 20px 20px;
  font-family: 'Arial, sans-serif';

  @media (max-width: 768px) {
    padding: 30px 15px 15px;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 30px;
  gap: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
  }
`;

const Column = styled.div`
  flex: 1;
  min-width: 200px;

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

const Heading = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #565454;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 10px;
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  margin-bottom: 10px;

  @media (max-width: 768px) {
    margin-bottom: 8px;
  }
`;

const Link = styled.a`
  color: #545050;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;

  &:hover {
    color: #000000;
  }

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const SocialContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 15px;

  @media (max-width: 768px) {
    gap: 10px;
    justify-content: center;
  }
`;

const SocialIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
  }
`;

const Divider = styled.div`
  border-top: 1px solid #333;
  margin: 20px 0;

  @media (max-width: 768px) {
    margin: 15px 0;
  }
`;

const Bottom = styled.div`
  text-align: center;
  font-size: 14px;
  color: #010101;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const Footer = () => {
  return (
    <FooterContainer data-testid="footer">
      <Container>
        <Content>
          {/* Company Column */}
          <Column>
            <Heading>Company</Heading>
            <List>
              <ListItem>
                <Link
                  href="#about"
                  data-testid="footer-about-link"
                >
                  About Us
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  href="#careers"
                  data-testid="footer-careers-link"
                >
                  Careers
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  href="#blog"
                  data-testid="footer-blog-link"
                >
                  Blog
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  href="#contact"
                  data-testid="footer-contact-link"
                >
                  Contact
                </Link>
              </ListItem>
            </List>
          </Column>

          {/* Products Column */}
          <Column>
            <Heading>Products</Heading>
            <List>
              <ListItem>
                <Link
                  href="#features"
                  data-testid="footer-features-link"
                >
                  Features
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  href="#pricing"
                  data-testid="footer-pricing-link"
                >
                  Pricing
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  href="#demo"
                  data-testid="footer-demo-link"
                >
                  Demo
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  href="#updates"
                  data-testid="footer-updates-link"
                >
                  Updates
                </Link>
              </ListItem>
            </List>
          </Column>

          {/* Resources Column */}
          <Column>
            <Heading>Resources</Heading>
            <List>
              <ListItem>
                <Link
                  href="#docs"
                  data-testid="footer-docs-link"
                >
                  Documentation
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  href="#support"
                  data-testid="footer-support-link"
                >
                  Support
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  href="#faq"
                  data-testid="footer-faq-link"
                >
                  FAQ
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  href="#community"
                  data-testid="footer-community-link"
                >
                  Community
                </Link>
              </ListItem>
            </List>
          </Column>

          {/* Legal Column */}
          <Column>
            <Heading>Legal</Heading>
            <List>
              <ListItem>
                <Link
                  href="#privacy"
                  data-testid="footer-privacy-link"
                >
                  Privacy Policy
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  href="#terms"
                  data-testid="footer-terms-link"
                >
                  Terms of Service
                </Link>
              </ListItem>
              <ListItem>
                <Link
                  href="#cookies"
                  data-testid="footer-cookies-link"
                >
                  Cookie Policy
                </Link>
              </ListItem>
            </List>

            {/* Social Media Icons */}
            <SocialContainer>
              <SocialIcon data-testid="footer-facebook-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#000000" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
                </svg>
              </SocialIcon>
              <SocialIcon data-testid="footer-twitter-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#000000" viewBox="0 0 16 16">
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
                </svg>
              </SocialIcon>
              <SocialIcon data-testid="footer-linkedin-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#000000" viewBox="0 0 25 25">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </SocialIcon>
              <SocialIcon data-testid="footer-instagram-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#000000" viewBox="0 0 25 25">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </SocialIcon>
            </SocialContainer>
          </Column>
        </Content>

        <Divider />

        <Bottom data-testid="footer-copyright">
          <p>
            &copy; {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </Bottom>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
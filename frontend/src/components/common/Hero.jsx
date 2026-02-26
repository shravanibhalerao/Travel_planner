import React from "react";
import { motion } from "framer-motion";
import styled from "styled-components";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./Navbar";
import img1 from "../../assets/1.jpg";
import img2 from "../../assets/2.jpg";
import img3 from "../../assets/3.jpg";
import img4 from "../../assets/4.jpg";
import img5 from "../../assets/5.jpg";
import img6 from "../../assets/6.jpg";
import img7 from "../../assets/7.jpg";
import img8 from "../../assets/abc.jpg";

// Images for the horizontal scrolling rail
const railImages = [img1, img2, img3, img4, img5, img6, img7];

// FIXED: Use margin-top instead of padding-top to account for fixed navbar
const HeroContainer = styled.section`
  width: 100%;
  min-height: 100vh;
  margin-top: -40px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0;
  margin-right: 0;
  padding: 0;

  background-image: url(${img8});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 1;
  }

  > * {
    position: relative;
    z-index: 2;
  }
`;

const HeroWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
  padding: 2rem;
  margin: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const TextSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fefefe;
  flex: 1;
  margin-top: -5px;
`;

const RightGallery = styled.div`
  width: 500px;
  overflow: hidden;
  flex-shrink: 0;

  /* Fade edges for premium look */
  mask-image: linear-gradient(
    to right,
    transparent,
    black 15%,
    black 85%,
    transparent
  );

  @media (max-width: 768px) {
    display: none;
  }
`;

const ScrollTrack = styled.div`
  display: flex;
  gap: 10px;
  width: max-content;

  animation: scrollX 30s linear infinite;

  &:hover {
    animation-play-state: paused;
  }

  @keyframes scrollX {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }
`;

const ImageCard = styled.div`
  width: 280px;
  height: 420px;
  border-radius: 20px;
  overflow: hidden;

  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
  background: #000;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Slight vertical motion */
  animation: floatY 6s ease-in-out infinite;

  @keyframes floatY {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
`;

const Heading = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 600;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  margin: 0 0 1.5rem 0;
`;

const Subtext = styled(motion.p)`
  font-size: 0.8rem;
  margin-bottom: 2.5rem;
  max-width: 520px;
  margin: 0 0 2.5rem 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const PrimaryButton = styled(motion.button)`
  background: transparent;
  color: #fdfdfd;
  border: 1px solid #ffffff;
  padding: 0.6rem 1.4rem; 
  border-radius: 50px;
  font-weight: 500;
  font-size: 1.00rem;
  cursor: pointer;
   &:hover {
      border-color: #ffffff;          /* ← new border color */
    background: rgba(120, 247, 249, 0.15);
    color: #f7f7f7;
  }
`;

function Hero() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const bounceVariants = {
    hidden: { scale: 0 },
    visible: { scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
  };

  return (
    <>
      <Navbar />
      <HeroContainer>
        <HeroWrapper>
          {/* Text Section */}
          <TextSection>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Heading variants={itemVariants}>
                The Journey Beyond <br /> Your Imagination
              </Heading>

              <Subtext variants={itemVariants}>
                Discover thousands of breathtaking destinations around the world.<br />
                Carefully crafted experiences that turn your trips into unforgettable stories.
              </Subtext>

              <ButtonGroup>
                <PrimaryButton
                  variants={bounceVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Now
                </PrimaryButton>
              </ButtonGroup>
            </motion.div>
          </TextSection>

          {/* Horizontal Auto-Scrolling Image Rail */}
          <RightGallery>
            <ScrollTrack>
              {railImages.concat(railImages).map((img, index) => (
                <ImageCard key={index}>
                  <img src={img} alt={`Rail Image ${index + 1}`} />
                </ImageCard>
              ))}
            </ScrollTrack>
          </RightGallery>
        </HeroWrapper>
      </HeroContainer>
    </>
  );
}

export default Hero;
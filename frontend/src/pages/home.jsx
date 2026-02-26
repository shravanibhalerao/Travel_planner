import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import Hero from "../components/common/Hero.jsx";
import Footer from "../components/common/Footer.jsx";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-8px) rotate(3deg); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(1.05); }
`;

const Container = styled.div`
  max-width: 400px; margin: 0 auto; width: 100%; padding: 0; min-height: 120%;
  @media (min-width: 1024px) { max-width: 1200px; padding: 0; }
  @media (min-width: 1536px) { max-width: 1200px; }
`;

const Section = styled.section`
  padding: 2rem 2rem;
  background: ${props => props.bg || '#ffffff'};
  text-align: center; position: relative; overflow: hidden;
  @media (min-width: 768px)  { padding: 3rem 2rem; }
  @media (min-width: 1024px) { padding: 4rem 2rem; }
  &::before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: ${props => props.overlay || 'rgba(255,255,255,0.1)'}; z-index: 0; }
  > * { position: relative; z-index: 1; }
  h2 { font-size: clamp(1.8rem,4vw,2.5rem); font-weight: 600; margin-bottom: 1.5rem; margin-top: -1rem; color: #393c42;
    @media (min-width: 1024px) { margin-bottom: 2rem; } }
  h3 { font-size: clamp(1.8rem,4vw,2.5rem); font-weight: 600; margin-bottom: 1.5rem; margin-top: -4rem; color: #393c42;
    @media (min-width: 1024px) { margin-bottom: 2rem; } }
`;

const ItemsGrid = styled.div`
  display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-top: 2rem;
  @media (min-width: 640px)  { grid-template-columns: repeat(2,1fr); gap: 2rem; }
  @media (min-width: 1024px) { grid-template-columns: repeat(3,1fr); gap: 2.5rem; }
  @media (min-width: 1536px) { grid-template-columns: repeat(4,1fr); gap: 3rem; }
`;

const Card = styled(motion.div)`
  flex: 0 0 280px; background: linear-gradient(145deg,#ffffff,#f1f5f9); border-radius: 10px;
  padding: 1.2rem; box-shadow: 0 8px 24px rgb(192,179,179);
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1); display: flex; flex-direction: column;
  &:hover { box-shadow: 0 16px 40px rgba(0,0,0,0.2); transform: translateY(-8px); }
  img { width: 100%; margin-bottom: 1rem; border-radius: 10px; }
  h5 { color: #1e3a8a; margin-bottom: 0.7rem; font-size: 1.1rem; font-weight: 700; }
  p  { color: #64748b; margin-bottom: 1rem; line-height: 1.5; font-size: 0.9rem; flex-grow: 1; }
`;

const Button = styled(motion.a)`
  display: inline-block; background: linear-gradient(45deg,#384166 0%,#3a4872); color: white;
  padding: 0.75rem 1.5rem; border-radius: 50px; text-decoration: none; font-weight: bold;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1); border: none; cursor: pointer; font-size: 0.95rem; width: fit-content;
  @media (min-width: 1024px) { padding: 0.85rem 1.8rem; font-size: 1rem; }
  &:hover { box-shadow: 0 8px 20px rgba(236,72,153,0.4); transform: translateY(-2px); }
  &:active { transform: translateY(0); }
`;

const StatusText = styled.p`color: #64748b; font-size: 1rem; margin-top: 2rem; text-align: center;`;

const Overlay = styled(motion.div)`
  position: fixed; inset: 0; background: rgba(186,210,235,0.55);
  backdrop-filter: blur(10px); display: grid; place-items: center; z-index: 1000; padding: 1rem;
`;

const Blob = styled.div`
  position: absolute; border-radius: 50%; filter: blur(55px); pointer-events: none;
  animation: ${pulse} 5s ease-in-out infinite;
  &.b1 { width:220px; height:220px; background:radial-gradient(circle,#bfdbfe 0%,transparent 70%); top:-60px; left:-60px; animation-delay:0s; }
  &.b2 { width:180px; height:180px; background:radial-gradient(circle,#93c5fd 0%,transparent 70%); bottom:-40px; right:-40px; animation-delay:2s; }
  &.b3 { width:120px; height:120px; background:radial-gradient(circle,#dbeafe 0%,transparent 70%); top:40%; left:30%; animation-delay:1s; opacity:0.5; }
`;

const ModalCard = styled(motion.div)`
  font-family: 'DM Sans',sans-serif; position: relative; overflow: hidden; width: 900px; max-width: 96vw;
  background: linear-gradient(140deg,#ffffff 0%,#eff6ff 50%,#ffffff 100%);
  border: 1px solid rgba(147,197,253,0.45); border-radius: 24px;
  display: grid; grid-template-columns: 1fr 1fr; color: #1e3a5f;
  box-shadow: 0 0 0 1px rgba(59,130,246,0.12), 0 40px 80px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.9);
  @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const CloseBtn = styled.button`
  position: absolute; top: 1.2rem; right: 1.2rem; width: 34px; height: 34px; border-radius: 50%;
  border: 1px solid rgba(59,130,246,0.2); background: rgba(219,234,254,0.5);
  color: #64748b; font-size: 1rem; line-height: 1; cursor: pointer; z-index: 10;
  display: grid; place-items: center; transition: background 0.2s,color 0.2s,border-color 0.2s;
  &:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.3); }
`;

const LeftPanel = styled.div`
  padding: 3rem 2.5rem; border-right: 1px solid rgba(147,197,253,0.3);
  display: flex; flex-direction: column; gap: 0;
  background: linear-gradient(160deg,#eff6ff 0%,#dbeafe 100%); border-radius: 24px 0 0 24px;
  @media (max-width: 700px) { border-right: none; border-bottom: 1px solid rgba(147,197,253,0.3); border-radius: 24px 24px 0 0; padding: 2.5rem 2rem 2rem; }
`;

const Tag = styled.span`
  font-family: 'DM Sans',sans-serif; font-size: 0.7rem; font-weight: 500; letter-spacing: 0.18em;
  text-transform: uppercase; color: #2563eb; background: rgba(37,99,235,0.1);
  border: 1px solid rgba(37,99,235,0.2); border-radius: 20px; padding: 0.25rem 0.75rem; width: fit-content; margin-bottom: 1.2rem;
`;

const LeftTitle = styled.h2`
  font-family: 'Syne',sans-serif; font-size: clamp(1.6rem,3vw,2.2rem); font-weight: 800; line-height: 1.15; margin: 0 0 0.5rem;
  background: linear-gradient(90deg,#1e40af,#3b82f6,#60a5fa); background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  animation: ${shimmer} 4s linear infinite;
`;

const LeftSubtitle = styled.p`font-size: 0.875rem; color: #64748b; margin: 0 0 2.5rem; line-height: 1.6;`;

const Divider = styled.div`height: 1px; background: linear-gradient(90deg,rgba(59,130,246,0.4),transparent); margin-bottom: 2rem;`;

const InfoList = styled.div`display: flex; flex-direction: column; gap: 1.2rem; flex: 1;`;

const InfoItem = styled.div`display: flex; align-items: flex-start; gap: 1rem;`;

const IconWrap = styled.div`
  width: 40px; height: 40px; border-radius: 12px; background: rgba(59,130,246,0.1);
  border: 1px solid rgba(59,130,246,0.2); display: grid; place-items: center; font-size: 1.1rem; flex-shrink: 0;
  animation: ${float} 5s ease-in-out infinite; animation-delay: ${({ delay }) => delay || '0s'};
`;

const InfoText  = styled.div`display: flex; flex-direction: column; gap: 0.15rem;`;
const InfoLabel = styled.span`font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500;`;
const InfoValue = styled.span`font-size: 0.92rem; color: #1e3a5f; font-weight: 500;`;

const SocialRow = styled.div`display: flex; gap: 0.6rem; margin-top: 2.5rem;`;

const SocialBtn = styled.a`
  width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.7);
  border: 1px solid rgba(147,197,253,0.5); display: grid; place-items: center;
  font-size: 1rem; color: #2563eb; text-decoration: none; cursor: pointer;
  transition: background 0.2s,border-color 0.2s,transform 0.2s;
  &:hover { background: rgba(219,234,254,0.9); border-color: rgba(59,130,246,0.5); transform: translateY(-2px); }
`;

const RightPanel = styled.div`
  padding: 3rem 2.5rem; display: flex; flex-direction: column; background: #ffffff; border-radius: 0 24px 24px 0;
  @media (max-width: 700px) { border-radius: 0 0 24px 24px; padding: 2rem 2rem 2.5rem; }
`;

const RightTitle    = styled.h3`font-family:'Syne',sans-serif; font-size:1.15rem; font-weight:700; color:#1e3a5f; margin:0 0 0.3rem;`;
const RightSubtitle = styled.p`font-size:0.82rem; color:#94a3b8; margin:0 0 1.8rem;`;

const FieldGroup = styled.div`
  display: flex; gap: 0.8rem; margin-bottom: 0.9rem;
  @media (max-width: 500px) { flex-direction: column; }
`;
const FieldWrap = styled.div`flex: 1; display: flex; flex-direction: column; gap: 0.35rem;`;
const Label     = styled.label`font-size:0.7rem; font-weight:500; letter-spacing:0.08em; color:#64748b; text-transform:uppercase;`;

const inputStyles = `
  font-family: 'DM Sans',sans-serif; width: 100%; padding: 0.65rem 0.9rem; background: #f8faff;
  border: 1px solid rgba(147,197,253,0.5); border-radius: 10px; color: #1e3a5f; font-size: 0.88rem;
  outline: none; transition: border-color 0.2s,background 0.2s,box-shadow 0.2s; box-sizing: border-box;
  &::placeholder { color: #cbd5e1; }
  &:focus { border-color: rgba(59,130,246,0.6); background: #eff6ff; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
`;

const Input    = styled.input`${inputStyles}`;
const Textarea = styled.textarea`${inputStyles} resize:none; line-height:1.6; margin-bottom:1.2rem;`;

const SubmitBtn = styled(motion.button)`
  font-family:'Syne',sans-serif; width:100%; padding:0.85rem; border-radius:12px; border:none; cursor:pointer;
  font-size:0.92rem; font-weight:700; letter-spacing:0.04em; position:relative; overflow:hidden;
  background: linear-gradient(135deg,#2563eb,#3b82f6); color:white; box-shadow:0 4px 20px rgba(37,99,235,0.3); transition:box-shadow 0.2s;
  &::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#1d4ed8,#2563eb); opacity:0; transition:opacity 0.3s; }
  &:hover::before { opacity:1; }
  &:hover { box-shadow: 0 6px 28px rgba(37,99,235,0.45); }
  span { position:relative; z-index:1; }
  &:disabled { opacity:0.6; cursor:not-allowed; }
`;

const StatusMsg = styled(motion.p)`
  text-align:center; font-size:0.82rem; margin:0.8rem 0 0;
  color: ${({ $success }) => $success ? '#16a34a' : '#dc2626'};
`;

const API_BASE = "https://travel-planner-cf8s.onrender.com";

function Home() {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  const [tourCategories, setTourCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(0);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [showContact, setShowContact]       = useState(false);
  const [form, setForm]     = useState({ name:'', email:'', subject:'', message:'' });
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const [errMsg, setErrMsg]   = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('error'); setErrMsg('Please fill in your name, email, and message.'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setStatus('error'); setErrMsg('Please enter a valid email address.'); return;
    }
    setSending(true); setStatus(null); setErrMsg('');
    try {
      const res  = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(), email: form.email.trim(),
          subject: form.subject.trim(), message: form.message.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('sent');
        setForm({ name:'', email:'', subject:'', message:'' });
      } else {
        setStatus('server-error');
        setErrMsg(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('server-error');
      setErrMsg('Could not reach the server. Please try again later.');
    } finally { setSending(false); }
  };

  const openContact  = () => { setShowContact(true);  setStatus(null); setErrMsg(''); };
  const closeContact = () => setShowContact(false);
  const btnLabel     = () => sending ? 'Sending…' : status === 'sent' ? '✓ Message sent!' : 'Send Message →';

  useEffect(() => {
    fetch(`${API_BASE}/api/tours/full`)
      .then(r => { if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`); return r.json(); })
      .then(d => { setTourCategories(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  return (
    <>
      <GlobalStyle />
      <Hero />

      {/* Indian Travel Destinations */}
      <Section bg="#f8fafc">
        <Container>
          <motion.div initial={{ opacity:0,y:30 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.7 }}
            style={{ textAlign:'center', marginBottom:'0.5rem' }}>
            <div style={{ position:'relative', display:'inline-block' }}>
              <motion.h2 initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ duration:0.6,delay:0.3 }}
                style={{ fontFamily:"'Georgia','Times New Roman',serif", fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:'400',
                  fontStyle:'italic', color:'#1e293b', lineHeight:'1.2', margin:0, letterSpacing:'-0.01em' }}>
                Journey Through{' '}
                <span style={{ fontStyle:'normal', fontWeight:'800', fontFamily:"'Inter',sans-serif",
                  background:'linear-gradient(135deg,#384166 0%,#6b7db3 50%,#384166 100%)',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>India's</span>
                {' '}Finest<br />Destinations
              </motion.h2>
              <motion.div initial={{ width:0 }} whileInView={{ width:'60%' }} viewport={{ once:true }}
                transition={{ duration:0.8,delay:0.6,ease:'easeOut' }}
                style={{ height:'3px', background:'linear-gradient(90deg,#384166,#6b7db3,transparent)',
                  borderRadius:'2px', margin:'0.75rem auto 0 auto' }} />
            </div>
          </motion.div>

          {loading && (
            <div style={{ textAlign:'center', padding:'3rem' }}>
              <div style={{ display:'inline-block', width:'36px', height:'36px', border:'3px solid #e2e8f0',
                borderTop:'3px solid #384166', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <StatusText style={{ marginTop:'1rem' }}>Loading...</StatusText>
            </div>
          )}
          {error && <StatusText style={{ color:'#e53e3e', marginTop:'2rem' }}>⚠️ Could not load destinations: {error}</StatusText>}

          {!loading && !error && tourCategories.length > 0 && (
            <>
              <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}
                style={{ display:'flex', flexWrap:'nowrap', gap:'0.75rem', justifyContent:'flex-start',
                  marginTop:'2rem', marginBottom:'0.5rem', overflowX:'auto', paddingBottom:'0.75rem',
                  scrollbarWidth:'none', msOverflowStyle:'none' }}>
                {tourCategories.map((category, index) => (
  <motion.button
    key={category.id}
    onClick={() => setActiveCategory(activeCategory === index ? null : index)}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    style={{
      flexShrink: 0,
      padding: '0.6rem 1.4rem',
      borderRadius: '50px',
      border: '2px solid',
      borderColor: activeCategory === index ? '#384166' : '#e2e8f0',
      background: activeCategory === index
        ? 'linear-gradient(135deg,#384166,#4a5490)'
        : '#ffffff',
      color: activeCategory === index ? '#ffffff' : '#64748b',
      fontWeight: '600',
      fontSize: '0.9rem',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      boxShadow: activeCategory === index
        ? '0 4px 15px rgba(56,65,102,0.35)'
        : '0 2px 8px rgba(0,0,0,0.06)',
      whiteSpace: 'nowrap'
    }}
  >
    {category.categoryName}
  </motion.button>
))}
              </motion.div>

              <AnimatePresence mode="wait">
                {activeCategory !== null && tourCategories[activeCategory] && (
                  <motion.div key={activeCategory} initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }}
                    exit={{ opacity:0,y:-10 }} transition={{ duration:0.4,ease:'easeOut' }} style={{ marginTop:'2rem' }}>
                    
                    {tourCategories[activeCategory].destinations?.length > 0 ? (
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1.5rem' }}>
                        {tourCategories[activeCategory].destinations.map((place, i) => (
                          <motion.div key={place.id} initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }}
                            transition={{ delay:i*0.07,duration:0.4,ease:'easeOut' }} whileHover={{ y:-6 }}
                            style={{ borderRadius:'16px', overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.1)',
                              background:'#fff', cursor:'pointer', position:'relative' }}>
                            {place.imageUrl ? (
                              <img src={place.imageUrl} alt={place.name} loading="lazy"
                                style={{ width:'100%', height:'180px', objectFit:'cover', display:'block' }} />
                            ) : (
                              <div style={{ width:'100%', height:'180px',
                                background:'linear-gradient(135deg,#384166 0%,#6b7db3 100%)',
                                display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem' }}></div>
                            )}
                            <div style={{ padding:'1rem' }}>
                              <div style={{ fontWeight:'700', color:'#1e3a8a', fontSize:'1rem', marginBottom:'0.25rem' }}>{place.name}</div>
                              
                              {place.description && (
                                <div style={{ fontSize:'0.8rem', color:'#64748b', marginTop:'0.5rem', lineHeight:'1.4',
                                  display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                                  {place.description}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : <StatusText>No destinations in this category yet.</StatusText>}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </Container>
      </Section>

      {/* Top Deals */}
      <Section bg="#f0f7f7">
        <Container>
          <br /><br /><h3>Top Deals</h3>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once:true,amount:0.2 }}>
            <ItemsGrid>
              <Card variants={itemVariants} whileHover={{ y:-8 }}>
                <h5>Explore Incredible India</h5><p>Packages starting from ₹4,999</p>
                <p>Discover Goa beaches, Manali mountains, Kerala backwaters & more!</p>
                <Button as={motion(Link)} to="/packages" whileHover={{ scale:1.05 }}>Explore Now</Button>
              </Card>
              <Card variants={itemVariants} whileHover={{ y:-8 }}>
                <h5>Discover India's Best Destinations</h5><p>Starting from ₹3,999</p>
                <p>From Jaipur palaces to Kashmir valleys — your perfect getaway awaits.</p>
                <Button as={motion(Link)} to="/packages" whileHover={{ scale:1.05 }}>Plan Your Trip</Button>
              </Card>
              <Card variants={itemVariants} whileHover={{ y:-8 }}>
                <h5>🇮🇳 Journey Through India</h5><p>Affordable trips from ₹2,999</p>
                <p>Experience culture, food, heritage & natural beauty all in one place.</p>
                <Button as={motion(Link)} to="/packages" whileHover={{ scale:1.05 }}>Start Exploring</Button>
              </Card>
            </ItemsGrid>
          </motion.div>
        </Container>
      </Section>

      {/* Why Us */}
      <Section bg="#f4fcfc">
        <Container>
          <h2>Designed for the Way You Travel</h2>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once:true,amount:0.2 }}>
            <ItemsGrid>
              <Card variants={itemVariants} whileHover={{ y:-8 }}>
                <h5>Best Prices Ever</h5>
                <p>Guaranteed low-key savings on every booking. We match or beat any competitor's price.</p>
                <Button as="a" href="#" whileHover={{ scale:1.05 }}>Learn More</Button>
              </Card>
              <Card variants={itemVariants} whileHover={{ y:-8 }}>
                <h5>24/7 Squad</h5>
                <p>Our support team is always here to help. Chat, call, or email anytime.</p>
                <Button as="button" onClick={openContact} whileHover={{ scale:1.05 }}>Contact Us</Button>
              </Card>
              <Card variants={itemVariants} whileHover={{ y:-8 }}>
                <h5>Secure AF</h5>
                <p>Safe and secure transactions for peace of mind. Your data is protected.</p>
                <Button as="a" href="#" whileHover={{ scale:1.05 }}>See Details</Button>
              </Card>
            </ItemsGrid>
          </motion.div>
        </Container>
      </Section>

      <br />

      {/* About Us */}
<section bg="#f0f7f7">
 <div className="col-lg-12 d-flex justify-content-center position-relative">
   
        <div className="card-body p-4 p-lg-3">
          <div className="row align-items-center">
            {/* Left Column */}
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="display-5 fw-bold text-dark mb-3">About Us</h2>
              <p className="lead text-muted mb-2" style={{ fontSize: '0.95rem' }}>
                Embark on unforgettable journeys with us, where every destination tells a story and every experience creates lasting memories. Our passion for travel drives us to curate adventures that inspire and connect people from all walks of life.
              </p>
              <p className="text-muted mb-2" style={{ fontSize: '0.95rem' }}>
                From serene beaches to bustling cities, we believe in exploring the world with curiosity and respect, fostering a deeper appreciation for diverse cultures and breathtaking landscapes.
              </p><br /><br/>
              <button className="btn rounded-pill px-4 py-2 fw-semibold text-white" style={{ backgroundColor: '#2d324a',  fontSize: '0.85rem' }}>
                More about
              </button>
            </div>

            {/* Right Column */}
            <div className="col-lg-6 position-relative">
              <div className="position-relative">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=500&q=80"
                  alt="Travel destination 1"
                  className="img-fluid rounded-3 shadow"
                  style={{ transform: 'rotate(-5deg)', width: '80%', height: 'auto' }}
                />
                <img
                  src="https://deih43ym53wif.cloudfront.net/agonda-beach-goa-india-shutterstock_1340137070.jpg_aa56019d55.jpg"
                  alt="Travel destination 2"
                  className="img-fluid rounded-3 shadow position-absolute top-50 start-50 translate-middle"
                  style={{ transform: 'rotate(5deg) translate(-50%, -50%)', width: '80%', height: 'auto', zIndex: 1 }}
                />
              </div>
              {/* Dotted Curved Path with Paper Plane */}
              <svg
                width="200"
                height="150"
                className="position-absolute top-0 end-0"
                style={{ zIndex: 2 }}
                viewBox="0 0 200 150"
              >
                <path
                  d="M10 140 Q50 50 150 20"
                  fill="none"
                  stroke="#3b3e5b"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  strokeLinecap="round"
                />
                <text x="160" y="15" fontSize="20" fill="#1c2348">✈︎</text>
              </svg>
            </div>
          </div>

          {/* Bottom Stats Row */}
          <div className="row mt-5 text-center">
            <div className="col-6 col-md-3 mb-3">
              <h4 className="fw-bold text-primary mb-1">10,000+</h4>
              <p className="text-muted small mb-0">Happy Travelers</p>
            </div>
            <div className="col-6 col-md-3 mb-3">
              <h4 className="fw-bold text-primary mb-1">50+</h4>
              <p className="text-muted small mb-0">Destinations</p>
            </div>
            <div className="col-6 col-md-3 mb-3">
              <h4 className="fw-bold text-primary mb-1">98%</h4>
              <p className="text-muted small mb-0">Satisfaction Rate</p>
            </div>
            <div className="col-6 col-md-3 mb-3">
              <h4 className="fw-bold text-primary mb-1">15+</h4>
              <p className="text-muted small mb-0">Years Experience</p>
            </div>
          </div>
        </div>
      </div>

</section>
      <br /><br />

      {/* Contact Modal */}
      <AnimatePresence>
        {showContact && (
          <Overlay initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={closeContact}>
            <ModalCard initial={{ opacity:0,scale:0.88,y:20 }} animate={{ opacity:1,scale:1,y:0 }}
              exit={{ opacity:0,scale:0.88,y:20 }} transition={{ type:'spring',stiffness:280,damping:28 }}
              onClick={e => e.stopPropagation()}>
              <Blob className="b1" /><Blob className="b2" /><Blob className="b3" />
              <CloseBtn onClick={closeContact} aria-label="Close">✕</CloseBtn>

              <LeftPanel>
                <Tag>Get in touch</Tag>
                <LeftTitle>Let's work<br />together</LeftTitle>
                <LeftSubtitle>Have a project in mind or just want to say hello?<br />We're here for you.</LeftSubtitle>
                <Divider />
                <InfoList>
                  <InfoItem>
                    <IconWrap delay="0s">☎</IconWrap>
                    <InfoText><InfoLabel>Phone</InfoLabel><InfoValue>+91 98765 43210</InfoValue></InfoText>
                  </InfoItem>
                  <InfoItem>
                    <IconWrap delay="0.6s">📍</IconWrap>
                    <InfoText><InfoLabel>Location</InfoLabel><InfoValue>Pune, Maharashtra, India</InfoValue></InfoText>
                  </InfoItem>
                  <InfoItem>
                    <IconWrap delay="1.2s">⏰</IconWrap>
                    <InfoText><InfoLabel>Office Hours</InfoLabel><InfoValue>Mon – Fri · 10 AM – 6 PM</InfoValue></InfoText>
                  </InfoItem>
                </InfoList>
                <SocialRow>
                  <SocialBtn href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Z"/>
                    </svg>
                  </SocialBtn>
                  <SocialBtn href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.98 3.5C4.98 5 3.94 6 2.5 6S0 5 0 3.5 1.06 1 2.5 1 4.98 2 4.98 3.5zM.5 8h4v12h-4V8zm7 0h3.6v1.7h.05c.5-.95 1.7-1.95 3.5-1.95 3.75 0 4.45 2.45 4.45 5.65V20h-4v-5.6c0-1.35-.02-3.1-1.9-3.1-1.9 0-2.2 1.45-2.2 3v5.7h-4V8z"/>
                    </svg>
                  </SocialBtn>
                  <SocialBtn href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 012.01-.27c.68 0 1.36.09 2.01.27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                  </SocialBtn>
                  <SocialBtn href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8.051 1.999h.089c.822.003 1.644.032 2.464.093.824.06 1.644.179 2.46.36.766.17 1.356.76 1.526 1.526.181.816.3 1.636.36 2.46.061.82.09 1.642.093 2.464v.178c-.003.822-.032 1.644-.093 2.464-.06.824-.179 1.644-.36 2.46-.17.766-.76 1.356-1.526 1.526-.816.181-1.636.3-2.46.36-.82.061-1.642.09-2.464.093h-.178c-.822-.003-1.644-.032-2.464-.093-.824-.06-1.644-.179-2.46-.36A1.875 1.875 0 01.526 12.526c-.181-.816-.3-1.636-.36-2.46A47.4 47.4 0 010 8.051v-.089c.003-.822.032-1.644.093-2.464.06-.824.179-1.644.36-2.46C.623 2.272 1.213 1.682 1.979 1.512c.816-.181 1.636-.3 2.46-.36.82-.061 1.642-.09 2.464-.093zm-1.54 3.482v5.038L10.6 8 6.51 5.48z"/>
                    </svg>
                  </SocialBtn>
                </SocialRow>
              </LeftPanel>

              <RightPanel>
                <RightTitle>Send a message</RightTitle>
                <RightSubtitle>We'll get back to you within 24 hours.</RightSubtitle>
                <FieldGroup>
                  <FieldWrap>
                    <Label htmlFor="name">Your name</Label>
                    <Input id="name" name="name" type="text" placeholder="Arjun Sharma"
                      value={form.name} onChange={handleChange} disabled={sending || status==='sent'} />
                  </FieldWrap>
                  <FieldWrap>
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" name="email" type="email" placeholder="arjun@example.com"
                      value={form.email} onChange={handleChange} disabled={sending || status==='sent'} />
                  </FieldWrap>
                </FieldGroup>
                <FieldWrap style={{ marginBottom:'0.9rem' }}>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" type="text" placeholder="What's this about?"
                    value={form.subject} onChange={handleChange} disabled={sending || status==='sent'} />
                </FieldWrap>
                <FieldWrap>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" rows={5} placeholder="Tell us more about your project or enquiry…"
                    value={form.message} onChange={handleChange} disabled={sending || status==='sent'} />
                </FieldWrap>
                <SubmitBtn onClick={handleSubmit} disabled={sending || status==='sent'} whileTap={{ scale:0.97 }}>
                  <span>{btnLabel()}</span>
                </SubmitBtn>
                <AnimatePresence>
                  {(status==='error' || status==='server-error') && (
                    <StatusMsg $success={false} initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                      {errMsg}
                    </StatusMsg>
                  )}
                  {status==='sent' && (
                    <StatusMsg $success={true} initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                      Thanks! We'll be in touch soon. 🎉
                    </StatusMsg>
                  )}
                </AnimatePresence>
              </RightPanel>
            </ModalCard>
          </Overlay>
        )}
      </AnimatePresence>
      <Footer />
    </>
  );
}

export default Home;
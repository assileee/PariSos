import { useEffect, useState } from "react";
import CardComponent from "../components/CardComponent";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const HomePage = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGuides = async () => {
    setLoading(true);
    try {
      // Static starter content for Paris student resources
      const staticGuides = [
        {
          _id: "caf",
          name: "CAF – Housing Assistance",
          description:
            "Apply for APL/ALS housing aid. Get up to €200/month to help with rent.",
          unit: "Guide",
          quantity: 1,
          imageUrl:
            "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800&auto=format&fit=crop",
          link: "https://www.caf.fr/",
        },
        {
          _id: "navigo",
          name: "Navigo & Imagine R",
          description:
            "Get your transport card with student discount for Paris metro and buses.",
          unit: "Guide",
          quantity: 1,
          imageUrl:
            "https://images.unsplash.com/photo-1544986581-efac024faf62?q=80&w=800&auto=format&fit=crop",
          link: "https://www.iledefrance-mobilites.fr/",
        },
        {
          _id: "ofii",
          name: "OFII / Residence Permit",
          description:
            "Validate your visa within 3 months! Handle all residence permit procedures.",
          unit: "Guide",
          quantity: 1,
          imageUrl:
            "https://images.unsplash.com/photo-1542382257-80dedb725088?q=80&w=800&auto=format&fit=crop",
          link: "https://administration-etrangers-en-france.interieur.gouv.fr/",
        },
        {
          _id: "cvec",
          name: "CVEC",
          description:
            "Pay the €100 Student Life Contribution required for enrollment.",
          unit: "Guide",
          quantity: 1,
          imageUrl:
            "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=800&auto=format&fit=crop",
          link: "https://cvec.etudiant.gouv.fr/",
        },
        {
          _id: "cpam",
          name: "Health Insurance",
          description:
            "Register for French healthcare, get your Carte Vitale and find a doctor.",
          unit: "Guide",
          quantity: 1,
          imageUrl:
            "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop",
          link: "https://www.ameli.fr/",
        },
        {
          _id: "bank",
          name: "French Bank Account",
          description:
            "Open a student account - required for CAF, rent, and phone contracts.",
          unit: "Guide",
          quantity: 1,
          imageUrl:
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
          link: "#",
        },
      ];
      setGuides(staticGuides);
      setError(null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuides();
  }, []);

  const token = localStorage.getItem("token");

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading guides...</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Hero Section with Paris Background */}
      <div 
        className="hero-section position-relative text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '500px',
          marginTop: '-30px',
          marginBottom: '50px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '0 0 20px 20px'
        }}
      >
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-3 fw-bold mb-4">
                Welcome to PariSos
              </h1>
              <p className="lead fs-4 mb-4">
                Your personal guide to conquering French administration
              </p>
              <p className="fs-5 mb-5" style={{ opacity: 0.95 }}>
                Moving to Paris as a student can be overwhelming. From visa validation to CAF applications, 
                we're here to simplify every step of your journey. Get personalized checklists, 
                instant answers, and never miss a deadline again.
              </p>
              {!token ? (
                <div>
                  <a href="/signup" className="btn btn-primary btn-lg me-3 px-4">
                    <i className="bi bi-rocket-takeoff me-2"></i>Get Started
                  </a>
                  <a href="/login" className="btn btn-outline-light btn-lg px-4">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Login
                  </a>
                </div>
              ) : (
                <div>
                  <a href="/chatbot" className="btn btn-light btn-lg me-3 px-4">
                    <i className="bi bi-chat-dots text-primary me-2"></i>
                    <span className="text-primary">Start Chatbot</span>
                  </a>
                  <a href="/checklist" className="btn btn-outline-light btn-lg px-4">
                    <i className="bi bi-list-check me-2"></i>My Checklist
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* What is PariSos Section */}
        <div className="row mb-5">
          <div className="col-12 text-center mb-5">
            <h2 className="display-6 fw-bold">What is PariSos?</h2>
            <p className="lead text-muted col-lg-8 mx-auto">
              PariSos is an AI-powered assistant designed specifically for international students in Paris. 
              We understand the complexity of French bureaucracy and we're here to make your transition smooth and stress-free.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="row mb-5 g-4">
          <div className="col-md-4">
            <div className="text-center p-4 h-100">
              <div className="feature-icon mb-3">
                <i className="bi bi-robot text-primary" style={{ fontSize: '3rem' }}></i>
              </div>
              <h4>AI Chatbot</h4>
              <p className="text-muted">
                Get instant answers to your questions about visas, housing, banking, and more. 
                Available 24/7 in multiple languages.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="text-center p-4 h-100">
              <div className="feature-icon mb-3">
                <i className="bi bi-list-check text-success" style={{ fontSize: '3rem' }}></i>
              </div>
              <h4>Personalized Checklists</h4>
              <p className="text-muted">
                Based on your nationality, visa type, and situation, get a custom checklist 
                of everything you need to do, with deadlines.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="text-center p-4 h-100">
              <div className="feature-icon mb-3">
                <i className="bi bi-bell text-warning" style={{ fontSize: '3rem' }}></i>
              </div>
              <h4>Never Miss Deadlines</h4>
              <p className="text-muted">
                Track your progress and get reminders for important deadlines like visa 
                validation, CVEC payment, and CAF applications.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="row mb-5 py-5 bg-light rounded-3">
          <div className="col-12 text-center mb-4">
            <h2 className="display-6 fw-bold">How PariSos Works</h2>
          </div>
          <div className="col-md-3 text-center mb-3">
            <div className="step-number mb-3">
              <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" 
                style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                1
              </div>
            </div>
            <h5>Sign Up</h5>
            <p className="text-muted small">Create your free account in seconds</p>
          </div>
          <div className="col-md-3 text-center mb-3">
            <div className="step-number mb-3">
              <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" 
                style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                2
              </div>
            </div>
            <h5>Answer Questions</h5>
            <p className="text-muted small">Tell us about your situation (EU/non-EU, student level, etc.)</p>
          </div>
          <div className="col-md-3 text-center mb-3">
            <div className="step-number mb-3">
              <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" 
                style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                3
              </div>
            </div>
            <h5>Get Your Checklist</h5>
            <p className="text-muted small">Receive a personalized action plan with all tasks and deadlines</p>
          </div>
          <div className="col-md-3 text-center mb-3">
            <div className="step-number mb-3">
              <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" 
                style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                4
              </div>
            </div>
            <h5>Track Progress</h5>
            <p className="text-muted small">Check off tasks as you complete them and stay organized</p>
          </div>
        </div>

        {/* Essential Resources Section */}
        <div className="row mb-4">
          <div className="col-12 text-center">
            <h2 className="display-6 fw-bold mb-3">Essential Resources</h2>
            <p className="lead text-muted mb-5">
              Quick access to the most important French administrative websites
            </p>
          </div>
        </div>

        <section className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4 mb-5">
          {guides.length > 0 ? (
            guides.map((guide) => (
              <CardComponent
                key={guide._id}
                title={guide.name}
                description={guide.description}
                imageUrl={guide.imageUrl}
                link={guide.link}
              />
            ))
          ) : (
            <div className="col-12">
              <p className="text-center text-muted">No guides found.</p>
            </div>
          )}
        </section>

        {/* CTA Section */}
        {!token && (
          <div className="row mb-5 py-5 bg-primary text-white rounded-3">
            <div className="col-12 text-center">
              <h3 className="mb-4">Ready to Make Your Paris Journey Easier?</h3>
              <p className="lead mb-4">
                Join thousands of international students who've simplified their French administration
              </p>
              <a href="/signup" className="btn btn-light btn-lg px-5">
                <i className="bi bi-person-plus me-2"></i>
                <span className="text-primary fw-bold">Create Free Account</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
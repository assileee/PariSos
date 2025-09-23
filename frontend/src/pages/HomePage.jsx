import { useEffect, useState } from "react";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const HomePage = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Try to load resources from your API if you add one later,
  // otherwise fall back to a built-in static list.
  const loadGuides = async () => {
    setLoading(true);
    try {
      if (VITE_API_URL) {
        const res = await fetch(`${VITE_API_URL}/api/resources`);
        if (!res.ok) throw new Error("Failed to load resources");
        const data = await res.json();
        // Expecting an array of { _id, title, description, imageUrl }
        const formatted = data.map((item) => ({
          _id: item._id,
          name: item.title,
          description: item.description,
          unit: "Guide",
          quantity: 1,
          imageUrl: item.imageUrl,
          link: item.link,
        }));
        setGuides(formatted);
      } else {
        // Static starter content
        const staticGuides = [
          {
            _id: "caf",
            name: "CAF – Aide au logement",
            description:
              "Comment créer un compte CAF, documents requis, et envoyer votre demande d’APL/ALS.",
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
              "Obtenir la carte, abonnement étudiant, justificatifs, et réduction jeunes.",
            unit: "Guide",
            quantity: 1,
            imageUrl:
              "https://images.unsplash.com/photo-1544986581-efac024faf62?q=80&w=800&auto=format&fit=crop",
            link: "https://www.iledefrance-mobilites.fr/",
          },
          {
            _id: "ofii",
            name: "OFII / Titre de séjour",
            description:
              "Validation du VLS-TS, rendez-vous préf., renouvellement titre étudiant, taxes & timbres.",
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
              "Payer la Contribution Vie Étudiante et de Campus et récupérer l’attestation.",
            unit: "Guide",
            quantity: 1,
            imageUrl:
              "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=800&auto=format&fit=crop",
            link: "https://cvec.etudiant.gouv.fr/",
          },
          {
            _id: "cpam",
            name: "Assurance Maladie (CPAM/Ameli)",
            description:
              "Ouvrir vos droits, obtenir la carte Vitale, mutuelle & médecin traitant.",
            unit: "Guide",
            quantity: 1,
            imageUrl:
              "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop",
            link: "https://www.ameli.fr/",
          },
          {
            _id: "bank",
            name: "Compte bancaire en France",
            description:
              "Ouvrir un compte étudiant (RIB), justificatifs, et alternatives en ligne.",
            unit: "Guide",
            quantity: 1,
            imageUrl:
              "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
            link: "#",
          },
          {
            _id: "phone",
            name: "Forfait mobile / Internet",
            description:
              "Choisir un opérateur, offres sans engagement, documents nécessaires.",
            unit: "Guide",
            quantity: 1,
            imageUrl:
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
            link: "#",
          },
          {
            _id: "discounts",
            name: "Réductions étudiantes",
            description:
              "Cartes & apps utiles (ISIC, UNiDAYS, Apple/Spotify), musées et cinémas.",
            unit: "Guide",
            quantity: 1,
            imageUrl:
              "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop",
            link: "#",
          },
          {
            _id: "housing",
            name: "Logement & Garant",
            description:
              "Trouver un studio/coloc, Visale, dossier locatif et état des lieux.",
            unit: "Guide",
            quantity: 1,
            imageUrl:
              "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=800&auto=format&fit=crop",
            link: "#",
          },
        ];
        setGuides(staticGuides);
      }
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

  if (loading) return <p>Loading guides…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
      {guides.length > 0 ? (
        guides.map((guide) => (
          <CardComponent
            key={guide._id}
            ingredient={guide}
            title={guide.name}
            description={guide.description}
            unit={guide.unit}          
            quantity={guide.quantity}  // harmless placeholder
            imageUrl={guide.imageUrl}
            showAddToFridgeButton={false}
          />
        ))
      ) : (
        <p className="text-center">No guides found.</p>
      )}
    </section>
  );
};

export default HomePage;

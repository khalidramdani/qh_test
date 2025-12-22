"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect } from "react";

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openForm = () => {
    setIsFormOpen(true);
    setFormStep(1);
  };
  const closeForm = () => {
    setIsFormOpen(false);
    setFormStep(1);
  };

  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [formStep, setFormStep] = useState(1); // Step 1: infos, Step 2: présentation, Step 3: médias

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    whatssap: '',
    tiktok: '',
    instagram: '',
    age: '',
    ville: '',
    presentation: '',
    photos: [],
    videos: []
  });

  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCityValid, setIsCityValid] = useState(false);
  const [previews, setPreviews] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    // Check if it's a file input
    if (files) {
      if (name.startsWith('photos')) {
        // Multiple photos input
        const photoArray = Array.from(files).slice(0, 5);
        setFormData(prev => ({
          ...prev,
          photos: photoArray
        }));
        
        // Create previews for all photos
        const newPreviews = {};
        photoArray.forEach((file, index) => {
          const objectUrl = URL.createObjectURL(file);
          newPreviews[`photo${index + 1}`] = objectUrl;
        });
        setPreviews(prev => ({
          ...prev,
          ...newPreviews
        }));
      } else if (name.startsWith('videos')) {
        // Multiple videos input
        const videoArray = Array.from(files).slice(0, 5);
        setFormData(prev => ({
          ...prev,
          videos: videoArray
        }));
        
        // Create previews for all videos
        const newPreviews = {};
        videoArray.forEach((file, index) => {
          const objectUrl = URL.createObjectURL(file);
          newPreviews[`video${index + 1}`] = objectUrl;
        });
        setPreviews(prev => ({
          ...prev,
          ...newPreviews
        }));
      } else {
        // Single file input (keep original logic for other file types)
        const file = files[0];
        setFormData(prev => ({
          ...prev,
          [name]: file
        }));

        const objectUrl = URL.createObjectURL(file);
        setPreviews(prev => ({
          ...prev,
          [name]: objectUrl
        }));
      }
    } else {
      // Text inputs
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Cleanup preview URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      Object.values(previews).forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  useEffect(() => {
    setLastScrollY(typeof window !== 'undefined' ? window.scrollY : 0);

    let ticking = false;
    const threshold = 10; // px before we react

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY;

        // Hide only if we scroll down, and we are past the hero a bit
        if (delta > threshold && currentY > 80) {
          setIsHeaderHidden(true);
        } else if (delta < -threshold) {
          setIsHeaderHidden(false);
        }

        // Parallax effect on title
        const titleElement = document.querySelector(`.${styles.title}`);
        if (titleElement) {
          const parallaxOffset = currentY * 0.5; // Adjust 0.5 for parallax intensity
          titleElement.style.transform = `translateY(${parallaxOffset}px)`;
        }

        setLastScrollY(currentY);
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  const handleCityChange = async (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, ville: value }));
    setIsCityValid(false); // Reset validity on manual input

    if (value.length > 2) {
      try {
        const response = await fetch(`https://geo.api.gouv.fr/communes?nom=${value}&fields=nom,codesPostaux&boost=population&limit=5`);
        const data = await response.json();
        setCitySuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Erreur API Gouv:", error);
      }
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectCity = (city) => {
    const cityString = `${city.nom} (${city.codesPostaux[0]})`;
    setFormData(prev => ({ ...prev, ville: cityString }));
    setCitySuggestions([]);
    setShowSuggestions(false);
    setIsCityValid(true);
  };

  // Validation functions
  const validateStep1 = () => {
    if (!formData.nom || !formData.prenom || !formData.email || !formData.whatssap || !formData.age || !isCityValid) {
      alert('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.presentation || formData.presentation.trim().length === 0) {
      alert('Veuillez remplir votre présentation');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (formStep === 1 && !validateStep1()) return;
    if (formStep === 2 && !validateStep2()) return;
    setFormStep(formStep + 1);
  };

  const prevStep = () => {
    if (formStep > 1) setFormStep(formStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isCityValid) {
      alert("Veuillez sélectionner une ville valide dans la liste.");
      return;
    }
    console.log(formData);
  };

  const scrollToHome = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToAbout = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeForm();
    };
    if (isFormOpen) {
      document.addEventListener('keydown', onKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFormOpen]);

  return (
    <div className={styles.page}>
  <div className={`${styles.header} ${isHeaderHidden ? styles.headerHidden : ''}`}>
        <div className={styles.logo} onClick={scrollToHome}>
          <img className={styles.logoImg} src="/QH.png" alt="Queen House Logo" />
        </div>
        {/* Checkbox for CSS-only burger toggle */}
        <input id="nav-toggle" className={styles.navToggle} type="checkbox" aria-label="Toggle navigation" />
        <label htmlFor="nav-toggle" className={styles.burger} aria-hidden="true">
          <span></span>
        </label>
        <nav className={styles.nav}>
          <button className={styles.navLink} onClick={scrollToHome}>Accueil</button>
          <button className={styles.navLink} onClick={scrollToAbout}>À propos</button>
          <button className={styles.navLink} onClick={openForm}>Candidater</button>
        </nav>
      </div>
      <div className={styles.hero}>
          <div className={styles.spotlighta}></div>
          <div className={styles.spotlightb}></div>
          <p className={styles.s2}>Saison <span className={styles.deux}>2</span></p>
          <h1 className={styles.title}>QUEEN<br /><span className={styles.gradientText}>HOUSE</span><span className={styles.v2}>2.0</span></h1>
          <button className={styles.ctaCandidature} onClick={openForm}>Candidater</button>
        </div>
        <div className={styles.whoWeAre}>
          <h2 className={styles.whoWeAreTitle}><strong>La prod</strong></h2>

          <div className={styles.foundersGrid}>
            <div className={styles.founderCard}>
              <div className={styles.founderImageContainer}>
                <img src="/yuma.jpg" alt="Yuma" className={styles.founderImage} />
              </div>
              <h3 className={styles.founderName}>Yuma</h3>
              <p className={styles.founderRole}>@yumafaitsastar</p>
            </div>
            <div className={styles.founderCard}>
              <div className={styles.founderImageContainer}>
                <img src="/benoit.jpg" alt="Benoît Chevalier" className={styles.founderImage} />
              </div>
              <h3 className={styles.founderName}>Benoît Chevalier</h3>
              <p className={styles.founderRole}>@benoit_chevalier</p>
            </div>
            <div className={styles.founderCard}>
              <div className={styles.founderImageContainer}>
                <img src="/ricardo.jpg" alt="Ricardo" className={styles.founderImage} />
              </div>
              <h3 className={styles.founderName}>Ricardo</h3>
              <p className={styles.founderRole}>@ricardoalexalex</p>
            </div>
          </div>

          <div className={styles.whoAreContent}>
            <p className={styles.whoAreText}>
              La <strong>Queen House</strong> est un concept unique créé par <strong>Benoît Chevalier</strong>.
            </p>
            <p className={styles.whoAreText}>
              Après le succès phénoménal de la première saison, nous revenons pour une <strong>Saison 2</strong> encore plus grandiose ! Le principe ? Réunir des créateurs de contenu talentueux et passionnés dans une villa de rêve pour vivre une aventure inoubliable.
            </p>
            <p className={styles.whoAreText}>
              Tu as du talent ? Tu rêves de percer sur les réseaux ? Tu veux rejoindre la famille ? C'est ton moment !
            </p>

            <div className={styles.aboutCtaRow}>
              <button className={styles.aboutCtaButton} onClick={openForm}>Candidater</button>
            </div>
          </div>

          <footer className={styles.footer}>
            <div className={styles.footerInner}>
              <div className={styles.footerBrand}>
                <span className={styles.footerLogo}>QUEEN HOUSE</span>
                <span className={styles.footerSeason}>Saison 2</span>
              </div>

              <div className={styles.footerLinks}>
                <button className={styles.footerLink} onClick={scrollToHome}>Accueil</button>
                <button className={styles.footerLink} onClick={scrollToAbout}>À propos</button>
                <button className={styles.footerLink} onClick={openForm}>Candidater</button>
              </div>

              <div className={styles.footerMeta}>
                <span className={styles.footerCopy}>© {new Date().getFullYear()} Queen House. Tous droits réservés.</span>
              </div>
            </div>
          </footer>
        </div>
        <div
          className={`${styles.formOverlay} ${isFormOpen ? styles.active : ''}`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <button className={styles.closeButton} type="button" onClick={closeForm} aria-label="Fermer">&times;</button>
          <div className={styles.form}>
            <form onSubmit={handleSubmit} className={styles.formm}>
            
            {/* Progress Indicator */}
            <div className={styles.stepIndicator}>
              <div className={`${styles.stepDot} ${formStep >= 1 ? styles.active : ''}`}>1</div>
              <div className={`${styles.stepLine} ${formStep >= 2 ? styles.active : ''}`}></div>
              <div className={`${styles.stepDot} ${formStep >= 2 ? styles.active : ''}`}>2</div>
              <div className={`${styles.stepLine} ${formStep >= 3 ? styles.active : ''}`}></div>
              <div className={`${styles.stepDot} ${formStep >= 3 ? styles.active : ''}`}>3</div>
            </div>

            {/* Section 1: Infos de base */}
            {formStep === 1 && (
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Informations Personnelles</h3>
                <div className={styles.mainInfoGrid}>
                  <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required />
                  <input type="text" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} required />
                  <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                  <input type="text" name="whatssap" placeholder="Numéro WhatsApp" value={formData.whatssap} onChange={handleChange} required />
                  
                  <input type="number" name="age" placeholder="Âge" value={formData.age} onChange={handleChange} required />
                  <div className={styles.cityContainer}>
                    <input 
                      type="text" 
                      name="ville" 
                      placeholder="Ville (ex: Paris 75001)" 
                      value={formData.ville} 
                      onChange={handleCityChange} 
                      required 
                      autoComplete="off"
                      style={{width: '100%'}}
                    />
                    {showSuggestions && citySuggestions.length > 0 && (
                      <ul className={styles.suggestionsList}>
                        {citySuggestions.map((city, index) => (
                          <li 
                            key={`${city.code}-${index}`} 
                            className={styles.suggestionItem}
                            onClick={() => selectCity(city)}
                          >
                            {city.nom} ({city.codesPostaux[0]})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <input type="text" name="tiktok" placeholder="Lien TikTok" value={formData.tiktok} onChange={handleChange} />
                  <input type="text" name="instagram" placeholder="Lien Instagram" value={formData.instagram} onChange={handleChange} />
                </div>
              </div>
            )}

            {/* Section 2: Texte de motivation */}
            {formStep === 2 && (
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Ta Présentation</h3>
                <textarea 
                  name="presentation" 
                  placeholder="Parle-nous de toi ! Pourquoi tu veux rejoindre Queen House ? Quels sont tes talents, tes rêves ? (500 caractères max)" 
                  value={formData.presentation} 
                  onChange={handleChange}
                  maxLength={500}
                  className={styles.textarea}
                  rows={6}
                />
                <p className={styles.charCount}>{formData.presentation.length}/500</p>
              </div>
            )}

            {/* Section 3: Photos et Vidéos */}
            {formStep === 3 && (
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>Tes Médias</h3>
                
                <div className={styles.fileUploadSection}>
                  <h4 className={styles.fileUploadTitle}>Vos Photos (Max 5)</h4>
                  <div className={styles.filesGrid}>
                    <div className={styles.fileInputGroup}>
                      <label className={styles.fileLabel}>Sélectionnez vos photos</label>
                      <input 
                        type="file" 
                        name="photos" 
                        accept="image/*" 
                        multiple
                        onChange={handleChange} 
                        className={styles.fileInput} 
                      />
                      <p className={styles.fileHint}>Vous pouvez sélectionner jusqu'à 5 photos à la fois</p>
                      {formData.photos && formData.photos.length > 0 && (
                        <div className={styles.previewsContainer}>
                          {formData.photos.map((photo, index) => (
                            previews[`photo${index + 1}`] && (
                              <div key={`photo-${index}`} className={styles.previewItem}>
                                <img src={previews[`photo${index + 1}`]} alt={`Aperçu ${index + 1}`} className={styles.previewImage} />
                                <span className={styles.photoCount}>{index + 1}</span>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.fileUploadSection}>
                  <h4 className={styles.fileUploadTitle}>Vos Vidéos (Max 5)</h4>
                  <div className={styles.filesGrid}>
                    <div className={styles.fileInputGroup}>
                      <label className={styles.fileLabel}>Sélectionnez vos vidéos</label>
                      <input 
                        type="file" 
                        name="videos" 
                        accept="video/*" 
                        multiple
                        onChange={handleChange} 
                        className={styles.fileInput} 
                      />
                      <p className={styles.fileHint}>Vous pouvez sélectionner jusqu'à 5 vidéos à la fois</p>
                      {formData.videos && formData.videos.length > 0 && (
                        <div className={styles.previewsContainer}>
                          {formData.videos.map((video, index) => (
                            previews[`video${index + 1}`] && (
                              <div key={`video-${index}`} className={styles.previewItem}>
                                <video src={previews[`video${index + 1}`]} controls className={styles.previewVideo} />
                                <span className={styles.videoCount}>{index + 1}</span>
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className={styles.formNavigation}>
              {formStep > 1 && (
                <button type="button" className={styles.prevButton} onClick={prevStep}>← Précédent</button>
              )}
              {formStep < 3 ? (
                <button type="button" className={styles.nextButton} onClick={nextStep}>Suivant →</button>
              ) : (
                <button type="submit" className={styles.submitButton}>Envoyer ma candidature</button>
              )}
            </div>
            </form>
          </div>
        </div>
    </div>
  );
}

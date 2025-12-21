"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for burger menu
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    whatssap: '',
    tiktok: '',
    instagram: '',
    age: '',
    ville: '',
    motivation: '', // Added motivation field
    presentation: '',
    //5photos
    photo1: '',
    photo2: '',
    photo3: '',
    photo4: '',
    photo5: '',
    //5videos
    video1: '',
    video2: '',
    video3: '',
    video4: '',
    video5: ''
  });

  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCityValid, setIsCityValid] = useState(false);
  const [previews, setPreviews] = useState({});

  const openForm = () => {
    setIsFormOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setCurrentStep(1); // Reset to step 1 when closing
    document.body.style.overflow = 'unset';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const nextStep = () => {
    // Basic validation for step 1
    if (currentStep === 1) {
      if (!formData.nom || !formData.prenom || !formData.email || !formData.whatssap || !formData.age || !formData.ville || !formData.motivation) {
        alert("Veuillez remplir tous les champs obligatoires avant de continuer.");
        return;
      }
      if (!isCityValid) {
        alert("Veuillez sélectionner une ville valide dans la liste.");
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];

      // Validation de la taille du fichier
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB pour vidéos, 5MB pour photos

      if (file.size > maxSize) {
        alert(`Le fichier est trop volumineux. Taille maximum autorisée : ${isVideo ? '50 Mo' : '5 Mo'}.`);
        e.target.value = ""; // Réinitialiser le champ
        return;
      }

      // Handle file inputs
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviews(prev => ({
        ...prev,
        [name]: objectUrl
      }));
    } else {
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
    // Simulate loading time or wait for resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 seconds loading

    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className={styles.page}>
      {isLoading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loaderContent}>
            <img src="/QH.png" alt="Loading..." className={styles.loaderLogo} />
            <div className={styles.loaderSpinner}></div>
          </div>
        </div>
      )}
      <div className={styles.header}>
        <div className={styles.logo} onClick={scrollToHome}>
          <img className={styles.logoImg} src="/QH.png" alt="Queen House Logo" />
        </div>
        
        {/* Burger Icon */}
        <div className={`${styles.burgerIcon} ${isMenuOpen ? styles.open : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Navigation */}
        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <button className={styles.navLink} onClick={() => { scrollToHome(); closeMenu(); }}>Accueil</button>
          <button className={styles.navLink} onClick={() => { scrollToAbout(); closeMenu(); }}>À propos</button>
          <button className={styles.navLink} onClick={() => { openForm(); closeMenu(); }}>Candidatez</button>
        </nav>
      </div>
      <div className={styles.hero}>
          <div className={styles.spotlighta}></div>
          <div className={styles.spotlightb}></div>
          <p className={styles.s2}>Saison <span className={styles.deux}>2</span></p>
          <h1 className={styles.title}>QUEEN<br /><span className={styles.gradientText}>HOUSE</span><span className={styles.v2}>2.0</span></h1>
          <button className={styles.ctaCandidature} onClick={openForm}>Candidatez</button>
        </div>
        <div className={styles.whoWeAre}>
          <h2 className={styles.whoWeAreTitle}>Qui sommes-nous ?</h2>
          <div className={styles.whoAreImg}></div>
        </div>

        {/* Modal Form Overlay */}
        <div className={`${styles.formOverlay} ${isFormOpen ? styles.active : ''}`}>
          <button className={styles.closeButton} onClick={closeForm}>&times;</button>
          <div className={styles.form}>
            <form onSubmit={handleSubmit} className={styles.formm}>
              
              {/* Progress Indicator */}
              <div className={styles.stepIndicator}>
                <div className={`${styles.step} ${currentStep >= 1 ? styles.activeStep : ''}`}>1. Informations</div>
                <div className={styles.stepLine}></div>
                <div className={`${styles.step} ${currentStep >= 2 ? styles.activeStep : ''}`}>2. Médias</div>
              </div>

              {currentStep === 1 && (
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>Informations Personnelles</h3>
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
                    <textarea 
                      name="motivation" 
                      placeholder="Vos motivations (Pourquoi Queen House ?)" 
                      value={formData.motivation} 
                      onChange={handleChange} 
                      required 
                      className={styles.textarea}
                    />
                    <input type="text" name="tiktok" placeholder="Lien TikTok" value={formData.tiktok} onChange={handleChange} />
                    <input type="text" name="instagram" placeholder="Lien Instagram" value={formData.instagram} onChange={handleChange} />
                  </div>
                  
                  <div className={styles.buttonGroup}>
                    <button type="button" className={styles.nextButton} onClick={nextStep}>Suivant</button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className={styles.stepContent}>
                  <div className={styles.fileUploadSection}>
                    <h3 className={styles.fileUploadTitle}>Vos Photos (Max 5)</h3>
                    <div className={styles.filesGrid}>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <div key={`photo-${num}`} className={styles.fileInputGroup}>
                          <label className={styles.fileLabel}>Photo {num}</label>
                          <input type="file" name={`photo${num}`} accept="image/*" onChange={handleChange} className={styles.fileInput} />
                          {previews[`photo${num}`] && (
                            <div className={styles.previewContainer}>
                              <img src={previews[`photo${num}`]} alt={`Aperçu ${num}`} className={styles.previewImage} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.fileUploadSection}>
                    <h3 className={styles.fileUploadTitle}>Vos Vidéos (Max 5)</h3>
                    <div className={styles.filesGrid}>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <div key={`video-${num}`} className={styles.fileInputGroup}>
                          <label className={styles.fileLabel}>Vidéo {num}</label>
                          <input type="file" name={`video${num}`} accept="video/*" onChange={handleChange} className={styles.fileInput} />
                          {previews[`video${num}`] && (
                            <div className={styles.previewContainer}>
                              <video src={previews[`video${num}`]} controls className={styles.previewVideo} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.buttonGroup}>
                    <button type="button" className={styles.prevButton} onClick={prevStep}>Retour</button>
                    <button type="submit" className={styles.submitButton}>Envoyer ma candidature</button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
    </div>
  );
}

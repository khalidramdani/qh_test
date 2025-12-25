"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState, useEffect, useRef } from "react";
import { FeuilleGauche, FeuilleDroite } from "../components/Feuille";
import next from "next";

export default function Home() {
      // Popup custom
      const [popupMsg, setPopupMsg] = useState("");
      const [showPopup, setShowPopup] = useState(false);
      const showCustomPopup = (msg) => {
        setPopupMsg(msg);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3200);
      };
    // Affiche le header si la souris approche du haut de la page (desktop)
    useEffect(() => {
      const handleMouseMove = (e) => {
        if (e.clientY < 60) {
          setIsHeaderHidden(false);
        }
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feuilleOut, setFeuilleOut] = useState(false);

  const headerRef = useRef(null);
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const candidatureRef = useRef(null);

  const closeBurgerMenu = () => {
    if (typeof document === 'undefined') return;
    const toggle = document.getElementById('nav-toggle');
    if (toggle && 'checked' in toggle) toggle.checked = false;
  };

  const getHeaderOffset = () => {
    const headerHeight = headerRef.current?.getBoundingClientRect?.().height || 0;
    // add a little breathing room under the fixed header
    return headerHeight ? Math.round(headerHeight + 16) : 110;
  };

  const scrollToElement = (el) => {
    if (!el || typeof window === 'undefined') return;
    const offset = getHeaderOffset();
    const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const openForm = () => {
    closeBurgerMenu();
    // Block opening if localStorage shows a submission from this device
    try {
      const submitted = typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('qh_submitted');
      if (submitted) {
        alert('Une candidature a déjà été envoyée depuis cet appareil.');
        return;
      }
    } catch (e) {
      // ignore
    }

    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
      setFormStep(1);
      setTimeout(() => {
        const el = candidatureRef.current || document.getElementById('candidature');
        if (el) {
          const firstField = el.querySelector('input, textarea, select');
          // Scroll to the first field so we land "in" the form, not on the section header.
          scrollToElement(firstField || el);
          setTimeout(() => {
            if (firstField && typeof firstField.focus === 'function') firstField.focus();
          }, 160);
        }
      }, 0);
      return;
    }

    // Desktop: open overlay
    setIsFormOpen(true);
    setFormStep(1);

    // Focus first field once the overlay is mounted
    setTimeout(() => {
      const first = document.querySelector(`.${styles.formm} input, .${styles.formm} textarea, .${styles.formm} select`);
      if (first && typeof first.focus === 'function') first.focus();
    }, 0);
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
  const [rgpdAccepted, setRgpdAccepted] = useState(false);

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

  const validateStep3 = () => {
    // Ici tu peux adapter la validation selon tes besoins
    // Ex: au moins 1 photo OU 1 vidéo obligatoire
    if ((!formData.photos || formData.photos.length === 0) && (!formData.videos || formData.videos.length === 0)) {
      alert('Merci d’ajouter au moins une photo ou une vidéo.');
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
    // Vérification étape 3
    if (formStep !== 3) return;

    // Vérification des champs obligatoires
    if (!formData.nom || !formData.prenom || !formData.email || !formData.whatssap || !formData.ville || !formData.age || !formData.presentation) {
      showCustomPopup('Veuillez remplir tous les champs obligatoires (nom, prénom, email, WhatsApp, ville, âge, motivation).');
      return;
    }
    // Vérification ville
    if (!isCityValid) {
      showCustomPopup("Veuillez sélectionner une ville valide dans la liste.");
      return;
    }
    // Vérification au moins une image
    if (!formData.photos || formData.photos.length < 1) {
      showCustomPopup('Merci d’ajouter au moins une photo.');
      return;
    }
    // Vérification RGPD
    if (!rgpdAccepted) {
      showCustomPopup("Merci d'accepter la politique de confidentialité (RGPD) pour continuer.");
      return;
    }
    // Vérification numéro de téléphone FR
    const phoneRegex = /^0[1-9](\d{8})$/;
    if (!phoneRegex.test(formData.whatssap)) {
      showCustomPopup('Veuillez entrer un numéro de téléphone valide au format français (ex: 0775845689).');
      return;
    }
    // Vérification email
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(formData.email)) {
      showCustomPopup('Veuillez entrer une adresse email valide.');
      return;
    }
    // Vérification âge
    if (isNaN(formData.age) || Number(formData.age) < 18) {
      showCustomPopup('Vous devez avoir au moins 18 ans pour candidater.');
      return;
    }
    // Vérification motivation
    if (!formData.presentation || formData.presentation.trim().length === 0) {
      showCustomPopup('Veuillez remplir votre texte de motivation.');
      return;
    }

    // Nouvelle logique : d'abord créer le candidat (DB), récupérer l'id,
    // puis uploader les fichiers en utilisant le candidateId dans le nommage,
    // enfin enregistrer les métadonnées médias côté serveur.
    async function validateAllMedias() {
      // Images size
      if (formData.photos && formData.photos.length > 0) {
        for (const file of formData.photos) {
          if (file.size > 5 * 1024 * 1024) {
            alert('L\'image ' + file.name + ' dépasse 5 Mo. Merci de la compresser avant d\'envoyer.');
            return false;
          }
        }
      }
      // Videos duration
      if (formData.videos && formData.videos.length > 0) {
        for (const file of formData.videos) {
          const url = URL.createObjectURL(file);
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.src = url;
          const ok = await new Promise((resolve) => {
            let done = false;
            video.onloadedmetadata = () => {
              if (!done) {
                done = true;
                URL.revokeObjectURL(url);
                resolve(video.duration <= 10);
              }
            };
            video.onerror = () => {
              if (!done) {
                done = true;
                URL.revokeObjectURL(url);
                resolve(false);
              }
            };
            setTimeout(() => {
              if (!done) {
                done = true;
                URL.revokeObjectURL(url);
                resolve(false);
              }
            }, 5000);
          });
          if (!ok) {
            alert('La vidéo ' + file.name + ' dépasse 10 secondes ou est illisible.');
            return false;
          }
        }
      }
      return true;
    }

    const submitSequence = async () => {
      // Ensure all medias are valid before creating the candidate
      const allValid = await validateAllMedias();
      if (!allValid) return; // abort early
      try {
        // 1) Créer le candidat sans médias pour récupérer l'ID
        const respCreate = await fetch('/api/candidature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom: formData.nom,
            prenom: formData.prenom,
            age: parseInt(formData.age, 10),
            ville: formData.ville,
            email: formData.email,
            whatssap: formData.whatssap,
            tiktok: formData.tiktok || null,
            instagram: formData.instagram || null,
            motivation: formData.presentation
          }),
          credentials: 'same-origin'
        });
        const created = await respCreate.json();
        if (!respCreate.ok) throw new Error(created?.error || 'Erreur création candidat');
        const candidateId = created?.candidat?.id;
        if (!candidateId) throw new Error('ID candidat introuvable');

        // 2) Uploads to Backblaze using candidateId in filenames
        const { uploadToB2 } = await import('./components/b2UploadClient');
        const uploadedMedias = [];

        // Photos
        if (formData.photos && formData.photos.length > 0) {
          for (let i = 0; i < formData.photos.length; i++) {
            const file = formData.photos[i];
            if (file.size > 5 * 1024 * 1024) {
              alert('L\'image ' + file.name + ' dépasse 5 Mo. Merci de la compresser avant d\'envoyer.');
              continue;
            }
            const ext = (file.name && file.name.includes('.')) ? file.name.split('.').pop() : 'jpg';
            const desiredName = `${candidateId}-img-${i + 1}.${ext}`;
            try {
              const res = await uploadToB2(file, desiredName);
              uploadedMedias.push({ filename: res.fileName, filetype: true });
            } catch (err) {
              alert('Erreur upload photo: ' + file.name);
              console.error(err);
              return;
            }
          }
        }

        // Videos
        if (formData.videos && formData.videos.length > 0) {
          for (let i = 0; i < formData.videos.length; i++) {
            const file = formData.videos[i];
            const url = URL.createObjectURL(file);
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = url;
            const ok = await new Promise((resolve) => {
              video.onloadedmetadata = () => {
                URL.revokeObjectURL(url);
                resolve(video.duration <= 10);
              };
            });
            if (!ok) {
              alert('La vidéo ' + file.name + ' dépasse 10 secondes. Merci de la raccourcir avant d\'envoyer.');
              continue;
            }
            const ext = (file.name && file.name.includes('.')) ? file.name.split('.').pop() : 'mp4';
            const desiredName = `${candidateId}-vid-${i + 1}.${ext}`;
            try {
              const res = await uploadToB2(file, desiredName);
              uploadedMedias.push({ filename: res.fileName, filetype: false });
            } catch (err) {
              alert('Erreur upload vidéo: ' + file.name);
              console.error(err);
              return;
            }
          }
        }

        // 3) Enregistrer les métadonnées médias côté serveur
        if (uploadedMedias.length > 0) {
          const respSaveMedias = await fetch('/api/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidateId, medias: uploadedMedias })
          });
          const dataSave = await respSaveMedias.json();
          if (!respSaveMedias.ok) throw new Error(dataSave?.error || 'Erreur enregistrement médias');
        }
        // mark locally to block further submissions from this device
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('qh_submitted', String(candidateId));
          }
        } catch (e) {}

        alert('Candidature envoyée avec succès !');
      } catch (err) {
        alert('Erreur lors de l\'envoi : ' + (err?.message || err));
      }
    };
    submitSequence();
  };

  const scrollToHome = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const goHome = () => {
    closeBurgerMenu();
    setIsHeaderHidden(false);
    scrollToHome();
  };

  const goAbout = () => {
    closeBurgerMenu();
    setIsHeaderHidden(false);
    // Correction : scroll pile au début de la section about, même sur mobile
    if (aboutRef.current) {
      const offset = getHeaderOffset();
      const rect = aboutRef.current.getBoundingClientRect();
      const absoluteY = window.scrollY + rect.top;
      window.scrollTo({ top: absoluteY - offset, behavior: 'smooth' });
    }
  };

  const goCandidature = () => {
    setIsHeaderHidden(false);
    openForm();
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

  // Liquid glass ripple effect on header click
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const handleClick = (e) => {
      const ripple = document.createElement('div');
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(255,255,255,0.6)';
      ripple.style.width = '20px';
      ripple.style.height = '20px';
      ripple.style.transform = 'scale(0)';
      ripple.style.animation = 'ripple 0.6s linear';
      ripple.style.left = `${e.offsetX - 10}px`;
      ripple.style.top = `${e.offsetY - 10}px`;
      ripple.style.pointerEvents = 'none';
      header.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };

    header.addEventListener('click', handleClick);
    return () => header.removeEventListener('click', handleClick);
  }, []);

  const desktopCandidatureForm = (
    <div className={styles.form}>
      <form onSubmit={handleSubmit} className={styles.formm}>
        {}
        <div className={styles.stepIndicator}>
          <div className={`${styles.stepDot} ${formStep >= 1 ? styles.active : ''}`}>1</div>
          <div className={`${styles.stepLine} ${formStep >= 2 ? styles.active : ''}`}></div>
          <div className={`${styles.stepDot} ${formStep >= 2 ? styles.active : ''}`}>2</div>
          <div className={`${styles.stepLine} ${formStep >= 3 ? styles.active : ''}`}></div>
          <div className={`${styles.stepDot} ${formStep >= 3 ? styles.active : ''}`}>3</div>
        </div>

        <div key={formStep} className={styles.stepPane}>
          {}
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
                    style={{ width: '100%' }}
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

          {}
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

          {}
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
                            <div key={`photo-${index}`} className={styles.previewItem} title={photo?.name || `Photo ${index + 1}`}>
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
                            <div key={`video-${index}`} className={styles.previewItem} title={video?.name || `Vidéo ${index + 1}`}>
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

              {/* Ajout RGPD : case à cocher obligatoire avant soumission */}
              <div className={styles.rgpdContainer} style={{margin: '16px 0'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <input
                    type="checkbox"
                    checked={rgpdAccepted}
                    onChange={e => setRgpdAccepted(e.target.checked)}
                    required
                  />
                  J’accepte que mes données soient utilisées pour le traitement de ma candidature conformément à la <a href="/rgpd.pdf" target="_blank" rel="noopener noreferrer">politique de confidentialité</a>.
                </label>
              </div>
            </div>
          )}
        </div>

        {}
        <div className={styles.formNavigation}>
          {formStep > 1 && (
            <button type="button" className={styles.prevButton} onClick={prevStep}>← Précédent</button>
          )}
          {formStep < 3 ? (
            <button
              type="button"
              className={styles.nextButton}
              onClick={async () => {
                // Attente de 2 secondes AVANT de changer d'étape
                await new Promise(resolve => setTimeout(resolve, 1));
                setFormStep(formStep + 1);
              }}
            >
              Suivant →
            </button>
          ) : (
            <button type="submit" className={styles.submitButton}>Envoyer ma candidature</button>
          )}
        </div>
      </form>
    </div>
  );

  const mobileProgress = formStep === 1 ? 33 : formStep === 2 ? 66 : 100;

  const mobileCandidatureForm = (
    <form className={styles.mobileForm} onSubmit={handleSubmit}>
      <div className={styles.mobileFormTop}>
        <div className={styles.mobileProgressTrack} aria-hidden="true">
          <div className={styles.mobileProgressFill} style={{ width: `${mobileProgress}%` }}></div>
        </div>

        <div className={styles.mobilePills} role="tablist" aria-label="Étapes du formulaire">
          <button
            type="button"
            className={`${styles.mobilePill} ${formStep === 1 ? styles.mobilePillActive : ''}`}
            onClick={() => setFormStep(1)}
          >
            Infos
          </button>
          <button
            type="button"
            className={`${styles.mobilePill} ${formStep === 2 ? styles.mobilePillActive : ''}`}
            onClick={() => setFormStep(2)}
          >
            Présentation
          </button>
          <button
            type="button"
            className={`${styles.mobilePill} ${formStep === 3 ? styles.mobilePillActive : ''}`}
            onClick={() => setFormStep(3)}
          >
            Médias
          </button>
        </div>
      </div>

      <div key={`mobile-step-${formStep}`} className={styles.mobileStepPane}>
        {formStep === 1 && (
          <div className={styles.mobileCard}>
            <h4 className={styles.mobileCardTitle}>Informations</h4>

            <div className={styles.mobileRow}>
              <div className={styles.mobileField}>
                <label className={styles.mobileLabel} htmlFor="m-nom">Nom *</label>
                <input
                  id="m-nom"
                  className={styles.mobileInput}
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  autoComplete="family-name"
                  required
                />
              </div>
              <div className={styles.mobileField}>
                <label className={styles.mobileLabel} htmlFor="m-prenom">Prénom *</label>
                <input
                  id="m-prenom"
                  className={styles.mobileInput}
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  autoComplete="given-name"
                  required
                />
              </div>
            </div>

            <div className={styles.mobileField}>
              <label className={styles.mobileLabel} htmlFor="m-email">Email *</label>
              <input
                id="m-email"
                className={styles.mobileInput}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                inputMode="email"
                required
              />
            </div>

            <div className={styles.mobileField}>
              <label className={styles.mobileLabel} htmlFor="m-whatsapp">WhatsApp *</label>
              <input
                id="m-whatsapp"
                className={styles.mobileInput}
                type="tel"
                name="whatssap"
                value={formData.whatssap}
                onChange={handleChange}
                inputMode="tel"
                placeholder="06 00 00 00 00"
                required
              />
              <div className={styles.mobileHint}>On te contactera ici si tu es sélectionné(e).</div>
            </div>

            <div className={styles.mobileRow}>
              <div className={styles.mobileField}>
                <label className={styles.mobileLabel} htmlFor="m-age">Âge *</label>
                <input
                  id="m-age"
                  className={styles.mobileInput}
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min={0}
                  inputMode="numeric"
                  required
                />
              </div>

              <div className={styles.mobileField}>
                <label className={styles.mobileLabel} htmlFor="m-ville">Ville *</label>
                <div className={styles.mobileCityWrap}>
                  <input
                    id="m-ville"
                    className={styles.mobileInput}
                    type="text"
                    name="ville"
                    placeholder="Paris (75001)"
                    value={formData.ville}
                    onChange={handleCityChange}
                    required
                    autoComplete="off"
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
                {!isCityValid && formData.ville?.length > 0 && (
                  <div className={styles.mobileWarn}>Choisis une ville dans la liste.</div>
                )}
              </div>
            </div>

            <div className={styles.mobileField}>
              <label className={styles.mobileLabel} htmlFor="m-tiktok">TikTok</label>
              <input
                id="m-tiktok"
                className={styles.mobileInput}
                type="url"
                name="tiktok"
                value={formData.tiktok}
                onChange={handleChange}
                inputMode="url"
                placeholder="https://tiktok.com/@..."
              />
            </div>
            <div className={styles.mobileField}>
              <label className={styles.mobileLabel} htmlFor="m-instagram">Instagram</label>
              <input
                id="m-instagram"
                className={styles.mobileInput}
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                inputMode="url"
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        )}

        {formStep === 2 && (
          <div className={styles.mobileCard}>
            <h4 className={styles.mobileCardTitle}>Ta présentation *</h4>
            <div className={styles.mobileField}>
              <textarea
                className={styles.mobileTextarea}
                name="presentation"
                placeholder="Pourquoi tu veux rejoindre Queen House ? Tes talents, tes rêves… (500 caractères max)"
                value={formData.presentation}
                onChange={handleChange}
                maxLength={500}
                rows={8}
                required
              />
              <div className={styles.mobileMetaRow}>
                <span className={styles.mobileHint}>Sois naturel, on veut te connaître.</span>
                <span className={styles.mobileCount}>{formData.presentation.length}/500</span>
              </div>
            </div>
          </div>
        )}

        {formStep === 3 && (
          <div className={styles.mobileCard}>
            <h4 className={styles.mobileCardTitle}>Tes médias (max 5 + 5)</h4>

            <div className={styles.mobileUploadBox}>
              <div className={styles.mobileUploadTop}>
                <div className={styles.mobileUploadTitle}>Photos</div>
                <div className={styles.mobileUploadCount}>{formData.photos?.length || 0}/5</div>
              </div>
              <input
                className={styles.mobileFileInput}
                type="file"
                name="photos"
                accept="image/*"
                multiple
                onChange={handleChange}
              />
              <div className={styles.mobileSlots} aria-label="Aperçu des photos">
                {[0, 1, 2, 3, 4].map((index) => {
                  const photo = formData.photos?.[index];
                  const url = previews[`photo${index + 1}`];
                  return (
                    <div
                      key={`m-photo-slot-${index}`}
                      className={`${styles.mobileSlot} ${url ? styles.mobileSlotFilled : ''}`}
                      title={photo?.name || `Photo ${index + 1}`}
                    >
                      {url ? (
                        <img src={url} alt={photo?.name || `Photo ${index + 1}`} className={styles.mobileSlotMedia} />
                      ) : (
                        <span className={styles.mobileSlotPlus}>+</span>
                      )}
                      <span className={styles.mobileSlotIndex}>{index + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.mobileUploadBox}>
              <div className={styles.mobileUploadTop}>
                <div className={styles.mobileUploadTitle}>Vidéos</div>
                <div className={styles.mobileUploadCount}>{formData.videos?.length || 0}/5</div>
              </div>
              <input
                className={styles.mobileFileInput}
                type="file"
                name="videos"
                accept="video/*"
                multiple
                onChange={handleChange}
              />
              <div className={styles.mobileSlots} aria-label="Aperçu des vidéos">
                {[0, 1, 2, 3, 4].map((index) => {
                  const video = formData.videos?.[index];
                  const url = previews[`video${index + 1}`];
                  return (
                    <div
                      key={`m-video-slot-${index}`}
                      className={`${styles.mobileSlot} ${url ? styles.mobileSlotFilled : ''}`}
                      title={video?.name || `Vidéo ${index + 1}`}
                    >
                      {url ? (
                        <video src={url} className={styles.mobileSlotMedia} muted playsInline preload="metadata" />
                      ) : (
                        <span className={styles.mobileSlotPlus}>+</span>
                      )}
                      <span className={styles.mobileSlotIndex}>{index + 1}</span>
                      {url && <span className={styles.mobileSlotPlay}>▶</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* RGPD checkbox for mobile */}
            <div className={styles.rgpdContainer} style={{margin: '16px 0'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <input
                  type="checkbox"
                  checked={rgpdAccepted}
                  onChange={e => setRgpdAccepted(e.target.checked)}
                  required
                />
                J’accepte que mes données soient utilisées pour le traitement de ma candidature conformément à la <a href="/rgpd.pdf" target="_blank" rel="noopener noreferrer">politique de confidentialité</a>.
              </label>
            </div>
          </div>
        )}
      </div>

      <div className={styles.mobileNav}>
        <button
          type="button"
          className={styles.mobileSecondary}
          onClick={prevStep}
          disabled={formStep === 1}
        >
          ← Retour
        </button>

        {formStep < 3 ? (
          <button type="button" className={styles.mobilePrimary} onClick={nextStep}>
            Continuer →
          </button>
        ) : (
          <button type="submit" className={styles.mobilePrimary}>
            Envoyer
          </button>
        )}
      </div>
    </form>
  );

  return (
    <>
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: '18px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.22)',
          color: '#ff5fb7',
          padding: '18px 32px',
          borderRadius: '18px',
          boxShadow: '0 4px 32px #0003',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '1.08rem',
          maxWidth: '90vw',
          textAlign: 'center',
          backdropFilter: 'blur(14px) saturate(180%)',
          border: '1.5px solid rgba(255,91,183,0.18)',
          letterSpacing: '0.02em',
        }}>
          {popupMsg}
        </div>
      )}
      {loading && (
        <div className={styles.loadingOverlay}>
          <FeuilleGauche animateOut={feuilleOut} />
          <FeuilleDroite animateOut={feuilleOut} />
        </div>
      )}
      <div className={styles.page}>
        <div className={styles.blurLoad}></div>
        <div className={styles.onload}>
          <img src="\palmdroit.png" alt="feuille chargement" className={styles.feuilledroit}/>
          <img src="\palmdroit.png" alt="feuille chargement" className={styles.feuillegauche}/>
        </div>
  <div ref={headerRef} className={`${styles.header} ${isHeaderHidden ? styles.headerHidden : ''}`}>
        <div className={styles.logo} onClick={goHome}>
          <img className={styles.logoImg} src="/minilogo.png" alt="Queen House Logo" />
        </div>
        {}
        <input id="nav-toggle" className={styles.navToggle} type="checkbox" aria-label="Toggle navigation" />
        <label htmlFor="nav-toggle" className={styles.burger} aria-hidden="true">
          <span></span>
        </label>
        <nav className={styles.nav}>
          <button className={styles.navLink} onClick={goHome}>Accueil</button>
          <button className={styles.navLink} onClick={goAbout}>À propos</button>
          <button className={styles.navLink} onClick={goCandidature}>Candidater</button>
        </nav>
      </div>
        <div ref={heroRef} className={styles.hero}>
          <div className={styles.spotlighta}></div>
          <div className={styles.spotlightb}></div>
          <img className={styles.logoImghero} src="/LOGOb.png" alt="logo"></img>
          <img src="/CANDIDATER.png" alt="Candidater" className={styles.ctaCandidature} onClick={openForm} />
        </div>
        <div ref={aboutRef} className={styles.whoWeAre}>
          <img className={styles.borderTop} src="/border-top.png" alt="Border Top" />
          <img className={styles.borderTopReverse} src="/border-top.png" alt="Border Top Reverse" />
          <h2 className={styles.whoWeAreTitle}>
            <img className={styles.whowearepng} src="/laprod.png" alt="La Prod" style={{maxWidth: '100%', height: 'auto'}} />
          </h2>

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

              <img src="/CANDIDATER.png" alt="Candidater" className={styles.ctaCandidature2} onClick={openForm} style={{cursor: 'pointer'}} />
          </div>

          {}
          <section ref={candidatureRef} id="candidature" className={styles.inlineFormSection} aria-label="Formulaire de candidature">
            <div className={styles.inlineFormHeader}>
              <h3 className={styles.inlineFormTitle}>Candidature</h3>
            </div>
            <div className={styles.inlineFormCard}>
              {mobileCandidatureForm}
            </div>
          </section>
          {/* Nouveau footer liquid glass amélioré */}
      <footer className={styles.footer}>
        <div className={styles.logo}>
          <img className={styles.logoImg} src="/minilogo.png" alt="Queen House Logo" />
        </div>
        <nav className={styles.nav}>
          <button className={styles.navLink} onClick={goHome}>Accueil</button>
          <button className={styles.navLink} onClick={goAbout}>À propos</button>
          <button className={styles.navLink} onClick={goCandidature}>Candidater</button>
        </nav>
        <span style={{color: '#FFF9E3', fontSize: '0.95rem', marginLeft: '2vw'}}>Queen House - Tous droits réservés</span>
      </footer>
        </div>

        {}
        <div
          className={`${styles.formOverlay} ${isFormOpen ? styles.active : ''}`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <img src="/palmdroit.png" alt="feuille fond formulaire" className={`${styles.formFeuilledroit} ${isFormOpen ? styles.active : ''}`}/>
          <img src="/palmdroit.png" alt="feuille fond formulaire" className={`${styles.formFeuillegauche} ${isFormOpen ? styles.active : ''}`}/>
          <button className={styles.closeButton} type="button" onClick={closeForm} aria-label="Fermer">&times;</button>
          {desktopCandidatureForm}
        </div>
      </div>
    </>
  );
}

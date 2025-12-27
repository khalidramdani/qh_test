"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Admin() {
    const [candidatures, setCandidatures] = useState([]);
    const [allCandidatures, setAllCandidatures] = useState([]);
    const [visibleCount, setVisibleCount] = useState(20);
    const sentinelRef = useRef(null);
    const [ville, setVille] = useState("");
    const [genre, setGenre] = useState("");
    // `genre` UI uses strings 'true'|'false'; data field `sexe` is boolean (true=Homme, false=Femme)
    const [favoris, setFavoris] = useState(false);
    const [aContacter, setAContacter] = useState(false);
    const [search, setSearch] = useState("");
    const [villes, setVilles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalCandidate, setModalCandidate] = useState(null);
    const [mediaUrls, setMediaUrls] = useState({}); // Kept for backward compatibility but no longer used
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const router = useRouter();
    const [headerMinimized, setHeaderMinimized] = useState(false);

    useEffect(() => {
        document.body.classList.add('admin-page');
        return () => document.body.classList.remove('admin-page');
    }, []);

    useEffect(() => {
        async function fetchCandidatures() {
            setLoading(true);
            try {
                const res = await fetch("/api/admin-candidatures");
                if (res.status === 401) return window.location.href = '/admin/login';
                const candidats = await res.json();
                if (!res.ok) {
                    console.error('API /api/admin-candidatures error:', candidats);
                    setLoading(false);
                    return;
                }
                // Pour chaque candidat, utiliser le champ `image` renvoyé par l'API
                // (fallback : chercher dans `medias` si `image` absent)
                const cards = (candidats || []).map(c => {
                    const imageFromApi = c.image;
                    const imgFromMedias = c.medias?.find(m => m.filetype === true) || c.medias?.[0];
                    const filename = imageFromApi || imgFromMedias?.filename;
                    return { ...c, image: filename || '/default.jpg' };
                });
                // shuffle cards for random display order and store full list
                const shuffled = [...cards].sort(() => Math.random() - 0.5);
                setAllCandidatures(shuffled);
                setCandidatures(shuffled);
                setVisibleCount(20);
                setVilles([...new Set(cards.map(c => c.ville).filter(Boolean))]);
            } catch (e) {
                // ignore
            }
            setLoading(false);
        }
        fetchCandidatures();
    }, []);

    // Filtrage dynamique
    const filtered = allCandidatures.filter(c =>
        (ville === "" || c.ville?.toLowerCase().includes(ville.toLowerCase())) &&
        (genre === "" || String(Boolean(c.sexe)) === genre) &&
        (!favoris || c.favoris) &&
        (!aContacter || c.acontacter) &&
        (search === "" || c.nom?.toLowerCase().includes(search.toLowerCase()) || c.prenom?.toLowerCase().includes(search.toLowerCase()) || c.motivation?.toLowerCase().includes(search.toLowerCase()))
    );

    // visible slice for infinite scroll / pagination
    const visible = filtered.slice(0, visibleCount);

    // reset visible count when filters change
    useEffect(() => {
        setVisibleCount(20);
    }, [ville, genre, favoris, aContacter, search]);

    // IntersectionObserver to append more items when sentinel enters viewport
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setVisibleCount(prev => Math.min(prev + 20, filtered.length));
            }
        }, { root: null, rootMargin: '200px', threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [filtered]);

    // Media URLs are now resolved server-side in admin-candidatures API
    // No need for client-side resolution anymore

    // Scroll listener for header minimization on mobile
    useEffect(() => {
        let lastScrollY = 0;
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 0) {
                setHeaderMinimized(true);
            } else if (currentScrollY < lastScrollY) {
                setHeaderMinimized(false);
            }
            lastScrollY = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Actions favoris / à contacter
    const toggleFavori = async (id, value) => {
        const prevAll = allCandidatures;
        const prevVisible = candidatures;
        // optimistic update on both collections
        setAllCandidatures(prev => prev.map(c => c.id === id ? { ...c, favoris: value } : c));
        setCandidatures(prev => prev.map(c => c.id === id ? { ...c, favoris: value } : c));
        setModalCandidate(prev => prev && prev.id === id ? { ...prev, favoris: value } : prev);
        try {
            const res = await fetch("/api/admin-candidatures", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, field: "favoris", value })
            });
            if (!res.ok) {
                // revert on failure
                setAllCandidatures(prevAll);
                setCandidatures(prevVisible);
                console.error('Failed to toggle favoris', await res.text());
            }
        } catch (e) {
            setAllCandidatures(prevAll);
            setCandidatures(prevVisible);
            console.error('Network error toggling favoris', e);
        }
    };
    const toggleAContacter = async (id, value) => {
        const prevAll = allCandidatures;
        const prevVisible = candidatures;
        setAllCandidatures(prev => prev.map(c => c.id === id ? { ...c, acontacter: value } : c));
        setCandidatures(prev => prev.map(c => c.id === id ? { ...c, acontacter: value } : c));
        setModalCandidate(prev => prev && prev.id === id ? { ...prev, acontacter: value } : prev);
        try {
            const res = await fetch("/api/admin-candidatures", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, field: "acontacter", value })
            });
            if (!res.ok) {
                setAllCandidatures(prevAll);
                setCandidatures(prevVisible);
                console.error('Failed to toggle acontacter', await res.text());
            }
        } catch (e) {
            setAllCandidatures(prevAll);
            setCandidatures(prevVisible);
            console.error('Network error toggling acontacter', e);
        }
    };

    return (
        <div className={styles.page}>
            <div className={`${styles.head} ${headerMinimized ? styles.headMinimized : ''}`}>
                <div className={styles.logoo}><img src='/LOGOb.png' alt='logo' className={styles.logo} /></div>
                <button className={styles.deconnexion} onClick={async () => { await fetch('/api/logout', { method: 'POST' }); router.push('/admin/login'); }}>déconnexion</button>
            </div>
            <div className={`${styles.filtre} ${headerMinimized ? styles.filtreMinimized : ''}`}>
                {/* Autocomplete ville */}
                <input
                    type="search"
                    placeholder="Ville"
                    value={ville}
                    onChange={e => setVille(e.target.value)}
                    list="villes"
                />
                <datalist id="villes">
                    {villes.map(v => <option key={v} value={v} />)}
                </datalist>
                {/* Sexe filter */}
                <select value={genre} onChange={e => setGenre(e.target.value)}>
                    <option value="">Sexe</option>
                    <option value="false">Femme</option>
                    <option value="true">Homme</option>
                </select>
                {/* Favoris */}
                <label>
                    <input type="checkbox" checked={favoris} onChange={e => setFavoris(e.target.checked)} />
                    Favoris
                </label>
                {/* À contacter */}
                <label>
                    <input type="checkbox" checked={aContacter} onChange={e => setAContacter(e.target.checked)} />
                    À contacter
                </label>
                {/* Recherche mot-clé */}
                <input
                    type="search"
                    placeholder="Recherche..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <div className={`${styles.content} ${headerMinimized ? styles.contentWithMiniHeader : ''}`}>
                {loading ? <div>Chargement...</div> : filtered.length === 0 ? <div className={styles.aucuneCandidature}>Aucune candidature...</div> : visible.map(c => (
                    <div key={c.id} className={styles.card} onClick={() => { setModalCandidate(c); setActiveMediaIndex(0); }} style={{backgroundImage: `url(${c.image})`}}>
                        <button className={`${styles.btnFavoris} ${styles.btnFavorisTopRight} ${c.favoris ? styles.btnFavorisActive : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavori(c.id, !c.favoris); }}>{c.favoris ? "★" : "☆"}</button>
                        <button className={`${styles.btnContact} ${c.acontacter ? styles.btnContactActive : ''}`} onClick={(e) => { e.stopPropagation(); toggleAContacter(c.id, !c.acontacter); }}>📞</button>
                        <div className={styles.cardOverlay}>
                            <h4>{c.prenom} {c.nom}</h4>
                            <div className={styles.meta}>
                                {c.ville} • {Boolean(c.sexe) ? 'Homme' : 'Femme'}
                            </div>
                            <div className={styles.meta}>{c.motivation}</div>
                        </div>
                    </div>
                ))}
                <div ref={sentinelRef} style={{height: 1}} />
                {/* Modal for candidate details */}
                {modalCandidate && (
                    <div className={styles.modalOverlay} onClick={() => setModalCandidate(null)}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalBody}>
                                <div className={styles.mediaViewer}>
                                    {/* main media */}
                                    {modalCandidate.medias && modalCandidate.medias.length > 0 ? (
                                        modalCandidate.medias[activeMediaIndex]?.url ? (
                                            modalCandidate.medias[activeMediaIndex].filetype ? (
                                                <img src={modalCandidate.medias[activeMediaIndex].url} alt="media" />
                                            ) : (
                                                <video src={modalCandidate.medias[activeMediaIndex].url} controls preload="metadata" />
                                            )
                                        ) : (
                                            <div>Chargement média...</div>
                                        )
                                    ) : (
                                        <img src={modalCandidate.image} alt="primary" />
                                    )}
                                    {/* thumbnails */}
                                    <div className={styles.thumbs}>
                                        {/* Images */}
                                        <div className={styles.thumbGroup}>
                                            <h5 className={styles.thumbGroupTitle}>Images</h5>
                                            {(modalCandidate.medias || []).filter(m => m.filetype).map((m, i) => (
                                                <button key={m.filename} className={styles.thumbBtn} onClick={() => setActiveMediaIndex(modalCandidate.medias.indexOf(m))}>
                                                    <img src={m.url || modalCandidate.image} alt={m.filename} />
                                                </button>
                                            ))}
                                        </div>
                                        {/* Videos */}
                                        <div className={styles.thumbGroup}>
                                            <h5 className={styles.thumbGroupTitle}>Videos</h5>
                                            {(modalCandidate.medias || []).filter(m => !m.filetype).map((m, i) => (
                                                <button key={m.filename} className={`${styles.thumbBtn} ${styles.thumbBtnVideo}`} onClick={() => setActiveMediaIndex(modalCandidate.medias.indexOf(m))}>
                                                <video src={m.url} muted preload="metadata" className={styles.thumbVideo} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.details}>
                                    <button className={styles.modalClose} onClick={() => setModalCandidate(null)}>✕</button>
                                    <button className={`${styles.btnFavoris} ${styles.btnFavorisModalTopRight} ${modalCandidate.favoris ? styles.btnFavorisActive : ''}`} onClick={() => toggleFavori(modalCandidate.id, !modalCandidate.favoris)}>{modalCandidate.favoris ? "★" : "☆"}</button>
                                    <button className={`${styles.btnContact} ${styles.btnContactModalTopRight} ${modalCandidate.acontacter ? styles.btnContactActive : ''}`} onClick={() => toggleAContacter(modalCandidate.id, !modalCandidate.acontacter)}>📞</button>
                                    <h3>{modalCandidate.prenom} {modalCandidate.nom}</h3>
                                    <p><strong>Ville:</strong> {modalCandidate.ville}</p>
                                    <p><strong>Motivation:</strong> {modalCandidate.motivation}</p>
                                    <p><strong>Sexe:</strong> {Boolean(modalCandidate.sexe) ? 'Homme' : 'Femme'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
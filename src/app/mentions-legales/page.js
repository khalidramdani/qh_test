export default function MentionsLegales() {
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Poppins, sans-serif',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      color: '#ffffff'
    }}>
      <h1 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Mentions Légales</h1>
      <p style={{ textAlign: 'center', fontStyle: 'italic' }}><strong>Dernière mise à jour :</strong> Décembre 2025</p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>1. Éditeur du site</h2>
      <p>
        Queen House<br />
        Représenté par Benoît Chevalier<br />
        Email : contact@queenhousereality.com<br />
        SIRET : [À insérer]<br />
        Adresse : [À insérer]
      </p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>2. Hébergement</h2>
      <p>
        Le site est hébergé par :<br />
        [Nom de l'hébergeur]<br />
        [Adresse]<br />
        [Téléphone]
      </p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>3. Propriété intellectuelle</h2>
      <p>Le contenu du site (textes, images, vidéos) est protégé par le droit d'auteur. Toute reproduction est interdite sans autorisation.</p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>4. Données personnelles</h2>
      <p>Vos données sont traitées conformément à notre politique de confidentialité et au RGPD.</p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>5. Cookies</h2>
      <p>Nous utilisons uniquement des cookies essentiels. Voir notre politique de cookies.</p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>6. Responsabilité</h2>
      <p>Queen House ne peut être tenu responsable des dommages indirects liés à l'utilisation du site.</p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>7. Droit applicable</h2>
      <p>Le droit français s'applique. En cas de litige, les tribunaux français sont compétents.</p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>8. Contact</h2>
      <p>Pour toute question : contact@queenhousereality.com</p>
    </div>
  );
}
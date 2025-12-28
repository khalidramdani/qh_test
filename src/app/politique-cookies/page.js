export default function PolitiqueCookies() {
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
      <h1 style={{ color: '#ffffff', textAlign: 'center', marginBottom: '2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Politique de Cookies</h1>
      <p style={{ textAlign: 'center', fontStyle: 'italic' }}><strong>Dernière mise à jour :</strong> Décembre 2025</p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>1. Qu'est-ce qu'un cookie ?</h2>
      <p>Un cookie est un petit fichier texte stocké sur votre ordinateur lors de la visite de notre site.</p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>2. Cookies que nous utilisons</h2>
      <p>Nous n'utilisons que des <strong>cookies essentiels</strong> nécessaires au fonctionnement du site :</p>
      <ul>
        <li><strong>Cookies de session</strong> : Pour maintenir votre session connectée dans l'admin</li>
        <li><strong>Cookies de sécurité</strong> : Pour protéger contre les attaques CSRF</li>
        <li><strong>Cookies fonctionnels</strong> : Pour mémoriser vos préférences de formulaire</li>
      </ul>
      <p><em>Nous n'utilisons aucun cookie analytique, publicitaire ou de tracking.</em></p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>3. Gestion des cookies</h2>
      <p>Vous pouvez gérer les cookies via les paramètres de votre navigateur. Désactiver les cookies essentiels peut affecter le fonctionnement du site.</p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>4. Consentement</h2>
      <p>En utilisant notre site, vous consentez à l'utilisation des cookies essentiels selon cette politique.</p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>5. Modifications</h2>
      <p>Cette politique peut être mise à jour. Consultez-la régulièrement.</p>

      <h2 style={{ color: '#ffffff', marginTop: '2rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>6. Contact</h2>
      <p>Pour toute question : contact@queenhousereality.com</p>
    </div>
  );
}
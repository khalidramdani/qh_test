"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
      });
      if (res.ok) {
        router.push('/admin');
      } else {
        const j = await res.json();
        setError(j?.error || 'Erreur');
      }
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center'}}>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:12,width:300}}>
        <h2>Admin login</h2>
        <input value={user} onChange={e=>setUser(e.target.value)} placeholder="Identifiant" />
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Mot de passe" />
        <button type="submit">Se connecter</button>
        {error && <div style={{color:'red'}}>{error}</div>}
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

const positions = [
  { value: 'kaleci', label: 'Goalkeeper' },
  { value: 'defans', label: 'Defender' },
  { value: 'orta saha', label: 'Midfielder' },
  { value: 'forvet', label: 'Forward' },
];

export default function ProfileForm({ onSaved }: { onSaved?: () => void }) {
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noUser, setNoUser] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setNoUser(true);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) setError(error.message);
      if (data) {
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url || '');
        setPosition(data.position || '');
        console.log('ProfileForm fetched profile:', data); // DEBUG LOG
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setNoUser(true);
      setLoading(false);
      return;
    }
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username: username,
      avatar_url: avatarUrl,
      position: position as 'goalkeeper' | 'defender' | 'midfielder' | 'forward',
    });
    if (error) setError(error.message);
    else console.log('ProfileForm upserted:', { username, avatarUrl, position }); // DEBUG LOG
    setLoading(false);
    onSaved?.();
  };

  if (noUser) return <div>Please sign in.</div>;

  return (
    <div className="gpu-accelerate" style={{ 
      backgroundColor: "#1e293b", 
      padding: "clamp(12px, 4vw, 16px)", 
      borderRadius: "12px", 
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)", 
      margin: "clamp(4px, 2vw, 8px)" 
    }}>
      <h2 style={{ 
        fontSize: "clamp(1.25rem, 5vw, 1.5rem)", 
        fontWeight: "bold", 
        color: "#ffffff", 
        marginBottom: "clamp(12px, 3vw, 16px)", 
        textAlign: "center", 
        textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" 
      }}>
        Profile Information
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", color: "#93c5fd", fontWeight: "600", marginBottom: "6px", fontSize: "0.9rem" }}>
            Username
          </label>
          <input
            style={{ 
              width: "100%", 
              backgroundColor: "rgba(15, 23, 42, 0.6)", 
              color: "white", 
              padding: "clamp(8px, 2vw, 10px) clamp(10px, 3vw, 12px)", 
              borderRadius: "8px", 
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "16px",
              minHeight: "44px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05) inset"
            }}
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
          />
        </div>
        
        <div>
          <label style={{ display: "block", color: "#93c5fd", fontWeight: "600", marginBottom: "6px", fontSize: "0.9rem" }}>
            Profile Photo URL
          </label>
          <input
            style={{ 
              width: "100%", 
              backgroundColor: "rgba(15, 23, 42, 0.6)", 
              color: "white", 
              padding: "clamp(8px, 2vw, 10px) clamp(10px, 3vw, 12px)", 
              borderRadius: "8px", 
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "16px",
              minHeight: "44px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05) inset"
            }}
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
            placeholder="Paste image URL (optional)"
          />
        </div>
        
        <div>
          <label style={{ display: "block", color: "#93c5fd", fontWeight: "600", marginBottom: "6px", fontSize: "0.9rem" }}>
            Position
          </label>
          <select
            style={{ 
              width: "100%", 
              backgroundColor: "rgba(15, 23, 42, 0.8)", 
              color: "white", 
              padding: "clamp(8px, 2vw, 10px) clamp(10px, 3vw, 12px)", 
              borderRadius: "8px", 
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "16px",
              minHeight: "44px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05) inset",
              appearance: "none",
              backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"white\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/><path d=\"M0 0h24v24H0z\" fill=\"none\"/></svg>')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center"
            }}
            value={position}
            onChange={e => setPosition(e.target.value)}
            required
          >
            <option value="" style={{ color: "#9ca3af", backgroundColor: "#111827" }}>Select</option>
            {positions.map(pos => (
              <option key={pos.value} value={pos.value} style={{ color: "white", backgroundColor: "#1f2937" }}>
                {pos.label}
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          className="gpu-accelerate"
          style={{ 
            width: "100%", 
            background: "linear-gradient(to right, #059669, #2563eb)", 
            color: "white", 
            fontWeight: "600", 
            padding: "clamp(10px, 3vw, 12px)", 
            borderRadius: "8px", 
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", 
            marginTop: "clamp(8px, 2vw, 12px)",
            fontSize: "clamp(16px, 4vw, 18px)",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? "0.7" : "1",
            minHeight: "48px",
            transition: "transform 0.1s ease, box-shadow 0.2s ease"
          }}
          onTouchStart={(e) => {
            // Add simple touch feedback
            if (!loading) {
              (e.target as HTMLButtonElement).style.transform = "scale(0.98)";
            }
          }}
          onTouchEnd={(e) => {
            // Reset after touch
            if (!loading) {
              (e.target as HTMLButtonElement).style.transform = "scale(1)";
            }
          }}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        
        {error && (
          <div style={{ color: "#f87171", textAlign: "center", fontWeight: "600", marginTop: "8px", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
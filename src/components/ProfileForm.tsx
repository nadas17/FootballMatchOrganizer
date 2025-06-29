import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

const positions = ['goalkeeper', 'defender', 'midfielder', 'forward'];

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
      username,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Username</label>
        <input
          className="glass-input w-full"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Profile Photo URL</label>
        <input
          className="glass-input w-full"
          value={avatarUrl}
          onChange={e => setAvatarUrl(e.target.value)}
        />
      </div>
      <div>
        <label>Position</label>
        <select
          className="glass-input w-full"
          value={position}
          onChange={e => setPosition(e.target.value)}
          required
        >
          <option value="">Select</option>
          {positions.map(pos => (
            <option key={pos} value={pos}>
              {pos.charAt(0).toUpperCase() + pos.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white rounded py-2"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </form>
  );
}
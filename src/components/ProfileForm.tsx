import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

const positions = [
  { value: 'goalkeeper', label: 'Goalkeeper' },
  { value: 'defender', label: 'Defender' },
  { value: 'midfielder', label: 'Midfielder' },
  { value: 'forward', label: 'Forward' },
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
    <div className="glass-card max-w-md mx-auto p-8 rounded-2xl shadow-xl space-y-6">
      <h2 className="text-2xl font-orbitron font-bold text-white mb-4 text-center drop-shadow">
        Profile Information
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-blue-200 font-semibold mb-2">
            Username
          </label>
          <input
            className="glass-input w-full text-lg px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
          />
        </div>
        <div>
          <label className="block text-blue-200 font-semibold mb-2">
            Profile Photo URL
          </label>
          <input
            className="glass-input w-full text-lg px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
            placeholder="Paste image URL (optional)"
          />
        </div>
        <div>
          <label className="block text-blue-200 font-semibold mb-2">
            Position
          </label>
          <select
            className="glass-input w-full text-lg px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white/10 text-white"
            value={position}
            onChange={e => setPosition(e.target.value)}
            required
            style={{ color: '#fff', backgroundColor: 'rgba(30,41,59,0.7)' }}
          >
            <option value="" className="text-gray-400 bg-gray-900">Select</option>
            {positions.map(pos => (
              <option key={pos.value} value={pos.value} className="text-black bg-white">
                {pos.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-lg"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        {error && (
          <div className="text-red-400 text-center font-semibold mt-2">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
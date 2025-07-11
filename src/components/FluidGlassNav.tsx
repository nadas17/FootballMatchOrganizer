import { useNavigate, useLocation } from 'react-router-dom';

export default function FluidGlassNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Home", link: "/" },
    { label: "Profile", link: "/profile" },
    { label: "Matches", link: "/matches" },
  ];

  const isActive = (link: string) => {
    if (link === "/" && location.pathname === "/") return true;
    if (link !== "/" && location.pathname.startsWith(link)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="h-16 bg-black/20 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center justify-around h-full px-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.link)}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                isActive(item.link) 
                  ? 'text-white' 
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
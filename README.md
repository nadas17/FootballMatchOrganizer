# Football Warriors Organization - Web Application

A modern web application for organizing football matches with real-time features, weather integration, and Google Maps support.

## 🚀 Features

- **Match Creation**: Create football matches with detailed information
- **Team Management**: Organize players into teams with positions
- **Request System**: Join requests with approval workflow
- **Real-time Updates**: Live notifications for match creators
- **Weather Integration**: Current weather conditions for match locations
- **Google Maps**: Interactive maps for match venues
- **Responsive Design**: Mobile-first responsive UI
- **Modern UI**: Glass-morphism design with animations

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/UI, Radix UI
- **Backend**: Supabase (PostgreSQL, Real-time subscriptions)
- **APIs**: OpenWeatherMap, Google Maps
- **Build Tool**: Vite
- **Deployment**: Ready for Vercel/Netlify

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- OpenWeatherMap API key
- Google Maps API key

### Environment Variables
Create `.env.local` file:
```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Installation
```bash
# Clone repository
git clone [repository-url]
cd WEB-app-Football-Organizer-interaction

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup
The application uses Supabase with these tables:
- `matches` - Match information
- `match_participants` - Approved participants
- `match_requests` - Join requests

## 📱 Usage

### For Match Creators
1. Click "Create a match event"
2. Fill in match details (title, date, time, location)
3. Set maximum players and price
4. Manage join requests in the sidebar
5. Approve/reject participants

### For Players
1. Browse available matches
2. Click "Request to Join" 
3. Select team (A/B) and position
4. Wait for creator approval
5. Check match details and weather

## 🔒 Security Features

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Environment variable usage for API keys
- Error handling and logging

## 🚀 Performance Optimizations

- Code splitting and lazy loading
- Image optimization
- Caching strategies
- Real-time subscriptions
- Responsive design

## 📊 Architecture

```
src/
├── components/          # React components
├── pages/              # Page components
├── types/              # TypeScript definitions
├── utils/              # Utility functions
├── integrations/       # Supabase integration
└── lib/                # Shared libraries
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Follow code style guidelines
4. Add tests for new features
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- Weather service fallback needed
- Mobile map interaction improvements
- Offline functionality

## 🔮 Future Enhancements

- User authentication system
- Push notifications
- Chat functionality
- Match statistics
- Payment integration
- Multi-language support

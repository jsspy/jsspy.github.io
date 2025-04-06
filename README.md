# JSSpy Frontend

The frontend interface for JSSpy - Monitor JavaScript file changes with automatic versioning and diff viewing.

## 🌐 Live Demo
Visit [https://yourusername.github.io/jsspy-frontend](https://yourusername.github.io/jsspy-frontend)

## 🛠️ Built With
- HTML5
- Tailwind CSS
- Vanilla JavaScript

## 📦 Features
- Landing page with waitlist signup
- JavaScript file monitoring dashboard
- Real-time diff viewer
- Authentication system
- Burp Suite integration preview

## 🚀 Development
1. Clone the repository
2. No build process required - it's vanilla HTML, CSS, and JavaScript
3. Serve the files using any static file server

## 🔗 API Integration
The frontend is designed to work with the JSSpy backend API. To connect to your own backend:

1. Update the API endpoints in `javascript.js`:
```javascript
const API_BASE_URL = 'https://your-api-url.com';
```

2. Ensure CORS is properly configured on your backend

## 📄 License
MIT License 
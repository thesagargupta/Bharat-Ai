# 🇮🇳 Bharat AI - Free AI Chatbot Made in India

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **A powerful, free AI chatbot assistant built with Indian values and designed for Indian users.**

🌐 **Live Demo:** [https://thebharatai.vercel.app](https://thebharatai.vercel.app)

---

## ✨ Features

### 🤖 **Advanced AI Capabilities**
- **Intelligent Chat** - Context-aware conversations powered by Gemini 2.5 Flash/Pro
- **Image Analysis** - Upload and analyze images with AI vision
- **Multi-format Support** - Text, images (JPG, PNG, WebP), and more
- **Conversation Memory** - Maintains context across chat sessions
- **Real-time Responses** - Smooth, streaming AI responses

### 🎨 **User Experience**
- **Clean UI/UX** - Modern, responsive design inspired by ChatGPT
- **Dark/Light Mode** - Comfortable viewing in any environment
- **Mobile Optimized** - Perfect experience on all devices
- **Fast Performance** - Built with Next.js 15 and Turbopack
- **Auto-scroll** - Professional message scrolling like ChatGPT/Gemini

### 🔐 **Security & Authentication**
- **Google OAuth** - Secure login with Google accounts
- **Session Management** - JWT-based authentication
- **Protected Routes** - Secure API endpoints
- **User Profiles** - Personalized experience for each user

### 💾 **Data Management**
- **Chat History** - Save and retrieve all your conversations
- **MongoDB Storage** - Reliable, scalable database
- **Message Search** - Find past conversations easily
- **Export/Import** - Backup your chat data

### ⚡ **Architecture Highlights**
- **N8N Webhook Integration** - Lightweight, scalable AI backend
- **Error Handling** - Graceful fallbacks and retry mechanisms
- **SEO Optimized** - 50+ keywords, structured data, rich snippets
- **No Caching Issues** - Always fresh content without PWA problems

---



## 🎯 Key Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework | 15.5.4 |
| **React** | UI library | 19.0.0 |
| **MongoDB** | Database | - |
| **NextAuth.js** | Authentication | 4.24.x |
| **Gemini API** | AI responses | 2.5 Flash/Pro |
| **Tailwind CSS** | Styling | 3.4.x |
| **Lucide React** | Icons | Latest |
| **N8N** | Workflow automation | Optional |

---

## 📱 Features in Detail

### Chat Interface
- **Auto-save**: Every message automatically saved
- **Context-aware**: AI remembers previous messages
- **Smart scrolling**: Messages appear at top for easy reading
- **Image upload**: Drag & drop or click to upload
- **Markdown support**: Rich text formatting
- **Code highlighting**: Syntax highlighting for code blocks

### User Profile
- **Google integration**: Seamless Google account sync
- **Avatar display**: Profile picture from Google
- **Chat statistics**: Total chats, messages sent
- **Settings**: Customize your experience

### Chat History
- **Organized sidebar**: All your chats in one place
- **Search**: Find conversations quickly
- **Delete**: Remove unwanted chats
- **Timestamps**: See when each chat was created
- **Auto-naming**: Intelligent chat title generation

---

## 🔒 Security Features

- ✅ **JWT authentication** - Secure session management
- ✅ **Protected routes** - API endpoints require authentication
- ✅ **Input validation** - Sanitized user inputs
- ✅ **Rate limiting** - Prevent API abuse
- ✅ **HTTPS only** - Secure data transmission
- ✅ **Environment variables** - Secrets never exposed
- ✅ **CORS protection** - Cross-origin security

---

## 🌐 SEO Optimization

- ✅ **50+ targeted keywords** - "AI chatbot India", "ChatGPT alternative"
- ✅ **Structured data (JSON-LD)** - Rich search results
- ✅ **Meta tags** - Optimized titles and descriptions
- ✅ **Sitemap.xml** - Automatic sitemap generation
- ✅ **Robots.txt** - Proper crawler directives
- ✅ **Google Search Console** - Verified and indexed
- ✅ **No-cache headers** - Always fresh content
- ✅ **Mobile-friendly** - Responsive design

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables from `.env.local`
   - Click "Deploy"

3. **Configure Domain** (Optional)
   - Add custom domain in Vercel settings
   - Update `NEXTAUTH_URL` in environment variables

### Deploy to Other Platforms

**Netlify:**
```bash
npm run build
# Deploy the .next folder
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **API Response Time**: < 2s (average)
- **Database Queries**: Optimized with indexes
- **Bundle Size**: < 500KB (gzipped)

---

## 🐛 Troubleshooting

### Common Issues

**1. Gemini API 429 Error (Quota Exceeded)**
```
Solution: Wait for quota reset (24 hours) or upgrade to paid tier
Alternative: Switch to N8N webhook with different AI provider
```

**2. Gemini API 503 Error (Service Overloaded)**
```
Solution: Automatic retry with exponential backoff (implemented)
Best practice: Use N8N webhook for better reliability
```

**3. MongoDB Connection Failed**
```
Check: Connection string, IP whitelist, user credentials
Fix: Update MONGODB_URI in .env.local
```

**4. Google OAuth Error**
```
Check: Redirect URIs, OAuth credentials, domain verification
Fix: Update Google Cloud Console settings
```

**5. Build Errors**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation
- Keep PRs focused on single features

---

## 📝 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 👨‍💻 Author

**Sagar Gupta**
- GitHub: [@thesagargupta](https://github.com/thesagargupta)
- LinkedIn: [Sagar Gupta](https://linkedin.com/insagargupta9193)
- Website: [thebharatai.vercel.app](https://thebharatai.vercel.app)

---

## 🙏 Acknowledgments

- **Google Gemini** - AI capabilities
- **Next.js Team** - Amazing React framework
- **Vercel** - Hosting and deployment
- **MongoDB** - Reliable database
- **N8N** - Workflow automation
- **Open Source Community** - Inspiration and support

---

## 📈 Roadmap

### Version 2.0 (Coming Soon)
- [ ] Voice input/output
- [ ] PDF document analysis
- [ ] Multi-language support (Hindi, Tamil, Telugu)
- [ ] Team collaboration features
- [ ] Advanced code generation
- [ ] Plugin system for extensions

### Version 3.0 (Future)
- [ ] Mobile apps (iOS/Android)
- [ ] Desktop apps (Windows/Mac/Linux)
- [ ] Fine-tuned India-specific AI model
- [ ] Offline mode with local AI
- [ ] Enterprise features

---

## 📞 Support

Need help? Here's how to get support:

1. **Check Documentation**: Read this README and other docs
2. **Search Issues**: Look for existing GitHub issues
3. **Create Issue**: Open a new issue with details
4. **Email**: Contact through GitHub profile

---

## ⭐ Star History

If you find this project helpful, please give it a ⭐ on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=thesagargupta/Bharat-Ai&type=Date)](https://star-history.com/#thesagargupta/Bharat-Ai&Date)

---

## 📸 Screenshots

### Chat Interface
Beautiful, intuitive chat interface with real-time AI responses

### Image Analysis
Upload and analyze images with advanced AI vision

### Mobile View
Fully responsive design works perfectly on all devices

### Profile Page
Manage your account and view chat statistics

---

<div align="center">

**Made with ❤️ in India 🇮🇳**

[Website](https://thebharatai.vercel.app) • [GitHub](https://github.com/thesagargupta/Bharat-Ai) • [Issues](https://github.com/thesagargupta/Bharat-Ai/issues)

</div>

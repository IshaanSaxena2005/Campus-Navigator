# 🎓 Campus Navigator - AI Pathfinding Visualizer

An interactive, AI-powered pathfinding algorithm visualizer built with React and Vite. Simulate and compare different search algorithms on customizable grid-based maps with weighted terrain, AI-generated scenarios, and real-time performance analytics.

![React](https://img.shields.io/badge/React-19.2.4-61dafb?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.0.1-646cff?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2.2-38bdf8?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)

---

## ⚖️ License & Copyright

**© 2026 Ishaan Saxena & Hardesh Agarwal. All Rights Reserved.**

This project is the exclusive intellectual property of **Ishaan Saxena** and **Hardesh Agarwal**. 

### Terms of Use:
- ❌ **No Copying**: This project cannot be copied, reproduced, or duplicated without explicit written permission from both authors
- ❌ **No Distribution**: Redistribution of this code, in whole or in part, is strictly prohibited
- ❌ **No Derivative Works**: Creating derivative works based on this project is not allowed
- ✅ **Personal Use**: You may use the compiled application for personal, non-commercial purposes
- ⚠️ **Academic Use**: If using for academic purposes, proper attribution must be given to both authors

### Attribution Required:
If referenced in any academic or public context, you must credit:
- **Ishaan Saxena** - Co-Creator & Developer
- **Hardesh Agarwal** - Co-Creator & Developer

### Contact for Licensing:
For commercial licensing or permission to use this code, please contact the authors.

**Unauthorized use, copying, or distribution of this software will result in legal action.**

---

## ✨ Features

### 🔍 Pathfinding Algorithms
Visualize and compare **5 different pathfinding algorithms**:
- **A*** - Optimal informed search with terrain awareness
- **Dijkstra** - Guaranteed shortest path with full weight consideration
- **Greedy BFS** - Fast but not always optimal
- **BFS** - Uninformed breadth-first exploration
- **DFS** - Depth-first exploration (may not find optimal path)

### 🎨 Interactive Grid System
- **Custom Terrain Painting**: Draw walls, water bodies, and pathways
- **Drag & Drop**: Move start and goal positions dynamically
- **Multi-touch Support**: Works on mobile and desktop
- **Real-time Animation**: Watch algorithms explore step-by-step

### 🗺️ Preset Scenarios
Choose from **7 pre-built environments**:
- 🎓 University Campus
- 🏙️ City Grid with Traffic
- 🌴 Dense Jungle
- 🌊 River Delta
- 🚇 Downtown Metro
- 🏔️ Mountain Pass
- 🏡 Suburban Neighborhood

### 🤖 AI-Powered Features
- **AI Map Designer**: Generate custom terrains from text descriptions using Llama 3.3
- **Image-to-Map**: Upload campus map screenshots, AI converts them to navigable grids (Llama 3.2 Vision)
- **AI Performance Analyst**: Get intelligent insights on algorithm comparisons

### 📊 Performance Comparison
- **Side-by-side Metrics**: Compare explored nodes, path costs, and efficiency
- **Visual Charts**: Bar graphs showing relative performance
- **AI Insights**: Automated analysis of why certain algorithms performed better

### 🎯 Weighted Terrain System
- **Empty (Cost: 1)** - Standard pathways
- **Water (Cost: 3)** - Slower traversal areas
- **Wall (Cost: ∞)** - Impassable obstacles

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campus-navigator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

---

## 📖 How to Use

### Basic Navigation
1. **Select an algorithm** from the top toolbar (A*, Dijkstra, Greedy, BFS, DFS)
2. **Choose a preset scenario** or create your own map
3. **Click "Start Agent"** to visualize the pathfinding process
4. **Drag start/goal** icons to reposition them
5. **Paint terrain** using the toolbar tools (Wall 💧, Water 🧱, Eraser)

### AI Map Generation
1. Click **"AI Designer"** button
2. **Type a description** (e.g., "A campus with a central library surrounded by dorms")
3. **OR upload an image** of a floor plan/map
4. Click **"Generate with AI"** and watch your map appear!

### Algorithm Comparison
1. Click **"Compare All"** to run all 5 algorithms simultaneously
2. View the **performance dashboard** with metrics
3. Click **"Get AI Insights"** for intelligent analysis

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **AI Integration**: Groq API (Llama 3.3 & Llama 3.2 Vision)
- **CSS Framework**: PostCSS + Autoprefixer

---

## 📁 Project Structure

```
campus-navigator/
├── public/
│   ├── favicon.svg          # Site favicon
│   └── icons.svg            # SVG icon sprites
├── src/
│   ├── assets/              # Static images and assets
│   ├── App.jsx              # Main application component (998 lines)
│   ├── App.css              # App-specific styles
│   ├── index.css            # Global styles + Tailwind imports
│   └── main.jsx             # React entry point
├── .gitignore               # Git ignore rules
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

---

## 🧠 Algorithm Details

### A* Algorithm
- **Heuristic**: Manhattan distance
- **Cost Function**: f(n) = g(n) + h(n)
- **Terrain Awareness**: ✅ Yes
- **Optimality**: ✅ Guaranteed optimal

### Dijkstra's Algorithm
- **Cost Function**: g(n) only (actual cost from start)
- **Terrain Awareness**: ✅ Yes
- **Optimality**: ✅ Guaranteed optimal
- **Trade-off**: Explores more nodes than A*

### Greedy Best-First Search
- **Heuristic**: Manhattan distance only
- **Cost Function**: h(n) (heuristic to goal)
- **Terrain Awareness**: ❌ No
- **Optimality**: ❌ Not guaranteed

### BFS (Breadth-First Search)
- **Strategy**: Level-by-level exploration
- **Terrain Awareness**: ❌ No (treats all costs as 1)
- **Optimality**: ✅ Only for unweighted graphs

### DFS (Depth-First Search)
- **Strategy**: Explore deepest node first
- **Terrain Awareness**: ❌ No
- **Optimality**: ❌ Not guaranteed

---

## ⚙️ Configuration

### Grid Dimensions
- **Rows**: 20
- **Columns**: 40
- **Total Cells**: 800

### Terrain Costs
```javascript
EMPTY: 1    // Standard movement
WATER: 3    // Difficult terrain
WALL: ∞     // Impassable
```

### Animation Speed
Adjustable via the speed slider (default: 15ms per step)

---

## 🔒 API Keys & Environment

This project uses **Groq API** for AI features. The API key is currently hardcoded in `App.jsx` (line 9):

```javascript
const apiKey = "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";
```

### ⚠️ Security Recommendation
For production deployment:
1. Create a `.env` file:
   ```env
   VITE_GROQ_API_KEY=your_api_key_here
   ```

2. Update `App.jsx`:
   ```javascript
   const apiKey = import.meta.env.VITE_GROQ_API_KEY;
   ```

3. Add `.env` to `.gitignore`

---

## 🐛 Known Limitations

- API key exposed in client-side code (see Security section above)
- Large grids may experience performance degradation during animations
- AI map generation depends on Groq API rate limits (429 errors handled with retries)

---

## 🚧 Future Enhancements

- [ ] Add diagonal movement support
- [ ] Implement more algorithms (Jump Point Search, Bidirectional A*)
- [ ] Save/load custom maps from localStorage
- [ ] Multi-level pathfinding (stairs, elevators)
- [ ] Export map as image/PDF
- [ ] Real-time collaboration features
- [ ] Mobile-responsive grid resizing
- [ ] Dark mode toggle

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

### Development Guidelines
- Follow existing code style and formatting
- Add comments for complex algorithms
- Test on multiple screen sizes
- Ensure no ESLint warnings

---

## 📄 License

**Proprietary - All Rights Reserved**

© 2026 Ishaan Saxena & Hardesh Agarwal

This software and its associated documentation are protected by copyright law. 
Unauthorized copying, distribution, or modification is strictly prohibited.
For licensing inquiries, please contact the authors.

---

## 👨‍💻 Authors & Creators

**Ishaan Saxena** - Co-Creator & Lead Developer  
**Hardesh Agarwal** - Co-Creator & Lead Developer  

Campus Navigator - AI Search Simulation  
© 2026 All Rights Reserved

---

## 🙏 Acknowledgments

- **React Team** for the amazing UI library
- **Vite** for blazing-fast build tooling
- **Tailwind CSS** for utility-first styling
- **Groq** for lightning-fast AI inference
- **Lucide Icons** for beautiful icon set

---

## 📞 Support

If you encounter any issues or have questions:
1. Check the **Known Limitations** section
2. Verify your **Groq API key** is valid
3. Ensure **Node.js v18+** is installed
4. Open an issue on GitHub

---

<div align="center">

**Made with ❤️ and React**

⭐ Star this repo if you found it helpful!

</div>

# 🐸 FocusFrog - Code Review Navigator

> **Make code reviews more lively!** Click on function names to jump to definitions with smooth scrolling and intelligent highlighting.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🎯 **Smart Function Detection**
- **JavaScript/TypeScript**: `function`, `const`, `class`, arrow functions
- **Python**: `def` functions
- **Go**: `func` functions  
- **React Components**: JSX components, hooks, and class components
- **Cross-language support** with intelligent parsing

### 🎨 **Visual Enhancements**
- **Yellow highlighting** on function call sites
- **Smooth scroll animation** to definitions
- **Flash highlight** on destination (3.5s duration)
- **Tooltip hints** on hover: "Click to jump to definition"
- **Sticky header awareness** for perfect positioning

### ⌨️ **Keyboard Navigation**
- **Alt + ←** : Go back to previous position
- **Full keyboard support** for accessibility

### 🚀 **Performance & Reliability**
- **Dynamic DOM observation** - works with lazy-loaded diffs
- **Debounced scanning** - smooth performance during page updates
- **Multi-platform support**: GitHub, GitLab, Bitbucket
- **Smart caching** - avoids re-processing already marked elements

## 🎮 How It Works

1. **Index Definitions**: Scans the page for function/component definitions
2. **Highlight Calls**: Marks function call sites with yellow highlighting
3. **Click to Jump**: Click any highlighted function name to scroll to its definition
4. **Navigate Back**: Use Alt+← or the Back button to return to previous positions

## 🛠️ Installation

### From Chrome Web Store
*Coming soon!*

### Manual Installation
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the FocusFrog folder
5. The 🐸 icon will appear in your toolbar

## 🎯 Supported Platforms

| Platform | Support Level | Features |
|----------|---------------|----------|
| **GitHub** | ✅ Full | Unified/Split diffs, Single file view |
| **GitLab** | ✅ Full | Merge requests, Code diffs |
| **Bitbucket** | ✅ Full | Pull requests, Source view |

## 🔧 Configuration

### Popup Controls
Click the 🐸 icon to access:
- **Enable/Disable** the extension
- **Settings panel** (coming soon)

### Keyboard Shortcuts
- `Alt + ←` : Navigate back to previous scroll position
- `Alt + →` : Navigate forward (coming soon)

## 🎨 Customization

### Highlight Colors
The extension uses subtle yellow highlighting that adapts to your theme:
```css
background: rgba(255,255,0,0.3); /* Call sites */
background: rgba(255,255,0,0.6); /* Flash highlight */
```

### Flash Duration
Currently set to 3.5 seconds - perfect for spotting the destination without being intrusive.

## 🚀 Advanced Features

### Smart Detection
- **Context-aware**: Distinguishes between definitions and calls
- **Syntax-aware**: Works with syntax-highlighted code
- **Multi-span support**: Handles cases where function names and `(` are in different HTML spans

### Navigation Stack
- **Unlimited history**: Every click is saved in the navigation stack
- **Smart positioning**: Accounts for sticky headers and UI elements
- **Smooth animations**: CSS-based transitions for professional feel

## 🔍 Supported Code Patterns

### JavaScript/TypeScript
```javascript
// Function declarations
function myFunction() { }

// Arrow functions  
const myArrow = () => { }

// Async functions
const myAsync = async () => { }

// Class definitions
class MyComponent { }

// React components
const MyReactComponent = () => { return <div />; }
```

### Python
```python
def my_function():
    pass

class MyClass:
    def method(self):
        pass
```

### Go
```go
func myFunction() {
    // implementation
}
```

## 🎯 Use Cases

### Code Reviews
- **Jump between functions** without losing your place
- **Understand call flows** by following function references
- **Navigate large diffs** efficiently

### Code Exploration
- **Discover function relationships** through visual highlighting
- **Learn codebases** by following execution paths
- **Debug issues** by jumping to problem areas

## 🛡️ Privacy & Security

- **No data collection**: Everything runs locally in your browser
- **No external requests**: No analytics or tracking
- **Minimal permissions**: Only requires access to code review pages
- **Open source**: Full transparency in the codebase

## 🐛 Troubleshooting

### Highlighting Not Working?
1. **Refresh the page** after enabling the extension
2. **Check the site**: Ensure you're on a supported platform (GitHub/GitLab/Bitbucket)
3. **Expand collapsed sections**: Only visible code is indexed
4. **Verify function names**: Definitions and calls must be on the same page

### Performance Issues?
- The extension automatically limits processing for pages with >200 definitions
- Debounced scanning prevents excessive DOM manipulation
- Smart caching avoids re-processing elements

## 🚀 Roadmap

### Coming Soon
- [ ] **Cross-file navigation** - jump between files in the same PR
- [ ] **Custom highlight colors** - user-configurable themes
- [ ] **Forward navigation** - Alt+→ to go forward in history
- [ ] **Mini-map view** - function list for quick navigation
- [ ] **Import/Export detection** - follow dependencies across files

### Future Enhancements
- [ ] **Multi-language support** - Rust, C++, Java, etc.
- [ ] **IDE integration** - VS Code, IntelliJ compatibility
- [ ] **Team features** - shared navigation preferences
- [ ] **Analytics dashboard** - code review productivity metrics

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. Clone the repository
2. Make your changes
3. Test on GitHub/GitLab/Bitbucket PR pages
4. Submit a pull request

### Areas for Contribution
- **Language support**: Add detection for new programming languages
- **Platform support**: Extend to other code hosting platforms
- **UI/UX improvements**: Enhance the visual experience
- **Performance optimization**: Improve scanning and highlighting speed

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **GitHub** for the amazing code review interface
- **GitLab** and **Bitbucket** for comprehensive diff views
- **Chrome Extensions team** for the powerful manifest v3 API
- **Open source community** for inspiration and feedback

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Racheli-shtrochlitz/CR-Navigator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Racheli-shtrochlitz/CR-Navigator/discussions)
- **Email**: rachel35906@gmail.com

---

<div align="center">

**Made with 🐸 by developers, for developers**

[⭐ Star this repo](https://github.com/Racheli-shtrochlitz/CR-Navigator) • [🐛 Report bugs](https://github.com/Racheli-shtrochlitz/CR-Navigator/issues) • [💡 Request features](https://github.com/Racheli-shtrochlitz/CR-Navigator/discussions)

</div>
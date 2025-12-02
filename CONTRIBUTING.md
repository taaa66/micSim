# Contributing to OphthalmoSim+

Thank you for your interest in contributing to OphthalmoSim+. This document provides guidelines for contributing to the project.

## 🎯 Our Mission

OphthalmoSim+ aims to democratize access to high-quality ophthalmic surgical training. Every contribution—whether code, documentation, clinical expertise, or feedback—helps us move closer to this goal.

## 🤝 Ways to Contribute

### For Developers

- **Bug Fixes**: Identify and resolve issues
- **Feature Development**: Implement new training modules or games
- **Performance Optimization**: Improve frame rates and responsiveness
- **Testing**: Expand test coverage and identify edge cases
- **Documentation**: Improve code comments and technical docs

### For Clinicians

- **Content Validation**: Review medical accuracy of training scenarios
- **Question Bank Expansion**: Contribute OKAP-style questions
- **Usability Feedback**: Identify workflow improvements
- **Clinical Correlation**: Suggest metrics that predict surgical outcomes

### For Educators

- **Curriculum Integration**: Share implementation experiences
- **Pedagogical Review**: Suggest learning pathway improvements
- **Assessment Design**: Help develop competency benchmarks

## 📋 Development Guidelines

### Code Style

```javascript
// Use descriptive variable names
const tremor_amplitude_micrometers = calculateTremor(samples);

// Document complex algorithms
/**
 * Calculates RMS deviation for tremor analysis
 * @param {number[]} samples - Position samples at 60Hz
 * @returns {number} RMS deviation in micrometers
 */
function calculateRMSDeviation(samples) { ... }

// Prefer composition over inheritance
// Keep components focused and testable
```

### Commit Messages

Follow conventional commits:

```
feat(okap): add pharmacology question bank
fix(tremor): correct RMS calculation for edge cases
docs(readme): update clinical validation section
perf(games): optimize render loop for 60fps
```

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with appropriate tests
4. Ensure all tests pass (`npm test`)
5. Submit a pull request with a clear description

## 🔬 Clinical Content Guidelines

When contributing medical content:

1. **Accuracy**: All clinical information must be evidence-based
2. **Sources**: Cite authoritative references (AAO, peer-reviewed journals)
3. **Review**: Clinical content requires review by a board-certified ophthalmologist
4. **Currency**: Ensure information reflects current practice guidelines

## 📊 Testing Requirements

- **Unit Tests**: Required for all utility functions
- **Component Tests**: Required for interactive components
- **E2E Tests**: Required for critical user flows
- **Performance Tests**: Required for real-time features

## 🔒 Security

- Never commit credentials or API keys
- Report security vulnerabilities privately
- Follow HIPAA guidelines for any health-related data

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's proprietary license.

## 📞 Questions?

- Open a GitHub issue for technical questions
- Contact the maintainers for clinical or partnership inquiries

---

**Thank you for helping improve ophthalmic surgical education worldwide.**

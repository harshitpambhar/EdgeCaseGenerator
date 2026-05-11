# AI-Powered Intelligent Test Case Generator

An enterprise-grade AI-powered platform that automatically generates intelligent test cases by analyzing source code using advanced machine learning and static analysis techniques.

> **Status**: In Development | **Architecture**: Microservices | **License**: MIT

---

## 🎯 Project Overview

This platform combines **AI/ML**, **NLP**, **Static Analysis**, and **DevOps** to automatically:

- 🔍 **Scan & Understand** repositories using AST parsing and semantic analysis
- 🧠 **Predict Edge Cases** using transformer-based ML models
- 🧪 **Generate Test Cases** intelligently with coverage optimization
- 📊 **Analyze Risk** and identify unstable functions
- 📈 **Optimize Coverage** with mutation testing and path analysis
- 🔐 **Integrate with CI/CD** for automated quality gates

**Perfect for**: Final-year projects, AI/ML portfolios, SDE interviews, and production deployments.

---

## 🛠️ Tech Stack

### Frontend
```
Framework:        React + TypeScript
Build Tool:       Vite
Styling:          Tailwind CSS
State Mgmt:       Redux Toolkit
API Calls:        Axios
Code Editor:      Monaco Editor
Charts:           Recharts
Authentication:   JWT + OAuth (Google, GitHub)
Routing:          React Router
Forms:            React Hook Form
```

### Backend Services
```
API Framework:    FastAPI (Python)
API Gateway:      Spring Boot (Java)
Database:         PostgreSQL
Cache:            Redis
Message Queue:    RabbitMQ / Kafka
File Storage:     MinIO / AWS S3
Job Queue:        Celery
API Docs:         Swagger
```

### ML/AI Stack
```
Deep Learning:    PyTorch
NLP Models:       Transformers (HuggingFace)
Code Models:      CodeBERT, CodeT5, GraphCodeBERT
Traditional ML:   Scikit-learn, XGBoost
Embeddings:       Sentence Transformers
Vector DB:        Qdrant
Experiment Track: MLflow
Serving:          TorchServe / FastAPI
```

### Parsing & Analysis
```
Multi-Language:   Tree-Sitter
Python:           ast
JavaScript/TS:    Babel
Java:             JavaParser
Coverage Tools:   coverage.py, Istanbul, JaCoCo
Mutation Testing: mutmut, cosmic-ray
```

### DevOps & Deployment
```
Containerization: Docker
Orchestration:    Kubernetes
CI/CD:            GitHub Actions
Monitoring:       Prometheus
Visualization:    Grafana
Logging:          ELK Stack
```

---

## 🏗️ Architecture

### Microservices Architecture

```
                    React Frontend (TypeScript)
                           ↓
              Java Spring Boot API Gateway
                    /        |        \
                   /         |         \
                  ↓          ↓          ↓
         Python Parser   Python ML    Python Report
          Service        Service      Service
              ↓              ↓             ↓
                    PostgreSQL + Redis
                    (Shared Data Layer)
```

### Service Responsibilities

| Service | Owner | Tech | Responsibility |
|---------|-------|------|-----------------|
| **Frontend** | Frontend Dev | React + TS | Developer dashboard, code editor, reports |
| **API Gateway** | Java Dev | Spring Boot | Routing, auth, rate limiting, request validation |
| **Auth Service** | Java Dev | Spring Boot + JWT | Login, OAuth, RBAC, token management |
| **Parser Service** | Python Dev | Python + Tree-Sitter | AST parsing, code understanding |
| **ML Service** | Python Dev | PyTorch + Transformers | Edge case prediction, risk analysis, embeddings |
| **Test Generator** | Python Dev | FastAPI | Test case generation, coverage analysis |
| **Report Service** | Python Dev | FastAPI | PDF/HTML reports, analytics, visualizations |
| **Job Queue** | Devops | Celery + Redis | Async task scheduling, workflow orchestration |

---

## 📁 Project Structure

### Frontend
```
frontend/
├── src/
│   ├── api/                  # API integration layer
│   ├── components/           # Reusable React components
│   ├── pages/                # Page components
│   ├── layouts/              # Layout wrappers
│   ├── redux/                # State management
│   ├── hooks/                # Custom React hooks
│   ├── services/             # Business logic services
│   ├── utils/                # Utility functions
│   ├── editor/               # Monaco code editor integration
│   ├── charts/               # Data visualization components
│   └── auth/                 # Authentication logic
├── public/
└── package.json
```

### Backend
```
backend/
├── api/                      # FastAPI routes
├── auth/                     # Authentication & JWT
├── repositories/             # Repository management
├── parsers/                  # AST parsing logic
├── generators/               # Test case generation
├── coverage/                 # Coverage analysis
├── mutation/                 # Mutation testing
├── reports/                  # Report generation
├── workers/                  # Celery workers
├── services/                 # Business logic
├── middleware/               # Request middleware
├── models/                   # Database models (SQLAlchemy)
├── utils/                    # Utility functions
└── tests/                    # Unit & integration tests
```

### ML Service
```
ml_service/
├── models/                   # PyTorch models
│   ├── code_embedder/        # CodeBERT based embeddings
│   ├── edge_case_predictor/  # Edge case prediction model
│   ├── risk_predictor/       # Risk scoring model
│   └── test_generator/       # Test generation transformer
├── pipelines/                # ML pipelines
│   ├── feature_engineering/  # Feature extraction
│   ├── training/             # Model training
│   └── inference/            # Inference pipelines
├── datasets/                 # Dataset handling
├── utils/                    # ML utilities
├── experiments/              # MLflow experiments
└── api.py                    # FastAPI inference server
```

---

## 🚀 Getting Started

### Prerequisites
- **Frontend**: Node.js 18+, npm/yarn
- **Backend**: Python 3.10+, Java 17+
- **ML**: CUDA 11.8+ (GPU optional but recommended)
- **DevOps**: Docker, Docker Compose

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/ai-test-case-generator.git
cd ai-test-case-generator
```

#### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

#### 3. Setup Backend Services

**Python Services:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

**Java API Gateway:**
```bash
cd java-gateway
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=8080"
```

#### 4. Setup ML Service
```bash
cd ml_service
pip install -r requirements.txt
python api.py
```
ML API runs on `http://localhost:8001`

#### 5. Setup Infrastructure
```bash
docker-compose up -d
```
Starts: PostgreSQL, Redis, RabbitMQ, MinIO

---

## 🔑 Core Features

### 1. **Repository Analysis**
- GitHub repo cloning and analysis
- Language detection
- Framework identification
- Dependency scanning
- Entry point discovery

### 2. **Intelligent Parsing**
- Multi-language AST parsing (Python, JS/TS, Java, etc.)
- Function extraction
- Control flow analysis
- API mapping
- Exception handling detection

### 3. **ML-Based Edge Case Prediction**
```python
# Input: divide(a, b)
# ML Predicts test cases:
- a=4, b=2  (normal case)
- a=5, b=0  (division by zero)
- a=None, b=2  (null case)
- a=-999999, b=-1  (edge numbers)
```

### 4. **Automated Test Generation**
- Unit test generation
- Integration test scaffolding
- API test creation
- Boundary test cases
- Security test suggestions

### 5. **Coverage Analysis**
- Line coverage tracking
- Branch coverage analysis
- Path coverage optimization
- Coverage gap identification
- Recommendations for improvement

### 6. **Risk Scoring**
- Cyclomatic complexity analysis
- Nesting depth detection
- Function length assessment
- Dependency counting
- Bug probability prediction

### 7. **Mutation Testing**
- Artificial mutation injection
- Test robustness validation
- Mutation kill rate analysis

---

## 📊 ML Components

### Code Understanding Models
- **CodeBERT**: Code embeddings and semantic understanding
- **CodeT5**: Code-to-test generation transformer
- **GraphCodeBERT**: Code structure understanding

### Feature Engineering
- AST-based feature extraction
- Complexity metrics
- Dependency graph analysis
- Semantic code embeddings
- Variable naming analysis

### Prediction Engines
1. **Edge Case Predictor**: Predicts boundary values and special cases
2. **Risk Predictor**: Identifies high-risk functions
3. **Test Recommender**: Suggests missing test scenarios

---

## 🔄 Data Flow

```
Repository Upload
    ↓
Language Detection
    ↓
AST Parsing (Tree-Sitter)
    ↓
Feature Extraction
    ↓
ML Inference
    ├─ Code Embeddings
    ├─ Edge Case Prediction
    └─ Risk Scoring
    ↓
Test Generation
    ↓
Coverage Analysis
    ↓
Report Generation (HTML/PDF/JSON)
    ↓
API Response to Frontend
```

---

## 👥 Team Structure

| Role | Tech | Responsibility |
|------|------|-----------------|
| **ML/AI Engineer** | Python, PyTorch, Transformers | Parsing, ML models, embeddings, edge case prediction |
| **Backend Java Dev** | Spring Boot, Microservices | API Gateway, Auth, Job orchestration |
| **Frontend Dev** | React, TypeScript, Tailwind | Dashboard, code editor, visualizations |
| **DevOps Engineer** | Docker, K8s, CI/CD | Infrastructure, deployment, monitoring |

---

## 🔌 API Examples

### Start Analysis
```bash
POST /api/analyze
{
  "repoUrl": "https://github.com/user/project",
  "language": "python"
}
```

### Generate Tests
```bash
POST /api/generate-tests
{
  "functionId": "abc123",
  "language": "python",
  "framework": "pytest"
}
```

### Get Coverage Report
```bash
GET /api/reports/{analysisId}/coverage
```

### ML Predictions
```bash
POST /api/ml/predict-edge-cases
{
  "code": "def divide(a, b): return a/b",
  "language": "python"
}
```

---

## 📈 Performance & Scalability

- **Async Processing**: Celery workers for long-running tasks
- **Horizontal Scaling**: Stateless microservices
- **Caching**: Redis for frequently accessed data
- **Vector Search**: Qdrant for fast similarity search
- **GPU Support**: CUDA for ML inference acceleration

---

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && python -m pytest

# ML tests
cd ml_service && python -m pytest
```

---

## 📚 Documentation

- [Frontend Setup Guide](./frontend/README.md)
- [Backend API Documentation](./backend/README.md)
- [ML Model Documentation](./ml_service/README.md)
- [Architecture Decision Records](./docs/ADR/)

---

## 🔐 Security

- JWT-based authentication
- OAuth2 integration (GitHub, Google)
- Role-based access control (RBAC)
- Input validation & sanitization
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection
- CORS configuration
- Rate limiting on APIs

---

## 🚀 Deployment

### Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

### CI/CD Pipeline
GitHub Actions handles:
- Build & test on every push
- Docker image creation
- Automated deployment
- Coverage reporting

---

## 📊 Why This Project Stands Out

### ✅ Multi-Domain Expertise
- AI/ML + NLP
- Static Analysis
- Microservices
- DevOps
- Frontend Engineering

### ✅ Real-World Architecture
- Polyglot microservices
- Distributed systems
- Scalable infrastructure
- Production-ready

### ✅ Advanced ML Features
- Transformer-based code understanding
- Edge case prediction
- Risk scoring
- Semantic embeddings

### ✅ Industry Best Practices
- Clean architecture
- Comprehensive testing
- Monitoring & logging
- Security hardening

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙌 Acknowledgments

- [CodeBERT](https://github.com/microsoft/CodeBERT) - Microsoft
- [Tree-Sitter](https://tree-sitter.github.io/tree-sitter/) - GitHub
- [HuggingFace Transformers](https://huggingface.co/transformers/) - HuggingFace
- [FastAPI](https://fastapi.tiangolo.com/) - Sebastián Ramírez
- [Spring Boot](https://spring.io/projects/spring-boot) - Pivotal

---

## 📧 Contact & Support

- **Project Maintainer**: [Your Name]
- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-test-case-generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-test-case-generator/discussions)

---

## 🎓 Educational Value

This project demonstrates:
- AI/ML systems design
- Microservices architecture
- Full-stack development
- DevOps practices
- Enterprise software engineering

**Perfect for**: Portfolios, interviews, research, and production deployments.

---

**Last Updated**: May 2026 | **Version**: 0.1.0-beta

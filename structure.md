**Project File Structure**
anti-poaching-system/
├── backend/
│ ├── app/
│ │ ├── api/
│ │ │ ├── endpoints/
│ │ │ │ ├── species.py
│ │ │ │ ├── incidents.py
│ │ │ │ ├── reports.py
│ │ │ │ ├── patrols.py
│ │ │ │ └── predictions.py
│ │ │ └── dependencies.py
│ │ ├── core/
│ │ │ ├── config.py
│ │ │ ├── security.py
│ │ │ └── database.py
│ │ ├── models/
│ │ │ ├── species.py
│ │ │ ├── incident.py
│ │ │ ├── report.py
│ │ │ └── patrol.py
│ │ ├── services/
│ │ │ ├── ml_service.py
│ │ │ ├── alert_service.py
│ │ │ └── spatial_service.py
│ │ ├── schemas/
│ │ │ └── (Pydantic models)
│ │ └── main.py
│ ├── ml/
│ │ ├── train_model.py
│ │ ├── predict.py
│ │ ├── features.py
│ │ └── models/
│ │ └── poaching_risk.pkl
│ ├── requirements.txt
│ └── Dockerfile
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Map/
│ │ │ ├── Dashboard/
│ │ │ └── Reports/
│ │ ├── pages/
│ │ ├── services/
│ │ │ └── api.js
│ │ └── App.js
│ └── package.json
├── mobile/ (PWA)
│ ├── public/
│ └── src/
├── docker-compose.yml
└── README.md

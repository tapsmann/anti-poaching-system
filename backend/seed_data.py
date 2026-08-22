from datetime import datetime, timedelta
import random

from app.core.database import SessionLocal
from app.core.geo import linestring_from_coords, point_from_latlng
from app.core.security import get_password_hash
from app.models.incident import Incident
from app.models.patrol import Patrol
from app.models.protected_area import ProtectedArea
from app.models.ranger import Ranger
from app.models.report import CommunityReport
from app.models.species import Species

DEFAULT_PASSWORD = "ranger123"


def seed_database():
    db = SessionLocal()
    rng = random.Random(20260718)

    print("Seeding database...")

    areas_data = [
        {
            "name": "Hwange National Park",
            "zone_type": "national_park",
            "risk_level": "high",
            "size_hectares": 1465100,
            "description": "Zimbabwe's largest national park, famous for elephants",
        },
        {
            "name": "Gonarezhou National Park",
            "zone_type": "national_park",
            "risk_level": "high",
            "size_hectares": 505300,
            "description": "Remote wilderness in the southeast lowveld",
        },
        {
            "name": "Mana Pools National Park",
            "zone_type": "national_park",
            "risk_level": "medium",
            "size_hectares": 219600,
            "description": "UNESCO World Heritage site on the Zambezi",
        },
        {
            "name": "Matobo National Park",
            "zone_type": "national_park",
            "risk_level": "medium",
            "size_hectares": 42400,
            "description": "Granite kopjes and black rhino sanctuary",
        },
    ]

    area_count = 0
    for data in areas_data:
        existing = db.query(ProtectedArea).filter(ProtectedArea.name == data["name"]).first()
        if not existing:
            db.add(ProtectedArea(**data))
            area_count += 1
    db.commit()
    print(f"  Added {area_count} protected areas")

    species_data = [
        {
            "name": "Black Rhino",
            "scientific_name": "Diceros bicornis",
            "conservation_status": "CR",
            "population_estimate": 540,
            "habitat": "Savanna and woodlands",
            "threats": "Poaching for horns",
        },
        {
            "name": "African Elephant",
            "scientific_name": "Loxodonta africana",
            "conservation_status": "EN",
            "population_estimate": 85000,
            "habitat": "Savanna, forests, and deserts",
            "threats": "Poaching for ivory",
        },
        {
            "name": "Lion",
            "scientific_name": "Panthera leo",
            "conservation_status": "VU",
            "population_estimate": 1500,
            "habitat": "Savanna and grasslands",
            "threats": "Habitat loss and conflict",
        },
        {
            "name": "Leopard",
            "scientific_name": "Panthera pardus",
            "conservation_status": "VU",
            "population_estimate": 3000,
            "habitat": "Woodlands and rocky outcrops",
            "threats": "Poaching for skins",
        },
        {
            "name": "Hippopotamus",
            "scientific_name": "Hippopotamus amphibius",
            "conservation_status": "VU",
            "population_estimate": 6000,
            "habitat": "Rivers and lakes",
            "threats": "Human-wildlife conflict",
        },
        {
            "name": "Cheetah",
            "scientific_name": "Acinonyx jubatus",
            "conservation_status": "VU",
            "population_estimate": 170,
            "habitat": "Savanna grasslands",
            "threats": "Habitat fragmentation",
        },
        {
            "name": "African Wild Dog",
            "scientific_name": "Lycaon pictus",
            "conservation_status": "EN",
            "population_estimate": 700,
            "habitat": "Savanna and woodlands",
            "threats": "Habitat fragmentation",
        },
        {
            "name": "Giraffe",
            "scientific_name": "Giraffa camelopardalis",
            "conservation_status": "VU",
            "population_estimate": 2500,
            "habitat": "Savanna and woodlands",
            "threats": "Habitat loss",
        },
    ]

    species_count = 0
    for data in species_data:
        existing = db.query(Species).filter(Species.name == data["name"]).first()
        if not existing:
            db.add(Species(**data))
            species_count += 1
    db.commit()
    print(f"  Added {species_count} species")

    rangers_data = [
        {
            "name": "Thandeka Ncube",
            "badge_number": "ZKW-047",
            "email": "thandeka.ncube@zimparks.co.zw",
            "phone": "+263771000001",
            "rank": "senior_officer",
            "specialization": "patrol",
            "is_active": True,
            "is_on_duty": True,
            "lat": -19.45,
            "lng": 26.52,
        },
        {
            "name": "Blessing Moyo",
            "badge_number": "ZKW-039",
            "email": "blessing.moyo@zimparks.co.zw",
            "phone": "+263771000002",
            "rank": "officer",
            "specialization": "intelligence",
            "is_active": True,
            "is_on_duty": True,
            "lat": -21.05,
            "lng": 31.45,
        },
        {
            "name": "Chipo Chirinda",
            "badge_number": "ZKW-055",
            "email": "chipo.chirinda@zimparks.co.zw",
            "phone": "+263771000003",
            "rank": "officer",
            "specialization": "community_outreach",
            "is_active": True,
            "is_on_duty": True,
            "lat": -15.97,
            "lng": 29.37,
        },
        {
            "name": "Rutendo Dube",
            "badge_number": "ZKW-043",
            "email": "rutendo.dube@zimparks.co.zw",
            "phone": "+263771000004",
            "rank": "inspector",
            "specialization": "investigation",
            "is_active": True,
            "is_on_duty": False,
            "lat": -20.55,
            "lng": 28.51,
        },
        {
            "name": "Maxwell Moyo",
            "badge_number": "ZKW-061",
            "email": "maxwell.moyo@zimparks.co.zw",
            "phone": "+263771000005",
            "rank": "officer",
            "specialization": "quick_response",
            "is_active": True,
            "is_on_duty": True,
            "lat": -19.62,
            "lng": 27.82,
        },
        {
            "name": "Simbai Ndlovu",
            "badge_number": "ZKW-082",
            "email": "simbai.ndlovu@zimparks.co.zw",
            "phone": "+263771000006",
            "rank": "trainee",
            "specialization": "patrol",
            "is_active": True,
            "is_on_duty": True,
            "lat": -20.12,
            "lng": 30.85,
        },
    ]

    password_hash = get_password_hash(DEFAULT_PASSWORD)
    ranger_count = 0
    for data in rangers_data:
        existing = db.query(Ranger).filter(Ranger.badge_number == data["badge_number"]).first()
        if not existing:
            loc = point_from_latlng(data["lat"], data["lng"])
            db.add(
                Ranger(
                    name=data["name"],
                    badge_number=data["badge_number"],
                    email=data["email"],
                    phone=data["phone"],
                    rank=data["rank"],
                    specialization=data["specialization"],
                    is_active=data["is_active"],
                    is_on_duty=data["is_on_duty"],
                    password_hash=password_hash,
                    base_location=loc,
                    current_location=loc,
                )
            )
            ranger_count += 1
        elif not existing.password_hash:
            existing.password_hash = password_hash
    db.commit()
    print(f"  Added {ranger_count} rangers (default password: {DEFAULT_PASSWORD})")

    species_ids = [s.id for s in db.query(Species).all()]
    ranger_ids = [r.id for r in db.query(Ranger).all()]
    area_ids = [a.id for a in db.query(ProtectedArea).all()]

    if not species_ids or not ranger_ids or not area_ids:
        print("Missing required data for incidents/reports/patrols.")
        db.close()
        return

    park_coords = {
        "Hwange National Park": (-19.45, 26.52),
        "Gonarezhou National Park": (-21.05, 31.45),
        "Mana Pools National Park": (-15.97, 29.37),
        "Matobo National Park": (-20.55, 28.51),
    }
    areas = db.query(ProtectedArea).all()

    existing_incidents = db.query(Incident).count()
    if existing_incidents == 0:
        incidents = []
        for i in range(15):
            area = rng.choice(areas)
            base_lat, base_lng = park_coords.get(area.name, (-19.5, 29.0))
            lat = base_lat + rng.uniform(-0.3, 0.3)
            lng = base_lng + rng.uniform(-0.3, 0.3)
            incidents.append(
                Incident(
                    location=point_from_latlng(lat, lng),
                    description=f"Suspicious activity detected near {area.name} sector {i + 1}",
                    risk_score=rng.uniform(20, 95),
                    incident_type=rng.choice(
                        ["poaching", "trespassing", "wildfire", "human_wildlife_conflict"]
                    ),
                    severity=rng.choice(["low", "medium", "high", "critical"]),
                    species_id=rng.choice(species_ids),
                    ranger_id=rng.choice(ranger_ids),
                    protected_area_id=area.id,
                    verified=rng.choice([True, False]),
                    is_resolved=rng.choice([True, False]),
                    timestamp=datetime.utcnow() - timedelta(days=rng.randint(0, 30)),
                )
            )
        db.add_all(incidents)
        db.commit()
        print(f"  Added {len(incidents)} incidents")

    existing_reports = db.query(CommunityReport).count()
    if existing_reports == 0:
        reports = []
        for i in range(8):
            area = rng.choice(areas)
            base_lat, base_lng = park_coords.get(area.name, (-19.5, 29.0))
            lat = base_lat + rng.uniform(-0.2, 0.2)
            lng = base_lng + rng.uniform(-0.2, 0.2)
            reports.append(
                CommunityReport(
                    location=point_from_latlng(lat, lng),
                    description=f"Community report #{i + 1} near {area.name}",
                    reporter_phone=f"+2637710000{i + 10}",
                    is_anonymous=random.choice([True, False]),
                    report_type=random.choice(["poaching", "suspicious_activity", "injured_animal"]),
                    risk_score=rng.uniform(10, 80),
                    status=rng.choice(["pending", "verified", "investigating", "resolved"]),
                    assigned_ranger_id=rng.choice(ranger_ids),
                    created_at=datetime.utcnow() - timedelta(days=rng.randint(0, 15)),
                )
            )
        db.add_all(reports)
        db.commit()
        print(f"  Added {len(reports)} community reports")

    existing_patrols = db.query(Patrol).count()
    if existing_patrols == 0:
        patrols = []
        for i in range(6):
            area = rng.choice(areas)
            base_lat, base_lng = park_coords.get(area.name, (-19.5, 29.0))
            route = []
            for j in range(3):
                route.append(
                    {
                        "lat": base_lat + rng.uniform(-0.05, 0.05) * (j + 1),
                        "lng": base_lng + rng.uniform(-0.05, 0.05) * (j + 1),
                    }
                )
            started_at = datetime.utcnow() - timedelta(days=rng.randint(0, 7), hours=rng.randint(1, 8))
            status = rng.choice(["planned", "active", "completed"])
            patrols.append(
                Patrol(
                    route=linestring_from_coords(route),
                    ranger_id=rng.choice(ranger_ids),
                    protected_area_id=area.id,
                    start_time=started_at,
                    end_time=started_at + timedelta(hours=rng.randint(1, 8)) if status == "completed" else None,
                    patrol_type=rng.choice(["routine", "intelligence_led", "rapid_response"]),
                    objectives=f"Patrol objectives for {area.name} session {i + 1}",
                    area_covered_km2=rng.uniform(5, 50),
                    status=status,
                    notes=f"Notes for patrol session {i + 1}",
                )
            )
        db.add_all(patrols)
        db.commit()
        print(f"  Added {len(patrols)} patrols")

    db.close()
    print("Database seeded successfully!")
    print(f"Login with: thandeka.ncube@zimparks.co.zw / {DEFAULT_PASSWORD}")


if __name__ == "__main__":
    seed_database()

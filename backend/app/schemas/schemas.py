from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PointSchema(BaseModel):
    lat: float
    lng: float


class IncidentBase(BaseModel):
    latitude: float
    longitude: float
    incident_type: str
    description: Optional[str] = None
    severity: Optional[str] = "medium"
    species_id: Optional[int] = None
    protected_area_id: Optional[int] = None
    ranger_id: Optional[int] = None
    verified: bool = False
    is_resolved: bool = False


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    incident_type: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    species_id: Optional[int] = None
    protected_area_id: Optional[int] = None
    ranger_id: Optional[int] = None
    verified: Optional[bool] = None
    is_resolved: Optional[bool] = None


class IncidentResponse(BaseModel):
    id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    incident_type: str
    severity: Optional[str] = None
    description: Optional[str] = None
    risk_score: float = 0.0
    verified: bool = False
    is_resolved: bool = False
    species_id: Optional[int] = None
    species_name: Optional[str] = None
    protected_area_id: Optional[int] = None
    protected_area_name: Optional[str] = None
    ranger_id: Optional[int] = None
    ranger_name: Optional[str] = None
    timestamp: datetime
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReportCreate(BaseModel):
    latitude: float
    longitude: float
    description: str
    reporter_phone: Optional[str] = None
    reporter_email: Optional[str] = None
    is_anonymous: bool = True
    report_type: Optional[str] = "suspicious_activity"


class ReportUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[str] = None
    risk_score: Optional[float] = None
    assigned_ranger_id: Optional[int] = None
    ranger_notes: Optional[str] = None


class ReportResponse(BaseModel):
    id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str
    reporter_phone: Optional[str] = None
    reporter_email: Optional[str] = None
    is_anonymous: bool = True
    report_type: Optional[str] = None
    risk_score: float = 0.0
    status: str = "pending"
    incident_id: Optional[int] = None
    assigned_ranger_id: Optional[int] = None
    ranger_name: Optional[str] = None
    ranger_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PatrolCreate(BaseModel):
    ranger_id: int
    route: list[PointSchema] = Field(..., min_length=2)
    start_time: datetime
    end_time: Optional[datetime] = None
    protected_area_id: Optional[int] = None
    patrol_type: Optional[str] = "routine"
    objectives: Optional[str] = None
    area_covered_km2: Optional[float] = None
    status: Optional[str] = "planned"
    notes: Optional[str] = None


class PatrolUpdate(BaseModel):
    ranger_id: Optional[int] = None
    route: Optional[list[PointSchema]] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    protected_area_id: Optional[int] = None
    patrol_type: Optional[str] = None
    objectives: Optional[str] = None
    area_covered_km2: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class PatrolResponse(BaseModel):
    id: int
    ranger_id: int
    ranger_name: Optional[str] = None
    route: list[PointSchema] = []
    start_time: datetime
    end_time: Optional[datetime] = None
    protected_area_id: Optional[int] = None
    protected_area_name: Optional[str] = None
    patrol_type: Optional[str] = None
    objectives: Optional[str] = None
    area_covered_km2: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RangerCreate(BaseModel):
    name: str
    badge_number: str
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str = Field(..., min_length=8, max_length=128)
    rank: Optional[str] = "officer"
    specialization: Optional[str] = "patrol"
    is_active: bool = True
    is_on_duty: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class RangerUpdate(BaseModel):
    name: Optional[str] = None
    badge_number: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    rank: Optional[str] = None
    specialization: Optional[str] = None
    is_active: Optional[bool] = None
    is_on_duty: Optional[bool] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class RangerResponse(BaseModel):
    id: int
    name: str
    badge_number: str
    email: Optional[str] = None
    phone: Optional[str] = None
    rank: Optional[str] = None
    specialization: Optional[str] = None
    is_active: bool = True
    is_on_duty: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    hire_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    ranger: RangerResponse


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class HotspotResponse(BaseModel):
    lat: float
    lng: float
    risk: float
    risk_score: float


class PredictionResponse(BaseModel):
    lat: float
    lng: float
    risk_score: float
    timestamp: datetime

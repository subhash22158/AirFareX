from sqlalchemy import Column, Integer, String, Date, DateTime, Float
from datetime import datetime

from database import Base


class FareObservation(Base):
    __tablename__ = "fare_observations"

    id = Column(Integer, primary_key=True, index=True)

    origin = Column(String(10), nullable=False)
    destination = Column(String(10), nullable=False)

    airline = Column(String(100), nullable=False)

    travel_date = Column(Date, nullable=False)
    search_date = Column(Date, nullable=False)

    lead_days = Column(Integer, nullable=False)

    base_fare = Column(Float, nullable=True)
    taxes = Column(Float, nullable=True)
    total_fare = Column(Float, nullable=False)

    source = Column(String(100), nullable=True)

    collected_at = Column(
        DateTime,
        default=datetime.utcnow
    )
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import SessionLocal
from models import FareObservation

from collections import defaultdict


app = FastAPI(
    title="AirFareX",
    description="Airfare Measurement & Indexing Platform - SIH 26056",
    version="1.0.0"
)


# =========================================================
# CORS
# Demo/public testing ke liye all origins allow
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "AirFareX API is running",
        "problem_statement": "SIH 26056",
        "platform": "Airfare Measurement & Indexing Platform"
    }


# =========================================================
# ALL FARES
# =========================================================

@app.get("/fares")
def get_fares():

    db = SessionLocal()

    observations = (
        db.query(FareObservation)
        .order_by(
            FareObservation.origin,
            FareObservation.destination,
            FareObservation.lead_days
        )
        .all()
    )

    result = []

    for obs in observations:

        result.append({
            "id": obs.id,
            "origin": obs.origin,
            "destination": obs.destination,
            "airline": obs.airline,
            "travel_date": str(obs.travel_date),
            "search_date": str(obs.search_date),
            "lead_days": obs.lead_days,
            "base_fare": obs.base_fare,
            "taxes": obs.taxes,
            "total_fare": obs.total_fare,
            "source": obs.source
        })

    db.close()

    return {
        "count": len(result),
        "fares": result
    }


# =========================================================
# ROUTE FARES
# =========================================================

@app.get("/fares/{origin}/{destination}")
def get_route_fares(
    origin: str,
    destination: str
):

    db = SessionLocal()

    observations = (
        db.query(FareObservation)
        .filter(
            FareObservation.origin == origin.upper(),
            FareObservation.destination == destination.upper()
        )
        .order_by(FareObservation.lead_days)
        .all()
    )

    result = []

    for obs in observations:

        result.append({
            "id": obs.id,
            "airline": obs.airline,
            "travel_date": str(obs.travel_date),
            "search_date": str(obs.search_date),
            "lead_days": obs.lead_days,
            "base_fare": obs.base_fare,
            "taxes": obs.taxes,
            "total_fare": obs.total_fare,
            "source": obs.source
        })

    db.close()

    return {
        "route": f"{origin.upper()}-{destination.upper()}",
        "count": len(result),
        "fares": result
    }


# =========================================================
# AIRFARE INDEX
# =========================================================

@app.get("/index")
def get_index():

    db = SessionLocal()

    observations = (
        db.query(FareObservation)
        .order_by(
            FareObservation.origin,
            FareObservation.destination,
            FareObservation.lead_days
        )
        .all()
    )

    if not observations:

        db.close()

        return {
            "count": 0,
            "index": []
        }

    route_data = defaultdict(list)

    for obs in observations:

        route = f"{obs.origin}-{obs.destination}"

        route_data[route].append(obs)

    result = []

    for route, fares in route_data.items():

        base_price = fares[0].total_fare

        for fare in fares:

            index_value = (
                fare.total_fare / base_price
            ) * 100

            result.append({
                "route": route,
                "lead_days": fare.lead_days,
                "fare": fare.total_fare,
                "index": round(index_value, 2)
            })

    db.close()

    return {
        "count": len(result),
        "index": result
    }
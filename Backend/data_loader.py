from datetime import date

from database import SessionLocal
from models import FareObservation


def load_demo_data():
    db = SessionLocal()

    demo_data = [
        FareObservation(
            origin="DEL",
            destination="BOM",
            airline="IndiGo",
            travel_date=date(2026, 10, 10),
            search_date=date(2026, 10, 9),
            lead_days=1,
            base_fare=4800,
            taxes=500,
            total_fare=5300,
            source="demo"
        ),

        FareObservation(
            origin="DEL",
            destination="BOM",
            airline="Air India",
            travel_date=date(2026, 10, 10),
            search_date=date(2026, 10, 3),
            lead_days=7,
            base_fare=4100,
            taxes=500,
            total_fare=4600,
            source="demo"
        ),

        FareObservation(
            origin="DEL",
            destination="BOM",
            airline="IndiGo",
            travel_date=date(2026, 10, 10),
            search_date=date(2026, 9, 25),
            lead_days=15,
            base_fare=3600,
            taxes=500,
            total_fare=4100,
            source="demo"
        ),

        FareObservation(
            origin="DEL",
            destination="BLR",
            airline="IndiGo",
            travel_date=date(2026, 10, 10),
            search_date=date(2026, 10, 9),
            lead_days=1,
            base_fare=5500,
            taxes=600,
            total_fare=6100,
            source="demo"
        ),

        FareObservation(
            origin="DEL",
            destination="BLR",
            airline="Air India",
            travel_date=date(2026, 10, 10),
            search_date=date(2026, 10, 3),
            lead_days=7,
            base_fare=4700,
            taxes=500,
            total_fare=5200,
            source="demo"
        ),

        FareObservation(
            origin="BOM",
            destination="BLR",
            airline="IndiGo",
            travel_date=date(2026, 10, 10),
            search_date=date(2026, 10, 3),
            lead_days=7,
            base_fare=3800,
            taxes=400,
            total_fare=4200,
            source="demo"
        ),
    ]

    db.add_all(demo_data)
    db.commit()

    print("Demo fare data inserted successfully")

    db.close()


if __name__ == "__main__":
    load_demo_data()
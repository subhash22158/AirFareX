from database import engine, Base, SessionLocal
from models import FareObservation
from data_loader import load_demo_data

print("Creating database tables...")

Base.metadata.create_all(bind=engine)

print("Tables created successfully.")

db = SessionLocal()

count = db.query(FareObservation).count()

db.close()

if count == 0:
    print("No fare data found. Loading demo data...")
    load_demo_data()
    print("Demo data loaded successfully.")
else:
    print(f"Existing fare data found: {count} rows.")
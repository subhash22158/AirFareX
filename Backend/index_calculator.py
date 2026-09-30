from database import SessionLocal
from models import FareObservation


def calculate_index():
    db = SessionLocal()

    observations = (
        db.query(FareObservation)
        .order_by(FareObservation.origin,
                 FareObservation.destination,
                 FareObservation.lead_days)
        .all()
    )

    if not observations:
        print("No fare observations found")
        db.close()
        return

    print("\nAIRFARE INDEX")
    print("-" * 50)

    # Demo base fare = first observation of each route
    route_base_prices = {}

    for obs in observations:
        route = f"{obs.origin}-{obs.destination}"

        if route not in route_base_prices:
            route_base_prices[route] = obs.total_fare

        base_price = route_base_prices[route]

        index_value = (obs.total_fare / base_price) * 100

        print(
            f"Route: {route} | "
            f"Lead Days: T+{obs.lead_days} | "
            f"Fare: ₹{obs.total_fare:.0f} | "
            f"Index: {index_value:.2f}"
        )

    db.close()


if __name__ == "__main__":
    calculate_index()
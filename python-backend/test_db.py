import sqlite3


def test_vehicle_market_analysis(vehicle_type, model_year):
    conn = sqlite3.connect('stores.db')  # Adjust path if needed
    cursor = conn.cursor()

    query = """
    SELECT year_2020, year_2021, year_2022, year_2023, year_2024 
    FROM vehicle_market_analysis 
    WHERE vehicle_type = ? AND model_year = ?
    """

    cursor.execute(query, (vehicle_type, model_year))
    row = cursor.fetchone()
    conn.close()

    if row:
        print(f"Prices for {model_year} model_year {vehicle_type} from 2020 to 2024:")
        prices = {
            "2020": row[0],
            "2021": row[1],
            "2022": row[2],
            "2023": row[3],
            "2024": row[4],
        }
        print(prices)
    else:
        print(f"No data found for {vehicle_type} model_year {model_year}")


# Example usage:
test_vehicle_market_analysis('Prius', '2010')

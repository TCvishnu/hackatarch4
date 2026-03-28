import psycopg2
import os

def get_connection():
    return psycopg2.connect(
        host="dpg-d740j8tactks738728t0-a.oregon-postgres.render.com",
        port=5432,
        database="supercell",
        user="supercell_user",
        password="tTzQI2ATNoa1OdDtMTvmWvtHWEQ7A8pz"
    )

def create_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            product_name TEXT,
            asin VARCHAR(20) UNIQUE,
            price NUMERIC(10, 2),
            brand_name TEXT,
            date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

def insert_product(product_name: str, asin: str, price: str, brandName: str, date: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO products (product_name, asin, price, brand_name, date)
            VALUES (%s, %s, %s, %s, %s)
        """, (product_name, asin, float(price[1:]) if price else None, brandName, date or None))
        conn.commit()
        print(f"✅ Product '{product_name}' inserted successfully.")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error inserting product: {e}")
    finally:
        cursor.close()
        conn.close()


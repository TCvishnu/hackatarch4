import random
from datetime import datetime, timedelta
from db import get_connection


def insert_fake_amazon_data(asin: str, days: int = 10):
    conn = get_connection()
    cursor = conn.cursor()

    base_price = 100.0
    base_referral_pct = 0.15   # 15% typical Amazon fee
    base_pick_pack = 5.5
    base_fulfillment = 8.5

    start_time = datetime.now() - timedelta(days=days)

    try:
        for i in range(days):
            # 📈 Increasing price trend
            price = base_price + i * 2 + random.uniform(-0.5, 0.5)

            # Slight optimization over time (fees improve slightly)
            referral_fee = price * (base_referral_pct - i * 0.001)
            pick_pack_fee = base_pick_pack - i * 0.05
            fulfillment_fee = base_fulfillment - i * 0.05

            created_at = start_time + timedelta(days=i)

            cursor.execute("""
                INSERT INTO amazon_product_fees (
                    asin,
                    your_price,
                    sales_price,

                    estimated_referral_fee_per_unit,
                    estimated_variable_closing_fee,
                    estimated_order_handling_fee_per_order,
                    estimated_pick_pack_fee_per_unit,
                    estimated_weight_handling_fee_per_unit,
                    expected_fulfillment_fee_per_unit,

                    created_at
                ) VALUES (
                    %s, %s, %s,
                    %s, %s, %s, %s, %s, %s,
                    %s
                )
            """, (
                asin,
                price,
                price,

                referral_fee,
                0.0,
                0.0,
                pick_pack_fee,
                0.0,
                fulfillment_fee,

                created_at
            ))

        conn.commit()
        print(f"✅ Inserted {days} fake records for ASIN {asin}")

    except Exception as e:
        conn.rollback()
        print("❌ Error inserting fake data:", e)

    finally:
        cursor.close()
        conn.close()
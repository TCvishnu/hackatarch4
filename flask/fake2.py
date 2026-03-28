# # import psycopg2
# # from store import get_connection
# # from server2 import create_ai_suggestions_table, create_amazon_product_fees_table   
# # ASIN = "B08XYZ1234"

# # def insert_amazon_product_fees():
# #     conn = get_connection()
# #     cursor = conn.cursor()

# #     try:
# #         cursor.execute("""
# #             INSERT INTO amazon_product_fees (
# #                 sku, fnsku, asin,
# #                 product_name, product_group, brand, fulfilled_by,
# #                 your_price, sales_price,
# #                 longest_side, median_side, shortest_side, length_girth,
# #                 unit_weight, shipping_weight,
# #                 currency,
# #                 estimated_fee_total, estimated_referral_fee_per_unit,
# #                 estimated_variable_closing_fee, estimated_order_handling_fee_per_order,
# #                 estimated_pick_pack_fee_per_unit, estimated_weight_handling_fee_per_unit,
# #                 expected_fulfillment_fee_per_unit,
# #                 is_hazmat, size_tier
# #             ) VALUES (
# #                 'SKU-DEMO-001', 'X001FNSKU01', %s,
# #                 'Wireless Ergonomic Mouse', 'Electronics', 'TechBrand', 'Amazon',
# #                 18.99, 17.49,          -- sales_price < ai_suggested_price → POSITIVE result
# #                 5.5, 3.2, 1.8, NULL,
# #                 0.45, 0.60,
# #                 'USD',
# #                 3.20, 2.70,
# #                 0.00, 0.00,
# #                 1.50, 0.80,
# #                 2.50,
# #                 FALSE, 'Small Standard-Size'
# #             )
# #         """, (ASIN,))

# #         conn.commit()
# #         print("✅ amazon_product_fees row inserted.")

# #     except Exception as e:
# #         conn.rollback()
# #         print(f"❌ Error: {e}")

# #     finally:
# #         cursor.close()
# #         conn.close()


# # def insert_ai_suggestion():
# #     conn = get_connection()
# #     cursor = conn.cursor()

# #     try:
# #         cursor.execute("""
# #             INSERT INTO ai_product_suggestions (
# #                 asin,
# #                 suggested_title,
# #                 suggested_price,
# #                 model_version,
# #                 confidence_score
# #             ) VALUES (
# #                 %s,
# #                 'TechBrand Wireless Ergonomic Mouse – Silent Click, USB Nano Receiver, 18-Month Battery',
# #                 22.99,          -- higher than sales_price (17.49) → triggers positive trend
# #                 'gpt-4-turbo',
# #                 91.50
# #             )
# #         """, (ASIN,))

# #         conn.commit()
# #         print("✅ ai_product_suggestions row inserted.")

# #     except Exception as e:
# #         conn.rollback()
# #         print(f"❌ Error: {e}")

# #     finally:
# #         cursor.close()
# #         conn.close()


# # if __name__ == '__main__':
# #     create_ai_suggestions_table()
# #     create_amazon_product_fees_table()  
# #     insert_amazon_product_fees()
# #     insert_ai_suggestion()
# #     print(f"\n✅ Done! Hit: GET /analysis/{ASIN}")

# from store import get_connection
 
# ASIN = "B08XYZ1234"
 
# def create_tables():
#     conn = get_connection()
#     cursor = conn.cursor()
#     try:
#         cursor.execute("""
#             CREATE TABLE IF NOT EXISTS brand_analytics_search_catalog (
#                 id                          SERIAL PRIMARY KEY,
#                 report_date                 DATE NOT NULL,
#                 asin                        VARCHAR(20) NOT NULL,
#                 product_name                TEXT,
#                 brand                       TEXT,
#                 category                    TEXT,
#                 subcategory                 TEXT,
#                 impressions                 INTEGER,
#                 clicks                      INTEGER,
#                 click_through_rate          NUMERIC(8,4),
#                 cart_adds                   INTEGER,
#                 cart_add_rate               NUMERIC(8,4),
#                 purchases                   INTEGER,
#                 purchase_rate               NUMERIC(8,4),
#                 revenue                     NUMERIC(12,2),
#                 glance_views                INTEGER,
#                 conversion_rate             NUMERIC(8,4),
#                 new_to_brand_purchases      INTEGER,
#                 new_to_brand_purchase_rate  NUMERIC(8,4),
#                 new_to_brand_revenue        NUMERIC(12,2),
#                 created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#             );
 
#             CREATE TABLE IF NOT EXISTS ai_product_suggestions (
#                 id                SERIAL PRIMARY KEY,
#                 asin              VARCHAR(20) NOT NULL,
#                 suggested_title   TEXT,
#                 suggested_price   NUMERIC(10,2),
#                 model_version     TEXT,
#                 confidence_score  NUMERIC(5,2),
#                 created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#             );
#         """)
#         conn.commit()
#     except Exception as e:
#         conn.rollback()
#         print(f"❌ Error creating tables: {e}")
#     finally:
#         cursor.close()
#         conn.close()
# def seed_data():
#     conn = get_connection()
#     cursor = conn.cursor()
 
#     try:
#         # --- brand_analytics_search_catalog ---
#         cursor.execute("""
#             INSERT INTO brand_analytics_search_catalog (
#                 report_date, asin, product_name, brand, category, subcategory,
#                 impressions, clicks, click_through_rate,
#                 cart_adds, cart_add_rate,
#                 purchases, purchase_rate, revenue,
#                 glance_views, conversion_rate,
#                 new_to_brand_purchases, new_to_brand_purchase_rate, new_to_brand_revenue
#             ) VALUES (
#                 '2026-03-01', %s,
#                 'Traveler Pro 20-Inch Hardshell',
#                 'TravelerPro',
#                 'Luggage & Travel Gear',
#                 'Carry-Ons',
 
#                 84200,    
#                 3100,     
#                 0.0368,   -- CTR 3.68%       ✅ above 3.0% benchmark
 
#                 940,      
#                 0.3032,   -- cart_add_rate   ✅ above 25% benchmark
 
#                 310,      
#                 0.1000,   
#                 40197.00, 
 
#                 84200,    
#                 0.0037,   -- conversion_rate ✅ above 0.3% benchmark
 
#                 210,      
#                 0.6774,   -- ntb_rate        ✅ above 50% benchmark
#                 27237.90  
#             )
#         """, (ASIN,))
 
#         # --- ai_product_suggestions ---
#         # Keyword-rich optimized title vs the plain product name above
#         # High confidence score signals strong positive AI recommendation
#         cursor.execute("""
#             INSERT INTO ai_product_suggestions (
#                 asin,
#                 suggested_title,
#                 suggested_price,
#                 model_version,
#                 confidence_score
#             ) VALUES (
#                 %s,
#                 'TravelerPro 20-Inch Hardshell Carry-On Luggage – TSA Lock, 360° Spinner Wheels, Lightweight Suitcase for Airlines',
#                 129.99,
#                 'claude-sonnet-4-20250514',
#                 91.50
#             )
#         """, (ASIN,))
 
#         conn.commit()
#         print("✅ Seed data inserted successfully.")
#         print(f"   Hit: GET /analysis/{ASIN}")
 
#     except Exception as e:
#         conn.rollback()
#         print(f"❌ Error: {e}")
 
#     finally:
#         cursor.close()
#         conn.close()
 
 
# if __name__ == '__main__':
#     create_tables()
#     seed_data()

from store import get_connection

ASIN = "B08XYZ1234"


def seed_data():
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO brand_analytics_search_catalog (
                report_date, asin, product_name, brand, category, subcategory,
                impressions, clicks, click_through_rate,
                cart_adds, cart_add_rate,
                purchases, purchase_rate, revenue,
                glance_views, conversion_rate,
                new_to_brand_purchases, new_to_brand_purchase_rate, new_to_brand_revenue
            ) VALUES (
                '2026-03-01', %s,
                'Traveler Pro 20-Inch Hardshell',
                'TravelerPro',
                'Luggage & Travel Gear',
                'Carry-Ons',
                84200,
                3100,
                0.0368,
                940,
                0.3032,
                310,
                0.1000,
                40197.00,
                84200,
                0.0037,
                210,
                0.6774,
                27237.90
            )
        """, (ASIN,))

        cursor.execute("""
            INSERT INTO ai_product_suggestions (
                asin,
                suggested_title,
                suggested_price,
                model_version,
                confidence_score
            ) VALUES (%s, %s, %s, %s, %s)
        """, (
            ASIN,
            'TravelerPro 20-Inch Hardshell Carry-On Luggage - TSA Lock, 360 Spinner Wheels, Lightweight Suitcase for Airlines',
            129.99,
            'claude-sonnet-4-20250514',
            91.50
        ))

        conn.commit()
        print("Seed data inserted successfully.")
        print(f"Hit: GET /analysis/{ASIN}")

    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")

    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    seed_data()
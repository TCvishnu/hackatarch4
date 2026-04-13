# from flask import Flask, jsonify
# from store import get_connection

# app = Flask(__name__)

# def create_ai_suggestions_table():
#     conn = get_connection()
#     cursor = conn.cursor()

#     try:
#         cursor.execute("""
#             CREATE TABLE IF NOT EXISTS ai_product_suggestions (
#                 id SERIAL PRIMARY KEY,

#                 asin VARCHAR(20) NOT NULL,
#                 suggested_title TEXT,
#                 suggested_price NUMERIC(10,2),

#                 model_version TEXT,
#                 confidence_score NUMERIC(5,2),

#                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#             )
#         """)
#         conn.commit()
#         print("✅ ai_product_suggestions table created successfully.")

#     except Exception as e:
#         conn.rollback()
#         print(f"❌ Error creating ai_product_suggestions table: {e}")

#     finally:
#         cursor.close()
#         conn.close()


# def create_amazon_product_fees_table():
#     conn = get_connection()
#     cursor = conn.cursor()

#     try:
#         cursor.execute("""
#             CREATE TABLE IF NOT EXISTS amazon_product_fees (
#                 id SERIAL PRIMARY KEY,

#                 sku TEXT,
#                 fnsku TEXT,
#                 asin VARCHAR(20),

#                 product_name TEXT,
#                 product_group TEXT,
#                 brand TEXT,
#                 fulfilled_by TEXT,

#                 your_price NUMERIC(10,2),
#                 sales_price NUMERIC(10,2),

#                 longest_side NUMERIC(10,2),
#                 median_side NUMERIC(10,2),
#                 shortest_side NUMERIC(10,2),
#                 length_girth NUMERIC(10,2),

#                 unit_weight NUMERIC(10,2),
#                 shipping_weight NUMERIC(10,2),

#                 currency TEXT,

#                 estimated_fee_total NUMERIC(10,2),
#                 estimated_referral_fee_per_unit NUMERIC(10,2),
#                 estimated_variable_closing_fee NUMERIC(10,2),
#                 estimated_order_handling_fee_per_order NUMERIC(10,2),
#                 estimated_pick_pack_fee_per_unit NUMERIC(10,2),
#                 estimated_weight_handling_fee_per_unit NUMERIC(10,2),
#                 expected_fulfillment_fee_per_unit NUMERIC(10,2),

#                 is_hazmat BOOLEAN,
#                 size_tier TEXT,

#                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#             )
#         """)

#         conn.commit()
#         print("✅ amazon_product_fees table created successfully.")

#     except Exception as e:
#         conn.rollback()
#         print(f"❌ Error creating amazon_product_fees table: {e}")

#     finally:
#         cursor.close()
#         conn.close()



# @app.route('/analysis/<asin>', methods=['GET'])
# def analyze_product(asin):
#     create_ai_suggestions_table()
#     create_amazon_product_fees_table()
#     conn = get_connection()
#     cursor = conn.cursor()

#     try:
#         # 1. Get latest Amazon data
#         cursor.execute("""
#             SELECT your_price, sales_price, created_at
#             FROM amazon_product_fees
#             WHERE asin = %s
#             ORDER BY created_at DESC
#             LIMIT 1
#         """, (asin,))
#         amazon_data = cursor.fetchone()

#         if not amazon_data:
#             return jsonify({"error": "No Amazon data found"}), 404

#         your_price, sales_price, amazon_time = amazon_data
#         current_price = sales_price or your_price

#         # 2. Get latest AI suggestion
#         cursor.execute("""
#             SELECT suggested_price, suggested_title, created_at
#             FROM ai_product_suggestions
#             WHERE asin = %s
#             ORDER BY created_at DESC
#             LIMIT 1
#         """, (asin,))
#         ai_data = cursor.fetchone()

#         if not ai_data:
#             return jsonify({"error": "No AI suggestion found"}), 404

#         ai_price, ai_title, ai_time = ai_data

#         # 3. Compare logic
#         if current_price is None or ai_price is None:
#             trend = "insufficient data"
#         elif current_price < ai_price:
#             trend = "price lower than AI → potential increase in sales"
#         elif current_price > ai_price:
#             trend = "price higher than AI → potential decrease in sales"
#         else:
#             trend = "price matches AI → optimal"

#         # 4. Response
#         return jsonify({
#             "asin": asin,
#             "current_price": float(current_price) if current_price else None,
#             "ai_suggested_price": float(ai_price) if ai_price else None,
#             "suggested_title": ai_title,
#             "analysis": trend,
#             "amazon_last_updated": amazon_time,
#             "ai_last_updated": ai_time
#         })

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     finally:
#         cursor.close()
#         conn.close()


# if __name__ == '__main__':
#     app.run(debug=True, port=5001)


from flask import Flask, jsonify
from store import get_connection

app = Flask(__name__)
from flask_cors import CORS   
CORS(app)

def create_tables():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS brand_analytics_search_catalog (
                id                          SERIAL PRIMARY KEY,
                report_date                 DATE NOT NULL,
                asin                        VARCHAR(20) NOT NULL,
                product_name                TEXT,
                brand                       TEXT,
                category                    TEXT,
                subcategory                 TEXT,
                impressions                 INTEGER,
                clicks                      INTEGER,
                click_through_rate          NUMERIC(8,4),
                cart_adds                   INTEGER,
                cart_add_rate               NUMERIC(8,4),
                purchases                   INTEGER,
                purchase_rate               NUMERIC(8,4),
                revenue                     NUMERIC(12,2),
                glance_views                INTEGER,
                conversion_rate             NUMERIC(8,4),
                new_to_brand_purchases      INTEGER,
                new_to_brand_purchase_rate  NUMERIC(8,4),
                new_to_brand_revenue        NUMERIC(12,2),
                created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS ai_product_suggestions (
                id                SERIAL PRIMARY KEY,
                asin              VARCHAR(20) NOT NULL,
                suggested_title   TEXT,
                suggested_price   NUMERIC(10,2),
                model_version     TEXT,
                confidence_score  NUMERIC(5,2),
                created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating tables: {e}")
    finally:
        cursor.close()
        conn.close()


@app.route('/analysis/<asin>', methods=['GET'])
def analyze_product(asin):
    create_tables()
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT impressions, clicks, click_through_rate,
                   cart_adds, cart_add_rate,
                   purchases, purchase_rate, revenue,
                   conversion_rate,
                   new_to_brand_purchases, new_to_brand_purchase_rate, new_to_brand_revenue,
                   product_name, brand, category, subcategory, report_date
            FROM brand_analytics_search_catalog
            WHERE asin = %s
            ORDER BY report_date DESC
            LIMIT 1
        """, (asin,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "No brand analytics data found for this ASIN"}), 404

        (impressions, clicks, ctr, cart_adds, cart_add_rate,
         purchases, purchase_rate, revenue, conversion_rate,
         ntb_purchases, ntb_rate, ntb_revenue,
         product_name, brand, category, subcategory, report_date) = row

        cursor.execute("""
            SELECT suggested_title, suggested_price, confidence_score
            FROM ai_product_suggestions
            WHERE asin = %s
            ORDER BY created_at DESC
            LIMIT 1
        """, (asin,))
        ai_row = cursor.fetchone()

        # --- Benchmarks (typical for Luggage / general hardgoods) ---
        CTR_BENCHMARK        = 0.030   # 3.0%
        CONVERSION_BENCHMARK = 0.003   # 0.3%
        CART_ADD_BENCHMARK   = 0.250   # 25%
        NTB_BENCHMARK        = 0.500   # 50%

        insights = []
        score = 0  # out of 4

        # CTR
        if float(ctr) >= CTR_BENCHMARK:
            insights.append(f"✅ CTR {float(ctr)*100:.2f}% is above benchmark ({CTR_BENCHMARK*100:.1f}%) — listing title/image is compelling.")
            score += 1
        else:
            insights.append(f"⚠️ CTR {float(ctr)*100:.2f}% is below benchmark ({CTR_BENCHMARK*100:.1f}%) — consider improving main image or title.")

        # Conversion rate
        if float(conversion_rate) >= CONVERSION_BENCHMARK:
            insights.append(f"✅ Conversion rate {float(conversion_rate)*100:.2f}% is above benchmark ({CONVERSION_BENCHMARK*100:.1f}%) — product page is converting well.")
            score += 1
        else:
            insights.append(f"⚠️ Conversion rate {float(conversion_rate)*100:.2f}% is below benchmark — review pricing, reviews, and bullet points.")

        # Cart add rate
        if float(cart_add_rate) >= CART_ADD_BENCHMARK:
            insights.append(f"✅ Cart-add rate {float(cart_add_rate)*100:.2f}% is strong ({CART_ADD_BENCHMARK*100:.0f}% benchmark) — high purchase intent.")
            score += 1
        else:
            insights.append(f"⚠️ Cart-add rate {float(cart_add_rate)*100:.2f}% is low — customers may be comparing alternatives.")

        # New-to-brand rate
        if float(ntb_rate) >= NTB_BENCHMARK:
            insights.append(f"✅ {float(ntb_rate)*100:.2f}% of buyers are new to brand — strong customer acquisition.")
            score += 1
        else:
            insights.append(f"⚠️ New-to-brand rate {float(ntb_rate)*100:.2f}% is low — growth may be slowing, consider awareness campaigns.")

        overall = (
            "🟢 Strong performance across all metrics."  if score == 4 else
            "🟡 Good performance with room to improve."  if score >= 2 else
            "🔴 Underperforming — action needed."
        )

        response = {
            "asin": asin,
            "product_name": product_name,
            "brand": brand,
            "category": f"{category} > {subcategory}",
            "report_date": str(report_date),
            "metrics": {
                "impressions": impressions,
                "clicks": clicks,
                "click_through_rate": float(ctr),
                "cart_adds": cart_adds,
                "cart_add_rate": float(cart_add_rate),
                "purchases": purchases,
                "purchase_rate": float(purchase_rate),
                "revenue": float(revenue),
                "conversion_rate": float(conversion_rate),
                "new_to_brand_purchases": ntb_purchases,
                "new_to_brand_purchase_rate": float(ntb_rate),
                "new_to_brand_revenue": float(ntb_revenue),
            },
            "analysis": {
                "overall": overall,
                "score": f"{score}/4",
                "insights": insights,
            }
        }

        if ai_row:
            response["ai_suggestion"] = {
                "suggested_title": ai_row[0],
                "suggested_price": float(ai_row[1]) if ai_row[1] else None,
                "confidence_score": float(ai_row[2]) if ai_row[2] else None,
            }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    app.run(debug=True, port=5001)
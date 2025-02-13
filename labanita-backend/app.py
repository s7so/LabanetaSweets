from flask import Flask, jsonify, request

import psycopg2

app = Flask(__name__)


def get_db_connection():
    conn = None
    try:
        conn = psycopg2.connect(
            host="localhost",  # السيرفر بتاع قاعدة البيانات (جهازك)
            database="labanita_db",  # اسم قاعدة البيانات اللي أنشأناها
            user="postgres",  # اسم المستخدم بتاع قاعدة البيانات (افتراضي في PostgreSQL)
            password="123456",  # كلمة سر المستخدم (لو حطيت كلمة سر للمستخدم postgres وقت التثبيت، دخلها هنا، لو مفيش كلمة سر، سيبها فاضية)
        )
    except (Exception, psycopg2.Error) as error:
        print("Error while connecting to PostgreSQL", error)
    return conn


@app.route("/")
def hello_world():
    conn = get_db_connection()
    if conn:
        conn.close()  # مهم تقفل الاتصال بعد ما تخلصه
        return "Hello, World! - Connected to PostgreSQL!"
    else:
        return "Hello, World! - Not connected to PostgreSQL!"


# إضافة منتج جديد
@app.route("/products", methods=["POST"])
def create_product():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        data = request.get_json()  # جلب البيانات من الطلب بصيغة JSON
        name = data["name"]
        description = data["description"]
        price = data["price"]
        image_url = data["image_url"]
        category_id = data["category_id"]

        # أمر SQL لإضافة منتج جديد في جدول products
        query = "INSERT INTO products (name, description, price, image_url, category_id) VALUES (%s, %s, %s, %s, %s) RETURNING id;"
        cur.execute(query, (name, description, price, image_url, category_id))
        product_id = cur.fetchone()[0]  # جلب الـ ID بتاع المنتج الجديد اللي تم إضافته

        conn.commit()  # حفظ التغييرات في قاعدة البيانات
        cur.close()
        conn.close()

        return (
            jsonify(
                {"message": "Product created successfully!", "product_id": product_id}
            ),
            201,
        )  # رد ناجح مع رسالة و ID المنتج الجديد

    except (Exception, psycopg2.Error) as error:
        if conn:
            conn.rollback()  # تراجع عن التغييرات في حالة الخطأ
            conn.close()
        return (
            jsonify({"message": "Failed to create product.", "error": str(error)}),
            500,
        )  # رد خطأ مع رسالة خطأ وتفاصيل الخطأ


# جلب قائمة المنتجات
@app.route("/products", methods=["GET"])
def get_products():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # أمر SQL لجلب كل المنتجات من جدول products
        query = "SELECT * FROM products;"
        cur.execute(query)
        products = cur.fetchall()  # جلب كل الصفوف اللي رجعت من قاعدة البيانات

        cur.close()
        conn.close()

        products_list = []  # قائمة فاضية هنحط فيها المنتجات بصيغة ديكشنري
        for product in products:
            product_dict = {
                "id": product[0],
                "name": product[1],
                "description": product[2],
                "price": float(
                    product[3]
                ),  # تحويل السعر لـ float عشان JSON يعرف يتعامل معاه
                "image_url": product[4],
                "category_id": product[5],
                "created_at": product[
                    6
                ].isoformat(),  # تحويل التاريخ والوقت لـ String بصيغة ISO
                "updated_at": (
                    product[7].isoformat() if product[7] else None
                ),  # نفس الكلام بس لو updated_at مش موجود (None)
            }
            products_list.append(product_dict)  # إضافة الديكشنري للقائمة

        return jsonify(products_list), 200  # رد ناجح مع قائمة المنتجات

    except (Exception, psycopg2.Error) as error:
        if conn:
            conn.close()
        return (
            jsonify({"message": "Failed to get products.", "error": str(error)}),
            500,
        )  # رد خطأ مع رسالة خطأ وتفاصيل الخطأ


# جلب منتج بناءً على الـ ID
@app.route("/products/<int:id>", methods=["GET"])
def get_product(id):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # أمر SQL لجلب منتج واحد من جدول products بناءً على الـ ID
        query = "SELECT * FROM products WHERE id = %s;"
        cur.execute(query, (id,))  # تمرير الـ ID كـ parameter في الأمر

        product = cur.fetchone()  # جلب صف واحد بس (المنتج اللي ليه الـ ID ده)

        cur.close()
        conn.close()

        if product:  # لو المنتج موجود (يعني الـ query رجع صف)
            product_dict = {
                "id": product[0],
                "name": product[1],
                "description": product[2],
                "price": float(product[3]),
                "image_url": product[4],
                "category_id": product[5],
                "created_at": product[6].isoformat(),
                "updated_at": product[7].isoformat() if product[7] else None,
            }
            return jsonify(product_dict), 200  # رد ناجح مع تفاصيل المنتج

        else:  # لو المنتج مش موجود (يعني الـ query مرجعش صف)
            return (
                jsonify({"message": "Product not found."}),
                404,
            )  # رد خطأ "غير موجود" (Not Found)

    except (Exception, psycopg2.Error) as error:
        if conn:
            conn.close()
        return (
            jsonify({"message": "Failed to get product.", "error": str(error)}),
            500,
        )  # رد خطأ مع رسالة خطأ وتفاصيل الخطأ


# تعديل منتج بناءً على الـ ID
@app.route("/products/<int:id>", methods=["PUT"])
def update_product(id):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        data = request.get_json()  # جلب البيانات من الطلب بصيغة JSON
        name = data["name"]
        description = data["description"]
        price = data["price"]
        image_url = data["image_url"]
        category_id = data["category_id"]

        # أمر SQL لتعديل منتج موجود في جدول products بناءً على الـ ID
        query = "UPDATE products SET name = %s, description = %s, price = %s, image_url = %s, category_id = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s;"
        cur.execute(
            query, (name, description, price, image_url, category_id, id)
        )  # تمرير البيانات والـ ID كـ parameters في الأمر

        if cur.rowcount > 0:  # لو تم تعديل صف واحد على الأقل (يعني المنتج موجود)
            conn.commit()  # حفظ التغييرات في قاعدة البيانات
            cur.close()
            conn.close()
            return (
                jsonify({"message": "Product updated successfully!"}),
                200,
            )  # رد ناجح مع رسالة تأكيد

        else:  # لو متمش تعديل أي صف (يعني المنتج مش موجود)
            cur.close()
            conn.close()
            return (
                jsonify({"message": "Product not found."}),
                404,
            )  # رد خطأ "غير موجود" (Not Found)

    except (Exception, psycopg2.Error) as error:
        if conn:
            conn.rollback()  # تراجع عن التغييرات في حالة الخطأ
            conn.close()
        return (
            jsonify({"message": "Failed to update product.", "error": str(error)}),
            500,
        )  # رد خطأ مع رسالة خطأ وتفاصيل الخطأ


# حذف منتج بناءً على الـ ID
@app.route("/products/<int:id>", methods=["DELETE"])
def delete_product(id):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # أمر SQL لحذف منتج من جدول products بناءً على الـ ID
        query = "DELETE FROM products WHERE id = %s;"
        cur.execute(query, (id,))  # تمرير الـ ID كـ parameter في الأمر

        if cur.rowcount > 0:  # لو تم حذف صف واحد على الأقل (يعني المنتج موجود)
            conn.commit()  # حفظ التغييرات في قاعدة البيانات
            cur.close()
            conn.close()
            return (
                jsonify({"message": "Product deleted successfully!"}),
                200,
            )  # رد ناجح مع رسالة تأكيد

        else:  # لو متمش حذف أي صف (يعني المنتج مش موجود)
            cur.close()
            conn.close()
            return (
                jsonify({"message": "Product not found."}),
                404,
            )  # رد خطأ "غير موجود" (Not Found)

    except (Exception, psycopg2.Error) as error:
        if conn:
            conn.rollback()  # تراجع عن التغييرات في حالة الخطأ
            conn.close()
        return (
            jsonify({"message": "Failed to delete product.", "error": str(error)}),
            500,
        )  # رد خطأ مع رسالة خطأ وتفاصيل الخطأ


if __name__ == "__main__":
    app.run(debug=True)

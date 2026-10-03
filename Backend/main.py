from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import get_connection


# APPLICATION

app = FastAPI(
    title="Perpetual Medtech API",
    description="Backend API for Perpetual Medtech website",
    version="1.0.0"
)


# CORS

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
        "https://perpetualmedtech.netlify.app"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# MODELS

class ContactMessage(BaseModel):
    name: str
    email: str
    subject: str
    message: str


# HOME / ROOT API

@app.get("/")
def home():

    return {
        "message": "Perpetual Medtech API is running",
        "status": "success"
    }


# DATABASE HEALTH CHECK

@app.get("/api/health")
def health_check():

    connection = None
    cursor = None

    try:

        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT current_database();")
        database_name = cursor.fetchone()[0]

        cursor.execute("SELECT current_user;")
        database_user = cursor.fetchone()[0]

        cursor.execute("SELECT current_schema();")
        schema_name = cursor.fetchone()[0]

        cursor.execute("""
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'contacts'
            );
        """)

        contacts_exists = cursor.fetchone()[0]

        cursor.execute("""
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'products'
            );
        """)

        products_exists = cursor.fetchone()[0]

        return {
            "status": "healthy",
            "database": database_name,
            "user": database_user,
            "schema": schema_name,
            "contacts_table": contacts_exists,
            "products_table": products_exists
        }

    except Exception as error:

        return {
            "status": "unhealthy",
            "error": str(error)
        }

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()
# CONTACT FORM API

@app.post("/api/contact")
def create_contact(contact: ContactMessage):

    connection = None
    cursor = None

    try:

        # CONNECT TO DATABASE

        connection = get_connection()

        cursor = connection.cursor()


        # INSERT CONTACT MESSAGE

        query = """
            INSERT INTO contacts
            (
                name,
                email,
                subject,
                message
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s
            )
            RETURNING id;
        """


        cursor.execute(
            query,
            (
                contact.name,
                contact.email,
                contact.subject,
                contact.message
            )
        )


        # GET NEW CONTACT ID

        contact_id = cursor.fetchone()[0]


        # SAVE CHANGES

        connection.commit()


        # RESPONSE

        return {
            "status": "success",
            "message": "Contact message stored successfully",
            "contact_id": contact_id
        }


    except Exception as error:

        # ROLLBACK IF ERROR OCCURS

        if connection:

            connection.rollback()


        print(
            "CONTACT API ERROR:",
            error
        )


        return {
            "status": "error",
            "message": str(error)
        }


    finally:

        # CLOSE CURSOR

        if cursor:

            cursor.close()


        # CLOSE DATABASE CONNECTION

        if connection:

            connection.close()


# PRODUCTS API

@app.get("/api/products")
def get_products():

    connection = None
    cursor = None

    try:

        # CONNECT TO DATABASE

        connection = get_connection()

        cursor = connection.cursor()


        # GET PRODUCTS

        query = """
            SELECT
                id,
                name,
                category,
                description,
                image_url,
                created_at
            FROM products
            ORDER BY id;
        """


        cursor.execute(query)


        products = cursor.fetchall()


        # CONVERT DATABASE ROWS TO JSON

        product_list = []


        for product in products:

            product_list.append({

                "id": product[0],

                "name": product[1],

                "category": product[2],

                "description": product[3],

                "image_url": product[4],

                "created_at":
                    product[5].isoformat()
                    if product[5]
                    else None

            })


        # RESPONSE

        return {

            "status": "success",

            "products": product_list

        }


    except Exception as error:

        print(
            "PRODUCT API ERROR:",
            error
        )


        return {

            "status": "error",

            "message": str(error)

        }


    finally:

        # CLOSE CURSOR-

        if cursor:

            cursor.close()


        # CLOSE DATABASE CONNECTION

        if connection:

            connection.close()
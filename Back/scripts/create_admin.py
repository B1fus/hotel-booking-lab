import asyncio
import argparse
from getpass import getpass 
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select


import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from app.core.config import settings
from app.core.security import get_password_hash
from app.models import AdminUser 

async def create_admin(username: str, password: str):
    print(f"Attempting to create admin user: {username}")
    print(f"Using database: {settings.DATABASE_URL}")

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    AsyncSessionLocal = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with AsyncSessionLocal() as session:
        async with session.begin(): 
            
            result = await session.execute(
                select(AdminUser).filter(AdminUser.username == username)
            )
            existing_user = result.scalars().first()

            if existing_user:
                print(f"Error: Admin user '{username}' already exists.")
                return

            hashed_password = get_password_hash(password)
            admin_user = AdminUser(username=username, hashed_password=hashed_password)
            session.add(admin_user)

        print(f"Admin user '{username}' created successfully!")

    await engine.dispose() 

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create an admin user for the Hotel API.")
    parser.add_argument("username", help="The username for the new admin user.")
    args = parser.parse_args()    
    password = getpass(f"Enter password for admin user '{args.username}': ")
    password_confirm = getpass("Confirm password: ")

    if password != password_confirm:
        print("Error: Passwords do not match.")
        sys.exit(1)

    if not password:
        print("Error: Password cannot be empty.")
        sys.exit(1)
    
    try:
        asyncio.run(create_admin(args.username, password))
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        print("Please check your database connection string in .env and ensure the database is running.")
        sys.exit(1)
import os
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Configure test database URL
TEST_DB_FILE = "./test_fragment_first.db"
if os.path.exists(TEST_DB_FILE):
    try:
        os.remove(TEST_DB_FILE)
    except Exception:
        pass

from app.database.base import Base
import app.models  # Register all models
from app.core.config import settings

# Force demo mode and test secret
settings.DATABASE_URL = f"sqlite:///{TEST_DB_FILE}"
settings.DEMO_MODE = True
settings.SECRET_KEY = "test_secret_key_for_unit_tests_32_characters"

test_engine = create_engine(
    f"sqlite:///{TEST_DB_FILE}",
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Monkeypatch SessionLocal in session module so get_current_user also uses test db
import app.database.session as session_module
session_module.SessionLocal = TestingSessionLocal
session_module.engine = test_engine

from main import app
from app.database.session import get_db


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except Exception:
            pass


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="session")
def victim_token(client):
    reg_data = {
        "email": "victim_test@example.com",
        "full_name": "Jane Victim",
        "password": "Password123!",
        "role": "victim"
    }
    resp = client.post("/api/auth/register", json=reg_data)
    assert resp.status_code == 201, resp.text
    return resp.json()["access_token"]


@pytest.fixture(scope="session")
def investigator_token(client):
    reg_data = {
        "email": "investigator_test@example.com",
        "full_name": "Detective Miller",
        "password": "Password123!",
        "role": "investigator"
    }
    resp = client.post("/api/auth/register", json=reg_data)
    assert resp.status_code == 201, resp.text
    return resp.json()["access_token"]


@pytest.fixture(scope="session")
def victim_headers(victim_token):
    return {"Authorization": f"Bearer {victim_token}"}


@pytest.fixture(scope="session")
def investigator_headers(investigator_token):
    return {"Authorization": f"Bearer {investigator_token}"}

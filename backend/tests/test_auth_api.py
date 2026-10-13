from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_visualizer_requires_authentication():
    response = client.post("/api/visualize/sort", json={"algorithm": "merge_sort", "array": [3, 1, 2]})
    assert response.status_code == 401


def test_register_login_and_run_custom_input():
    username = f"student_{uuid4().hex[:12]}"
    password = "strong-password-123"
    registration = client.post("/api/auth/register", json={"username": username, "password": password})
    assert registration.status_code == 201
    token = registration.json()["access_token"]

    login = client.post("/api/auth/login", json={"username": username, "password": password})
    assert login.status_code == 200
    assert login.json()["username"] == username

    response = client.post(
        "/api/visualize/sort",
        headers={"Authorization": f"Bearer {token}"},
        json={"algorithm": "merge_sort", "array": [42, -3, 9, 9, 0]},
    )
    assert response.status_code == 200
    assert response.json()["result"] == [-3, 0, 9, 9, 42]


def test_visualizer_rejects_oversized_array():
    username = f"student_{uuid4().hex[:12]}"
    token = client.post("/api/auth/register", json={"username": username, "password": "strong-password-123"}).json()["access_token"]
    response = client.post(
        "/api/visualize/sort",
        headers={"Authorization": f"Bearer {token}"},
        json={"algorithm": "merge_sort", "array": list(range(101))},
    )
    assert response.status_code == 422

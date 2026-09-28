from __future__ import annotations

import getpass
import json
import os
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


# ============================================================
# AeroVision Laptop Verification Script
# ============================================================

BACKEND_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_ROOT.parent
FRONTEND_ROOT = PROJECT_ROOT / "frontend"

BASE_URL = os.environ.get(
    "AEROVISION_BASE_URL",
    "http://127.0.0.1:8765",
)

ADMIN_EMAIL = os.environ.get(
    "AEROVISION_ADMIN_EMAIL",
    "admin@aerovision.local",
)

WRITE_MODE_TESTS = (
    os.environ.get(
        "AEROVISION_WRITE_MODE_TESTS",
        "0",
    )
    == "1"
)


EXPECTED_MODE_KEYS = [
    "standby",

    "traffic_overview",
    "traffic_no_parking",
    "traffic_helmet",
    "traffic_wrong_way",
    "traffic_plates",

    "crowd_overview",
    "crowd_density",
    "crowd_surge",
    "crowd_flow",
    "crowd_queues",

    "road_overview",
    "road_damage",
    "road_potholes",
    "road_condition",
    "road_missions",

    "safety_overview",
    "safety_zones",
    "safety_emergency",
]


FRONTEND_REQUIRED_FILES = [
    FRONTEND_ROOT / "src" / "App.tsx",
    FRONTEND_ROOT / "src" / "App.css",
    FRONTEND_ROOT / "src" / "services" / "api.ts",
    FRONTEND_ROOT / "src" / "components" / "PageModelControl.tsx",
    FRONTEND_ROOT / "src" / "auth" / "ProtectedRoute.tsx",
    FRONTEND_ROOT / "src" / "auth" / "AuthContext.tsx",
]


OLD_FRONTEND_FILES = [
    FRONTEND_ROOT / "src" / "components" / "ModeSelector.tsx",
    FRONTEND_ROOT / "src" / "auth" / "ModeRouteGuard.tsx",
    FRONTEND_ROOT / "src" / "pages" / "ModelControl.tsx",
]


passed = 0
failed = 0
warnings = 0


# ============================================================
# Output helpers
# ============================================================

def pass_test(message: str) -> None:
    global passed
    passed += 1
    print(f"[PASS] {message}")


def fail_test(message: str) -> None:
    global failed
    failed += 1
    print(f"[FAIL] {message}")


def warn_test(message: str) -> None:
    global warnings
    warnings += 1
    print(f"[WARN] {message}")


def info(message: str) -> None:
    print(f"[INFO] {message}")


def section(title: str) -> None:
    print()
    print("=" * 70)
    print(title)
    print("=" * 70)


# ============================================================
# Windows command helpers
# ============================================================

def get_command(
    name: str,
) -> str:

    if os.name == "nt":

        if name == "npm":
            return "npm.cmd"

        if name == "npx":
            return "npx.cmd"

    return name


# ============================================================
# Process helper
# ============================================================

def run_command(
    command: list[str],
    cwd: Path,
    description: str,
) -> tuple[int, str]:

    info(
        f"{description}: "
        f"{' '.join(command)}"
    )

    try:
        completed = subprocess.run(
            command,
            cwd=str(cwd),
            text=True,
            capture_output=True,
            encoding="utf-8",
            errors="replace",
            shell=False,
        )

    except FileNotFoundError as exc:
        fail_test(
            f"{description}: command not found: "
            f"{command[0]}"
        )
        return 127, str(exc)

    output = ""

    if completed.stdout:
        output += completed.stdout

    if completed.stderr:
        output += completed.stderr

    if output.strip():
        print(output.rstrip())

    return completed.returncode, output


# ============================================================
# HTTP helper
# ============================================================

def http_request(
    method: str,
    path: str,
    *,
    token: str | None = None,
    body: dict[str, Any] | None = None,
) -> tuple[int, Any, str]:

    url = (
        f"{BASE_URL.rstrip('/')}"
        f"{path}"
    )

    headers = {
        "Accept": "application/json",
    }

    data = None

    if body is not None:
        data = json.dumps(body).encode(
            "utf-8"
        )

        headers[
            "Content-Type"
        ] = "application/json"

    if token:
        headers[
            "Authorization"
        ] = f"Bearer {token}"

    request = urllib.request.Request(
        url,
        data=data,
        headers=headers,
        method=method,
    )

    try:

        with urllib.request.urlopen(
            request,
            timeout=10,
        ) as response:

            raw = (
                response.read()
                .decode(
                    "utf-8",
                    errors="replace",
                )
            )

            try:
                parsed = json.loads(raw)
            except json.JSONDecodeError:
                parsed = raw

            return (
                response.status,
                parsed,
                raw,
            )

    except urllib.error.HTTPError as exc:

        raw = (
            exc.read()
            .decode(
                "utf-8",
                errors="replace",
            )
        )

        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = raw

        return (
            exc.code,
            parsed,
            raw,
        )

    except urllib.error.URLError as exc:

        return (
            0,
            None,
            str(exc),
        )

    except Exception as exc:

        return (
            0,
            None,
            str(exc),
        )


# ============================================================
# 1. Project structure
# ============================================================

section("1. PROJECT STRUCTURE")

if BACKEND_ROOT.exists():
    pass_test(
        f"Backend directory exists: "
        f"{BACKEND_ROOT}"
    )
else:
    fail_test(
        f"Backend directory missing: "
        f"{BACKEND_ROOT}"
    )


if FRONTEND_ROOT.exists():
    pass_test(
        f"Frontend directory exists: "
        f"{FRONTEND_ROOT}"
    )
else:
    fail_test(
        f"Frontend directory missing: "
        f"{FRONTEND_ROOT}"
    )


# ============================================================
# 2. Backend import
# ============================================================

section("2. BACKEND IMPORT")

old_cwd = Path.cwd()

app = None
DeviceRuntime = None
engine = None

try:

    os.chdir(BACKEND_ROOT)

    try:

        from app.main import app as imported_app
        from app.models import DeviceRuntime as imported_runtime
        from app.db.session import engine as imported_engine

        app = imported_app
        DeviceRuntime = imported_runtime
        engine = imported_engine

        pass_test(
            "FastAPI application imports successfully."
        )

        pass_test(
            "DeviceRuntime model imports successfully."
        )

    except Exception as exc:

        fail_test(
            "Backend import failed: "
            f"{type(exc).__name__}: {exc}"
        )

finally:

    os.chdir(old_cwd)


# ============================================================
# 3. Backend route checks
#
# IMPORTANT:
# We intentionally do NOT use app.routes as the source of
# truth here because routers can be mounted through the
# application structure in ways that make a simple path scan
# misleading.
#
# HTTP requests against the running server are authoritative.
# ============================================================

section("3. BACKEND HTTP ROUTES")

status_code, health_data, raw = http_request(
    "GET",
    "/api/health",
)

if status_code == 200:
    pass_test(
        "GET /api/health is reachable."
    )
else:
    fail_test(
        f"GET /api/health returned "
        f"{status_code}: {raw}"
    )


# ============================================================
# 4. Database model
# ============================================================

section("4. DATABASE MODEL")

if DeviceRuntime is not None:

    model_columns = set(
        DeviceRuntime.__table__.columns.keys()
    )


    if "desired_mode" in model_columns:
        pass_test(
            "DeviceRuntime contains "
            "'desired_mode'."
        )
    else:
        fail_test(
            "DeviceRuntime is missing "
            "'desired_mode'."
        )


    if "current_mode" in model_columns:
        pass_test(
            "DeviceRuntime contains "
            "'current_mode'."
        )
    else:
        fail_test(
            "DeviceRuntime is missing "
            "'current_mode'."
        )


# ============================================================
# 5. PostgreSQL schema
# ============================================================

section("5. POSTGRESQL SCHEMA")

if engine is not None:

    try:

        from sqlalchemy import inspect

        inspector = inspect(engine)

        columns = {
            column["name"]
            for column in inspector.get_columns(
                "device_runtime"
            )
        }


        if "desired_mode" in columns:
            pass_test(
                "PostgreSQL has "
                "device_runtime.desired_mode."
            )
        else:
            fail_test(
                "PostgreSQL is missing "
                "device_runtime.desired_mode."
            )


        if "current_mode" in columns:
            pass_test(
                "PostgreSQL has "
                "device_runtime.current_mode."
            )
        else:
            fail_test(
                "PostgreSQL is missing "
                "device_runtime.current_mode."
            )

    except Exception as exc:

        fail_test(
            "Could not inspect PostgreSQL: "
            f"{type(exc).__name__}: {exc}"
        )


# ============================================================
# 6. Alembic
# ============================================================

section("6. ALEMBIC")

return_code, current_output = run_command(
    [
        sys.executable,
        "-m",
        "alembic",
        "current",
    ],
    BACKEND_ROOT,
    "Checking Alembic current revision",
)


if return_code == 0:

    if "c4f6a8b9d2e1" in current_output:

        pass_test(
            "Alembic is at "
            "c4f6a8b9d2e1."
        )

    else:

        fail_test(
            "Alembic is not at "
            "c4f6a8b9d2e1."
        )


return_code, head_output = run_command(
    [
        sys.executable,
        "-m",
        "alembic",
        "heads",
    ],
    BACKEND_ROOT,
    "Checking Alembic head",
)


if return_code == 0:

    if "c4f6a8b9d2e1" in head_output:

        pass_test(
            "Alembic head is "
            "c4f6a8b9d2e1."
        )

    else:

        fail_test(
            "Alembic head is not "
            "c4f6a8b9d2e1."
        )


# ============================================================
# 7. Authentication
# ============================================================

section("7. AUTHENTICATION")

print()

admin_password = getpass.getpass(
    "Enter admin password: "
)


status_code, login_data, raw = http_request(
    "POST",
    "/api/auth/login",
    body={
        "email": ADMIN_EMAIL,
        "password": admin_password,
    },
)


token = None


if (
    status_code == 200
    and isinstance(
        login_data,
        dict,
    )
    and login_data.get(
        "access_token"
    )
):

    token = (
        login_data[
            "access_token"
        ]
    )


    pass_test(
        "Admin login succeeded."
    )


    if (
        login_data.get(
            "token_type"
        )
        == "bearer"
    ):

        pass_test(
            "Login token type is bearer."
        )

    else:

        warn_test(
            "Login succeeded but "
            "token_type is not bearer."
        )

else:

    fail_test(
        "Admin login failed: "
        f"HTTP {status_code}: {raw}"
    )


if token:

    status_code, me_data, raw = (
        http_request(
            "GET",
            "/api/auth/me",
            token=token,
        )
    )


    if status_code == 200:

        pass_test(
            "GET /api/auth/me succeeded."
        )

    else:

        fail_test(
            f"GET /api/auth/me returned "
            f"{status_code}: {raw}"
        )


# ============================================================
# 8. Device API
# ============================================================

section("8. DEVICE API")

device_id = None
original_desired_mode = None


if token:

    status_code, devices_data, raw = (
        http_request(
            "GET",
            "/api/devices",
            token=token,
        )
    )


    if (
        status_code == 200
        and isinstance(
            devices_data,
            list,
        )
    ):

        pass_test(
            "GET /api/devices succeeded."
        )


        info(
            f"Found {len(devices_data)} device(s)."
        )


        primary_device = None


        for device in devices_data:

            if (
                isinstance(
                    device,
                    dict,
                )
                and device.get(
                    "device_uid"
                )
                == "rpi-01"
            ):

                primary_device = device
                break


        if (
            primary_device is None
            and devices_data
        ):

            primary_device = (
                devices_data[0]
            )


        if primary_device:

            device_id = (
                primary_device.get(
                    "id"
                )
            )


            pass_test(
                "Primary edge device found: "
                f"{primary_device.get('device_uid')}"
            )


            if (
                primary_device.get(
                    "device_uid"
                )
                == "rpi-01"
            ):

                pass_test(
                    "Primary device UID is rpi-01."
                )

            else:

                warn_test(
                    "rpi-01 was not found; "
                    "using the first device."
                )


        else:

            fail_test(
                "No device was returned."
            )

    elif status_code == 401:

        fail_test(
            "GET /api/devices returned 401."
        )

    else:

        fail_test(
            f"GET /api/devices returned "
            f"{status_code}: {raw}"
        )


# ============================================================
# 9. Mode GET
# ============================================================

section("9. MODE GET")

mode_data = None


if token and device_id is not None:

    status_code, mode_data, raw = (
        http_request(
            "GET",
            f"/api/devices/"
            f"{device_id}/mode",
            token=token,
        )
    )


    if (
        status_code == 200
        and isinstance(
            mode_data,
            dict,
        )
    ):

        pass_test(
            "GET device mode succeeded."
        )


        required_fields = [
            "device_id",
            "device_uid",
            "desired_mode",
            "current_mode",
            "label",
            "landing_path",
            "modes",
        ]


        for field in required_fields:

            if field in mode_data:

                pass_test(
                    f"Mode response contains "
                    f"'{field}'."
                )

            else:

                fail_test(
                    f"Mode response is missing "
                    f"'{field}'."
                )


        original_desired_mode = (
            mode_data.get(
                "desired_mode"
            )
        )


        modes = mode_data.get(
            "modes",
            [],
        )


        if not isinstance(
            modes,
            list,
        ):

            fail_test(
                "Mode response 'modes' "
                "is not a list."
            )

        else:

            returned_keys = {
                item.get("key")
                for item in modes
                if isinstance(
                    item,
                    dict,
                )
            }


            info("Backend mode keys:")


            for key in sorted(
                returned_keys
            ):

                print(
                    f"  - {key}"
                )


            for expected in (
                EXPECTED_MODE_KEYS
            ):

                if expected in returned_keys:

                    pass_test(
                        f"Mode exists: "
                        f"{expected}"
                    )

                else:

                    fail_test(
                        f"Mode missing: "
                        f"{expected}"
                    )


    elif status_code == 401:

        fail_test(
            "GET device mode returned 401."
        )

    else:

        fail_test(
            f"GET device mode returned "
            f"{status_code}: {raw}"
        )


# ============================================================
# 10. Mode POST and persistence
# ============================================================

section("10. MODE POST + PERSISTENCE")

if not WRITE_MODE_TESTS:

    warn_test(
        "Mode write tests are skipped."
    )

    print()
    print(
        'Enable them with:'
    )

    print(
        '$env:AEROVISION_WRITE_MODE_TESTS="1"'
    )

    print(
        "python test_laptop.py"
    )

elif (
    token
    and device_id is not None
):

    if original_desired_mode:

        info(
            "Original desired_mode: "
            f"{original_desired_mode}"
        )


    for mode_key in EXPECTED_MODE_KEYS:

        status_code, response_data, raw = (
            http_request(
                "POST",
                f"/api/devices/"
                f"{device_id}/mode",
                token=token,
                body={
                    "mode_key": mode_key,
                },
            )
        )


        if status_code != 200:

            fail_test(
                f"POST {mode_key} failed: "
                f"HTTP {status_code}: "
                f"{raw}"
            )

            continue


        if not isinstance(
            response_data,
            dict,
        ):

            fail_test(
                f"POST {mode_key} returned "
                "invalid JSON."
            )

            continue


        if (
            response_data.get(
                "desired_mode"
            )
            == mode_key
        ):

            pass_test(
                f"POST {mode_key} "
                "saved desired_mode."
            )

        else:

            fail_test(
                f"POST {mode_key} returned "
                "the wrong desired_mode."
            )


        get_status, get_data, get_raw = (
            http_request(
                "GET",
                f"/api/devices/"
                f"{device_id}/mode",
                token=token,
            )
        )


        if (
            get_status == 200
            and isinstance(
                get_data,
                dict,
            )
            and get_data.get(
                "desired_mode"
            )
            == mode_key
        ):

            pass_test(
                f"Persistence verified: "
                f"{mode_key}"
            )

        else:

            fail_test(
                f"Persistence failed: "
                f"{mode_key}. "
                f"GET returned "
                f"{get_status}: {get_raw}"
            )


    # Restore the original state.
    if original_desired_mode:

        status_code, restore_data, raw = (
            http_request(
                "POST",
                f"/api/devices/"
                f"{device_id}/mode",
                token=token,
                body={
                    "mode_key":
                        original_desired_mode,
                },
            )
        )


        if (
            status_code == 200
            and isinstance(
                restore_data,
                dict,
            )
            and restore_data.get(
                "desired_mode"
            )
            == original_desired_mode
        ):

            pass_test(
                "Restored original desired_mode: "
                f"{original_desired_mode}"
            )

        else:

            fail_test(
                "Failed to restore original "
                f"desired_mode: "
                f"{original_desired_mode}"
            )


# ============================================================
# 11. Frontend files
# ============================================================

section("11. FRONTEND FILES")

for required_file in (
    FRONTEND_REQUIRED_FILES
):

    if required_file.exists():

        pass_test(
            "Frontend file exists: "
            f"{required_file.relative_to(PROJECT_ROOT)}"
        )

    else:

        fail_test(
            "Frontend file missing: "
            f"{required_file.relative_to(PROJECT_ROOT)}"
        )


# ============================================================
# 12. Old files
# ============================================================

section("12. OLD MODE UI")

for old_file in OLD_FRONTEND_FILES:

    if old_file.exists():

        warn_test(
            "Old mode file still exists: "
            f"{old_file.relative_to(PROJECT_ROOT)}"
        )

    else:

        pass_test(
            "Old mode file removed: "
            f"{old_file.relative_to(PROJECT_ROOT)}"
        )


# ============================================================
# 13. Frontend TypeScript
# ============================================================

section("13. FRONTEND TYPESCRIPT")

if FRONTEND_ROOT.exists():

    npm_command = get_command("npm")


    return_code, output = run_command(
        [
            npm_command,
            "exec",
            "--",
            "tsc",
            "-b",
            "--pretty",
            "false",
        ],
        FRONTEND_ROOT,
        "Running TypeScript check",
    )


    if return_code == 0:

        pass_test(
            "Frontend TypeScript check passed."
        )

    else:

        fail_test(
            "Frontend TypeScript check failed."
        )


# ============================================================
# 14. Frontend production build
# ============================================================

section("14. FRONTEND PRODUCTION BUILD")

if FRONTEND_ROOT.exists():

    npm_command = get_command("npm")


    return_code, output = run_command(
        [
            npm_command,
            "run",
            "build",
        ],
        FRONTEND_ROOT,
        "Running frontend production build",
    )


    if return_code == 0:

        pass_test(
            "Frontend production build passed."
        )

    else:

        fail_test(
            "Frontend production build failed."
        )


# ============================================================
# 15. Summary
# ============================================================

section("FINAL RESULT")

print(
    f"PASS: {passed}"
)

print(
    f"FAIL: {failed}"
)

print(
    f"WARN: {warnings}"
)

print()


if failed == 0:

    print(
        "LAPTOP CHECK RESULT: PASS"
    )

    print()
    print(
        "The laptop application passed "
        "all enabled checks."
    )

    sys.exit(0)


else:

    print(
        "LAPTOP CHECK RESULT: FAIL"
    )

    print()
    print(
        "There are still failed checks "
        "that need attention."
    )

    sys.exit(1)
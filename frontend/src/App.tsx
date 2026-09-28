import {
  useEffect,
  useState,
} from "react";

import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
} from "react-router-dom";


import {
  AuthProvider,
  useAuth,
} from "./auth/AuthContext";

import ProtectedRoute from "./auth/ProtectedRoute";

import PageModelControl from "./components/PageModelControl";


import {
  getDeviceMode,
  getDevices,
  type DeviceModeResponse,
} from "./services/api";


import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Devices from "./pages/Devices";
import Cameras from "./pages/Cameras";

import Overview from "./pages/Overview";


import TrafficOverview from "./pages/TrafficOverview";
import NoParking from "./pages/NoParking";
import HelmetCompliance from "./pages/HelmetCompliance";
import WrongWay from "./pages/WrongWay";
import PlateMonitoring from "./pages/PlateMonitoring";


import CrowdOverview from "./pages/CrowdOverview";
import CrowdDensity from "./pages/CrowdDensity";
import CrowdSurge from "./pages/CrowdSurge";
import CrowdFlow from "./pages/CrowdFlow";
import QueueMonitoring from "./pages/QueueMonitoring";


import RoadOverview from "./pages/RoadOverview";
import SurfaceDamage from "./pages/SurfaceDamage";
import PotholeSurvey from "./pages/PotholeSurvey";
import RoadCondition from "./pages/RoadCondition";
import InspectionMission from "./pages/InspectionMission";


import SafetyOverview from "./pages/SafetyOverview";
import SafetyZones from "./pages/SafetyZones";
import EmergencyAccess from "./pages/EmergencyAccess";


import Missions from "./pages/Missions";
import MapIntelligence from "./pages/MapIntelligence";
import Reports from "./pages/Reports";


import "./App.css";


type SidebarLink = {
  label: string;
  to: string;
};


const PRIMARY_EDGE_DEVICE_UID =
  "rpi-01";


function SidebarSection({
  title,
  links,
}: {
  title: string;
  links: SidebarLink[];
}) {
  return (
    <div className="sidebar-section">

      <div className="sidebar-section-title">
        {title}
      </div>


      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `sidebar-subitem ${
              isActive
                ? "active"
                : ""
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}

    </div>
  );
}


function ApplicationShell() {

  const {
    user,
    token,
    logout,
  } = useAuth();


  const [
    deviceId,
    setDeviceId,
  ] = useState<number | null>(
    null,
  );


  const [
    activeMode,
    setActiveMode,
  ] = useState<DeviceModeResponse | null>(
    null,
  );


  const [
    modeLoading,
    setModeLoading,
  ] = useState(true);


  async function loadMode(
    activeToken: string,
    cancelled?: {
      value: boolean;
    },
  ) {
    const devices =
      await getDevices(
        activeToken,
      );


    const device =
      devices.find(
        (item) =>
          item.device_uid ===
          PRIMARY_EDGE_DEVICE_UID,
      ) || devices[0];


    if (!device) {
      throw new Error(
        "No edge device is registered.",
      );
    }


    const response =
      await getDeviceMode(
        device.id,
        activeToken,
      );


    if (
      cancelled &&
      cancelled.value
    ) {
      return;
    }


    setDeviceId(
      device.id,
    );

    setActiveMode(
      response,
    );
  }


  useEffect(() => {

    const cancelState = {
      value: false,
    };


    async function initialize() {

      if (!token) {
        setDeviceId(null);
        setActiveMode(null);
        setModeLoading(false);
        return;
      }


      try {
        setModeLoading(true);

        await loadMode(
          token,
          cancelState,
        );

      } catch {
        if (
          !cancelState.value
        ) {
          setDeviceId(null);
          setActiveMode(null);
        }

      } finally {
        if (
          !cancelState.value
        ) {
          setModeLoading(false);
        }
      }
    }


    initialize();


    return () => {
      cancelState.value = true;
    };

  }, [token]);


  useEffect(() => {

    if (
      !token ||
      deviceId === null
    ) {
      return;
    }


    let cancelled = false;


    const interval =
      window.setInterval(
        async () => {

          try {

            const response =
              await getDeviceMode(
                deviceId,
                token,
              );


            if (!cancelled) {
              setActiveMode(
                response,
              );
            }

          } catch {
            /*
             * Keep the last known
             * model visible.
             */
          }

        },
        5000,
      );


    return () => {
      cancelled = true;

      window.clearInterval(
        interval,
      );
    };

  }, [
    token,
    deviceId,
  ]);


  function handleModeChanged(
    response: DeviceModeResponse,
  ) {
    setActiveMode(
      response,
    );
  }


  return (
    <div className="app-shell">


      <aside className="sidebar">


        <div className="sidebar-brand">

          <div className="brand-mark">
            AV
          </div>


          <div>
            <strong>
              AeroVision
            </strong>

            <span>
              Mobility Intelligence
            </span>
          </div>

        </div>


        <nav className="sidebar-nav">


          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar-item ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            Overview
          </NavLink>


          <SidebarSection
            title="Traffic Intelligence"
            links={[
              {
                label:
                  "Traffic Overview",
                to: "/traffic",
              },
              {
                label:
                  "No-Parking Zone",
                to:
                  "/traffic/no-parking",
              },
              {
                label:
                  "Helmet Compliance",
                to:
                  "/traffic/helmet",
              },
              {
                label:
                  "Wrong-Way Monitoring",
                to:
                  "/traffic/wrong-way",
              },
              {
                label:
                  "Plate Monitoring",
                to:
                  "/traffic/plates",
              },
            ]}
          />


          <SidebarSection
            title="Crowd & Mobility"
            links={[
              {
                label:
                  "Crowd Overview",
                to: "/crowd",
              },
              {
                label:
                  "Crowd Density",
                to:
                  "/crowd/density",
              },
              {
                label:
                  "Crowd Surge Detection",
                to:
                  "/crowd/surge",
              },
              {
                label:
                  "Crowd Flow",
                to:
                  "/crowd/flow",
              },
              {
                label:
                  "Queue Monitoring",
                to:
                  "/crowd/queues",
              },
            ]}
          />


          <SidebarSection
            title="Road Intelligence"
            links={[
              {
                label:
                  "Road Overview",
                to: "/road",
              },
              {
                label:
                  "Surface Damage",
                to:
                  "/road/damage",
              },
              {
                label:
                  "Pothole Survey",
                to:
                  "/road/potholes",
              },
              {
                label:
                  "Road Condition",
                to:
                  "/road/condition",
              },
              {
                label:
                  "Inspection Mission",
                to:
                  "/road/missions",
              },
            ]}
          />


          <SidebarSection
            title="Mobility Safety"
            links={[
              {
                label:
                  "Safety Overview",
                to:
                  "/safety",
              },
              {
                label:
                  "Safety Zones",
                to:
                  "/safety/zones",
              },
              {
                label:
                  "Emergency Access",
                to:
                  "/safety/emergency",
              },
            ]}
          />


          <NavLink
            to="/missions"
            className={({ isActive }) =>
              `sidebar-item ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            Missions
          </NavLink>


          <NavLink
            to="/map"
            className={({ isActive }) =>
              `sidebar-item ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            Map Intelligence
          </NavLink>


          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `sidebar-item ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            Reports
          </NavLink>


          {user?.role === "ADMIN" && (

            <div className="sidebar-section">

              <div className="sidebar-section-title">
                Administration
              </div>


              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `sidebar-subitem ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                User Management
              </NavLink>


              <NavLink
                to="/admin/devices"
                className={({ isActive }) =>
                  `sidebar-subitem ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                Device Management
              </NavLink>


              <NavLink
                to="/admin/cameras"
                className={({ isActive }) =>
                  `sidebar-subitem ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                Camera Management
              </NavLink>

            </div>

          )}

        </nav>


        <div className="sidebar-bottom">


          <div className="logged-user">

            <div className="user-avatar">
              {user?.full_name
                ?.charAt(0)
                .toUpperCase()}
            </div>


            <div>

              <strong>
                {user?.full_name}
              </strong>

              <span>
                {user?.role}
              </span>

            </div>

          </div>


          <button
            className="logout-button"
            onClick={logout}
          >
            Sign out
          </button>

        </div>

      </aside>


      <main className="main-content">


        <header className="topbar">


          <div className="topbar-left">

            <div className="topbar-heading">

              <span className="topbar-title">
                AeroVision
              </span>

              <span className="topbar-divider">
                /
              </span>

              <span className="topbar-context">
                Mobility Intelligence
              </span>

            </div>

          </div>


          <div className="system-status">

            <span className="status-dot" />

            System Online

          </div>

        </header>


        {modeLoading && (
          <div className="page-mode-loading">
            Loading active model...
          </div>
        )}


        {!modeLoading &&
          token &&
          deviceId !== null && (

            <PageModelControl
              deviceId={
                deviceId
              }
              token={token}
              mode={
                activeMode
              }
              onModeChanged={
                handleModeChanged
              }
            />

          )}


        <Routes>


          <Route
            path="/"
            element={
              <Overview />
            }
          />


          <Route
            path="/traffic"
            element={
              <TrafficOverview />
            }
          />


          <Route
            path="/traffic/no-parking"
            element={
              <NoParking />
            }
          />


          <Route
            path="/traffic/helmet"
            element={
              <HelmetCompliance />
            }
          />


          <Route
            path="/traffic/wrong-way"
            element={
              <WrongWay />
            }
          />


          <Route
            path="/traffic/plates"
            element={
              <PlateMonitoring />
            }
          />


          <Route
            path="/crowd"
            element={
              <CrowdOverview />
            }
          />


          <Route
            path="/crowd/density"
            element={
              <CrowdDensity />
            }
          />


          <Route
            path="/crowd/surge"
            element={
              <CrowdSurge />
            }
          />


          <Route
            path="/crowd/flow"
            element={
              <CrowdFlow />
            }
          />


          <Route
            path="/crowd/queues"
            element={
              <QueueMonitoring />
            }
          />


          <Route
            path="/road"
            element={
              <RoadOverview />
            }
          />


          <Route
            path="/road/damage"
            element={
              <SurfaceDamage />
            }
          />


          <Route
            path="/road/potholes"
            element={
              <PotholeSurvey />
            }
          />


          <Route
            path="/road/condition"
            element={
              <RoadCondition />
            }
          />


          <Route
            path="/road/missions"
            element={
              <InspectionMission />
            }
          />


          <Route
            path="/safety"
            element={
              <SafetyOverview />
            }
          />


          <Route
            path="/safety/zones"
            element={
              <SafetyZones />
            }
          />


          <Route
            path="/safety/emergency"
            element={
              <EmergencyAccess />
            }
          />


          <Route
            path="/missions"
            element={
              <Missions />
            }
          />


          <Route
            path="/map"
            element={
              <MapIntelligence />
            }
          />


          <Route
            path="/reports"
            element={
              <Reports />
            }
          />


          <Route
            path="/admin"
            element={
              <Admin />
            }
          />


          <Route
            path="/admin/devices"
            element={
              <Devices />
            }
          />


          <Route
            path="/admin/cameras"
            element={
              <Cameras />
            }
          />


          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />


        </Routes>


      </main>

    </div>
  );
}


export default function App() {

  return (
    <BrowserRouter>

      <AuthProvider>

        <Routes>


          <Route
            path="/login"
            element={
              <Login />
            }
          />


          <Route
            element={
              <ProtectedRoute />
            }
          >

            <Route
              path="/*"
              element={
                <ApplicationShell />
              }
            />

          </Route>


        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}
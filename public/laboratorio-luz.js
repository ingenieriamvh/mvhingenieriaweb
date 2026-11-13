(function startMvhLightingLab() {
  "use strict";

  const tabs = Array.from(document.querySelectorAll("[data-lab-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-lab-panel]"));
  const city = document.querySelector("[data-weather-city]");
  const refresh = document.querySelector("[data-weather-refresh]");
  const useLocation = document.querySelector("[data-use-location]");
  const status = document.querySelector("[data-weather-status]");
  const place = document.querySelector("[data-weather-place]");
  const time = document.querySelector("[data-weather-time]");
  const daylight = document.querySelector("[data-weather-daylight]");
  const timeline = document.querySelector("[data-solar-timeline]");
  let activeLocation = null;
  let refreshTimer;

  function activatePanel(code, moveFocus = false) {
    const selected = tabs.find((tab) => tab.dataset.labTab === code) ?? tabs[0];
    if (!selected) return;

    tabs.forEach((tab) => {
      const active = tab === selected;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.labPanel !== selected.dataset.labTab;
    });
    if (moveFocus) selected.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      const code = tab.dataset.labTab;
      window.history.replaceState(null, "", `#${code}`);
      activatePanel(code);
    });
    tab.addEventListener("keydown", (event) => {
      let target = index;
      if (event.key === "ArrowRight") target = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") target = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") target = 0;
      else if (event.key === "End") target = tabs.length - 1;
      else return;
      event.preventDefault();
      const next = tabs[target];
      window.history.replaceState(null, "", `#${next.dataset.labTab}`);
      activatePanel(next.dataset.labTab, true);
    });
  });

  function selectedLocation() {
    const [latitude, longitude, label] = city.value.split("|");
    return {
      latitude: Number(latitude),
      longitude: Number(longitude),
      label,
    };
  }

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  }

  function number(value, digits = 0) {
    if (!Number.isFinite(value)) return "—";
    return new Intl.NumberFormat("es-CO", {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(value);
  }

  function clock(value) {
    return value?.includes("T") ? value.split("T")[1].slice(0, 5) : "—";
  }

  function duration(value) {
    if (!Number.isFinite(value)) return "—";
    const hours = Math.floor(value / 3600);
    const minutes = Math.round((value % 3600) / 60);
    return `${hours} h ${String(minutes).padStart(2, "0")} min`;
  }

  function renderTimeline(data) {
    timeline.replaceChildren();
    const times = data.hourly?.time ?? [];
    const radiation = data.hourly?.shortwave_radiation ?? [];
    const clouds = data.hourly?.cloud_cover ?? [];
    const currentHour = `${data.current.time.slice(0, 13)}:00`;
    const start = Math.max(times.findIndex((item) => item >= currentHour), 0);
    const samples = times.slice(start, start + 10).map((item, offset) => ({
      time: item,
      radiation: radiation[start + offset] ?? 0,
      cloud: clouds[start + offset] ?? 0,
    }));
    const maxRadiation = Math.max(...samples.map((item) => item.radiation), 1);

    samples.forEach((sample) => {
      const item = document.createElement("li");
      const bar = document.createElement("span");
      const value = document.createElement("strong");
      const label = document.createElement("small");
      const cloud = document.createElement("i");
      bar.className = "solar-timeline-bar";
      bar.style.setProperty(
        "--solar-level",
        `${Math.max((sample.radiation / maxRadiation) * 100, 3)}%`,
      );
      value.textContent = `${number(sample.radiation)} W/m²`;
      label.textContent = clock(sample.time);
      cloud.textContent = `Nubes ${number(sample.cloud)} %`;
      item.title = `${clock(sample.time)}: radiación global ${number(sample.radiation)} W/m²; nubosidad ${number(sample.cloud)} %.`;
      item.append(bar, value, cloud, label);
      timeline.append(item);
    });
  }

  function renderWeather(data, location) {
    const current = data.current ?? {};
    const daily = data.daily ?? {};
    const daylightSeconds = daily.daylight_duration?.[0];
    const sunshineSeconds = daily.sunshine_duration?.[0];
    const sunShare =
      Number.isFinite(daylightSeconds) && daylightSeconds > 0
        ? (sunshineSeconds / daylightSeconds) * 100
        : null;

    place.textContent = location.label;
    time.textContent = `${current.time?.replace("T", " · ") ?? "—"} · ${data.timezone_abbreviation ?? data.timezone ?? "hora local"}`;
    daylight.textContent = current.is_day === 1 ? "Periodo diurno" : "Periodo nocturno";
    setText('[data-weather-value="temperature"]', `${number(current.temperature_2m, 1)} °C`);
    setText('[data-weather-value="humidity"]', `${number(current.relative_humidity_2m)} %`);
    setText('[data-weather-value="cloud"]', `${number(current.cloud_cover)} %`);
    setText('[data-weather-value="precipitation"]', `${number(current.precipitation, 1)} mm`);
    setText('[data-weather-value="wind"]', `${number(current.wind_speed_10m, 1)} km/h`);
    setText('[data-weather-value="ghi"]', `${number(current.shortwave_radiation)} W/m²`);
    setText('[data-weather-value="dni"]', `${number(current.direct_normal_irradiance)} W/m²`);
    setText('[data-weather-value="dhi"]', `${number(current.diffuse_radiation)} W/m²`);
    setText('[data-weather-daily="sunrise"]', clock(daily.sunrise?.[0]));
    setText('[data-weather-daily="sunset"]', clock(daily.sunset?.[0]));
    setText('[data-weather-daily="daylight"]', duration(daylightSeconds));
    setText('[data-weather-daily="sunshine"]', duration(sunshineSeconds));
    setText('[data-weather-daily="sunshare"]', Number.isFinite(sunShare) ? `${number(sunShare)} %` : "—");
    setText('[data-weather-daily="radiationSum"]', `${number(daily.shortwave_radiation_sum?.[0], 1)} MJ/m²`);
    renderTimeline(data);
  }

  async function loadWeather(location = selectedLocation()) {
    if (!status || !place) return;
    activeLocation = location;
    status.textContent = "Consultando la información ambiental más reciente…";
    status.dataset.state = "loading";
    refresh.disabled = true;

    const query = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      current:
        "temperature_2m,relative_humidity_2m,cloud_cover,precipitation,wind_speed_10m,shortwave_radiation,direct_normal_irradiance,diffuse_radiation,is_day",
      hourly:
        "shortwave_radiation,direct_normal_irradiance,diffuse_radiation,cloud_cover",
      daily:
        "sunrise,sunset,daylight_duration,sunshine_duration,shortwave_radiation_sum,uv_index_max",
      timezone: "auto",
      forecast_days: "2",
    });
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`, {
        signal: controller.signal,
        headers: { accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Respuesta ${response.status}`);
      const data = await response.json();
      renderWeather(data, location);
      status.textContent = "Datos actualizados. Próxima actualización automática en aproximadamente 15 minutos.";
      status.dataset.state = "success";
    } catch (error) {
      status.textContent =
        "No fue posible actualizar los datos. Revise la conexión o intente nuevamente; el contenido técnico sigue disponible.";
      status.dataset.state = "error";
    } finally {
      window.clearTimeout(timeout);
      refresh.disabled = false;
    }
  }

  if (city && refresh && useLocation && status) {
    city.addEventListener("change", () => loadWeather(selectedLocation()));
    refresh.addEventListener("click", () => loadWeather(activeLocation ?? selectedLocation()));
    useLocation.addEventListener("click", () => {
      if (!navigator.geolocation) {
        status.textContent = "Este navegador no permite obtener la ubicación. Seleccione una ciudad de referencia.";
        status.dataset.state = "error";
        return;
      }
      status.textContent = "Esperando autorización para usar la ubicación del dispositivo…";
      navigator.geolocation.getCurrentPosition(
        (position) => {
          loadWeather({
            latitude: Number(position.coords.latitude.toFixed(4)),
            longitude: Number(position.coords.longitude.toFixed(4)),
            label: "Ubicación del dispositivo",
          });
        },
        () => {
          status.textContent = "No se obtuvo la ubicación. Puede continuar con una ciudad de referencia.";
          status.dataset.state = "error";
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
      );
    });
    loadWeather(selectedLocation());
    refreshTimer = window.setInterval(() => {
      if (!document.hidden) loadWeather(activeLocation ?? selectedLocation());
    }, 15 * 60 * 1000);
    window.addEventListener("pagehide", () => window.clearInterval(refreshTimer));
  }

  const initialCode = window.location.hash.replace("#", "");
  activatePanel(tabs.some((tab) => tab.dataset.labTab === initialCode) ? initialCode : "ambiente");
})();

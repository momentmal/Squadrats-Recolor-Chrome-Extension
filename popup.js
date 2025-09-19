const editableStyles = {
  "squadrats-paint": ["fill-color", "fill-opacity"],
  "squadratinhos-paint": ["fill-color", "fill-opacity"],
  "squadyard-paint": ["fill-color", "fill-opacity"],
  "squadyardinho-paint": ["fill-color", "fill-opacity"],
  "ubersquadrat-paint": ["line-color", "line-width", "line-opacity"],
  "ubersquadratinho-paint": ["line-color", "line-width", "line-opacity"],
  "new-squadrats-paint": ["fill-color", "fill-opacity"],
  "new-squadratinhos-paint": ["fill-color", "fill-opacity"],
  "squadrats-outline-paint": ["line-color", "line-width", "line-opacity"],
  "squadratinhos-outline-paint": ["line-color", "line-width", "line-opacity"],
  "grid-paint": ["line-color", "line-width", "line-opacity"],
  "gridinho-paint": ["line-color", "line-width", "line-opacity"]
};

const defaultStyles = {
  "squadrats-paint": { "fill-opacity": "0.2", "fill-color": "#aaaaaa" },
  "squadratinhos-paint": { "fill-opacity": "0.5", "fill-color": "#999999" },
  "squadyard-paint": { "opacity": "0", "fill-opacity": "0", "fill-color": "#ffffff" },
  "squadyardinho-paint": { "opacity": "0", "fill-opacity": "0", "fill-color": "#ffbe7c" },
  "ubersquadrat-paint": { "line-width": "2", "line-color": "#ff5500" },
  "ubersquadratinho-paint": { "line-width": "1", "line-color": "#7a4700" },
  "new-squadrats-paint": { "opacity": "0", "fill-opacity": "0.5", "fill-color": "#4cf095" },
  "new-squadratinhos-paint": { "opacity": "0", "fill-opacity": "0.5", "fill-color": "#00fcca" },
  "squadrats-outline-paint": { "line-width": "1", "line-color": "#000000" },
  "squadratinhos-outline-paint": { "line-width": "0.5", "line-color": "#000000", "line-opacity": "0" },
  "grid-paint": { "line-opacity": "0.8", "line-color": "#bbbbbb", "line-width": "1.2" },
  "gridinho-paint": { "line-opacity": "0.8", "line-color": "#bbbbbb", "line-width": "0.7" }
};

const isColorKey = (k) => k.includes("color");
const isOpacityKey = (k) => k.includes("opacity");
const isWidthKey = (k) => k.includes("width");

document.addEventListener("DOMContentLoaded", async () => {
  const editor = document.getElementById("editor");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      try {
        return {
          defaults: window.squadratsStyles || {},
          overrides: JSON.parse(localStorage.getItem("customSquadratsStyles") || "{}"),
          enabled: localStorage.getItem("enableSquadratsOverrides") === "true",
          enabledTypes: JSON.parse(localStorage.getItem("enabledSquadratsTypes") || "[]")
        };
      } catch (e) {
        return { defaults: {}, overrides: {}, enabled: false, error: e.toString() };
      }
    }
  }, ([result]) => {
    if (!result || !result.result) {
      alert("⚠️ Failed to load squadratsStyles from page context.");
      return;
    }

    const { defaults, overrides, enabled, enabledTypes } = result.result;
    document.getElementById("enableOverride").checked = enabled;

    // reflect enabledTypes
    document.getElementById("enableLeaflet").checked = enabledTypes.includes("leaflet-styling");
    document.getElementById("enableMapboxVector").checked = enabledTypes.includes("mapbox-vector-styling");
    document.getElementById("enableMapboxRaster").checked = enabledTypes.includes("mapbox-raster-styling");
    document.getElementById("enableMapboxSatellite").checked = enabledTypes.includes("mapbox-satellite-styling");

    // pick one active group as source of truth for GUI
    const activeType = enabledTypes[0] || "leaflet-styling";
    const defaultsForGUI = defaults[activeType] || {};
    const overridesForGUI = overrides[activeType] || {};

    // build GUI
    for (const key in editableStyles) {
      const group = document.createElement("div");
      group.className = "group";

      const title = document.createElement("h4");
      title.textContent = key;
      group.appendChild(title);

      editableStyles[key].forEach((prop) => {
        const overrideVal = overridesForGUI?.[key]?.[prop];
        const defaultVal = defaultStyles?.[key]?.[prop];
        const value = overrideVal ?? defaultVal;

        const entry = document.createElement("div");
        entry.className = "entry";

        const label = document.createElement("label");
        label.textContent = prop;
        entry.appendChild(label);

        const input = document.createElement("input");
        const valueLabel = document.createElement("span");
        valueLabel.className = "value-label";

        if (isColorKey(prop)) {
          input.type = "color";
          input.value = typeof value === "string" ? value : "#000000";
        } else if (isOpacityKey(prop)) {
          input.type = "range";
          input.min = 0; input.max = 1; input.step = 0.01;
          input.value = parseFloat(value) || 0;
          valueLabel.textContent = input.value;
        } else if (isWidthKey(prop)) {
          input.type = "range";
          input.min = 0; input.max = 10; input.step = 0.1;
          input.value = parseFloat(value) || 0;
          valueLabel.textContent = input.value;
        }

        input.oninput = () => {
          if (!overridesForGUI[key]) overridesForGUI[key] = {};
          const val = input.type === "color" ? input.value : parseFloat(input.value);
          overridesForGUI[key][prop] = val;
          valueLabel.textContent = val;

          // apply into ALL enabled style groups
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (o) => {
              const full = JSON.parse(localStorage.getItem("customSquadratsStyles") || "{}");
              full["universal"] = o;
              localStorage.setItem("customSquadratsStyles", JSON.stringify(full));
            },
            args: [overridesForGUI]
          });
        };

        entry.appendChild(input);
        if (!isColorKey(prop)) entry.appendChild(valueLabel);
        group.appendChild(entry);
      });

      editor.appendChild(group);
    }
  });

  document.getElementById("enableOverride").onchange = (e) => {
    const enabled = e.target.checked;
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (val) => localStorage.setItem("enableSquadratsOverrides", val.toString()),
      args: [enabled]
    });
  };
});

const typeMap = {
  enableLeaflet: "leaflet-styling",
  enableMapboxVector: "mapbox-vector-styling",
  enableMapboxRaster: "mapbox-raster-styling",
  enableMapboxSatellite: "mapbox-satellite-styling"
};

Object.keys(typeMap).forEach(id => {
  const el = document.getElementById(id);
  el.onchange = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (storageKey, checked) => {
          const list = JSON.parse(localStorage.getItem("enabledSquadratsTypes") || "[]");
          if (checked && !list.includes(storageKey)) list.push(storageKey);
          if (!checked) {
            const i = list.indexOf(storageKey);
            if (i > -1) list.splice(i,1);
          }
          localStorage.setItem("enabledSquadratsTypes", JSON.stringify(list));
        },
        args: [typeMap[id], el.checked]
      });
    });
  };
});

document.getElementById("resetColors").onclick = () => {
  if (confirm("Reset all custom coloring?")) {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          localStorage.removeItem("customSquadratsStyles");
          alert("🎨 Custom coloring cleared. Please reload the page.");
        }
      });
    });
  }
};

// Export / Import unchanged
document.getElementById("export").onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // 1) collect stored overrides from all buckets → flat
        const stored = JSON.parse(localStorage.getItem("customSquadratsStyles") || "{}");
        const buckets = ["universal","leaflet-styling","mapbox-vector-styling","mapbox-raster-styling","mapbox-satellite-styling"];
        const flat = {};
        const merge = (src) => {
          if (!src) return;
          for (const layer in src) flat[layer] = Object.assign({}, flat[layer], src[layer]);
        };
        buckets.forEach(k => merge(stored[k]));

        // 2) fill missing props from the effective live styles on the page
        const editable = {
          "squadrats-paint": ["fill-color","fill-opacity"],
          "squadratinhos-paint": ["fill-color","fill-opacity"],
          "squadyard-paint": ["fill-color","fill-opacity"],
          "squadyardinho-paint": ["fill-color","fill-opacity"],
          "ubersquadrat-paint": ["line-color","line-width","line-opacity"],
          "ubersquadratinho-paint": ["line-color","line-width","line-opacity"],
          "new-squadrats-paint": ["fill-color","fill-opacity"],
          "new-squadratinhos-paint": ["fill-color","fill-opacity"],
          "squadrats-outline-paint": ["line-color","line-width","line-opacity"],
          "squadratinhos-outline-paint": ["line-color","line-width","line-opacity"],
          "grid-paint": ["line-color","line-width","line-opacity"],
          "gridinho-paint": ["line-color","line-width","line-opacity"]
        };

        const effective = (window.squadrats && window.squadrats.styles)
          || (window.squadratsStyles && (window.squadratsStyles[(window.squadrats && window.squadrats.colors) || "mapbox-vector-styling"]))
          || {};

        const pickOpacity = (v) => {
          if (typeof v === "number") return v;
          if (Array.isArray(v)) {
            const nums = v.filter(x => typeof x === "number");
            return nums.length ? nums[nums.length - 1] : undefined;
          }
          if (typeof v === "string") {
            const m = v.match(/-?\d+(\.\d+)?/g);
            return m ? parseFloat(m[m.length - 1]) : undefined;
          }
          return undefined;
        };

        for (const layer in editable) {
          const props = editable[layer];
          props.forEach(prop => {
            if (!flat[layer] || flat[layer][prop] === undefined) {
              const live = effective[layer]?.[prop];
              if (live !== undefined) {
                if (!flat[layer]) flat[layer] = {};
                flat[layer][prop] = prop.includes("opacity") ? pickOpacity(live) : String(live);
              }
            }
          });
        }

        return JSON.stringify(flat);
      }
    }, ([res]) => {
      const blob = new Blob([res.result || "{}"], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "squadrats-custom-styles.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  });
};

document.getElementById("import").onclick = () => {
  document.getElementById("fileInput").click();
};

document.getElementById("fileInput").onchange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const json = JSON.parse(event.target.result);
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (data) => {
            try {
              const full = JSON.parse(localStorage.getItem("customSquadratsStyles") || "{}");

              // normalize accepted formats → flat object
              let flat = data;
              if (data && typeof data === "object") {
                if (data.universal) flat = data.universal;
                else if (data["leaflet-styling"] || data["mapbox-vector-styling"] || data["mapbox-raster-styling"] || data["mapbox-satellite-styling"]) {
                  flat = {};
                  ["leaflet-styling","mapbox-vector-styling","mapbox-raster-styling","mapbox-satellite-styling"].forEach(k => {
                    const src = data[k];
                    if (src) for (const layer in src) flat[layer] = Object.assign({}, flat[layer], src[layer]);
                  });
                }
              }

              const TYPES = ["leaflet-styling","mapbox-vector-styling","mapbox-raster-styling","mapbox-satellite-styling"];
              TYPES.forEach(t => { full[t] = flat; });
              full.universal = flat; // kept for future exports

              localStorage.setItem("customSquadratsStyles", JSON.stringify(full));
              alert("✅ Custom styles imported. Reload the page to apply.");
            } catch (e) {
              alert("⚠️ Invalid JSON file.");
            }
          },
          args: [json]
        });
      });
    } catch (e) {
      alert("⚠️ Invalid JSON file.");
    }
  };
  reader.readAsText(file);
};

const editableStyles = {
  "squadrats-paint": ["fill-color", "fill-opacity"],
  "squadratinhos-paint": ["fill-color", "fill-opacity"],
  "squadyard-paint": ["fill-color", "fill-opacity", "opacity"],
  "squadyardinho-paint": ["fill-color", "fill-opacity", "opacity"],
  "ubersquadrat-paint": ["line-color", "line-width"],
  "ubersquadratinho-paint": ["line-color", "line-width"],
  "new-squadrats-paint": ["fill-color", "fill-opacity", "opacity"],
  "new-squadratinhos-paint": ["fill-color", "fill-opacity", "opacity"],
  "squadrats-outline-paint": ["line-color", "line-width"],
  "squadratinhos-outline-paint": ["line-color", "line-opacity", "line-width"],
  "grid-paint": ["line-color", "line-opacity", "line-width"],
  "gridinho-paint": ["line-color", "line-opacity", "line-width"]
};

const defaultStyles = {
  "squadrats-paint": {
    "fill-opacity": "0.2",
    "fill-color": "#aaaaaa"
  },
  "squadratinhos-paint": {
    "fill-opacity": "0.5",
    "fill-color": "#999999"
  },
  "squadyard-paint": {
    "opacity": "0",
    "fill-opacity": "0",
    "fill-color": "#ffffff"
  },
  "squadyardinho-paint": {
    "opacity": "0",
    "fill-opacity": "0",
    "fill-color": "#ffbe7c"
  },
  "ubersquadrat-paint": {
    "line-width": "2",
    "line-color": "#ff5500"
  },
  "ubersquadratinho-paint": {
    "line-width": "1",
    "line-color": "#7a4700"
  },
  "new-squadrats-paint": {
    "opacity": "0",
    "fill-opacity": "0.5",
    "fill-color": "#4cf095"
  },
  "new-squadratinhos-paint": {
    "opacity": "0",
    "fill-opacity": "0.5",
    "fill-color": "#00fcca"
  },
  "squadrats-outline-paint": {
    "line-width": "1",
    "line-color": "#000000"
  },
  "squadratinhos-outline-paint": {
    "line-width": "0.5",
    "line-color": "#000000",
    "line-opacity": "0"
  },
  "grid-paint": {
    "line-opacity": "0.8",
    "line-color": "#bbbbbb",
    "line-width": "1.2"
  },
  "gridinho-paint": {
    "line-opacity": "0.8",
    "line-color": "#bbbbbb",
    "line-width": "0.7"
  }
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
          defaults: window.squadratsStyles?.["leaflet-styling"] || {},
          overrides: JSON.parse(localStorage.getItem("customSquadratsStyles") || "{}")["leaflet-styling"] || {},
          enabled: localStorage.getItem("enableSquadratsOverrides") === "true"
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

    const { defaults, overrides, enabled } = result.result;

    console.log("🎨 GUI initialized with:");
    console.log("defaults:", defaults);
    console.log("overrides:", overrides);
    console.log("enabled:", enabled);
  
    document.getElementById("enableOverride").checked = enabled;
  
    for (const key in editableStyles) {
      const group = document.createElement("div");
      group.className = "group";
  
      const title = document.createElement("h4");
      title.textContent = key;
      group.appendChild(title);
  
      editableStyles[key].forEach((prop) => {
        const overrideVal = overrides?.[key]?.[prop];
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
          input.min = 0;
          input.max = 1;
          input.step = 0.01;
          input.value = parseFloat(value) || 0;
          valueLabel.textContent = input.value;
        } else if (isWidthKey(prop)) {
          input.type = "range";
          input.min = 0;
          input.max = 10;
          input.step = 0.1;
          input.value = parseFloat(value) || 0;
          valueLabel.textContent = input.value;
        }
  
        input.oninput = () => {
          if (!overrides[key]) overrides[key] = {};
          const val = input.type === "color" ? input.value : parseFloat(input.value);
          overrides[key][prop] = val;
          valueLabel.textContent = val;
  
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (o) => {
              const full = JSON.parse(localStorage.getItem("customSquadratsStyles") || "{}");
              full["leaflet-styling"] = o;
              localStorage.setItem("customSquadratsStyles", JSON.stringify(full));
            },
            args: [overrides]
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

document.getElementById("resetColors").onclick = () => {
  if (confirm("Reset all custom coloring?")) {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const full = JSON.parse(localStorage.getItem("customSquadratsStyles") || "{}");
          delete full["leaflet-styling"];
          localStorage.setItem("customSquadratsStyles", JSON.stringify(full));
          alert("🎨 Custom coloring cleared. Please reload the page.");
        }
      });
    });
  }
};

// Export button: downloads localStorage["customSquadratsStyles"] as JSON
document.getElementById("export").onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => localStorage.getItem("customSquadratsStyles")
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

// Import button: loads JSON into localStorage["customSquadratsStyles"]
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
            localStorage.setItem("customSquadratsStyles", JSON.stringify(data));
            alert("✅ Custom styles imported. Reload the page to apply.");
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


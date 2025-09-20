# Squadrats-Recolor-Chrome-Extension
Small Chrome Extension that provides a GUI to recolor Squadrats.com Tiles on BRouter-Web & Komoot

<table>
  <tr>
    <td width="45%">
      <img width="388" height="633" alt="image" src="https://github.com/user-attachments/assets/9c3011a8-5119-4818-bd01-c9d4542b0325" />
    </td>
    <td width="55%">
      <img width="446" height="357" alt="image" src="https://github.com/user-attachments/assets/95ef8588-9545-4f57-abe3-d4317b965e53" />
      <br/>
      <img width="446" height="357" alt="image" src="https://github.com/user-attachments/assets/6f63bbd4-c253-4fcf-965b-98a84605a02e" />
    </td>
  </tr>
</table>

This is based on a quick weekend hack using a lot of AI assisted coding - use at your own risk.
Not intented to harm anyone, just a quick workaround to add custom coloring to the Squadrats Chrome Extension for BRouter-Web (Leaflet) since this is something I found lacking. 
Now also supporting Komoot (Mapbox Vector Style).

## Installation - Minimal setup

- For this extension to work, we need to hook some code to the end of squadratsStyles.js in the original Squadrats Extension:
- <details><summary>>>(CLICK TO EXPAND FOR CODE)<<</summary>
  <pre>
  
  function mergeDeep(target, source) {
      for (const key in source) {
        if (source[key] instanceof Object && key in target) {
          mergeDeep(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
    
    try {
      const enable = localStorage.getItem("enableSquadratsOverrides") === "true";
      if (enable) {
        const overrides = JSON.parse(localStorage.getItem("customSquadratsStyles") || "{}");
        const enabledTypes = JSON.parse(localStorage.getItem("enabledSquadratsTypes") || "[]");
    
        enabledTypes.forEach(type => {
            if (overrides[type] && squadratsStyles[type]) {
                const fixed = {};
                for (const layer in overrides[type]) {
                fixed[layer] = {};
                for (const prop in overrides[type][layer]) {
                    let val = overrides[type][layer][prop];
    
                    if (prop === "fill-opacity" || prop === "line-opacity") {
                    if (type.startsWith("mapbox-")) {
                        // ✅ Handle specific opacity properties for Mapbox
                        const originalValue = squadratsStyles[type][layer]?.[prop];
                        const opacityValue = parseFloat(val);
                        
                        if (typeof originalValue === 'string' && originalValue.includes('interpolate')) {
                            // String format: "['interpolate',['linear'],['zoom'],11,1,14,0.2]"
                            fixed[layer][prop] = `['interpolate',['linear'],['zoom'],0,${opacityValue},22,${opacityValue}]`;
                        } else {
                            // Simple string format: "0.2"
                            fixed[layer][prop] = opacityValue.toString();
                        }
                    } else {
                        // ✅ Apply opacity overrides for Leaflet
                        fixed[layer][prop] = parseFloat(val);
                    }
                    } else if (prop === "fill-color" || prop === "line-color") {
                    // ✅ Always apply custom color
                    val = String(val);
                    fixed[layer][prop] = val;
                    } else if (prop === "line-width") {
                    // ✅ Handle line width
                    fixed[layer][prop] = parseFloat(val);
                    } else if (prop === "opacity") {
                    // ✅ Handle generic opacity (for Leaflet compatibility)
                    if (!type.startsWith("mapbox-")) {
                        fixed[layer][prop] = parseFloat(val);
                    }
                    }
                }
                }
                mergeDeep(squadratsStyles[type], fixed);
                console.log("🎨 Applied overrides for", type);
            }
            });
    
      } else {
        console.log("🎨 Squadrats overrides disabled via toggle");
      }
    } catch (e) {
      console.warn("⚠️ Failed to apply style overrides:", e);
    }
    
    window.squadratsStyles = squadratsStyles;
  </pre>
  </details>

- Only with this hook, the GUI will actually have effect on the coloring.
- For a minimal setup, you then can go ahead and Download the recolor extension provided in this repository (via [Releases](https://github.com/momentmal/Squadrats-Recolor-Chrome-Extension/releases)
- Unzip it and put it in a folder
- Then import it (in Chrome via "Manage Extensions" (Developer Mode) - Import Unpacked)

## Installation - Optional path (how I set it up)

To avoid a self-updating Squadrats Extension, first I copied the original Squadrats.com Extension Files into a custom folder and removed the key in the manifest.json (so it is not confused with the original Extension), deactivated the original extension temporarily for my experiment
- ![image](https://github.com/user-attachments/assets/4462b532-613a-423b-af3e-df74564a2b59)
- Reasoning behind this: The normal installed version can change its path by itself, and Chrome uses some very obscure folder names / paths for maintaining the extensions installed via the chrome web store
- Downside: To update the Squadrats.com extension, you have to occasionally deactivate the manual copy, reactivate the chrome web store version, and transfer the files after the extension has updated. There might be a more elegant way to let the 2 extensions work together.
- I added the code mentioned in the minimal setup above to the end of the squadratsStyles.js in the copy of the original Squadrats.com Extension
- Then I imported the copied original Squadrats extension, so the Extension does not self update and sits in a known location (in Chrome via "Manage Extensions" (Developer Mode) - Import Unpacked)
- Ensure your copied version of the Squadrats Extension still works for you
- Download the recolor extension provided in this repository (via [Releases](https://github.com/momentmal/Squadrats-Recolor-Chrome-Extension/releases))
- Put it in a folder and use the same "Import Unpacked" method in Chrome

## Usage

- Should be self-explaining.
- Note, that you need to refresh the page each time you change something, e.g.:
- Doing color changes
- Toggling the custom styling
- Importing your styling from a file.
- Resetting the custom color styling


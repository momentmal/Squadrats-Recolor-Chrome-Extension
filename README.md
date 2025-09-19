# Squadrats-Recolor-Chrome-Extension
Small Chrome Extension that provides a GUI to recolor Squadrats.com Tiles on BRouter-Web & Komoot

<table>
  <tr>
    <td width="45%">
      <img width="370" height="595" alt="image" src="https://github.com/user-attachments/assets/1f41a638-a2d8-4208-99e0-8f1e4c21d9ed" />
      <!--<img src="https://github.com/user-attachments/assets/121df889-b792-440a-a55d-a4a8a08225a3"/>-->
      <!-- <img src="https://github.com/user-attachments/assets/1619bf1d-dece-4f55-a0e4-251879bf2cd4"/> -->
    </td>
    <td width="55%">
      <img src="https://github.com/user-attachments/assets/10c8a59f-7023-4203-9871-0d068c6e97f6"/>
      <br/>
      <img src="https://github.com/user-attachments/assets/8eeab066-ee2d-4edb-a779-cee8dd9fb368"/>
    </td>
  </tr>
</table>



<!--
| ![image](https://github.com/user-attachments/assets/1619bf1d-dece-4f55-a0e4-251879bf2cd4) | ![image](https://github.com/user-attachments/assets/10c8a59f-7023-4203-9871-0d068c6e97f6) ![image](https://github.com/user-attachments/assets/8eeab066-ee2d-4edb-a779-cee8dd9fb368) |
|-------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
-->

This was a quick weekend hack using a lot of AI assisted coding - use at your own risk.
Not intented to harm anyone, just a quick workaround to add custom coloring to the Squadrats Chrome Extension for BRouter-Web (Leaflet) since this is something I found lacking. 
Now also supporting Komoot (Mapbox Vector Style).

## Installation - How I set it up

- First I copied the original Squadrats.com Extension Files into a custom folder and removed the key in the manifest.json (so it is not confused with the original Extension), deactivated the original extension temporarily for my experiment, and imported the unpacked version, so the Extension does not self update and sits in a known location
- Reasoning behind this: The normal installed version can change its path by itself, and Chrome uses some very obscure folder names / paths for maintaining the extensions installed via the chrome web store
- Downside: To update the Squadrats.com extension, you have to occasionally deactivate the manual copy, reactivate the chrome web store version, and transfer the files after the extension has updated. There might be a more elegant way to let the 2 extensions work together.
- I imported the copied Extension in Chrome via "Manage Extensions" (Developer Mode) - Import Unpacked
- ![image](https://github.com/user-attachments/assets/4462b532-613a-423b-af3e-df74564a2b59)
- I added this code to the end of the squadratsStyles.js in the copy of the original Squadrats.com Extension:

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


- Then I imported my unpacked extension

## Usage

- Should be self-explaining.
- Note, that you need to refresh the page each time you change something, e.g.:
- Doing color changes
- Toggling the custom styling
- Importing your styling from a file.
- Resetting the custom color styling


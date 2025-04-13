# Squadrats-Recolor-Chrome-Extension
Small Chrome Extension that provides a GUI to recolor Squadrats.com Tiles on BRouter-Web

<table>
  <tr>
    <td width="45%">
      <img src="https://github.com/user-attachments/assets/121df889-b792-440a-a55d-a4a8a08225a3"/>
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
Not intented to harm anyone, just a quick workaround to add custom coloring to the Squadrats Chrome Extension since this is something I found lacking.

## Installation - How I set it up

- First I copied the original Squadrats.com Extension Files into a custom folder and removed the key in the manifest.json, deactivated the original extension, and imported the unpacked version, so the Extension does not self update and sits in a known location (the normal installed version can change its path by itself)
- I did this via Chrome in Developer Mode - Manage Extensions - Import Unpacked
- ![image](https://github.com/user-attachments/assets/4462b532-613a-423b-af3e-df74564a2b59)
- I added this code to the end of the squadratsStyles.js in the original Squadrats Extension:

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
      if (overrides["leaflet-styling"]) {
        mergeDeep(squadratsStyles["leaflet-styling"], overrides["leaflet-styling"]);
        console.log("✅ Applied leaflet-styling overrides from localStorage");
      }
    } else {
      console.log("ℹ️ Squadrats overrides disabled via toggle");
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


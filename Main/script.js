import * as ColorThiefModule from './src/color-thief.umd.js';

const colorThief = new ColorThief();

const root = document.documentElement;
let lastAlbumCover = null;

const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}).join('');

function updateDisplay(data) {
    if (data.changed) {
        // console.log('Track changed:', data.current_track_name);
        document.getElementById('track-name').innerText = data.current_track_name;
        document.getElementById('artist').innerText = data.artist;
        
        if (lastAlbumCover !== data.album_cover) {
            const coverElement = document.getElementById("cover");
            coverElement.style.backgroundImage = `url(${data.album_cover})`;
            coverElement.style.backgroundSize = "cover";

            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = data.album_cover;
            img.onload = () => {
                try {
                    const color = colorThief.getColor(img);
                    const palette = colorThief.getPalette(img, 6);
                    // console.log(`Doom Color: ${color}`);
                    // console.log("Color Palette:", palette);
                    root.style.setProperty('--dom-color-shad', `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`);
                    root.style.setProperty('--dom-color', `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`);

                    const [color1, color2, color3, color4, color5, color6] = palette.map(c => `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.8)`);
                    root.style.setProperty('--color1', `${color1}`);
                    root.style.setProperty('--color2', `${color2}`);
                    root.style.setProperty('--color3', `${color3}`);
                    root.style.setProperty('--color4', `${color4}`);
                    root.style.setProperty('--color5', `${color5}`);
                    root.style.setProperty('--color6', `${color6}`);
                } catch (error) {
                    console.error("Color Thief Error:", error);
                }
                img.remove();
            };
            };
            
            lastAlbumCover = data.album_cover;
        }
    }

async function fetchCurrentTrack() {
    const response = await fetch('http://localhost:5000/current_track');
    const data = await response.json();

    if (data.changed) {
        localStorage.setItem('lastTrackData', JSON.stringify(data));
        updateDisplay(data);
    } else {
        const cachedData = localStorage.getItem('lastTrackData');
        if (cachedData) {
            updateDisplay(JSON.parse(cachedData));
        }
    }
}

setInterval(fetchCurrentTrack, 2000);

fetchCurrentTrack();
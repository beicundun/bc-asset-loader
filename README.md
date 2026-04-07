<div style="text-align: center;">
<a href="https://www.beicundun.com/" target="_blank" rel="noopener noreferrer">
  <img src="./library-banner.png" alt="bc-asset-loader library banner" width="100%" height="auto">
</a>
</div>

# bc-asset-loader

A JavaScript library that asynchronously preloads images, fonts, and videos in bulk.
You can read loading progress via the `progress` property, which is useful for progress bars or percentage UIs.
It is well suited when you do not want to show the page until images and fonts have finished downloading, or when you want to prevent layout shift.

---

## Installation

**npm**

```bash
npm install bc-asset-loader
```

**Script tag or CDN (jsDelivr)**

```html
<script src="bc-asset-loader.js"></script>
```

```html
<script src="https://cdn.jsdelivr.net/gh/beicundun/bc-asset-loader@main/dist/bc-asset-loader.js"></script>
```

---

## Demo

From the root of this repository, install dependencies with `npm install`, then run `npm run dev` to start the development server and open the demo.

---

## Usage

### With npm

```typescript
import BcAssetLoader from 'bc-asset-loader';

const loader = new BcAssetLoader({
  image: [
    { url: '/img/hero.jpg' },
    { url: '/img/bg.png' },
  ],
  font: [
    { url: '/fonts/NotoSansJP-Regular.woff2', family: 'Noto Sans JP', weight: '400' },
    { url: '/fonts/NotoSansJP-Bold.woff2', family: 'Noto Sans JP', weight: '700' },
  ],
  extFont: [
    {
      url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700',
      families: [
        { family: 'Roboto', weights: ['400', '700'] },
      ],
    },
  ],
  video: [
    { url: '/video/intro.mp4' },
  ],
  onComplete: () => {
    console.log('All assets loaded');
  },
});

loader.load();

// Update progress bar
const progressBar = document.querySelector('.progress-bar');

requestAnimationFrame(function update() {
  progressBar.style.width = `${loader.progress * 100}%`;
  if (!loader.loaded) requestAnimationFrame(update);
});
```

### With a script tag or CDN (jsDelivr)

```html
<!-- Local file -->
<script src="bc-asset-loader.js"></script>

<!-- CDN (jsDelivr) -->
<script src="https://cdn.jsdelivr.net/gh/beicundun/bc-asset-loader@main/dist/bc-asset-loader.js"></script>

<script>
  const loader = new BcAssetLoader({
    image: [{ url: '/img/hero.jpg' }],
    onComplete: () => {
      console.log('All assets loaded');
    },
  });
  loader.load();
</script>
```

---

## API

### Constructor

```typescript
new BcAssetLoader(options: BcAssetLoaderOptions)
```

#### BcAssetLoaderOptions

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `image` | Array | Optional | List of images to load |
| `font` | Array | Optional | List of self-hosted fonts to load |
| `extFont` | Array | Optional | List of externally hosted fonts (e.g. Google Fonts) to load |
| `video` | Array | Optional | List of videos to load |
| `onComplete` | Function | Optional | Callback invoked when all assets have finished loading |

```typescript
interface BcAssetLoaderOptions {
  image?: {
    url: string;
  }[];
  font?: {
    url: string;
    family: string;
    weight?: string;
    style?: string;
    stretch?: string;
  }[];
  extFont?: {
    url: string;
    families: {
      family: string;
      weights?: string[];
      style?: 'normal' | 'italic';
    }[];
  }[];
  video?: {
    url: string;
  }[];
  onComplete?: () => void;
}
```

---

### Methods

#### `load(): Promise<void>`

Starts loading all assets.  
The `onComplete` callback is invoked after loading completes.

```typescript
await loader.load();
```

---

### Properties

#### `loaded: boolean`

Whether loading has finished for all assets.

#### `loadedAmount: number`

How much has been loaded, as the sum of the following:

| Asset type | When / how much is added |
|------------|--------------------------|
| `image` | `+1` per completed file |
| `font` | `+1` per completed file |
| `extFont` | `+1` when all fonts for one URL are done |
| `video` | Buffered fraction (`0`–`1`) added in real time |

> Only `video` contributes fractional values, so `loadedAmount` is not necessarily an integer.

#### `totalAmount: number`

Total workload, as the sum of the following:

| Asset type | How it is counted |
|------------|-------------------|
| `image` | Number of image files specified |
| `font` | Number of font files specified |
| `extFont` | Number of URLs specified (1 URL = 1) |
| `video` | Number of video files specified |

#### `progress: number`

Loading progress (`0`–`1`), computed as `loadedAmount / totalAmount`.

#### `onComplete: () => void`

Reference to the `onComplete` callback passed to the constructor.

---

## Error handling

- If an individual asset fails to load, an error is logged to the console, that asset is skipped, and loading continues.
- When all load attempts have finished, `loaded` becomes `true` and `onComplete` is called.
- Assets that failed to load are excluded from the `progress` calculation.

---

## TypeScript

Type definitions (`dist/bc-asset-loader.d.ts`) are bundled; no extra install is required.

---

## License

MIT

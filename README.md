# bc-asset-loader

画像・フォント・動画を非同期で一括プリロードする JavaScript ライブラリです。
ロードの進捗を `progress` プロパティで参照でき、プログレスバーやパーセント表示UIの実装に使用できます。

---

## インストール

**npm**

```bash
npm install bc-asset-loader
```

**scriptタグ or CDN（jsDelivr）**

```html
<script src="bc-asset-loader.js"></script>
```

```html
<script src="https://cdn.jsdelivr.net/gh/beicundun/bc-asset-loader@main/dist/bc-asset-loader.js"></script>
```

---

## 使用例

### npm経由での使用

```typescript
import BcAssetLoader from 'bc-asset-loader';

const loader = new BcAssetLoader({
  image: [
    { url: '/img/hero.jpg' },
    { url: '/img/bg.png' },
  ],
  font: [
    { url: '/fonts/NotoSansJP-Regular.woff2', family: 'Noto Sans JP', weight: '400' },
    { url: '/fonts/NotoSansJP-Bold.woff2',    family: 'Noto Sans JP', weight: '700' },
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
    console.log('全アセットのロード完了');
  },
});

loader.load();

// プログレスバーの更新
const progressBar = document.querySelector('.progress-bar');

requestAnimationFrame(function update() {
  progressBar.style.width = `${loader.progress * 100}%`;
  if (!loader.loaded) requestAnimationFrame(update);
});
```

### scriptタグ or CDN（jsDelivr）での使用

```html
<!-- ローカルファイル -->
<script src="bc-asset-loader.js"></script>

<!-- CDN（jsDelivr） -->
<script src="https://cdn.jsdelivr.net/gh/beicundun/bc-asset-loader@main/dist/bc-asset-loader.js"></script>

<script>
  const loader = new BcAssetLoader({
    image: [{ url: '/img/hero.jpg' }],
    onComplete: () => {
      console.log('全アセットのロード完了');
    },
  });
  loader.load();
</script>
```

---

## API

### コンストラクタ

```typescript
new BcAssetLoader(options: BcAssetLoaderOptions)
```

#### BcAssetLoaderOptions

| プロパティ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `image` | 配列 | 任意 | ロードする画像のリスト |
| `font` | 配列 | 任意 | ロードするセルフホストフォントのリスト |
| `extFont` | 配列 | 任意 | ロードする外部ホストフォント（Google Fontsなど）のリスト |
| `video` | 配列 | 任意 | ロードする動画のリスト |
| `onComplete` | 関数 | 任意 | 全アセットのロード完了時に呼ばれるコールバック |

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

### メソッド

#### `load(): Promise<void>`

全アセットのロードを開始する。  
`onComplete` コールバックは、ロード完了後に呼ばれる。

```typescript
await loader.load();
```

---

### プロパティ

#### `loaded: boolean`

全アセットのロードが完了したかどうか。

#### `loadedAmount: number`

ロード済みの量。以下の合計値。

| アセット種別 | 加算タイミング・値 |
|-------------|-----------------|
| `image` | 1ファイル完了ごとに `+1` |
| `font` | 1ファイル完了ごとに `+1` |
| `extFont` | 1URLの全フォントが完了したら `+1` |
| `video` | バッファ済み割合（`0〜1`）をリアルタイムで加算 |

> `video` のみ小数になるため、`loadedAmount` は整数とは限らない。

#### `totalAmount: number`

アセットの総量。以下の合計値。

| アセット種別 | カウント方法 |
|-------------|------------|
| `image` | 指定した画像ファイルの数 |
| `font` | 指定したフォントファイルの数 |
| `extFont` | 指定した URL の数（1URL = 1） |
| `video` | 指定した動画ファイルの数 |

#### `progress: number`

ロードの進捗（`0〜1`）。`loadedAmount / totalAmount` で計算される。

#### `onComplete: () => void`

コンストラクタで渡した `onComplete` コールバックへの参照。

---

## エラーハンドリング

- 個別アセットのロードが失敗した場合、コンソールにエラーを出力し、そのアセットをスキップして残りのロードを続行する。
- 全アセットのロード試行が完了した時点で `loaded = true` となり `onComplete` が呼ばれる。
- ロード失敗したアセットは `progress` の計算から除外される。

---

## TypeScript

型定義ファイル（`dist/bc-asset-loader.d.ts`）が同梱されています。追加インストールは不要です。

---

## ライセンス

MIT

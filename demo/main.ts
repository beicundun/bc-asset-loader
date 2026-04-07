import BcAssetLoader from 'bc-asset-loader';

const progressBar = document.getElementById('progressBar') as HTMLDivElement;
const progressPercent = document.getElementById('progressPercent') as HTMLParagraphElement;
const loading = document.getElementById('loading') as HTMLDivElement;
const content = document.getElementById('content') as HTMLElement;

const loader = new BcAssetLoader({
  image: [{ url: '/images/image1.jpg' }, { url: '/images/image2.jpg' }],
  font: [
    {
      url: '/fonts/TickingTimebombBB_ital.ttf',
      family: 'TickingTimebombBB',
      style: 'italic',
      weight: '400',
    },
  ],
  extFont: [
    {
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Roboto:ital,wght@0,100..900;1,100..900&family=Shippori+Mincho&family=Silkscreen:wght@400;700&display=swap',
      families: [
        { family: 'Noto Sans JP', weights: ['400', '700'] },
        { family: 'Roboto Mono', weights: ['400', '700'], style: 'italic' },
        { family: 'Roboto', weights: ['400', '700'] },
        { family: 'Shippori Mincho', weights: ['400'] },
        { family: 'Silkscreen', weights: ['400', '700'] },
      ],
    },
  ],
  video: [{ url: '/videos/IMG_8400.mp4' }],
  onComplete: () => {
    console.log('全アセットのロード完了');
    setTimeout(() => {
      loading.classList.add('is-hidden');
    }, 1000);
    setTimeout(() => {
      content.classList.add('is-loaded');
    }, 1000);
  },
});

// requestAnimationFrame でプログレスバーとパーセント表示UIをリアルタイム更新する
function updateProgress() {
  const percent = Math.round(loader.progress * 100);
  progressBar.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;

  if (!loader.loaded) {
    requestAnimationFrame(updateProgress);
  }
}

requestAnimationFrame(updateProgress);
loader.load();

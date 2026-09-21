// ============================================================
// ONEKO.JS — Pixelated Cat That Follows The Cursor
// Classic Neko cat animation with sleep, scratch, run, and alert states
// ============================================================

(function oneko() {
  const isReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isReducedMotion) return;

  const nekoEl = document.createElement('div');
  let nekoPosX = 64;
  let nekoPosY = 64;
  let mousePosX = 64;
  let mousePosY = 64;
  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;
  const nekoSpeed = 12;

  // Sprite mapping (x, y offsets in 32x32 frames)
  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    scratchWallN: [
      [0, 0],
      [0, -1],
    ],
    scratchWallS: [
      [-7, -1],
      [-6, -2],
    ],
    scratchWallE: [
      [-2, -2],
      [-2, -3],
    ],
    scratchWallW: [
      [-4, 0],
      [-4, -1],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };

  function init() {
    nekoEl.id = 'oneko';
    nekoEl.ariaHidden = 'true';
    nekoEl.style.width = '32px';
    nekoEl.style.height = '32px';
    nekoEl.style.position = 'fixed';
    nekoEl.style.pointerEvents = 'none';
    nekoEl.style.imageRendering = 'pixelated';
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
    nekoEl.style.zIndex = '999999';
    nekoEl.style.backgroundImage = "url('img/oneko.gif')";
    nekoEl.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))';
    nekoEl.style.transition = 'opacity 0.2s';

    document.body.appendChild(nekoEl);

    window.addEventListener('mousemove', function (event) {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    });

    window.requestAnimationFrame(onAnimationFrame);
  }

  let lastFrameTimestamp = 0;

  function onAnimationFrame(timestamp) {
    if (!nekoEl.isConnected) return;
    if (!lastFrameTimestamp) lastFrameTimestamp = timestamp;
    if (timestamp - lastFrameTimestamp > 90) {
      lastFrameTimestamp = timestamp;
      frame();
    }
    window.requestAnimationFrame(onAnimationFrame);
  }

  function setSprite(name, frameIdx) {
    if (!spriteSets[name] || !spriteSets[name].length) return;
    const sprite = spriteSets[name][frameIdx % spriteSets[name].length];
    if (!sprite) return;
    nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;

    // Trigger random idle behavior
    if (
      idleTime > 8 &&
      Math.floor(Math.random() * 150) === 0 &&
      idleAnimation === null
    ) {
      const available = ['sleeping', 'scratchSelf'];
      if (nekoPosX < 40) available.push('scratchWallW');
      if (nekoPosY < 40) available.push('scratchWallN');
      if (nekoPosX > window.innerWidth - 40) available.push('scratchWallE');
      if (nekoPosY > window.innerHeight - 40) available.push('scratchWallS');
      idleAnimation = available[Math.floor(Math.random() * available.length)];
    }

    switch (idleAnimation) {
      case 'sleeping':
        if (idleAnimationFrame < 8) {
          setSprite('tired', 0);
          break;
        }
        setSprite('sleeping', Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 180) {
          resetIdleAnimation();
        }
        break;
      case 'scratchWallN':
      case 'scratchWallS':
      case 'scratchWallE':
      case 'scratchWallW':
      case 'scratchSelf':
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite('idle', 0);
        return;
    }
    idleAnimationFrame += 1;
  }

  function frame() {
    frameCount += 1;
    const diffX = nekoPosX - mousePosX;
    const diffY = nekoPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    // If close enough to cursor, switch to idle
    if (distance < nekoSpeed || distance < 42) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    // Cat looks alert before taking off
    if (idleTime > 1) {
      setSprite('alert', 0);
      idleTime = Math.min(idleTime, 5);
      idleTime -= 1;
      return;
    }

    let direction = '';
    direction += diffY / distance > 0.5 ? 'N' : '';
    direction += diffY / distance < -0.5 ? 'S' : '';
    direction += diffX / distance > 0.5 ? 'W' : '';
    direction += diffX / distance < -0.5 ? 'E' : '';
    if (!direction) direction = 'S';

    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;

    // Clamp within window bounds
    nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
    nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);

    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
  }

  // Global toggle function
  window.toggleOneko = function (show) {
    if (show === undefined) {
      nekoEl.style.display = nekoEl.style.display === 'none' ? 'block' : 'none';
    } else {
      nekoEl.style.display = show ? 'block' : 'none';
    }
    return nekoEl.style.display !== 'none';
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

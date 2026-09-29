import React, { useEffect, useRef } from 'react';

/**
 * CosmicStarfield Component
 *
 * Implements an authentic, sparse night sky inspired by real observational astronomy:
 * - Reduced from hundreds of noise-like dots to a curated, realistic sparse sky (~60 stars total).
 * - Real recognizable constellations & asterisms:
 *     1. Ursa Major (The Big Dipper) with pointer stars aligning toward Polaris
 *     2. Polaris (The North Star)
 *     3. Cassiopeia (The iconic celestial 'W')
 *     4. Orion (The Hunter with Betelgeuse, Rigel, and the iconic 3-star Belt)
 *     5. Pleiades (The Seven Sisters cluster with subtle blue nebulosity)
 *     6. Prominent night sky landmarks: Sirius, Vega, Arcturus
 * - Accurate astronomical magnitudes: brilliant 1st magnitude beacons with soft diffuse halos,
 *   crisp 2nd/3rd magnitude guide stars, and delicate faint background pinpricks.
 * - Realistic stellar spectral classifications (Class B ice-blue, Class A diamond-white,
 *   Class G warm ivory, Class M topaz amber).
 * - Whisper-subtle planetarium constellation lines guiding celestial recognition.
 * - Organic atmospheric scintillation (gentle multi-frequency twinkling).
 * - Rare, authentic shooting stars (every 15–25 seconds).
 */
const CosmicStarfield = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Stellar color temperatures
    const COLOR_PALETTES = {
      diamondWhite: 'rgba(255, 255, 255, ',
      iceBlue: 'rgba(186, 230, 253, ',
      warmWhite: 'rgba(254, 252, 232, ',
      amber: 'rgba(253, 186, 116, ',
      faintWhite: 'rgba(226, 232, 240, ',
    };

    let allStars = [];
    let constellationLines = [];
    let pleiadesCenter = { x: 0, y: 0 };
    const meteors = [];
    let framesUntilNextMeteor = Math.floor(Math.random() * 600 + 400);

    const initSky = () => {
      allStars = [];
      constellationLines = [];

      // -----------------------------------------------------------------------
      // 1. Ursa Major (The Big Dipper / Saptarishi)
      // Placed in the upper-left cosmic sky
      // -----------------------------------------------------------------------
      const bigDipperDefs = [
        { name: 'Alkaid', u: 0.09, v: 0.22, mag: 1.8, color: 'iceBlue' },
        { name: 'Mizar', u: 0.13, v: 0.19, mag: 2.1, color: 'diamondWhite' },
        { name: 'Alioth', u: 0.17, v: 0.17, mag: 1.7, color: 'diamondWhite' },
        { name: 'Megrez', u: 0.21, v: 0.16, mag: 3.2, color: 'faintWhite' },
        { name: 'Phecda', u: 0.22, v: 0.22, mag: 2.3, color: 'warmWhite' },
        { name: 'Merak', u: 0.26, v: 0.20, mag: 2.2, color: 'diamondWhite' },
        { name: 'Dubhe', u: 0.26, v: 0.14, mag: 1.8, color: 'amber' },
      ];

      const bigDipperStars = bigDipperDefs.map((def) => ({
        x: def.u * width,
        y: def.v * height,
        name: def.name,
        radius: def.mag <= 2 ? 1.4 : 1.0,
        baseAlpha: 0.85,
        twinkleSpeed: 0.012 + Math.random() * 0.008,
        phase: Math.random() * Math.PI * 2,
        colorBase: COLOR_PALETTES[def.color],
        hasHalo: def.mag <= 2,
        haloRadius: def.mag <= 2 ? 5 : 0,
      }));

      allStars.push(...bigDipperStars);

      // Ursa Major connecting lines (handle + bowl)
      const dipperSegments = [
        [0, 1], // Alkaid -> Mizar
        [1, 2], // Mizar -> Alioth
        [2, 3], // Alioth -> Megrez
        [3, 4], // Megrez -> Phecda
        [4, 5], // Phecda -> Merak
        [5, 6], // Merak -> Dubhe
        [6, 3], // Dubhe -> Megrez (closes the bowl)
      ];

      dipperSegments.forEach(([from, to]) => {
        constellationLines.push({
          p1: bigDipperStars[from],
          p2: bigDipperStars[to],
        });
      });

      // -----------------------------------------------------------------------
      // 2. Polaris (The North Star) - pointed to by Merak -> Dubhe pointer line
      // -----------------------------------------------------------------------
      const polarisStar = {
        name: 'Polaris',
        x: 0.35 * width,
        y: 0.08 * height,
        radius: 1.6,
        baseAlpha: 0.9,
        twinkleSpeed: 0.008,
        phase: 1.2,
        colorBase: COLOR_PALETTES.warmWhite,
        hasHalo: true,
        haloRadius: 7,
      };
      allStars.push(polarisStar);

      // Faint alignment pointer line from Dubhe to Polaris
      constellationLines.push({
        p1: bigDipperStars[6], // Dubhe
        p2: polarisStar,
        isPointer: true,
      });

      // -----------------------------------------------------------------------
      // 3. Cassiopeia (The Cosmic 'W')
      // Placed across the upper-right sky
      // -----------------------------------------------------------------------
      const cassiopeiaDefs = [
        { name: 'Caph', u: 0.62, v: 0.13, mag: 2.2, color: 'warmWhite' },
        { name: 'Schedar', u: 0.66, v: 0.09, mag: 2.1, color: 'amber' },
        { name: 'Navi', u: 0.70, v: 0.14, mag: 2.0, color: 'iceBlue' },
        { name: 'Ruchbah', u: 0.74, v: 0.08, mag: 2.5, color: 'diamondWhite' },
        { name: 'Segin', u: 0.78, v: 0.12, mag: 3.1, color: 'iceBlue' },
      ];

      const cassiopeiaStars = cassiopeiaDefs.map((def) => ({
        x: def.u * width,
        y: def.v * height,
        name: def.name,
        radius: def.mag <= 2.2 ? 1.4 : 1.0,
        baseAlpha: 0.85,
        twinkleSpeed: 0.01 + Math.random() * 0.01,
        phase: Math.random() * Math.PI * 2,
        colorBase: COLOR_PALETTES[def.color],
        hasHalo: def.mag <= 2.2,
        haloRadius: def.mag <= 2.2 ? 5 : 0,
      }));

      allStars.push(...cassiopeiaStars);

      // 'W' connecting lines
      for (let i = 0; i < cassiopeiaStars.length - 1; i++) {
        constellationLines.push({
          p1: cassiopeiaStars[i],
          p2: cassiopeiaStars[i + 1],
        });
      }

      // -----------------------------------------------------------------------
      // 4. Orion (The Hunter with Betelgeuse, Rigel & Iconic 3-Star Belt)
      // Placed in lower-center sky
      // -----------------------------------------------------------------------
      const orionDefs = [
        { name: 'Betelgeuse', u: 0.44, v: 0.62, mag: 0.4, color: 'amber', prominent: true },
        { name: 'Bellatrix', u: 0.52, v: 0.61, mag: 1.6, color: 'iceBlue' },
        { name: 'Alnitak', u: 0.47, v: 0.71, mag: 1.9, color: 'iceBlue' },
        { name: 'Alnilam', u: 0.485, v: 0.70, mag: 1.7, color: 'iceBlue' },
        { name: 'Mintaka', u: 0.50, v: 0.69, mag: 2.1, color: 'iceBlue' },
        { name: 'Saiph', u: 0.45, v: 0.81, mag: 2.0, color: 'iceBlue' },
        { name: 'Rigel', u: 0.53, v: 0.80, mag: 0.1, color: 'iceBlue', prominent: true },
      ];

      const orionStars = orionDefs.map((def) => ({
        x: def.u * width,
        y: def.v * height,
        name: def.name,
        radius: def.prominent ? 2.1 : def.mag <= 1.8 ? 1.5 : 1.1,
        baseAlpha: 0.92,
        twinkleSpeed: 0.014 + Math.random() * 0.01,
        phase: Math.random() * Math.PI * 2,
        colorBase: COLOR_PALETTES[def.color],
        hasHalo: true,
        haloRadius: def.prominent ? 9 : 4.5,
        hasSpikes: def.prominent,
      }));

      allStars.push(...orionStars);

      // Orion skeleton lines
      const orionSegments = [
        [0, 1], // Betelgeuse -> Bellatrix (shoulders)
        [0, 2], // Betelgeuse -> Alnitak
        [1, 4], // Bellatrix -> Mintaka
        [2, 3], // Belt: Alnitak -> Alnilam
        [3, 4], // Belt: Alnilam -> Mintaka
        [2, 5], // Alnitak -> Saiph
        [4, 6], // Mintaka -> Rigel
        [5, 6], // Saiph -> Rigel (feet)
      ];

      orionSegments.forEach(([from, to]) => {
        constellationLines.push({
          p1: orionStars[from],
          p2: orionStars[to],
        });
      });

      // -----------------------------------------------------------------------
      // 5. Pleiades (The Seven Sisters - Tight compact celestial cluster)
      // Placed in upper mid-sky with soft blue reflection nebulosity
      // -----------------------------------------------------------------------
      pleiadesCenter = { x: 0.48 * width, y: 0.16 * height };
      const pleiadesOffsets = [
        { dx: 0, dy: 0, r: 1.1 },
        { dx: 4, dy: -3, r: 0.9 },
        { dx: -5, dy: 3, r: 0.8 },
        { dx: 7, dy: 4, r: 0.75 },
        { dx: -2, dy: -5, r: 0.85 },
        { dx: 5, dy: 7, r: 0.7 },
      ];

      pleiadesOffsets.forEach((p) => {
        allStars.push({
          x: pleiadesCenter.x + p.dx,
          y: pleiadesCenter.y + p.dy,
          radius: p.r,
          baseAlpha: 0.75,
          twinkleSpeed: 0.015,
          phase: Math.random() * Math.PI * 2,
          colorBase: COLOR_PALETTES.iceBlue,
          hasHalo: false,
        });
      });

      // -----------------------------------------------------------------------
      // 6. Prominent Navigational Beacons (Brightest Stars in Sky)
      // -----------------------------------------------------------------------
      const landmarkDefs = [
        { name: 'Sirius', u: 0.36, v: 0.79, color: 'diamondWhite', r: 2.2, halo: 10 },
        { name: 'Vega', u: 0.54, v: 0.28, color: 'iceBlue', r: 2.0, halo: 9 },
        { name: 'Arcturus', u: 0.16, v: 0.48, color: 'amber', r: 1.9, halo: 8 },
      ];

      landmarkDefs.forEach((def) => {
        allStars.push({
          name: def.name,
          x: def.u * width,
          y: def.v * height,
          radius: def.r,
          baseAlpha: 0.95,
          twinkleSpeed: 0.018,
          phase: Math.random() * Math.PI * 2,
          colorBase: COLOR_PALETTES[def.color],
          hasHalo: true,
          haloRadius: def.halo,
          hasSpikes: true,
        });
      });

      // -----------------------------------------------------------------------
      // 7. Sparse Faint Field Stars (~28 faint pinpricks filling cosmic depth)
      // -----------------------------------------------------------------------
      const FIELD_STAR_COUNT = 28;
      // Predefined pseudo-natural distribution across sky zones to avoid artificial cluttering
      for (let i = 0; i < FIELD_STAR_COUNT; i++) {
        // Natural uneven distribution
        const u = ((i * 37 + 13) % 97) / 100;
        const v = ((i * 53 + 7) % 89) / 100;

        allStars.push({
          x: u * width,
          y: v * height,
          radius: Math.random() * 0.4 + 0.55, // tiny pinpricks (0.55 - 0.95px)
          baseAlpha: Math.random() * 0.35 + 0.25, // gentle soft glow
          twinkleSpeed: Math.random() * 0.015 + 0.005,
          phase: Math.random() * Math.PI * 2,
          colorBase: Math.random() > 0.4 ? COLOR_PALETTES.faintWhite : COLOR_PALETTES.iceBlue,
          hasHalo: false,
        });
      }
    };

    initSky();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initSky();
    };

    window.addEventListener('resize', handleResize);

    // Rare natural meteor / shooting star
    const spawnMeteor = () => {
      framesUntilNextMeteor--;
      if (framesUntilNextMeteor <= 0) {
        meteors.push({
          x: Math.random() * (width * 0.6) + width * 0.2,
          y: Math.random() * (height * 0.35),
          length: Math.random() * 85 + 55,
          speed: Math.random() * 8 + 11,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          alpha: 1,
          decay: 0.018,
        });
        // Set next meteor arrival to 15 - 28 seconds (at 60fps = 900 - 1700 frames)
        framesUntilNextMeteor = Math.floor(Math.random() * 800 + 900);
      }
    };

    let tick = 0;

    const render = () => {
      tick++;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Pleiades subtle blue reflection nebula
      if (pleiadesCenter.x > 0) {
        const pleiadesGlow = ctx.createRadialGradient(
          pleiadesCenter.x,
          pleiadesCenter.y,
          0,
          pleiadesCenter.x,
          pleiadesCenter.y,
          24
        );
        pleiadesGlow.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
        pleiadesGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = pleiadesGlow;
        ctx.beginPath();
        ctx.arc(pleiadesCenter.x, pleiadesCenter.y, 24, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw whisper-subtle constellation lines (Planetarium sky chart style)
      ctx.save();
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.11)';
      ctx.setLineDash([3, 4]); // Elegant starry dashed constellation lines
      ctx.beginPath();
      constellationLines.forEach((line) => {
        if (!line.isPointer) {
          ctx.moveTo(line.p1.x, line.p1.y);
          ctx.lineTo(line.p2.x, line.p2.y);
        }
      });
      ctx.stroke();

      // Subtle pointer line from Dubhe to Polaris
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
      ctx.setLineDash([2, 5]);
      ctx.beginPath();
      constellationLines
        .filter((l) => l.isPointer)
        .forEach((line) => {
          ctx.moveTo(line.p1.x, line.p1.y);
          ctx.lineTo(line.p2.x, line.p2.y);
        });
      ctx.stroke();
      ctx.restore();

      // 3. Render Stars with realistic scintillation & astronomical magnitudes
      for (let i = 0; i < allStars.length; i++) {
        const s = allStars[i];

        // Atmospheric multi-frequency scintillation (real natural twinkle)
        const twinkle =
          0.8 +
          0.18 * Math.sin(tick * s.twinkleSpeed + s.phase) +
          0.08 * Math.cos(tick * s.twinkleSpeed * 1.7 + s.phase * 1.5);
        const alpha = Math.max(0.12, Math.min(1, s.baseAlpha * twinkle));

        // Soft atmospheric halo for bright stars
        if (s.hasHalo && s.haloRadius > 0) {
          const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.haloRadius);
          halo.addColorStop(0, `${s.colorBase}${alpha * 0.35})`);
          halo.addColorStop(0.6, `${s.colorBase}${alpha * 0.12})`);
          halo.addColorStop(1, `${s.colorBase}0)`);
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.haloRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star Core (pinpoint diamond disk)
        ctx.fillStyle = `${s.colorBase}${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // Delicate stellar diffraction spikes for brightest stars (Sirius, Vega, Rigel, Betelgeuse)
        if (s.hasSpikes && alpha > 0.7) {
          const spikeLen = s.radius * 3.8;
          ctx.strokeStyle = `${s.colorBase}${alpha * 0.28})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - spikeLen, s.y);
          ctx.lineTo(s.x + spikeLen, s.y);
          ctx.moveTo(s.x, s.y - spikeLen);
          ctx.lineTo(s.x, s.y + spikeLen);
          ctx.stroke();
        }
      }

      // 4. Handle rare natural shooting stars
      spawnMeteor();

      for (let m = meteors.length - 1; m >= 0; m--) {
        const meteor = meteors[m];
        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;
        meteor.alpha -= meteor.decay;

        if (meteor.alpha <= 0 || meteor.x > width || meteor.y > height) {
          meteors.splice(m, 1);
          continue;
        }

        const tailX = meteor.x - Math.cos(meteor.angle) * meteor.length;
        const tailY = meteor.y - Math.sin(meteor.angle) * meteor.length;

        const grad = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.7, `rgba(186, 230, 253, ${meteor.alpha * 0.6})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${meteor.alpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(meteor.x, meteor.y);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="cosmic-starfield-canvas" aria-hidden="true" />;
};

export default CosmicStarfield;

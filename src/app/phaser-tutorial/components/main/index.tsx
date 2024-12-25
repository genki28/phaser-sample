'use client';

import { useEffect, useRef } from 'react';

export const PhaserTutorialMain = () => {
  const gameArea = useRef(null);

  useEffect(() => {
    const makeGame = async () => {
      if (!gameArea.current) {
        return;
      }

      const phaser = await import('phaser');
      const { Main } = await import('../../game/Main');

      const config: Phaser.Types.Core.GameConfig = {
        title: 'Phaser Tutorial',
        width: 800,
        height: 600,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 300 },
            debug: false,
          },
        },
        parent: gameArea.current,
        scene: Main,
      };

      new phaser.Game(config);
    };

    makeGame();
  }, []);

  return <div ref={gameArea}></div>;
};

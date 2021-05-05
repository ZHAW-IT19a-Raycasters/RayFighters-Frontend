/**
 * Sound class. Makes it easy to play sound.
 */
export class Sound {
    /**
     * Singleton instance
     */
    private static instance: Sound;
    private static readonly SHOOT_SOUND_EFFECT_PATH = './assets/audio/9mm.mp3';
    private static readonly VOLUME_CUTOFF = 20;
    private shootAudio: any;

    /**
     * Private constructor. Initializes sounds.
     */
    private constructor() {
        this.shootAudio = new Audio(Sound.SHOOT_SOUND_EFFECT_PATH);
    }

    /**
     * Plays the shoot sound effect.
     * @param volume how loud the sound plays. Ranges from 0 to 1.
     */
    public shoot(volume: number) {
        if (volume > 1) {
            volume = 1;
        }
        if (volume < 0) {
            volume = 0;
        }
        let audioNode = <HTMLAudioElement>this.shootAudio.cloneNode();
        audioNode.volume = volume;
        audioNode.play();
        document.getElementById('debug-window').innerText = "bang! (" + volume + ")";
    }

    /**
     * Calculates an ideal volume curve for sounds that have been triggered somewhere else on the map.
     * @param distance Amount of distance between {@link Player} and {@link Enemy}.
     * @returns Volume,ranging between 0 and 1. 
     */
    public distanceToVolume(distance: number) {
        if (distance < 1)
          distance = 1
      
        // Full volume at distances 1 or closer
        // Logarithmically dropping off to 0 at VOLUME_CUTOFF
        return -(Math.log(distance) / Math.log(Sound.VOLUME_CUTOFF)) + 1;
      }

    /**
     * Singleton getter, enabling singleton pattern.
     * @returns a singleton {@link Sound} instance.
     */
    public static get get(): Sound {
        if (!Sound.instance) {
            Sound.instance = new Sound();
        }

        return Sound.instance;
    }
}
/**
 * Sound class. Makes it easy to play sound.
 */
export class Sound {
    /**
     * Singleton instance
     */
    private static instance: Sound;
    private static readonly SHOOT_SOUND_EFFECT_PATH = './assets/audio/9mm.mp3';
    private shootAudio: any;

    /**
     * Private constructor. Initializes sounds.
     */
    private constructor(){
        this.shootAudio = new Audio(Sound.SHOOT_SOUND_EFFECT_PATH);
    }

    /**
     * Plays the shoot sound effect.
     * @param volume how loud the sound plays. Ranges from 0 to 1.
     */
    public shoot(volume: number) {
        this.shootAudio.volume = volume;
        (<HTMLAudioElement>this.shootAudio.cloneNode()).play();
    }

    /**
     * Singleton getter, enabling singleton pattern.
     * @returns a singleton ProtocolParser instance.
     */
     public static get get(): Sound {
        if (!Sound.instance) {
            Sound.instance = new Sound();
        }

        return Sound.instance;
    }
}
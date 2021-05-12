/**
 * Type of sound effect. Needed for organizing the {@link Sound} system.
 */
export enum SoundType {
    SHOOT,
    STEP,
    DEATH
}

/**
 * Sound class. Makes it easy to play sound.
 */
export class Sound {
    /**
     * Singleton instance
     */
    private static instance: Sound;

    /**
     * Determines after which distance the sound is dampened completely.
     */
    private static readonly VOLUME_CUTOFF = 20;

    /**
     * Maximum volume of steps. Ranges between 0 and 1.
     */
    public static readonly STEP_MAX_VOLUME = 0.25;
    
    /**
     * Map of audio files.
     */
    private audioMap: Map<SoundType, HTMLAudioElement>;

    /**
     * Array of footstep sound {@link HTMLAudioElement} instances.
     */
    private stepSounds: Array<HTMLAudioElement>;

    /**
     * Private constructor. Initializes sounds.
     */
    private constructor() {
        // Prepare regular sound map.
        this.audioMap = new Map<SoundType, HTMLAudioElement>();
        this.audioMap.set(SoundType.SHOOT, new Audio('./assets/audio/9mm.mp3'));
        this.audioMap.set(SoundType.DEATH, new Audio('./assets/audio/death.wav'));

        // Prepare footstep sound array.
        this.stepSounds = new Array<HTMLAudioElement>();
        this.stepSounds.push(new Audio('./assets/audio/step_1.wav'));
        this.stepSounds.push(new Audio('./assets/audio/step_2.wav'));
        this.stepSounds.push(new Audio('./assets/audio/step_3.wav'));
        this.stepSounds.push(new Audio('./assets/audio/step_4.wav'));
        this.stepSounds.push(new Audio('./assets/audio/step_5.wav'));
    }

    /**
     * Plays the shoot sound effect.
     * @param volume how loud the sound plays. Ranges from 0 to 1.
     */
    public play(type: SoundType, volume: number) {
        let audio; 
        if(volume <= 0) {
            return;
        }
        
        // Differentiate if the sound is a step sound
        if (type === SoundType.STEP) {
            const randomIndex = Math.floor(Math.random() * this.stepSounds.length);
            // Shuffle random number based on array length
            audio = <HTMLAudioElement> this.stepSounds[randomIndex].cloneNode();
            if (volume > Sound.STEP_MAX_VOLUME) {
                audio.volume = Sound.STEP_MAX_VOLUME;
            }
        } else {
            // In case it is a regular sound
            audio = <HTMLAudioElement>this.audioMap.get(type).cloneNode();
            if (volume > 1) {
                audio.volume = 1.;
            }
        }
        audio.play();
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
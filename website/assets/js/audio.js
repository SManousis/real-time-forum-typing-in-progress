export class AudioManager {
    constructor(samplePaths, poolSize = 1) {
        this.context = new AudioContext();
        this.samplePaths = samplePaths;
        this.sampleBuffers = {};
        this.pools = {};
        this.poolSize = poolSize;
        this.cooldowns = {};
        this.sources = []
        this.locks = {};
        this.sounds = false;
        this.volume = 1;
    }

    async loadSamples() {
        const entries = Object.entries(this.samplePaths);
        for (const [name, url] of entries) {
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
                }

                const arrayBuffer = await res.arrayBuffer();
                const buffer = await this.context.decodeAudioData(arrayBuffer);
                this.sampleBuffers[name] = buffer;

                this.pools[name] = new Array(this.poolSize).fill().map(() => ({
                    playing: false,
                }));
            } catch (err) {
                console.error(`Error loading sample "${name}" from ${url}:`, err);
                this.sampleBuffers[name] = null;
                this.pools[name] = [];
            }
        }
    }


    async playSample(name, { gain = 1.0, throttleMs = 500 } = {}) {
        if (!this.sounds) return;
        // console.log("playSample called with:", name)
        if (!this.locks) this.locks = {};

        if (this.locks[name]) return;
        this.locks[name] = true;

        try {
            const buffer = this.sampleBuffers[name];
            // console.log(!buffer);
            if (!buffer) return;

            const now = Date.now();
            if (throttleMs > 0 && this.cooldowns[name] && now - this.cooldowns[name] < throttleMs) {
                return;
            }
            this.cooldowns[name] = now;

            const pool = this.pools[name];
            let slot = pool.find(s => !s.playing);
            if (!slot) {
                let oldest = pool.reduce((a, b) => (a.started < b.started ? a : b));
                if (oldest.source) {
                    try {
                        oldest.source.stop();
                    } catch (e) {
                        // silently ignore if already stopped
                    }
                }
                oldest.playing = false;
                slot = oldest;
            }

            const source = this.context.createBufferSource();
            const gainNode = this.context.createGain();

            source.buffer = buffer;
            gainNode.gain.value = gain;

            source.connect(gainNode).connect(this.context.destination);
            source.start(this.context.currentTime);

            slot.started = this.context.currentTime;
            slot.playing = true;
            slot.source = source;
            source.onended = () => {
                slot.playing = false;
            };
        } finally {
            this.locks[name] = false;
        }
    }


    killSamples() {
        for (const name in this.pools) {
            const slots = this.pools[name];

            slots.forEach(slot => {
                if (slot.playing && slot.source) {
                    try {
                        slot.source.stop();
                    } catch (e) {
                        console.warn(`Failed to stop ${name} slot`, e);
                    }
                    slot.playing = false;
                }
            });
        }
    }


    async resume() {
        if (this.context.state === "suspended") {
            await this.context.resume();
        }
    }
}

export const audio = {
    manager: new AudioManager({
        DmAlert: "./assets/audio/DmAlert.mp3",
        PostAlert: "./assets/audio/PostAlert.mp3",
    }, 1),
    initialized: false,
    setUp: async function () {
        this.manager.resume();
        await this.manager.loadSamples();
    }
}



class UpliftFace {
    constructor(options = {}) {
        this.target = options.target;
        this.audio = options.audio;
        this.status = options.status || null;
        this.opennessDisplay = options.openness || null;

        this.voiceId = options.voiceId || "street-vendor";

        this.attackMs = options.attackMs ?? 35;
        this.releaseMs = options.releaseMs ?? 130;
        this.noiseFloor = options.noiseFloor ?? 0.02;

        this.canvas = this.target;
        this.ctx = this.canvas.getContext("2d");

        this.lipSync = null;

        this.sprites = [];
        this.spritePaths = [
            "/assets/street-vendor/street_vendor_closed.png",
            "/assets/street-vendor/street_vendor_half.png",
            "/assets/street-vendor/street_vendor_open.png"
        ];
    }

    async init() {
        await this.loadSprites();

        this.drawFace(0);

        this.lipSync = new LipSyncEngine(this.audio, {
            attackMs: this.attackMs,
            releaseMs: this.releaseMs,
            noiseFloor: this.noiseFloor,

            onUpdate: (openness) => {
                if (this.opennessDisplay) {
                    this.opennessDisplay.textContent =
                        `Openness: ${openness.toFixed(2)}`;
                }

                this.drawFace(openness);
            }
        });

        await this.lipSync.attach();

        return this;
    }

    loadSprites() {
        return Promise.all(
            this.spritePaths.map((path) => {
                return new Promise((resolve, reject) => {
                    const image = new Image();

                    image.onload = () => resolve(image);
                    image.onerror = () => {
                        reject(
                            new Error(`Failed to load sprite: ${path}`)
                        );
                    };

                    image.src = path;
                });
            })
        ).then((sprites) => {
            this.sprites = sprites;
        });
    }

    drawFace(openness) {
        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        let spriteIndex;

        if (openness < 0.34) {
            spriteIndex = 0;
        } else if (openness < 0.67) {
            spriteIndex = 1;
        } else {
            spriteIndex = 2;
        }

        const sprite = this.sprites[spriteIndex];

        if (!sprite) {
            return;
        }

        const maxWidth = 260;
        const maxHeight = 285;

        const scale = Math.min(
            maxWidth / sprite.naturalWidth,
            maxHeight / sprite.naturalHeight
        );

        const width = sprite.naturalWidth * scale;
        const height = sprite.naturalHeight * scale;

        const x = (this.canvas.width - width) / 2;
        const y = (this.canvas.height - height) / 2;

        this.ctx.drawImage(
            sprite,
            x,
            y,
            width,
            height
        );
    }

    async speak(text) {
        const cleanText = text.trim();

        if (!cleanText) {
            throw new Error("Please enter some text.");
        }

        if (this.status) {
            this.status.textContent = "Generating speech...";
        }

        const response = await fetch("/speak", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: cleanText,
                voiceId: this.voiceId
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        this.audio.src = audioUrl;

        await this.audio.play();

        if (this.status) {
            this.status.textContent =
                "Speech generated successfully.";
        }
    }

    static async init(options = {}) {
        const face = new UpliftFace(options);

        await face.init();

        return face;
    }
}
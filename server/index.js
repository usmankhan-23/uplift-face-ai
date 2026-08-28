require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.post("/speak", async (req, res) => {
    const {
        text,
        voiceId = "street-vendor"
    } = req.body;

    if (!text || typeof text !== "string") {
        return res.status(400).json({
            error: "text is required"
        });
    }

    try {
        const upliftRes = await fetch(
            "https://api.upliftai.org/v1/synthesis/text-to-speech",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.UPLIFTAI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    voiceId,
                    text,
                    outputFormat: "MP3_22050_128"
                })
            }
        );

        if (!upliftRes.ok) {
            const errorText = await upliftRes.text();

            console.error("Uplift API error:", errorText);

            return res.status(upliftRes.status).json({
                error: "Uplift API request failed",
                details: errorText
            });
        }

        const audioBuffer = Buffer.from(
            await upliftRes.arrayBuffer()
        );

        const audioDuration = upliftRes.headers.get(
            "x-uplift-ai-audio-duration"
        );

        res.setHeader("Content-Type", "audio/mpeg");

        if (audioDuration) {
            res.setHeader(
                "X-Uplift-AI-Audio-Duration",
                audioDuration
            );
        }

        res.send(audioBuffer);

    } catch (err) {
        console.error("Server error:", err);

        res.status(500).json({
            error: "TTS request failed"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Uplift Faces server listening on ${PORT}`);
});
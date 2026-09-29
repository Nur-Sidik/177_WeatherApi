const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/lokasi", async (req, res) => {
    const kota = req.query.kota || "Yogyakarta"; // Default kota jika tidak ada query parameter
    const apiKey = "wRLhuMj7jvBhnNzkBV90"; // API Key MapTiler
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(kota)}.json?key=${apiKey}&language=id`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (!data.features || data.features.length === 0) {
            return res.status(404).json({ message: "Lokasi tidak ditemukan" });
        }

        const feature = data.features[0];
        const [longitude, latitude] = feature.geometry.coordinates;

        // Ekstraksi negara, provinsi, dan kecamatan/kota
        let negara = "-";
        let provinsi = "-";
        let kecamatan = feature.text || "-";

        if (feature.context) {
            feature.context.forEach(ctx => {
                if (ctx.id.startsWith("country")) negara = ctx.text;
                if (ctx.id.startsWith("region") || ctx.id.startsWith("province")) provinsi = ctx.text;
                if (ctx.id.startsWith("district") || ctx.id.startsWith("locality") || ctx.id.startsWith("subdistrict")) {
                    kecamatan = ctx.text;
                }
            });
        }

        res.json({
            negara: negara,
            provinsi: provinsi,

        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Gagal mengambil data dari MapTiler" });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
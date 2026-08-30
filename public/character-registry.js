(function () {
    const characters = Object.freeze([
        Object.freeze({
            id: "street-vendor",
            name: "Street Vendor",
            voiceId: "street-vendor",
            description: "Warm Pakistani street vendor",
            language: "Urdu",
            category: "Everyday",
            sprites: Object.freeze({
                closed: "/assets/street-vendor/street_vendor_closed.png",
                half: "/assets/street-vendor/street_vendor_half.png",
                open: "/assets/street-vendor/street_vendor_open.png"
            })
        })
    ]);

    window.UPLIFT_CHARACTERS = characters;

    window.getUpliftCharacter = function getUpliftCharacter(id) {
        return characters.find((character) => character.id === id) || null;
    };
})();

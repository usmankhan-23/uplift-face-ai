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
        }),

        Object.freeze({
            id: "dada-jee",
            name: "Dada Jee",
            voiceId: "crisp-storyteller",
            description: "Wise elderly Pakistani storyteller",
            language: "Urdu",
            category: "Elder",
            sprites: Object.freeze({
                closed: "/assets/dada-jee/closed.png",
                half: "/assets/dada-jee/half.png",
                open: "/assets/dada-jee/open.png"
            })
        }),

        Object.freeze({
            id: "young-student",
            name: "Young Pakistani Student",
            voiceId: "nazimabad-boy",
            description: "Friendly young Pakistani university student",
            language: "Urdu",
            category: "Student",
            sprites: Object.freeze({
                closed: "/assets/young-student/closed.png",
                half: "/assets/young-student/half.png",
                open: "/assets/young-student/open.png"
            })
        })
    ]);

    window.UPLIFT_CHARACTERS = characters;

    window.getUpliftCharacter = function getUpliftCharacter(id) {
        return characters.find(
            (character) => character.id === id
        ) || null;
    };
})();

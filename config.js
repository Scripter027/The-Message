window.AppConfig = {
    allApps: {
        trash: { id: "trash", nameRu: "Корзина", nameEn: "Recycle Bin", icon: "🗑️", type: "system" },
        explorer: { id: "explorer", nameRu: "Проводник", nameEn: "File Explorer", icon: "📁", type: "system" },
        store: { id: "store", nameRu: "Магазин", nameEn: "App Store", icon: "🏪", type: "system" },
        tetris: { id: "tetris", nameRu: "Тетрис", nameEn: "Tetris", icon: "🧱", type: "game" },
        dino: { id: "dino", nameRu: "Динозаврик", nameEn: "Dino Game", icon: "🦖", type: "game" }
    },
    state: {
        installed: ["trash", "explorer", "store"],
        positions: {},
        trashContents: []
    },
    save: function() {
        localStorage.setItem("desktop_app_state", JSON.stringify(this.state));
    },
    load: function() {
        const saved = localStorage.getItem("desktop_app_state");
        if (saved) {
            try {
                this.state = JSON.parse(saved);
            } catch (e) {
                this.save();
            }
        } else {
            this.save();
        }
    },
    resetToDesktopDefault: function() {
        this.state.installed = ["trash", "explorer", "store"];
        this.state.positions = {};
        this.state.trashContents = [];
        this.save();
    }
};
window.AppConfig.load();

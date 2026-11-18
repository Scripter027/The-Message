window.AppConfig = {
    allApps: {
        trash: { id: "trash", nameRu: "Корзина", nameEn: "Recycle Bin", icon: "🗑️", type: "system" },
        explorer: { id: "explorer", nameRu: "Проводник", nameEn: "File Explorer", icon: "📁", type: "system" },
        store: { id: "store", nameRu: "Магазин", nameEn: "App Store", icon: "🏪", type: "system" },
        notes: { id: "notes", nameRu: "Заметки", nameEn: "Notes", icon: "📝", type: "system" },
        homework: { id: "homework", nameRu: "Школа ДЗ", nameEn: "School HW", icon: "📚", type: "system" },
        nethack: { id: "nethack", nameRu: "Шлюз 4x4", nameEn: "Gateway 4x4", icon: "🔌", type: "system" },
        tetris: { id: "tetris", nameRu: "Тетрис", nameEn: "Tetris", icon: "🧱", type: "game" },
        dino: { id: "dino", nameRu: "Динозаврик", nameEn: "Dino Game", icon: "🦖", type: "game" },
        minesweeper: { id: "minesweeper", nameRu: "Сапёр", nameEn: "Minesweeper", icon: "💣", type: "game" },
        messenger: { id: "messenger", nameRu: "Mess", nameEn: "Mess", icon: "💬", type: "system" }
    },
    state: {
        installed: ["trash", "explorer", "store", "notes", "minesweeper"],
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
        this.state.installed = ["trash", "explorer", "store", "notes", "minesweeper"];
        this.state.positions = {};
        this.state.trashContents = [];
        this.save();
    },
    setupChapterOneMode: function() {
        this.state.installed = ["trash", "explorer", "messenger", "store", "notes", "homework"];
        this.state.positions = {};
        this.state.trashContents = [];
    }
};
window.AppConfig.load();

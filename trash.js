(function() {
    const windowTrash = document.getElementById('windowTrash');
    const btnCloseTrash = document.getElementById('btnCloseTrash');
    const btnClearTrash = document.getElementById('btnClearTrash');
    const trashContainer = document.getElementById('trashContainer');

    window.initTrashApp = function() {
        windowTrash.classList.remove('hidden');
        renderTrashContents();
    };

    btnCloseTrash.addEventListener('click', () => {
        windowTrash.classList.add('hidden');
    });

    btnClearTrash.addEventListener('click', () => {
        if (window.AppConfig.state.trashContents.length === 0) return;

        window.AppConfig.state.trashContents.forEach(appId => {
            const indexInInstalled = window.AppConfig.state.installed.indexOf(appId);
            if (indexInInstalled !== -1) {
                window.AppConfig.state.installed.splice(indexInInstalled, 1);
            }
            if (window.AppConfig.state.positions[appId]) {
                delete window.AppConfig.state.positions[appId];
            }
            if (window.AppConfig.state.lastPositions && window.AppConfig.state.lastPositions[appId]) {
                delete window.AppConfig.state.lastPositions[appId];
            }
        });

        window.AppConfig.state.trashContents = [];
        window.AppConfig.save();
        
        renderTrashContents();
        if (window.renderDesktopIcons) window.renderDesktopIcons();
        if (window.renderExplorerContents) window.renderExplorerContents();
    });

    function renderTrashContents() {
        trashContainer.innerHTML = '';
        const lang = document.documentElement.lang || 'ru';

        if (window.AppConfig.state.trashContents.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.style.color = '#00ff66';
            emptyEl.style.opacity = '0.5';
            emptyEl.style.padding = '10px';
            emptyEl.textContent = lang === 'ru' ? 'Корзина пуста' : 'Trash is empty';
            trashContainer.appendChild(emptyEl);
            return;
        }

        window.AppConfig.state.trashContents.forEach(appId => {
            const appData = window.AppConfig.allApps[appId];
            if (!appData) return;

            const itemEl = document.createElement('div');
            itemEl.style.display = 'flex';
            itemEl.style.justifyContent = 'space-between';
            itemEl.style.alignItems = 'center';
            itemEl.style.padding = '10px';
            itemEl.style.borderBottom = '1px solid rgba(0, 255, 102, 0.2)';

            const infoEl = document.createElement('div');
            infoEl.style.display = 'flex';
            infoEl.style.gap = '15px';
            infoEl.style.color = '#00ff66';

            const iconEl = document.createElement('span');
            iconEl.textContent = appData.icon;

            const nameEl = document.createElement('span');
            nameEl.textContent = lang === 'ru' ? appData.nameRu : appData.nameEn;

            infoEl.appendChild(iconEl);
            infoEl.appendChild(nameEl);

            const restoreBtn = document.createElement('button');
            restoreBtn.style.background = 'transparent';
            restoreBtn.style.border = '1px solid #00ff66';
            restoreBtn.style.color = '#00ff66';
            restoreBtn.style.padding = '5px 10px';
            restoreBtn.style.cursor = 'pointer';
            restoreBtn.style.fontFamily = 'Russo One, sans-serif';
            restoreBtn.style.fontSize = '0.8rem';
            restoreBtn.textContent = lang === 'ru' ? 'Восстановить' : 'Restore';

            restoreBtn.addEventListener('click', () => {
                const index = window.AppConfig.state.trashContents.indexOf(appId);
                if (index !== -1) {
                    window.AppConfig.state.trashContents.splice(index, 1);
                    if (window.restoreAppPosition) {
                        window.restoreAppPosition(appId);
                    } else {
                        window.AppConfig.save();
                    }
                    renderTrashContents();
                    if (window.renderDesktopIcons) window.renderDesktopIcons();
                    if (window.renderExplorerContents) window.renderExplorerContents();
                }
            });

            itemEl.appendChild(infoEl);
            itemEl.appendChild(restoreBtn);
            trashContainer.appendChild(itemEl);
        });
    }

    window.moveAppToTrash = function(appId) {
        const appData = window.AppConfig.allApps[appId];
        if (!appData || appData.type === 'system') return;

        if (!window.AppConfig.state.trashContents.includes(appId)) {
            if (!window.AppConfig.state.lastPositions) {
                window.AppConfig.state.lastPositions = {};
            }
            if (!window.AppConfig.state.lastPositions[appId] && window.AppConfig.state.positions[appId]) {
                window.AppConfig.state.lastPositions[appId] = { ...window.AppConfig.state.positions[appId] };
            }
            window.AppConfig.state.trashContents.push(appId);
            window.AppConfig.save();
            if (window.renderDesktopIcons) window.renderDesktopIcons();
            if (window.renderExplorerContents) window.renderExplorerContents();
            if (!windowTrash.classList.contains('hidden')) renderTrashContents();
        }
    };
})();

(function() {
    const windowStore = document.getElementById('windowStore');
    const btnCloseStore = document.getElementById('btnCloseStore');
    const storeContainer = document.getElementById('storeContainer');

    window.initStoreApp = function() {
        windowStore.classList.remove('hidden');
        renderStoreContents();
    };

    btnCloseStore.addEventListener('click', () => {
        windowStore.classList.add('hidden');
    });

    function renderStoreContents() {
        storeContainer.innerHTML = '';
        const lang = document.documentElement.lang || 'ru';

        Object.keys(window.AppConfig.allApps).forEach(appId => {
            const appData = window.AppConfig.allApps[appId];
            if (appData.type === 'system') return;

            const itemEl = document.createElement('div');
            itemEl.style.display = 'flex';
            itemEl.style.justifyContent = 'space-between';
            itemEl.style.alignItems = 'center';
            itemEl.style.padding = '12px';
            itemEl.style.borderBottom = '1px solid rgba(0, 255, 102, 0.2)';

            const infoEl = document.createElement('div');
            infoEl.style.display = 'flex';
            infoEl.style.gap = '15px';
            infoEl.style.color = '#00ff66';

            const iconEl = document.createElement('span');
            iconEl.style.fontSize = '1.2rem';
            iconEl.textContent = appData.icon;

            const nameEl = document.createElement('span');
            nameEl.style.alignSelf = 'center';
            nameEl.textContent = lang === 'ru' ? appData.nameRu : appData.nameEn;

            infoEl.appendChild(iconEl);
            infoEl.appendChild(nameEl);
            itemEl.appendChild(infoEl);

            const actionBtn = document.createElement('button');
            actionBtn.style.background = 'transparent';
            actionBtn.style.padding = '6px 12px';
            actionBtn.style.cursor = 'pointer';
            actionBtn.style.fontFamily = 'Russo One, sans-serif';
            actionBtn.style.fontSize = '0.8rem';

            const isInstalled = window.AppConfig.state.installed.includes(appId);
            const isInTrash = window.AppConfig.state.trashContents.includes(appId);

            if (isInTrash) {
                actionBtn.style.border = '1px solid #ffaa00';
                actionBtn.style.color = '#ffaa00';
                actionBtn.textContent = lang === 'ru' ? 'Вернуть' : 'Restore';
                actionBtn.addEventListener('click', () => {
                    const index = window.AppConfig.state.trashContents.indexOf(appId);
                    if (index !== -1) {
                        window.AppConfig.state.trashContents.splice(index, 1);
                        window.AppConfig.save();
                        renderStoreContents();
                        if (window.renderDesktopIcons) window.renderDesktopIcons();
                        if (window.renderExplorerContents) window.renderExplorerContents();
                    }
                });
            } else if (isInstalled) {
                actionBtn.style.border = '1px solid rgba(0, 255, 102, 0.4)';
                actionBtn.style.color = 'rgba(0, 255, 102, 0.4)';
                actionBtn.style.cursor = 'default';
                actionBtn.textContent = lang === 'ru' ? 'Скачано' : 'Installed';
            } else {
                actionBtn.style.border = '1px solid #00ff66';
                actionBtn.style.color = '#00ff66';
                actionBtn.textContent = lang === 'ru' ? 'Скачать' : 'Get';
                actionBtn.addEventListener('click', () => {
                    window.AppConfig.state.installed.push(appId);
                    window.AppConfig.save();
                    renderStoreContents();
                    if (window.renderDesktopIcons) window.renderDesktopIcons();
                    if (window.renderExplorerContents) window.renderExplorerContents();
                });
            }

            itemEl.appendChild(actionBtn);
            storeContainer.appendChild(itemEl);
        });
    }
})();
